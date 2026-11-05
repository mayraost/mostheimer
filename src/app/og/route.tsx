import { ImageResponse } from 'next/og';
import { OG_SIZE, OgCard, sanitizeOgTitle } from '@/components/og/ogCard';

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
 * (PNG) for external crawlers and link-preview fetchers. No DB read (the title
 * arrives as a query param), so there is no build-prerender risk; searchParams
 * make it request-time.
 *
 * Params are text slots in a Satori render, never HTML — length is capped by
 * sanitizeOgTitle, and no SSRF or DB access is possible.
 */
export function GET(request: Request): ImageResponse {
  const searchParams = new URL(request.url).searchParams;
  const title = sanitizeOgTitle(searchParams.get('t') ?? 'Mayra Ostheimer');
  const subtitle = sanitizeOgTitle(searchParams.get('s') ?? 'Personal website');

  return new ImageResponse(<OgCard title={title} subtitle={subtitle} />, {
    ...OG_SIZE,
  });
}
