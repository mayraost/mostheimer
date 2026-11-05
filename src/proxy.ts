import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'de'];
const defaultLocale = 'en';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that must not be localized.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    // /og serves OG image bytes; without the skip it would get a 307 locale
    // redirect and crawlers would receive no image. Exact match, not
    // startsWith, to avoid catching unrelated paths.
    pathname === '/og' ||
    pathname.includes('.') // file requests like .json, .js, .png
  ) {
    return NextResponse.next();
  }

  // Is a supported locale already in the path?
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    // Forward the pathname: layouts cannot read it themselves. The
    // NotFoundGate uses it to answer unknown slugs with a real HTTP 404 before
    // the first header flush (see [locale]/layout.tsx).
    const headers = new Headers(request.headers);
    headers.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers } });
  }

  // No locale yet: redirect based on Accept-Language.
  const acceptLanguage = request.headers.get('accept-language');
  let localeStr = defaultLocale;

  if (acceptLanguage) {
    if (acceptLanguage.includes('de')) {
      localeStr = 'de';
    } else {
      localeStr = 'en';
    }
  }

  request.nextUrl.pathname = `/${localeStr}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip internal paths (_next)
    '/((?!_next|admin|api|.*\\..*).*)',
  ],
};
