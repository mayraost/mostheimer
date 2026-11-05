import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './constants';
import { enqueueCloudflarePurge } from './purges';
import { FRONTEND_LOCALES, pagePath } from './routes';
import { normalizeSlug } from './utils';

/**
 * On-demand cache invalidation (OSR) + Cloudflare edge purge.
 *
 * Next 16 does not flush on revalidateTag; it records an in-doubt timestamp
 * (`revalidatedAt`). Entries only become stale lazily on the next read
 * (`entry.timestamp <= revalidatedAt`, see
 * next/dist/server/lib/incremental-cache/file-system-cache.js). With
 * `revalidateTag(tag, 'max')` the entry keeps being served and only revalidates
 * in the background, so pages stayed stale on prod. `{ expire: 0 }` forces the
 * next request to render fresh (blocking for one request) — never use 'max'
 * for CMS content.
 *
 * Note the layout entry caches site settings and navigation together under
 * `cms:global:*`, so a globals flush also drops the layout shell. In the
 * browser, `cacheLife.revalidate` (7 days) becomes the client/router stale
 * time — that is why every hook also purges the edge, see below.
 *
 * EDGE PURGE MAPPING (Cloudflare, see ./cloudflare.ts for why URL purges):
 *
 * | Tag                       | Purged edge objects                                   |
 * | ------------------------- | ----------------------------------------------------- |
 * | `cms:all`                 | every public content route + `/sitemap.xml`           |
 * | `cms:pages`               | every public content route, both locales              |
 * | `cms:pages:<slug>`        | `/en/<slug>` + `/de/<slug>` (`home` → `/en`, `/de`)   |
 * | `cms:sitemap`             | `/sitemap.xml`                                        |
 * | `cms:global:*`            | every public content route (layout-level global)      |
 *
 * `/_next/static/**` is never part of any mapping — static assets are immutable
 * and content-addressed, and they must survive both CMS edits and deploys so an
 * origin outage is still served styled from the edge. See `isPurgeablePath`.
 *
 * The slug → routes part needs the page list (it is the only place that knows
 * every slug). `registerPageSlugs` is fed by the cached page queries, so the
 * mapping stays exact without a second DB read.
 */

type RevalidateMode = 'blocking' | 'swr';

/** Home route is always cacheable content, even before the page list loaded. */
const KNOWN_SLUGS = new Set<string>(['home']);

/**
 * Publish the slugs the cached page reads have produced. Called from
 * `getCachedPageBySlugStatic` and `getCachedAllPagesStatic` (the two places
 * that know the full set), so the edge purge can map a bare `cms:pages` flush
 * onto the real route set.
 */
export function registerPageSlugs(slugs: readonly string[]): void {
  for (const slug of slugs) {
    const normalized = normalizeSlug(slug);
    if (normalized) KNOWN_SLUGS.add(normalized);
  }
}

/**
 * Route paths an edge purge has to remove for a tag.
 *
 * `home` is always included: the layout renders the globals on every page and
 * the home route is the one page that exists without a DB read, so a page-set
 * flush (`cms:pages`) must never leave it behind.
 */
export function edgePurgePathsForTag(
  tag: string,
  slugs: readonly string[] = [...KNOWN_SLUGS],
): string[] {
  const routeSlugs = slugs.includes('home') ? slugs : ['home', ...slugs];
  const contentPaths = routeSlugs.flatMap((slug) =>
    FRONTEND_LOCALES.map((locale) => pagePath(locale, slug)),
  );

  if (tag === CACHE_TAGS.ALL || tag === CACHE_TAGS.pages || tag.startsWith('cms:global:')) {
    // Applies to every page: the layout renders the globals, the page set
    // drives the nav and the sitemap.
    return contentPaths;
  }

  if (tag === CACHE_TAGS.sitemap) {
    return ['/sitemap.xml'];
  }

  if (tag.startsWith('cms:pages:')) {
    const slug = normalizeSlug(tag.slice('cms:pages:'.length));
    return FRONTEND_LOCALES.map((locale) => pagePath(locale, slug));
  }

  return [];
}

