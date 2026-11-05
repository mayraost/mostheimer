import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

/**
 * CSP rollout (final state after evaluating nonces).
 *
 * Nonces are deliberately NOT used: Next's CSP guide requires all pages to be
 * dynamically rendered when nonces are present (no ISR, no PPR, no CDN
 * caching). That would destroy the cacheComponents/OSR architecture.
 *
 * The enforced policy is the guide's "without nonces" pattern: Next and Payload
 * emit inline bootstrap scripts (self.__next_f.push) and inline styles (Lexical
 * admin), which default-src 'self' would block — hence 'unsafe-inline' on
 * script/style-src, plus 'unsafe-eval' in dev for React HMR.
 *
 * The report-only header below is the probe for eventually dropping
 * 'unsafe-inline'.
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Google-Tag-Manager-/Analytics-Origins (Consent Mode v2):
 *
 * - `https://www.googletagmanager.com`: Container-Bootstrap `gtm.js`
 *   (script-src) und Preview-/noscript-iframes (frame-src).
 * - `*.google-analytics.com`, `analytics.google.com`: GA4-Beacons, die GTM
 *   per fetch/sendBeacon absetzt. Ohne `connect-src` greift
 *   `default-src 'self'` und jeder Mess-Request waere geblockt.
 * - `www.googletagmanager.com` + `google-analytics.com` in img-src: Pixel-
 *   Fallback (`_ga`-Collect-Fallbacks, Bild-Beacons).
 * - `stats.g.doubleclick.net` / `www.google.com`: Conversion- und
 *   Remarketing-Pixel, falls im Container spaeter Ads-Tags aktiviert
 *   werden. Ob sie feuern, entscheidet ausschliesslich Consent Mode
 *   (`ad_storage`/`ad_user_data`/`ad_personalization` default denied).
 *
 * Bewusst NICHT erweitert: object-src, base-uri, form-action,
 * frame-ancestors — dort braucht Google nichts.
 */
const GOOGLE_SCRIPT_SRC = 'https://www.googletagmanager.com';
const GOOGLE_CONNECT_SRC = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://analytics.google.com',
].join(' ');
const GOOGLE_IMG_SRC = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://www.google.com',
  'https://stats.g.doubleclick.net',
].join(' ');

const CSP_ENFORCE = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE_SCRIPT_SRC}${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GOOGLE_IMG_SRC}`,
  `connect-src 'self' ${GOOGLE_CONNECT_SRC}`,
  `frame-src ${GOOGLE_SCRIPT_SRC}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

// Only lists the stricter directives, so reports show what would have to change
// if 'unsafe-inline' were dropped. The Google origins stay allowed here too,
// otherwise the probe would report GTM noise instead of the real
// unsafe-inline target. No report-to endpoint on purpose.
const CSP_REPORT_ONLY = [
  "script-src 'self'",
  `connect-src 'self' ${GOOGLE_CONNECT_SRC}`,
  `img-src 'self' data: blob: ${GOOGLE_IMG_SRC}`,
  `frame-src ${GOOGLE_SCRIPT_SRC}`,
  "style-src 'self'",
].join('; ');

// Deny everything the app does not use.
const PERMISSIONS_POLICY = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'accelerometer=()',
  'gyroscope=()',
  'idle-detection=()',
  'browsing-topics=()',
].join(', ');

/**
 * Edge cache TTL for public content routes — see the Cache-Control block in
 * `headers()` below and AGENTS.md § "Cloudflare Edge-Cache". Long TTLs are
 * safe because every CMS change purges the matching edge objects
 * synchronously; stale-if-error keeps the site up during deploys.
 */
const PUBLIC_CACHE_CONTROL =
  'public, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800';

/**
 * Release identity of this build, inlined into the server bundle and served by
 * /api/health: the client-side ReleaseGuard reloads an open tab once after a
 * deploy instead of letting it navigate with the previous build's chunks.
 * Prefers the CI commit (Coolify passes SOURCE_COMMIT as a build arg), falls
 * back to the build timestamp.
 */
const RELEASE_ID = process.env.SOURCE_COMMIT || `build-${Date.now()}`;

const nextConfig: NextConfig = {
  output: 'standalone',
  env: { NEXT_RELEASE_ID: RELEASE_ID },
  // Tailwind v4 via the native Turbopack loader. postcss.config.mjs was
  // removed: with the loader AND headless PostCSS Tailwind would run twice.
  // `as: '*.css'` makes the loader emit CSS instead of JS.
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // cacheComponents (Next 16): data layer via 'use cache' + cacheTag, dynamic
  // shell via connection(). The Coolify build container has no DB access, so
  // public routes must not prerender at build time; OSR runs exclusively
  // through Payload hooks + revalidateTag.
  cacheComponents: true,
  partialPrefetching: true,
  // Streaming metadata disabled (htmlLimitedBots matches every UA): otherwise
  // Next flushes the HTML head (200) before the NotFoundGate in the [locale]
  // layout can reject an unknown slug with notFound(), so the status is already
  // committed. With blocking metadata, notFound() throws before any flush and
  // the response is a real 404.
  htmlLimitedBots: /.*/,
  // Global security headers (non-CSP part). X-Frame-Options SAMEORIGIN instead
  // of DENY: the Payload admin embeds the live-preview route as a same-origin
  // iframe, which DENY would block.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Content-Security-Policy', value: CSP_ENFORCE },
        { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
      ],
    },
    {
      // Media is only consumed same-origin, so foreign sites must not load it.
      // Deliberately not global: that would also block legitimate
      // cross-origin loads such as API fetches from external tooling.
      source: '/media/:path*',
      headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }],
    },
    {
      // Media is also served by Payload's REST file endpoint
      // (/api/media/file/<filename>), so it needs the same CORP header.
      source: '/api/media/file/:path*',
      headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }],
    },
    // -- Edge cache contract (Cloudflare, see AGENTS.md § "Cloudflare Edge-
    // Cache") -------------------------------------------------------------
    // Cache-Control survives for route/static responses; for streamed HTML the
    // renderer keeps its own `no-store` (next.config headers() cannot override
    // it), which is why the zone enforces the same contract with a Cache
    // Response Rule. These entries document the TTL per route and keep
    // admin/API/preview/settings explicitly no-store (defence in depth next to
    // the zone's bypass rule). No entry ever lowers a route to private.
    {
      // Home of each locale: `/de` and `/en`.
      source: '/:locale(de|en)',
      headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE_CONTROL }],
    },
    {
      // Public content pages of each locale: `/de/<slug>`. Live preview
      // (`/de/preview`) and the per-visitor settings page stay out.
      source: '/:locale(de|en)/:slug((?!preview$|settings$).*)',
      headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE_CONTROL }],
    },
    {
      // Admin panel, REST/API surface, live preview and the OG renderer: never
      // cacheable at the edge, regardless of TTL.
      source: '/:path(admin|api|preview|og)(.*)',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
    {
      // Locale-scoped preview and settings routes.
      source: '/:locale(de|en)/:path(preview|settings)(.*)',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
  ],
};

export default withPayload(nextConfig);
