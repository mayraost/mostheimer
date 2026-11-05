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

const CSP_ENFORCE = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

// Only lists the stricter directives, so reports show what would have to change
// if 'unsafe-inline' were dropped. No report-to endpoint on purpose.
const CSP_REPORT_ONLY = ["script-src 'self'", "style-src 'self'"].join('; ');

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

const nextConfig: NextConfig = {
  output: 'standalone',
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
  ],
};

export default withPayload(nextConfig);
