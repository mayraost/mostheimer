import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './constants';
import { enqueueCloudflarePurge } from './purges';
import {
  FRONTEND_LOCALES,
  LISTING_ROUTE,
  pagePath,
  vibeListingPath,
  vibeProjectPath,
} from './routes';
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
 * | `cms:vibeprojects`        | listing subtree + every known project detail          |
 * | `cms:vibeshowcase`        | listing subtree (`/de/vibe-coding`, `/en/vibe-coding`) |
 * | `cms:vibetags`            | listing subtree (a tag rename/delete changes `?tag=`)  |
 * | `cms:vibeprojects:<slug>` | that project's detail URLs (both locales)             |
 *
 * PAGINATED / FILTERED ROUTES (`PAGINATED_ROUTES` in ./routes.ts): a `?page=N`
 * or `?tag=<slug>` response is a SEPARATE edge object and the purge API has no
 * wildcard URL purge. The listing subtree is evicted with ONE prefix op per
 * locale (`de/vibe-coding` — host+path, no scheme/query), which is also why a
 * project publish purges the listing: publishing changes the listing.
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

/**
 * Listing routes that are themselves `pages` documents. Registered eagerly so
 * the bare `/de/vibe-coding` path is purgeable on a cold start too — including
 * the very first `cms:pages` / `cms:global:*` / `cms:all` flush of a process
 * that has not rendered a page yet.
 */
export const LISTING_SLUGS: ReadonlySet<string> = new Set<string>([LISTING_ROUTE]);

/** Tag prefix of `CACHE_TAGS.vibeProject(slug)`. */
const VIBE_PROJECT_TAG_PREFIX = `${CACHE_TAGS.vibeProjects}:`;

/**
 * The page-slug registry, lazily created behind a `globalThis` key.
 *
 * WHY NOT A MODULE-LEVEL `const Set`: this module is star-exported from the
 * barrel, and under `esbuild` (vitest) a plain `const` that the barrel's copy of
 * the module re-declares can be left uninitialized — `registerPageSlugs` then
 * throws "Cannot access 'KNOWN_SLUGS' before initialization" while the direct
 * importer works fine. One lazily initialized record keeps `pages` and
 * `vibeProjects` identical for every import path (bug surfaced 09.11.2026 by the
 * listing-registry test).
 */
type RouteRegistries = { pages: Set<string>; vibeProjects: Set<string> };

const REGISTRY_KEY = Symbol.for('mostheimer.cms-route-registry');

type GlobalWithRegistry = typeof globalThis & { [REGISTRY_KEY]?: RouteRegistries };

/** `globalThis`-backed so route handlers and the RSC tree share one registry. */
function registries(): RouteRegistries {
  const store = globalThis as GlobalWithRegistry;
  store[REGISTRY_KEY] ??= {
    pages: new Set<string>(['home', ...LISTING_SLUGS]),
    vibeProjects: new Set<string>(),
  };
  return store[REGISTRY_KEY];
}

/**
 * Last page count observed per listing path (`/de/vibe-coding` → pages).
 */
const VIBE_SHOWN_PAGES = new Map<string, number>();

/** `pageSize` default of the `vibeShowcase` block (schema default). */
const VIBE_PAGE_SIZE = 6;

/**
 * Publish the slugs the cached page reads have produced. Called from
 * `getCachedPageBySlugStatic` and `getCachedAllPagesStatic` (the two places
 * that know the full set), so the edge purge can map a bare `cms:pages` flush
 * onto the real route set. The listing routes are always part of it.
 */
export function registerPageSlugs(slugs: readonly string[]): void {
  const pages = registries().pages;
  for (const slug of slugs) {
    const normalized = normalizeSlug(slug);
    if (normalized) pages.add(normalized);
  }
  for (const slug of LISTING_SLUGS) pages.add(slug);
}

/** Registers published vibe-project slugs (purge URL mapping only). */
export function registerVibeProjectSlugs(slugs: readonly string[]): void {
  const known = registries().vibeProjects;
  for (const slug of slugs) {
    const normalized = normalizeSlug(slug);
    if (normalized && normalized !== 'home') known.add(normalized);
  }
}

/** Registers the page count a listing render observed (purge fallback). */
export function registerVibeShowcasePageCount(listingPath: string, totalPages: number): void {
  if (!Number.isFinite(totalPages)) return;
  VIBE_SHOWN_PAGES.set(listingPath, Math.max(1, Math.trunc(totalPages)));
}

