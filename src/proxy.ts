import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'de'];
const defaultLocale = 'en';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip paths that should not be localized
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // like a file .json, .js, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    // x-pathname-Fwd: macht den Pfad im [locale]-Layout lesbar (layouts
    // koennen sonst keine pathname auslesen). Wird vom NotFoundGate
    // benutzt, um unbekannte Slugs VOR dem ersten HTTP-Header-Flush
    // (Layout-Skeleton-Suspense) mit echtem HTTP-404 zu beantworten
    // (siehe [locale]/layout.tsx).
    const headers = new Headers(request.headers);
    headers.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers } });
  }

  // Redirect if there is no locale
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
    // Skip all internal paths (_next)
    '/((?!_next|admin|api|.*\\..*).*)',
  ],
};
