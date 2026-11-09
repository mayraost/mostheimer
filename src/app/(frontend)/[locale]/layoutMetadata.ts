import type { Metadata } from 'next';
import { envConfig } from '@/envConfig';
import { COPY_KEYS } from '@/lib/translations';

/**
 * Base metadata for every `[locale]` segment.
 *
 * COPY SOURCE (rule since 08.11.2026): the title/description/`og:site_name`
 * strings come from the `translations` registry (`COPY_KEYS`), not from
 * literals. The object stays a STATIC export because `generateMetadata` of a
 * layout is not awaited by every consumer, so the values are the REGISTRY
 * SEEDS — the same strings the CMS is seeded with. `perPageMetadata()` overrides
 * them with the live CMS values wherever a request context exists.
 */
export const layoutMetadata: Metadata = {
  title: COPY_KEYS['seo.title'],
  description: COPY_KEYS['seo.description'],
  metadataBase: new URL(envConfig.serverUrl),
  // Base OG/Twitter defaults for every segment; per-page cards come from the
  // /og route.
  openGraph: { siteName: '', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

/**
 * Request-time variant: same shape, but with the CMS values substituted.
 *
 * `siteName` is DATA (`site-settings`), the rest is copy (`seo.*`). Every
 * caller passes what it resolved from the cached reads, so no layer has to
 * guess a default.
 */
export function perRequestMetadata({
  title,
  description,
  siteName,
}: {
  title: string;
  description: string;
  siteName: string;
}): Metadata {
  return {
    ...layoutMetadata,
    title: title || undefined,
    description: description || undefined,
    openGraph: { siteName, type: 'website' },
  };
}
