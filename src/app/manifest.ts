import type { MetadataRoute } from 'next';

/**
 * Web app manifest — install/metadata for mobile home screens and Android.
 *
 * The icons are generated from the traced MO mark (`src/app/icon-*.png`,
 * `apple-icon.png`). `purpose: 'any'` and `'maskable'` are declared separately
 * because the maskable variant carries extra padding so Android's circular
 * crop (which trims up to 20% per side) never clips the glyph — the same file
 * would look too small when used unmasked.
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
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
