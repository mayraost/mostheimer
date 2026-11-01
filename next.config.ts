import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

/**
 * CSP-Report-Only-Rollout (Stufe 1, KEIN Enforce): bewusst schmale
 * Directive-Scope (default/img/object/base-uri/form-action/frame-ancestors/
 * upgrade-insecure-requests) OHNE script-src/style-src — Turbopack-Dev und
 * Payload-Lexical embeden erhebliche Inline-Styles/Scripts; bis nonce-Infra
 * stünden dort massig False-Positives im Report-Empfänger. Erst wenn die
 * Reports leer sind, wird auf Content-Security-Policy (Enforce) umgestellt.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob:",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

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
        // Rollout-Stufe 1: CSP nur REPORTEN (keine Verletzung blockiert).
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
  ],
  // Hinweis: Der fruehere webpack()-extensionAlias-Block ist in Next 16 obsolet –
  // Turbopack ist Default fuer dev UND build (Payload 4 unterstuetzt Turbopack
  // nativ, siehe Payload-Doku "Enable Turbopack"); der Block wurde nur bei
  // Webpack-Fallback ausgewertet und ist bei Turbopack-Builds toter Code.
};

export default withPayload(nextConfig);
