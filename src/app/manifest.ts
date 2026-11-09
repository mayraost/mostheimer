import type { MetadataRoute } from 'next';
import { COPY_KEYS } from '@/lib/translations';

/**
 * Web app manifest — install/metadata for mobile home screens and Android.
 *
 * COPY SOURCE (rule since 08.11.2026): name/short_name/description come from
 * the `translations` registry (`seo.manifest*`), not from literals. A manifest
 * is fetched by the BROWSER before any locale is negotiated and is served from
 * a static route, so it deliberately uses the registry seeds (the same strings
 * the CMS is seeded with) rather than a request-time read: reading the CMS here
 * would make an install prompt depend on a database round-trip.
 *
 * `lang` is the primary audience (de), matching `x-default`.
 *
 * The icons are generated from the MO mark by `scripts/brand-icons.ts`
 * (`npm run generate:icons`). `purpose: 'any'` and `'maskable'` use separate
 * files: the maskable variant carries 20% padding so Android's circular crop
 * never clips the glyph, while the `any` icon would look too small with that
 * padding when shown unmasked.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COPY_KEYS['seo.manifestName'],
    short_name: COPY_KEYS['seo.manifestShortName'],
    description: COPY_KEYS['seo.manifestDescription'],
    start_url: '/',
    display: 'standalone',
    // Matches the design system's dark default (`--color-background`), so the
    // splash/status bar does not flash white before the first paint.
    background_color: '#121212',
    theme_color: '#121212',
    lang: 'de',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
