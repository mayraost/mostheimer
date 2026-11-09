/**
 * Public route model shared by the data-cache queries and the Cloudflare purge
 * layer.
 *
 * The public site renders per-locale under `/[locale]` (see
 * `src/app/(frontend)/[locale]`). Every slug exists in both locales, so the
 * route set of a page is always `{ /en/<slug>, /de/<slug> }` (the home slug
 * maps to the bare locale route). RSC prefetches render the same URL as the
 * HTML response, so purging the two HTML URLs also drops the RSC payloads.
 */

export type FrontendLocale = 'en' | 'de';

export const FRONTEND_LOCALES: readonly FrontendLocale[] = ['en', 'de'];

/** Route segment of a CMS page slug: `home` -> '' (bare locale route). */
export function slugToPath(slug: string): string {
  const cleaned = slug.replace(/^\/+|\/+$/g, '');
  return cleaned === '' || cleaned === 'home' ? '' : `/${cleaned}`;
}

/** Origin path of one page in one locale, e.g. `slug: 'imprint'` -> `/de/imprint`. */
export function pagePath(locale: FrontendLocale, slug: string): string {
  return `/${locale}${slugToPath(slug)}`;
}

// -- Vibe-Coding showcase -----------------------------------------------------

/**
 * Listing root of the vibe-coding showcase (`/[locale]/vibe-coding`). The
 * listing page itself is a `pages` document with this slug; the details are
 * `vibeProjects` documents below it (`/[locale]/vibe-coding/<project>`).
 */
export const VIBE_SHOWCASE_SLUG = 'vibe-coding';

/** Listing slug without a path segment — never a generic page slug value. */
export const LISTING_ROUTE = VIBE_SHOWCASE_SLUG;

/**
 * Routes whose page-1 HTML carries query-string VARIANTS that are separate
 * edge objects: `?page=N` and `?tag=<slug>` (and both combined). Purging them
 * one by one is exact only up to the page count; a TAG set change (rename /
 * delete) has an open-ended URL space, so the whole subtree is evicted with ONE
 * prefix purge (`host/path`, no scheme, no query — see `./cloudflare.ts`).
 *
 * The prefix is the bare route path on purpose: Cloudflare prefix purges match
 * "starts with", so `de/vibe-coding` also covers `/de/vibe-coding/<project>`.
 * That is exactly what a project *set* change (publish, unpublish, tag rename)
 * needs — detail pages are additionally purged by their own exact URLs when
 * only one project changed.
 */
export const PAGINATED_ROUTES: readonly string[] = [`/${VIBE_SHOWCASE_SLUG}`];

/**
 * True when a bare route path (no locale, e.g. `/vibe-coding`) addresses a
 * paginated route. Exact match or a child segment — never a string prefix, so
 * `/vibe-coding-old` stays a normal route.
 */
