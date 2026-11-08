import type { MetadataRoute } from 'next';

/**
 * Web app manifest — install/metadata for mobile home screens and Android.
 *
 * The icons are generated from the MO mark by `scripts/brand-icons.ts`
 * (`npm run generate:icons`). `purpose: 'any'` and `'maskable'` use separate
 * files: the maskable variant carries 20% padding so Android's circular crop
 * never clips the glyph, while the `any` icon would look too small with that
 * padding when shown unmasked.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mayra Ostheimer — Web & Application Architect',
    short_name: 'Mayra Ostheimer',
    description:
      'Senior Fullstack Developer und Web-Application-Architekt. Composable Architekturen, TypeScript, React und Next.js.',
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
