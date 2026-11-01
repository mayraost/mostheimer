import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

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
  // Hinweis: Der fruehere webpack()-extensionAlias-Block ist in Next 16 obsolet –
  // Turbopack ist Default fuer dev UND build (Payload 4 unterstuetzt Turbopack
  // nativ, siehe Payload-Doku "Enable Turbopack"); der Block wurde nur bei
  // Webpack-Fallback ausgewertet und ist bei Turbopack-Builds toter Code.
};

export default withPayload(nextConfig);
