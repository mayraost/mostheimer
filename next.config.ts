import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

/**
 * CSP-Rollout (Finalzustand nach Nonce-Prüfung):
 *
 * Nonce-Entscheidung: KEIN Nonce. Doku-Basis
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md —
 * "When you use nonces in your CSP, all pages must be dynamically rendered"
 * (Dynamic Rendering Requirement, ca. Zeile 391: ISR deaktiviert, PPR
 * inkompatibel, kein CDN-Caching). Projekteigene cacheComponents/OSR-
 * Architektur (statisch + Payload-Hook-Invalidierung) waere damit zerstört.
 *
 * Enforce-CSP = dokumentiertes "Without Nonces"-Muster desselben Docs
 * (Zeilen 421–435): Next+Payload emittieren Inline-Bootstrap-Scripts
 * (self.__next_f.push) und Inline-Styles (Lexical-Admin) — unter
 * default-src 'self' ohne script/style-src-Override wären sie geblockt;
 * daher script/style-src mit 'unsafe-inline' (Next-16-ohne-Nonce-Praxis),
 * dev zusätzlich 'unsafe-eval' (React-HMR/debug evals, Doku "Good to know").
 *
 * Report-Only-Spürer daneben für den Schritt, den unsafe-inline später
 * abzugeben (req für Nonce/Hash-Infra separat).
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

// Observability: RO-Header listet NUR die verschärften Direktiven; die
// Reports zeigen, was ersetzt werden müsste, wenn 'unsafe-inline' wegfällt.
// Kein report-to/Endpoint (eigene Report-Infra (Storage/Endpoint) ist
// bewusst NICHT Teil dieses Rollouts).
const CSP_REPORT_ONLY = ["script-src 'self'", "style-src 'self'"].join('; ');

// Ausfuehrliche Feature-Restriktion: alles, was die App nicht nutzt.
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
  /* config options here */
  output: 'standalone',
  // Header-Kompression im Node selbst (guenstig, hilft hinter Proxies ohne Kompression)
  compress: true,
  // X-Powered-By-Header entfernen
  poweredByHeader: false,
  reactStrictMode: true,
  // cacheComponents (Next 16): Datenlayer via 'use cache' + cacheTag,
  // dynamische Shell via connection() — Build-Container (Coolify-Docker)
  // erreicht die DB nicht, deshalb kein Build-Prerender der Public-Routes;
  // OSR-Kontrolle laeuft ausschliesslich ueber Payload-Hooks + revalidateTag
  // (vgl. nextjs-payload-caching-Skill, Profil "Build ohne DB").
  cacheComponents: true,
  // Skill-Empfehlung Next 16: Partial Prefetching gemeinsam aktivieren
  // (naechstes Major Removal des auslaufenden Config-Splits).
  partialPrefetching: true,
  // Streaming-Metadata deaktiviert (htmlLimitedBots matcht alle UAs):
  // sonst flusht Next den HTML-Head frueh (200) BEVOR der NotFoundGate im
  // [locale]-Layout einen unbekannten Slug mit notFound() erschlaegt —
  // der Status waere dann bereits nach Aussen committed (vgl.
  // generate-metadata.md "Streaming metadata"). Mit blockierender
  // Metadata wartet der Head auf generateMetadata; notFound() im Gate
  // wirft vor jedem Flush -> echter HTTP-404
  // (not-found.md: "Before streaming starts, Next.js returns a 404 status
  // code").
  htmlLimitedBots: /.*/,
  // Sicherheits-Header global (Muster aus scobio2026, dort via buildCsp-Adapter;
  // hier bewusst NUR die Non-CSP-Header uebernommen). X-Frame-Options SAMEORIGIN
  // statt DENY: das Payload-Admin-Panel bettet die Live Preview als iframe der
  // /preview-Route ein – DENY wuerde dieses Self-Iframe blocken; bei gleicher
  // Origin (panel + frontend am selben Host) ist SAMEORIGIN ausreichend strikt.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
        // Isolation: eigene Browsing-Contexte koppeln sich nicht mit
        // Cross-Origin-Referenzen (Mitigation gegen Lateral-Mitlesen).
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        // CSP-Rollout: enforce (Verifizierter Scope wie oben).
        { key: 'Content-Security-Policy', value: CSP_ENFORCE },
        // Parallel dazu der verschärfte Spürer fuer den späteren
        // 'unsafe-inline'-Abbau (kein report-to-Endpoint, bewusst ohne
        // eigene Report-Infra).
        { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
      ],
    },
    {
      // Media wird nur same-origin konsumiert (kein CDN/externe Embeds):
      // Cross-Origin-Lading von FOREIGN Sites verbieten — bewusst NICHT
      // global, sonst wuerde auch jedes legitime Cross-Origin-Laden (z. B.
      // API-Fetches aus externen Tooling-Kontexten) geblockt.
      source: '/media/:path*',
      headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }],
    },
    {
      // Payload-REST-File-Endpoint der media-Collection (Verifiziert:
      // dist/uploads/endpoints/index.js `path: '/file/:filename'` mounted
      // unter Collection-Slug → /api/media/file/<filename>) — transformierte
      // Varianten werden unter derselben Route gelesen.
      source: '/api/media/file/:path*',
      headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }],
    },
  ],
  // Hinweis: Der fruehere webpack()-extensionAlias-Block ist in Next 16 obsolet –
  // Turbopack ist Default fuer dev UND build (Payload 4 unterstuetzt Turbopack
  // nativ, siehe Payload-Doku "Enable Turbopack"); der Block wurde nur bei
  // Webpack-Fallback ausgewertet und ist bei Turbopack-Builds toter Code.
};

export default withPayload(nextConfig);
