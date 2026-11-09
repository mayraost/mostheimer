import { ImageResponse } from 'next/og';
import { OG_SIZE, OgCard, sanitizeOgTitle, splitWordmark } from '@/components/og/ogCard';
import { getCachedSiteSettings } from '@/cms/cache/frontend/queries';
import { getCachedTranslation } from '@/lib/translations.server';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';

/**
 * OG image route.
 *
 * The `opengraph-image.tsx` file convention cannot live in the optional
 * catch-all `[[...slug]]` segment: Next appends its internal metadata route as
 * a child segment, which the build rejects with "Optional catch-all must be the
 * last part of the URL". Per-page cards use explicit `openGraph.images` URLs
 * that point here instead.
 *
 * Route handler rather than a Server Action because it is a pure byte response
 * (PNG) for external crawlers and link-preview fetchers. `searchParams` make it
 * request-time.
 *
 * COPY SOURCE: the card is a pure renderer (Satori runs outside the React
 * request context), so the brand wordmark and the tagline are resolved HERE
 * from the cached reads (`site-settings` + `seo.ogSubtitle`). A failure falls
 * back to empty strings — a crawler then gets a card without a logo instead of
 * a 500.
 *
 * Params are text slots in a Satori render, never HTML — length is capped by
 * sanitizeOgTitle, and no SSRF or DB access is possible.
 */
export async function GET(request: Request): Promise<ImageResponse> {
  const searchParams = new URL(request.url).searchParams;
  const title = sanitizeOgTitle(searchParams.get('t') ?? '');
  const subtitle = sanitizeOgTitle(searchParams.get('s') ?? '');
  const locale: FrontendLocale = searchParams.get('loc') === 'de' ? 'de' : 'en';

  let siteName = '';
  let tagline = '';
  try {
    const [siteSettings, subtitleCopy] = await Promise.all([
      getCachedSiteSettings(locale),
      getCachedTranslation(locale, 'seo.ogSubtitle'),
    ]);
    siteName = siteSettings.siteName?.trim() ?? '';
    tagline = subtitleCopy;
  } catch {
    // Cold cache / DB outage: render the card without brand chrome.
  }

  return new ImageResponse(
    <OgCard
      title={title}
      subtitle={subtitle}
      wordmark={splitWordmark(siteName)}
      tagline={tagline}
    />,
    { ...OG_SIZE },
  );
}