/**
 * Route registries for the OPERATIONAL read side (`/api/purge-manifest` and the
 * diagnostics of the admin view) — never for a render or a 404 decision.
 *
 * - `registeredPageSlugs()`: every page slug the cached reads have seen (the
 *   eager listing slug included).
 * - `registeredVibeProjectSlugs()`: every published project slug seen so far.
 *
 * Both are monotonic in-process sets: they grow as routes render and are only
 * reset with the process. That is exactly what the purge needs (a broader list
 * is harmless, a missing URL is not), and why the Proxy keeps its own
 * DB-backed snapshot instead of importing these.
 */
export function registeredPageSlugs(): string[] {
  return [...registries().pages];
}

/** Monotonic in-process list of published project slugs (purge/ops only). */
export function registeredVibeProjectSlugs(): string[] {
  return [...registries().vibeProjects];
}

/** Detail URLs of every registered project in both locales (ops view). */
export function registeredVibeDetailPaths(): string[] {
  return [...registries().vibeProjects].flatMap(vibeDetailPaths);
}

/** Detail URLs of one project in both locales ('home' is not a project). */
function vibeDetailPaths(slug: string): string[] {
  const normalized = normalizeSlug(slug);
  if (!normalized || normalized === 'home') return [];
  // `vibeProjectPath` normalizes the segment the same way the route builder
  // does, so the purged URL is byte-identical to the rendered one.
  return FRONTEND_LOCALES.map((locale) => vibeProjectPath(locale, normalized));
}

/** Page-1 listing URLs of both locales (the prefix op covers the variants). */
function vibeListingPaths(): string[] {
  return FRONTEND_LOCALES.map((locale) => vibeListingPath(locale));
}

/**
 * Route paths an edge purge has to remove for a tag.
 *
 * `home` is always included: the layout renders the globals on every page and
 * the home route is the one page that exists without a DB read, so a page-set
 * flush (`cms:pages`) must never leave it behind.
 *
 * The listing routes (`LISTING_SLUGS`, i.e. `vibe-coding`) are part of every
 * content flush for the same reason: the listing IS a `pages` document, and its
 * page-1 HTML is a content object like any other page.
 */
