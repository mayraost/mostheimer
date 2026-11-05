import { headers } from 'next/headers';
import { StatusScreen } from '@/components/layout/StatusScreen';
import { mergeNotFoundTexts } from '@/components/layout/notFoundTexts';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { NotFound } from '@/payload-types';

/**
 * Localized 404 of the PAGE route.
 *
 * Why it lives here and not only in `[locale]/not-found.tsx`: `notFound()` is
 * caught by the `HTTPAccessFallbackBoundary` of ITS OWN segment — it renders
 * the `notFound` prop for errors thrown by its `children`
 * (node_modules/next/dist/client/components/http-access-fallback/
 * error-boundary.js). The page sits in `[locale]/[[...slug]]`, so a
 * `not-found.js` one level up in `[locale]/` is NOT its fallback. Measured
 * 05.11.2026 on the standalone build: with only the `[locale]` file, the global
 * English page rendered instead.
 *
 * Document shell, header, footer, fonts, theme and the consent banner still
 * come from the `[locale]` layout — only the content column is replaced.
 *
 * Locale: `x-pathname` (set by the Proxy), because a not-found boundary does
 * not receive the segment params. Copy comes from the CMS global
 * `not-found` (de/en) with localized fallbacks; a DB failure degrades to the
 * fallback copy, never to a 500.
 */
export default async function SlugNotFound() {
  const pathname = (await headers()).get('x-pathname');
  const locale: FrontendLocale = pathname?.startsWith('/de') ? 'de' : 'en';

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
    // No DB / cold cache → localized fallback copy.
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
