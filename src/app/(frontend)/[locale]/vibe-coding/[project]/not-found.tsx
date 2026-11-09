import { headers } from 'next/headers';
import { StatusScreen } from '@/components/layout/StatusScreen';
import { mergeNotFoundTexts } from '@/components/layout/notFoundTexts';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';
import { getCachedTranslation } from '@/lib/translations.server';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { NotFound } from '@/payload-types';

/**
 * Localized 404 of the PROJECT detail route.
 *
 * Why this file exists (same rule as `[[...slug]]/not-found.tsx`): `notFound()`
 * is caught by the `HTTPAccessFallbackBoundary` of ITS OWN segment — the page
 * sits in `[locale]/vibe-coding/[project]`, so a not-found boundary one level up
 * would not render for it. Without this file an unknown project would show the
 * global English fallback.
 *
 * The HTTP status comes from the Proxy (`publishedVibeProjectStatus`); this
 * boundary only replaces the content column. Document shell, header, footer,
 * theme and consent all come from the `[locale]` layout.
 *
 * Locale: `x-pathname` (set by the Proxy) — a not-found boundary receives no
 * segment params. Copy comes from the CMS global `not-found` (de/en); a DB
 * failure degrades to the localized fallback copy, never to a 500.
 */
export default async function VibeProjectNotFound() {
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

  let code = '';
  try {
    code = await getCachedTranslation(locale, 'chrome.notFoundCode');
  } catch {
    code = '';
  }

  return (
    <StatusScreen
      code={code}
      title={data.title}
      message={data.message}
      // The shared 404 copy keeps the same primary action as every other 404
      // (the header/footer still link everywhere else).
      primary={{ label: data.buttonLabel, href: data.buttonLink || `/${locale}` }}
    />
  );
}