export function edgePurgePathsForTag(
  tag: string,
  slugs: readonly string[] = [...registries().pages],
): string[] {
  // The listing routes belong to EVERY content flush, whatever set the caller
  // passed (tests and diagnostics pass explicit lists that predate the eager
  // registration). Prepended so `home` stays first, like an explicit list.
  const routeSlugs = [
    'home',
    ...LISTING_SLUGS,
    ...slugs.filter((slug) => slug !== 'home' && !LISTING_SLUGS.has(slug)),
  ];
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

  if (tag.startsWith(VIBE_PROJECT_TAG_PREFIX)) {
    // One project changed: its two detail URLs. The listing subtree is evicted
    // by the prefix op revalidateVibeListingCache queues.
    return vibeDetailPaths(tag.slice(VIBE_PROJECT_TAG_PREFIX.length));
  }

  if (tag === CACHE_TAGS.vibeProjects) {
    // Project SET changed: every known detail plus page 1 of the listing.
    return [...vibeListingPaths(), ...[...registries().vibeProjects].flatMap(vibeDetailPaths)];
  }

  if (tag === CACHE_TAGS.vibeShowcase || tag === CACHE_TAGS.vibeTags) {
    // Listing projection / chip row: page 1 of both locales; deeper variants
    // are covered by the prefix op.
    return vibeListingPaths();
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
 * sitemap list (and the edge purge route registry) hang off the collection
 * tag: a new slug must resolve immediately, a deleted one must 404 immediately.
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

// -- Vibe-coding showcase ----------------------------------------------------

/**
 * Listing flush: the listing projection tag plus ONE prefix op for the route
 * subtree (`?page=N` / `?tag=<slug>` are separate edge objects). Used by
 * project writes and by tag writes — a tag rename/delete changes every
 * `?tag=` variant and the chip row.
 */
export function revalidateVibeListingCache(label = 'vibe listing'): void {
  safeRevalidate(CACHE_TAGS.vibeShowcase, label);
  enqueueCloudflarePurge({ type: 'prefixes', paths: vibeListingPaths() }, label);
}

/**
 * One vibe project changed (create / update / unpublish / delete).
 *
 * The listing is flushed too: a publish moves the project between pages, a
 * delete empties one, and both change counts and the `ItemList`. One project
 * edit therefore purges its two detail URLs AND the listing subtree — the
 * queue merges both into a single request.
 */
export function revalidateVibeProjectCache(slug: string | null | undefined): void {
  const normalized = normalizeSlug(slug ?? '');
  if (!normalized || normalized === 'home') {
    // No usable slug: never fall back to a broad flush of every detail URL.
    revalidateVibeListingCache('vibe listing (project without slug)');
    return;
  }
  safeRevalidate(CACHE_TAGS.vibeProject(normalized), `vibe project ${normalized}`);
  safeRevalidate(CACHE_TAGS.vibeProjects, 'vibe projects domain');
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (vibe project changed)');
  revalidateVibeListingCache(`vibe listing (project ${normalized})`);
}

/**
 * Slug rename: the OLD detail URL must 404 from then on, so it is flushed and
 * purged explicitly (the tags only know the new slug).
 */
export function revalidatePreviousVibeProjectCache(
  previousSlug: string | null | undefined,
  nextSlug: string | null | undefined,
): void {
  const previous = normalizeSlug(previousSlug ?? '');
  const next = normalizeSlug(nextSlug ?? '');
  if (!previous || previous === 'home' || previous === next) return;
  safeRevalidate(CACHE_TAGS.vibeProject(previous), `old vibe project ${previous}`);
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (vibe project renamed)');
  enqueueCloudflarePurge(
    { type: 'urls', paths: [...vibeDetailPaths(previous), ...vibeDetailPaths(next)] },
    `old vibe project ${previous} (renamed)`,
  );
}

/**
 * Tag created / renamed / deleted. Only the chip row changes in the cache, but
 * EVERY `?tag=<slug>` variant of the listing is affected (a deleted tag's URLs
 * must fall back to the unfiltered listing), so this uses the same prefix op as
 * a project-set change.
 */
export function revalidateVibeTagsCache(slug?: string | null): void {
  const label = `vibe tags ${slug ? normalizeSlug(slug) : 'set'}`;
  safeRevalidate(CACHE_TAGS.vibeTags, label);
  revalidateVibeListingCache(`${label} (listing)`);
}

/**
 * Exact `?page=2 … N` listing URLs of both locales for a page count — the
 * ENUMERATED variant, used only by diagnostics and by callers that need a
 * concrete URL list.
 *
 * The production purge does NOT use this: a `?page=N` (and every `?tag=`)
 * response is an edge object of its own, and the listing subtree is evicted by
 * ONE prefix op (`toPurgePrefixes`, `host+path`) instead of N URLs. Page 1 is
 * always the bare listing — `?page=1` is never produced.
 */
function pageVariants(totalPages: number): string[] {
  const pages = Math.max(1, Math.trunc(totalPages) || 1);
  return FRONTEND_LOCALES.flatMap((locale) =>
    Array.from({ length: pages }, (_, index) => index + 1).map((page) =>
      page === 1 ? vibeListingPath(locale) : `${vibeListingPath(locale)}?page=${page}`,
    ),
  );
}

/** Exact `?page=2 … N` listing URLs for a published count (`totalDocs`). */
export function pageWindowUrls(totalDocs: number, pageSize: number = VIBE_PAGE_SIZE): string[] {
  const pages = Math.max(1, Math.ceil(Math.max(0, totalDocs) / Math.max(1, pageSize)) || 1);
  return pageVariants(pages);
}

/**
 * Enumerated listing variant URLs + every known detail URL — a DIAGNOSTIC view,
 * deliberately not wired into a hook.
 *
 * Why not wired: a project edit flushes its two detail URLs plus the listing
 * PREFIX (one op per locale and host); enumerating `?page=N` would spend the
 * Free-plan budget (5 requests/min) on a set the prefix already covers, and the
 * tag space is open-ended anyway. Keep this for scripts/operators that want the
 * concrete list (e.g. a manual, targeted purge while debugging).
 *
 * The page count is the DB count (`totalDocs`), never below the page count a
 * listing render observed — a shrink must not leave a stale page uncounted.
 */
export function vibeShowcaseVariantPaths(
  totalDocs: number,
  pageSize: number = VIBE_PAGE_SIZE,
): { pages: string[]; details: string[] } {
  const shown = Math.max(1, ...VIBE_SHOWN_PAGES.values());
  const fromCount = Math.max(1, Math.ceil(Math.max(0, totalDocs) / Math.max(1, pageSize)) || 1);
  return {
    pages: pageVariants(Math.max(fromCount, shown)),
    // Every known detail URL; empty when no listing render has registered one
    // yet (the caller then relies on the DB count / prefix purge only).
    details: [...registries().vibeProjects].flatMap(vibeDetailPaths),
  };
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
