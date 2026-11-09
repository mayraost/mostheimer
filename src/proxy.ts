import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  FRONTEND_LOCALES,
  PROJECT_SHOWCASE_SLUG,
  pathnameToSlug,
  slugToPath,
} from '@/cms/cache/frontend/routes';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import { publishedSlugStatus, publishedProjectStatus } from './proxy-slug-cache';

const defaultLocale: FrontendLocale = 'en';

/**
 * Routes under [locale] that render their own tree instead of the
 * `[[...slug]]` catch-all — they are not page slugs and must not be checked.
 *
 * `projects` is deliberately NOT listed: its first segment is the listing
 * page, a `pages` document with that slug, so it is checked like any page. Its
 * one-segment children are project details and are answered by
 * `publishedProjectStatus` (see `handleLocalizedRequest`); two or more
 * children are not a route at all.
 */
const STATIC_CHILD_ROUTES = new Set(['preview', 'settings', 'impressum']);

/**
 * True for a one-segment child of a STATIC route (`/de/impressum/<x>`,
 * `/de/settings/<x>`): those routes render their own tree and have no
 * `[[...slug]]` fallback, so nothing can ever make such a URL exist — it is a
 * real 404 regardless of the page-slug snapshot.
 *
 * `projects` is deliberately NOT in this set: its children are
 * `projects` documents (`publishedProjectStatus` decides), while the
 * listing itself is a page slug like any other.
 */
function isUnknownStaticChildRoute(slug: string): boolean {
  const [head, child] = slug.split('/');
  return child !== undefined && STATIC_CHILD_ROUTES.has(head ?? '');
}

/**
 * Proxy responsibilities — and only these:
 *
 * 1. locale redirect for unprefixed paths (`/career` → `/de/career`),
 * 2. forward `x-pathname` (a layout cannot read the pathname),
 * 3. set the HTTP status for an unknown slug.
 *
 * Rendering stays untouched: the request goes through the normal render path
 * (`[locale]/[[...slug]]/page.tsx` throws `notFound()`, the segment's
 * `not-found.tsx` renders the localized UI). The Proxy only decides the STATUS
 * before the stream starts, because once the shell streams the status is fixed
 * at 200 (Next docs: file-conventions/loading.md § "Status codes"):
 *
 *   "Run the corresponding check before the response body streams to return a
 *    404 … For a 404, you can check the slug in Proxy … Keep Proxy checks fast,
 *    and avoid fetching full content there."
 *
 * `NextResponse.next({ status: 404 })` sets that status and still renders the
 * route normally — measured on the production standalone build 05.11.2026
 * (response: `HTTP/1.1 404` with the page's own `not-found.tsx` body).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that must not be localized.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    // /og serves OG image bytes; without the skip it would get a 307 locale
    // redirect and crawlers would receive no image. Exact match, not
    // startsWith, to avoid catching unrelated paths.
    pathname === '/og' ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // file requests like .json, .js, .png
  ) {
    return NextResponse.next();
  }

  // Is a supported locale already in the path?
  const locale = FRONTEND_LOCALES.find(
    (candidate) => pathname.startsWith(`/${candidate}/`) || pathname === `/${candidate}`,
  );

  if (locale) {
    return handleLocalizedRequest(request, locale);
  }

  // No locale yet: redirect based on Accept-Language.
  //
  // Deliberate single hop, INCLUDING unknown paths (`/gibtsnicht` →
  // `/en/gibtsnicht` → 404). The redirect is a language decision, not a 404
  // decision: the visitor must see the 404 in their own language instead of a
  // generic English page. The status is decided on the second request, where
  // the locale is known. Do NOT short-circuit this into a direct 404 — that
  // would lose the localized copy and the localized chrome.
  return NextResponse.redirect(localizedUrl(request, detectLocale(request)));
}

/**
 * Localized request: verify the slug and, for an unknown one, answer with a
 * 404 status while the route renders exactly as usual.
 */
async function handleLocalizedRequest(request: NextRequest, locale: FrontendLocale) {
  const { pathname } = request.nextUrl;
  const slug = pathnameToSlug(locale, pathname);

  // `null` = not addressable as a page (trailing slash), `''` = locale root.
  if (slug === null || slug === '') return forward(request, pathname, locale);

  // `/[locale]/projects` (the listing page) also matches, so the first
  // segment must go through the page-slug snapshot — only the one-segment child
  // is a project. Two or more children are not a route at all.
  const [head, child, ...rest] = slug.split('/');
  if (head === PROJECT_SHOWCASE_SLUG && child !== undefined) {
    if (rest.length > 0) return forward(request, pathname, locale, 404);
    const status = await publishedProjectStatus(child);
    return forward(request, pathname, locale, status === 'missing' ? 404 : undefined);
  }

  if (STATIC_CHILD_ROUTES.has(head ?? '')) {
    // The static route itself (`/de/impressum`) renders; a CHILD of it has no
    // route at all and is a 404 — never "publishable content".
    return forward(request, pathname, locale, isUnknownStaticChildRoute(slug) ? 404 : undefined);
  }

  const status = await publishedSlugStatus(slug);

  // `unknown` = no reliable answer (DB down, cache disabled): fail OPEN and
  // render normally. A DB outage must never turn existing pages into 404s.
  return forward(request, pathname, locale, status === 'missing' ? 404 : undefined);
}

/** Normal pass-through; optionally with the 404 status decided by the Proxy. */
function forward(request: NextRequest, pathname: string, locale: FrontendLocale, status?: number) {
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);

  return NextResponse.next({
    ...(status ? { status } : {}),
    request: { headers },
  });
}

/** Accept-Language detection (German anywhere in the header). */
function detectLocale(request: NextRequest): FrontendLocale {
  const acceptLanguage = request.headers.get('accept-language');
  return acceptLanguage?.toLowerCase().includes('de') ? 'de' : defaultLocale;
}

/** `request.nextUrl` with the locale prefix, used for the redirect. */
function localizedUrl(request: NextRequest, locale: FrontendLocale): URL {
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathnameForLocaleRedirect(request.nextUrl.pathname)}`;
  return url;
}

/** `/` → `` (bare locale route), `/foo` → `/foo`, `foo/` stays as typed. */
function pathnameForLocaleRedirect(pathname: string): string {
  return pathname === '/' || slugToPath(pathname) === '' ? '' : pathname;
}

export const config = {
  matcher: [
    // Skip internal paths (_next)
    '/((?!_next|admin|api|.*\\..*).*)',
  ],
};
