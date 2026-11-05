import { headers } from 'next/headers';
import { StatusScreen } from '@/components/layout/StatusScreen';
import { mergeNotFoundTexts } from '@/components/layout/notFoundTexts';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { NotFound } from '@/payload-types';

/**
 * Localized 404 — runs INSIDE the [locale] layout, so the document shell,
 * header, footer, fonts, theme and consent banner all come from the layout
 * (nothing is duplicated here).
 *
 * Reached by every notFound() thrown within the locale tree. Texts: CMS global
 * `not-found` (de/en) with localized fallbacks; home link → locale root.
 */
export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname');
  const acceptLanguage = headersList.get('accept-language');
  const referer = headersList.get('referer');

  const locale: FrontendLocale =
    pathname === '/de' || pathname?.startsWith('/de/')
      ? 'de'
      : pathname === '/en' || pathname?.startsWith('/en/')
        ? 'en'
        : referer?.includes('/de/') || acceptLanguage?.startsWith('de')
          ? 'de'
          : 'en';

  let texts: Pick<NotFound, 'title' | 'message' | 'buttonLabel' | 'buttonLink'> | null = null;
  try {
    const fromCms = await getCachedNotFound(locale);
    if (fromCms) {
      texts = {
        title: fromCms.title,
        message: fromCms.message,
        buttonLabel: fromCms.buttonLabel,
        buttonLink: fromCms.buttonLink,
      };
    }
  } catch {
    // no DB / cold cache → fallback copy below.
  }

  const data = mergeNotFoundTexts(texts, locale);

  return (
    <StatusScreen
      code="HTTP 404 · Not Found"
      title={data.title}
      message={data.message}
      primary={{ label: data.buttonLabel, href: data.buttonLink || `/${locale}` }}
    />
  );
}
