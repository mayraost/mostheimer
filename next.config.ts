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
 *
 * frame-src enthält zusätzlich 'self' (Payload-Live-Preview-iframe im Admin);
 * ohne 'self' blockt der Browser den Preview-Frame, siehe CSP_ENFORCE.
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
  // frame-src steuert, was DIESES Dokument einbetten darf — also auch das
  // Live-Preview-iframe des Payload-Admin-Panels (`/admin` → `/<locale>/preview`).
  // Ohne 'self' blockiert der Browser den same-origin-Preview-Frame mit
  // „Framing ... violates ... frame-src" (sichtbar als Blocked-Frame-Placeholder
  // im Admin). 'self' = Admin-Origin == Preview-Origin (relative livePreview-URL).
  `frame-src 'self' ${GOOGLE_SCRIPT_SRC}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // frame-ancestors steuert, wer DIESE Seite einbetten darf: nur die eigene
  // Origin. Admin (Embedder) und Preview (Embedded) laufen über denselben Host
  // (`mostheimer.de`; die Alt-Domains 301-en dorthin, die relative
  // livePreview-URL erbt die Admin-Origin). X-Frame-Options bleibt SAMEORIGIN.
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
  `frame-src 'self' ${GOOGLE_SCRIPT_SRC}`,
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
 *
 * 1 day fresh (86400 s) + 30 days stale mirrors the `cacheLife` profile in
 * src/cms/cache/frontend/queries.ts (`stale`/`expire`), the Cloudflare Cache
 * Rule (`status_code_ttl` 2xx = 86400) and the Cache Response Rule — all
 * three MUST stay in sync. A longer `s-maxage` is pointless: the status-code
 * TTL override caps 2xx at one day, while the stale window stays 30 days.
 */
const PUBLIC_CACHE_CONTROL =
  'public, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000';

/**
 * `headers()` cannot match the response status, so the public directive above
 * also lands on a 404. The zone's Cache Rule sets every 4xx/5xx to `no-store`
 * (`status_code_ttl` = -1) and the Response-Rule catch-all adds `no-store`;
 * both layers are required to keep the 404-poisoning fix intact.
 */

/** OG renders are deterministic per query; 1 day keeps them warm for crawlers. */
const OG_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000';

/** Uploaded media (Payload file endpoint + static media path). */
const MEDIA_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000';

/** Generated favicon/icon routes (hashed query in the HTML). */
const FAVICON_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000';

/**
 * Release identity of this build, inlined into the server bundle and served by
 * /api/health: the client-side ReleaseGuard reloads an open tab once after a
 * deploy instead of letting it navigate with the previous build's chunks.
 *
 * Passed through unchanged; `/api/health` does NOT trust it as the primary
 * source and prefers the image's Next BUILD_ID (`src/lib/release.ts`). The CI
 * commit only works when Coolify also injects `SOURCE_COMMIT` into the build
 * (`include_source_commit_in_build`), which it does NOT here — so a
 * `build-${Date.now()}` fallback would make every build a "new release" and
 * send open tabs into a reload loop. Hence: no timestamp fallback.
 */
const RELEASE_ID = process.env.SOURCE_COMMIT?.trim() || '';

/**
 * CSP for the static Storybook build (`/storybook`).
 *
 * Same shape as the app policy, plus the two Google-Fonts origins that the
 * Storybook shell loads in `.storybook/preview-head.html`. Deliberately scoped
 * to `/storybook*`: the public site keeps `font-src 'self'`.
 */
const STORYBOOK_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

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
  // Payload's upload MIME detection (`file-type`) resolves `strtok3` through a
  // runtime `import(specifier)` with a non-literal specifier, which no bundler
  // can trace. Turbopack then copied only the statically imported subpath
  // (`strtok3/core`) into the standalone output and left `lib/index.js`,
  // `types.js` and `FileTokenizer.js` behind → production threw
  // `Cannot find module '/app/node_modules/strtok3/lib/index.js'` on every
  // `/api/media/file/*` request and answered **500** on every image, although
  // the uploads were present and intact on disk.
  //
  // Two pieces are required together (each alone verified insufficient):
  //   1. these packages stay external, so whole package files are copied
  //      verbatim instead of being bundled/partially traced, and
  //   2. a static `import 'strtok3'` in the Payload REST route
  //      (src/app/(payload)/api/[...slug]/route.ts) makes Turbopack trace the
  //      package entry as well.
  // `outputFileTracingIncludes` is NOT an option: Next 16 skips the whole
  // include/exclude pass under Turbopack, so such globs are a silent no-op.
  // `@tokenizer/token` is types-only and `peek-readable` is not a dep of
  // strtok3 v10 — neither is listed.
  serverExternalPackages: ['file-type', 'strtok3', 'token-types', '@tokenizer/inflate'],
  experimental: {
    // global-not-found (docs: 01-app/03-api-reference/03-file-conventions/
    // not-found.md, § "global-not-found.js (experimental)"):
    //   "Used to define a global 404 page for unmatched routes across your
    //    entire app. This is handled at the routing level and doesn't depend on
    //    rendering a layout or page. [...] Next.js skips rendering and directly
    //    returns this global page."
    // Exactly our case per the docs: "Your root layout is defined using
    // top-level dynamic segments (e.g. `app/[country]/layout.tsx`)" — this app
    // has app/(frontend)/[locale]/layout.tsx.
    //
    // Why it is REQUIRED here: with cacheComponents the [locale] shell streams
    // (layout `connection()` inside <Suspense>), and a streamed response is
    // fixed at 200 — docs: file-conventions/loading.md § "Status codes"
    // ("Streaming page responses begin with a `200` status code"). notFound()
    // from the layout, the page or generateMetadata all measured 200
    // (05.11.2026). global-not-found bypasses that render path entirely and
    // answers unmatched URLs with a real, prerendered 404 document.
    globalNotFound: false,
  },
  // Streaming metadata disabled (htmlLimitedBots matches every UA): otherwise
  // Next flushes the HTML head (200) before the page can reject an unknown
  // slug with notFound(), so the status is already committed. Unknown *URLs*
  // (no route at all) are answered by global-not-found (see experimental above);
  // notFound() thrown inside the [locale] tree (e.g. by the [[...slug]] page)
  // still renders the localized `[locale]/not-found.tsx` — that one keeps its
  // streamed 200 + noindex, because the shell has already flushed.
  htmlLimitedBots: /.*/,
  // Global security headers (non-CSP part). X-Frame-Options SAMEORIGIN instead
  // of DENY: the Payload admin embeds the live-preview route as a same-origin
  // iframe, which DENY would block. The matching *embedding* permission lives
  // in CSP frame-src ('self', see CSP_ENFORCE) — X-Frame-Options alone is not
  // enough: without frame-src 'self' the browser blocks the preview frame even
  // though XFO allows it.
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
      headers: [
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'Cache-Control', value: MEDIA_CACHE_CONTROL },
      ],
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
      // Admin panel, REST/API surface and live preview: never cacheable at the
      // edge, regardless of TTL. `/og` is intentionally NOT here: the OG
      // renderer is public and gets a short, bounded edge TTL instead (see the
      // dedicated entry below).
      source: '/:path(admin|api|preview)(.*)',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
    {
      // Per-page OG images: public, 1 day (deterministic per query; warmed at
      // deploy, stale-if-error covers a longer outage).
      source: '/og',
      headers: [{ key: 'Cache-Control', value: OG_CACHE_CONTROL }],
    },
    {
      // Payload's file endpoint is public media; the generic `/api/*` no-store
      // entry above matches first, so this later entry must re-assert the
      // public TTL (last entry wins for a given source + header key).
      source: '/api/media/file/:path*',
      headers: [{ key: 'Cache-Control', value: MEDIA_CACHE_CONTROL }],
    },
    {
      // Generated favicon route (HTML references it with a content hash query).
      source: '/favicon.ico',
      headers: [{ key: 'Cache-Control', value: FAVICON_CACHE_CONTROL }],
    },
    {
      // Locale-scoped preview and settings routes.
      source: '/:locale(de|en)/:path(preview|settings)(.*)',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
    // -- Storybook (statische Doku unter /storybook) --------------------------
    // Eigene CSP NUR für die Storybook-Ausgabe: die Docs-Seiten laden ihre
    // Schriften (Space Grotesk / JetBrains Mono) über Google Fonts. Die globale
    // Policy erlaubt `font-src 'self'` — im Storybook fiele die Typografie
    // sonst still auf Systemfonts zurück. Die App-Seiten bleiben unverändert
    // streng; Storybook ist eine statische Doku-Seite ohne Nutzerdaten.
    // Zwei Sources, weil Header pro REQUEST-Pfad matchen: `/storybook` (der
    // Rewrite auf index.html ändert den Pfad nicht) und alle Assets darunter.
    {
      source: '/storybook',
      headers: [{ key: 'Content-Security-Policy', value: STORYBOOK_CSP }],
    },
    {
      source: '/storybook/:path*',
      headers: [{ key: 'Content-Security-Policy', value: STORYBOOK_CSP }],
    },
  ],
  // ─── Storybook (statische Ausgabe unter /storybook) ──────────────────────
  // Der Build liegt in `src/public/storybook` und wird vom Dockerfile als
  // `/app/public` mitkopiert. Next löst für `/public`-VERZEICHNISSE keinen
  // Directory-Index auf — `/storybook` wäre ein 404, obwohl die Datei als
  // `/storybook/index.html` existiert. Deshalb genau eine `beforeFiles`-Rewrite
  // auf die Entry-Datei: die URL bleibt `/storybook` (kein Redirect, kein
  // sichtbarer `index.html`-Pfad), und die im HTML absolut referenzierten
  // Assets (`/storybook/assets/…`, gesetzt über `viteFinal.base`) treffen.
  //
  // Kanonisch ist `/storybook` OHNE Slash (Site-Regel wie `/de/` → 308 → `/de`).
  // Den 308 für `/storybook/` erzeugt Next bereits selbst über die
  // Trailing-Slash-Normalisierung (gemessen); der `redirects()`-Eintrag ist die
  // explizite Absicherung, falls diese Normalisierung je abgeschaltet wird.
  rewrites: async () => ({
    beforeFiles: [{ source: '/storybook', destination: '/storybook/index.html' }],
  }),
  redirects: async () => [{ source: '/storybook/', destination: '/storybook', permanent: true }],
};

