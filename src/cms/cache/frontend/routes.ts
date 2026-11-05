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