/**
 * Edge counterpart of a tag flush: always the exact content routes above, one
 * queued request per flush. `cms:all` is the same list plus `/sitemap.xml`
 * rather than `purge_everything`, which would also drop the immutable static
 * assets. No-op when Cloudflare is not configured or nothing is purgeable.
 */
function purgeEdgeForTag(tag: string, label: string): void {
  const paths = edgePurgePathsForTag(tag);
  if (tag === CACHE_TAGS.ALL) paths.push('/sitemap.xml');
  if (paths.length > 0) {
    enqueueCloudflarePurge({ type: 'urls', paths }, label);
  }
}

/**
 * Single entry point for all flushes. try/catch is mandatory: hooks run inside
 * the admin request context, but migrations, seeding and CLI contexts do not,
 * and revalidateTag throws there ("static generation store missing").
 *
 * The edge purge is enqueued regardless of whether the Next flush found a
 * request store: a seed/migration still changes what the edge serves.
 */
export function safeRevalidate(
  tag: string,
  label: string,
  mode: RevalidateMode = 'blocking',
): boolean {
  let nextFlushed = false;
  try {
    // 'blocking' = { expire: 0 }: stale content is never served, the next
    // request waits for a fresh render (read-your-own-writes after a CMS edit).
    // 'swr' = explicit 1h stale window.
    revalidateTag(tag, mode === 'blocking' ? { expire: 0 } : { expire: 3600 });
    nextFlushed = true;
  } catch (error) {
    console.warn(
      `[cms-cache] Revalidation '${label}' (tag: ${tag}) uebersprungen — kein Next.js-Request-Kontext.`,
      error,
    );
  }

  purgeEdgeForTag(tag, label);
  return nextFlushed;
}

/**
 * Flushes a single page route by slug ('home' or 'a/b'). Both locales are hit
 * (the tag has no locale prefix). `cms:pages` is invalidated too because the
 * NotFoundGate lookup and the sitemap list hang off the collection tag: a new
 * slug must resolve immediately, a deleted one must 404 immediately.
 */
export function revalidatePagePathCache(slug: string | null | undefined): void {
  if (!slug) return;
  safeRevalidate(CACHE_TAGS.pageByPath(normalizeSlug(slug)), `page path ${slug}`);
  safeRevalidate(CACHE_TAGS.pages, 'pages domain (page changed)');
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (page changed)');
}

/** Also flush the old path on a slug rename — it must serve notFound() from then on. */
export function revalidatePreviousPagePathCache(
  previousSlug: string | null | undefined,
  nextSlug: string | null | undefined,
): void {
  if (!previousSlug || !nextSlug || previousSlug === nextSlug) return;
  safeRevalidate(
    CACHE_TAGS.pageByPath(normalizeSlug(previousSlug)),
    `old page path ${previousSlug}`,
  );
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (page renamed)');
}

/** Invalidate the sitemap list (page set changed). */
export function revalidateSitemapCache(): void {
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap');
}

/** Broad flush of all frontend CMS caches (e.g. after a media change). */
export function revalidateAllFrontendCmsCaches(): void {
  safeRevalidate(CACHE_TAGS.ALL, 'all frontend cms caches');
  safeRevalidate(CACHE_TAGS.pages, 'pages');
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap');
}

export function revalidateSiteSettingsCache(): void {
  safeRevalidate(CACHE_TAGS.siteSettings, 'site settings');
}

export function revalidateNavigationCache(): void {
  safeRevalidate(CACHE_TAGS.navigation, 'navigation');
}

export function revalidateTranslationsCache(): void {
  safeRevalidate(CACHE_TAGS.translations, 'translations');
}

export function revalidateNotFoundCache(): void {
  safeRevalidate(CACHE_TAGS.notFound, 'not-found global');
}

/**
 * Flush results for diagnosable callers (e.g. the admin cache-clear view shows
 * whether the hook ran inside a request context).
 */
export function collectRevalidationResults(tags: readonly { tag: string; label: string }[]): {
  done: string[];
  skipped: string[];
} {
  const done: string[] = [];
  const skipped: string[] = [];
  for (const { tag, label } of tags) {
    if (safeRevalidate(tag, label)) done.push(tag);
    else skipped.push(tag);
  }
  return { done, skipped };
}