export function isPaginatedRoute(pathname: string): boolean {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return PAGINATED_ROUTES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`),
  );
}

/**
 * True when a purge prefix currently ends with `/` — such an entry would evict
 * `/de/vibe-coding-dark` as well as `/de/vibe-coding`. Always `false` for the
 * routes this module produces; kept as the explicit guard `toPurgePrefixes`
 * applies to arbitrary input.
 */
export function isSloppyPrefix(pathname: string): boolean {
  const path = pathname.split(/[?#]/, 1)[0] ?? '';
  return path.length > 1 && path.endsWith('/');
}

/**
 * Locale-relative paths of every paginated route (`/de/vibe-coding`,
 * `/en/vibe-coding`). These are the paths a purge hands to the API as
 * `prefixes` (see `toPurgePrefixes` in ./cloudflare.ts), and the paths the
 * deploy script derives from `/api/purge-manifest`.
 *
 * One entry per route × locale, never per query variant: the prefix covers the
 * bare URL and every `?page=N` / `?tag=<slug>` below it.
 */
export function paginatedRoutePaths(routes: readonly string[] = PAGINATED_ROUTES): string[] {
  const paths = new Set<string>();
  for (const route of routes) {
    const normalized = route.startsWith('/') ? route : `/${route}`;
    if (!isPurgeablePath(normalized)) continue;
    for (const locale of FRONTEND_LOCALES) {
      paths.add(`/${locale}${normalized}`);
    }
  }
  return [...paths];
}

/**
 * `host+path` prefix strings for the purge API (no scheme, no query, no
 * fragment — Cloudflare rejects those in `prefixes`), one per host × locale
 * route. Static assets can never be produced here: every entry is built from a
 * paginated route constant, never from an arbitrary path.
 */
export function paginatedRoutePrefixes(
  origins: readonly string[],
  routes: readonly string[] = PAGINATED_ROUTES,
): string[] {
  const prefixes = new Set<string>();
  const paths = paginatedRoutePaths(routes);
  for (const origin of origins) {
    let host: string;
    try {
      host = new URL(origin).host.toLowerCase();
    } catch {
      continue;
    }
    if (!host) continue;
    for (const path of paths) prefixes.add(`${host}${path}`);
  }
  return [...prefixes];
}

/**
 * Listing route of one locale (page 1, no query). Declared before the detail
 * route below because the detail route is built from it.
 */
export function vibeListingPath(locale: FrontendLocale): string {
  return `/${locale}/${VIBE_SHOWCASE_SLUG}`;
}

/** Detail route of one vibe project in one locale. */
export function vibeProjectPath(locale: FrontendLocale, slug: string): string {
  const normalized = normalizeRouteSlug(slug);
  return normalized ? `${vibeListingPath(locale)}/${normalized}` : vibeListingPath(locale);
}

/**
 * Lowercase, `[a-z0-9-]` only — the URL contract of a project/tag slug.
 *
 * Exported because the purge layer MUST derive a detail URL exactly the way the
 * route builder does: `vibeProjectPath('de', 'Audit Scanner')` is
 * `/de/vibe-coding/audit-scanner`, and a purge of `/de/vibe-coding/Audit%20...`
 * would miss that object.
 */
export function normalizeRouteSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * INVARIANT — static assets are never purged.
 *
 * `/_next/static/**` is served `public, max-age=31536000, immutable` and is
 * content-addressed by build. Purging it is (a) wasteful against the Free-plan
 * purge budget (5/min), (b) wrong, because a CMS edit cannot change a chunk, and
 * (c) dangerous: during an origin outage those warm edge objects are exactly
 * what keeps the site *styled*. The user-visible failure that motivated this
 * rule was an unstyled page because the CSS was not in the edge cache.
 *
 * `isPurgeablePath` is the single choke point every purge path goes through, so
 * a future mapping cannot reintroduce asset purges. The manual escape hatch for
 * a genuinely changed-file-under-same-name incident is documented in
 * `scripts/cf-purge.mjs` (`--everything`, operator only).
 */
export function isStaticAssetPath(pathname: string): boolean {
  // Case-insensitive and slash-tolerant (`/_next/static`, `/_next/static/`,
  // `/_Next/Static/x.js`): a prefix entry is the widest possible asset purge, so
  // this check must not be defeated by spelling.
  return /^\/_next\/static\b/i.test(pathname);
}

/** True when an edge purge may target this path. */
export function isPurgeablePath(pathname: string): boolean {
  return !isStaticAssetPath(pathname);
}

/**
 * Client-safe shape check for a `?tag=<slug>` value (`[a-z0-9-]`, no leading or
 * trailing dash). `null` = "not a tag" → the listing renders UNFILTERED.
 *
 * Shared by the render side and the cache readers so a tag that survives the
 * strict check is the same value in the URL, the query and the cache key.
 */
export function normalizeTagSlug(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) return null;
  return normalized;
}

/**
 * Client-safe `?page=` value: a bare digit run (`/^[0-9]+$/`) or `null`.
 *
 * `1` → 1 and `2` → 2 (both are page NUMBERS, canonical unless the page does
 * not exist); `01`, `1.5`, `2.0`, `+2`, `-1`, `abc`, `''` and non-strings are
 * malformed → `null`, which every caller renders as page 1 and marks
 * non-canonical (design §10.1). `?page=1` is itself never emitted (see
 * `buildListingHref`), so accepting the spelling here cannot create a duplicate
 * canonical.
 */
export function normalizePageNumber(raw: unknown): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) return null;
  const page = Number(value);
  // `0` is below the first page: malformed, not "page zero".
  if (!Number.isSafeInteger(page) || page < 1) return null;
  return page;
}

/**
 * Clamps a page request onto the real page count and reports whether the URL
 * names a page that actually EXISTS.
 *
 * - absent (`undefined`) → page 1, canonical;
 * - `5` of 3 pages → page 3, NON-canonical (the URL overreaches);
 * - `abc` → page 1, non-canonical;
 * - `1` → page 1, canonical (`?page=1` is a valid name for page 1; the chrome
 *   simply never LINKS to it — see `buildListingHref`).
 */