/**
 * Payload's `withPayload` appends `Accept-CH` / `Critical-CH:
 * Sec-CH-Prefers-Color-Scheme` to EVERY response (see
 * @payloadcms/next/dist/withPayload/withPayload.js). `Critical-CH` signals a
 * client-hint negotiation, and Cloudflare refuses to store any response that
 * carries it — every page stayed `cf-cache-status: DYNAMIC` while
 * /_next/static (no such header) and /robots.txt cached fine (measured
 * 05.11.2026). It is also the reason `/de/career` stopped being edge-cached:
 * the header arrives with the Next 16 / Payload 4 baseline, not with a cache
 * change.
 *
 * The admin panel still needs the hint (theme resolution reads
 * `Sec-CH-Prefers-Color-Scheme`), so it is re-emitted for /admin only — the
 * public frontend does not depend on it (theme comes from the pre-hydration
 * bootstrap script), and those are exactly the responses that need to cache.
 *
 * Plugins append their `headers()` AFTER `nextConfig.headers()`, so the
 * removal has to be the LAST entry — hence this wrapper around withPayload.
 */
const config = withPayload(nextConfig);

const stripsClientHint = (headers: Awaited<ReturnType<NonNullable<NextConfig['headers']>>>) => [
  ...(headers ?? []),
  {
    // Last entry wins for a given source+key.
    source: '/:path*',
    headers: [
      { key: 'Critical-CH', value: '' },
      { key: 'Accept-CH', value: '' },
    ],
  },
  {
    // The admin keeps the hint: its theme resolver reads it.
    source: '/admin/:path*',
    headers: [
      { key: 'Critical-CH', value: 'Sec-CH-Prefers-Color-Scheme' },
      { key: 'Accept-CH', value: 'Sec-CH-Prefers-Color-Scheme' },
    ],
  },
];

if (typeof config.headers === 'function') {
  const originalHeaders = config.headers;
  config.headers = async () => stripsClientHint(await originalHeaders());
}

export default config;
