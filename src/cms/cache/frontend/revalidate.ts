import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './constants';
import { normalizeSlug } from './utils';

/**
 * On-demand cache invalidation (OSR).
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
 * `cms:global:*`, so a globals flush also drops the layout shell.
 */

type RevalidateMode = 'blocking' | 'swr';

/**
 * Single entry point for all flushes. try/catch is mandatory: hooks run inside
 * the admin request context, but migrations, seeding and CLI contexts do not,
 * and revalidateTag throws there ("static generation store missing").
 */
export function safeRevalidate(
  tag: string,
  label: string,
  mode: RevalidateMode = 'blocking',
): boolean {
  try {
    // 'blocking' = { expire: 0 }: stale content is never served, the next
    // request waits for a fresh render (read-your-own-writes after a CMS edit).
    // 'swr' = explicit 1h stale window.
    revalidateTag(tag, mode === 'blocking' ? { expire: 0 } : { expire: 3600 });
    return true;
  } catch (error) {
    console.warn(
      `[cms-cache] Revalidation '${label}' (tag: ${tag}) uebersprungen — kein Next.js-Request-Kontext.`,
      error,
    );
    return false;
  }
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
