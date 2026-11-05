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
  return pathname.startsWith('/_next/static/');
}

/** True when an edge purge may target this path. */
export function isPurgeablePath(pathname: string): boolean {
  return !isStaticAssetPath(pathname);
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