export function resolvePageRequest(
  raw: unknown,
  totalPages: number,
): { page: number; isCanonical: boolean } {
  const total = Math.max(1, Math.trunc(totalPages) || 1);
  if (raw === undefined) return { page: 1, isCanonical: true };
  const parsed = normalizePageNumber(raw);
  if (parsed === null) return { page: 1, isCanonical: false };
  return { page: Math.min(parsed, total), isCanonical: parsed <= total };
}

/**
 * Listing URL builder — THE one place a `?page=` / `?tag=` URL is formed.
 *
 * - Page 1 is ALWAYS the bare URL: `?page=1` is never emitted (it is a
 *   non-canonical duplicate of the listing and would create a second edge
 *   object for the same content).
 * - Tag first, then page (`?tag=ai-assisted&page=3`), matching the URL scheme
 *   in design §10.1.
 */
export function buildListingHref(input: {
  basePath: string;
  tag?: string | null;
  page?: number;
}): string {
  const base = input.basePath.replace(/\/+$/, '');
  const params: string[] = [];
  const tag = normalizeTagSlug(input.tag ?? null);
  if (tag) params.push(`tag=${tag}`);
  if (typeof input.page === 'number' && Number.isFinite(input.page) && input.page > 1) {
    params.push(`page=${Math.trunc(input.page)}`);
  }
  return params.length > 0 ? `${base}?${params.join('&')}` : base;
}

/**
 * Inclusive page window for the pagination chrome (current ± radius), clamped to
 * `1…totalPages` and safe for degenerate input (0, negative, `NaN`, a current
 * page past the end).
 */
export function pageWindow(current: number, totalPages: number, radius = 1): number[] {
  const total = Math.max(1, Math.trunc(totalPages) || 1);
  const safeRadius = Math.max(0, Math.trunc(radius) || 0);
  const center = Math.min(Math.max(1, Math.trunc(current) || 1), total);
  const start = Math.max(1, center - safeRadius);
  const end = Math.min(total, center + safeRadius);
  const window: number[] = [];
  for (let page = start; page <= end; page += 1) window.push(page);
  return window;
}

/**
 * True for the admin panel, the REST/API surface and anything else that must
 * never be reachable from the public content cache.
 */
export function isNonContentPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/cdn-cgi') ||
    pathname.startsWith('/mcp')
  );
}

/**
 * Slug of a `/<locale>/<rest>` pathname, or `''` for the locale root, or `null`
 * when the path is not inside that locale (or carries a trailing slash, which
 * Next/the edge redirects before it can reach a render).
 *
 * Used by the Proxy 404 check and by the `[[...slug]]` route: the Proxy maps the
 * request path to a slug for its status decision, and the page resolves the same
 * slug for rendering.
 */
export function pathnameToSlug(locale: FrontendLocale, pathname: string): string | null {
  if (pathname.length > 1 && pathname.endsWith('/')) return null;
  // Public files carry a dot; the Proxy matcher skips them in production, but a
  // standalone/manual `next start` matches `^/(?!(de|en))` first and would
  // otherwise treat `/_next` as the locale. Never let that reach a DB query.
  if (pathname.includes('.')) return null;
  if (pathname === `/${locale}`) return '';
  if (!pathname.startsWith(`/${locale}/`)) return null;
  return pathname.slice(locale.length + 2);
}

/**
 * en/de route of an incoming content request, or null when the path is not a
 * public content page (admin/API/preview/settings, files, OG images). Used to
 * decide whether a response may carry the public edge Cache-Control.
 */
export function contentLocalePath(pathname: string): string | null {
  if (isNonContentPath(pathname)) return null;
  if (pathname.includes('.')) return null;
  // No trailing slash: the canonical form the metadata/RSC requests use.
  if (pathname.length > 1 && pathname.endsWith('/')) return null;
  for (const locale of FRONTEND_LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length).replace(/^\/+/, '');
      const firstSegment = rest.split('/')[0];
      // Live preview (drafts, admin session) and the per-visitor settings page
      // must never be cached at the edge.
      if (firstSegment === 'preview' || firstSegment === 'settings') return null;
      return pathname;
    }
  }
  return null;
}
