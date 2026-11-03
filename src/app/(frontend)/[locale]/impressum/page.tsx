import type { Metadata } from 'next';
import { envConfig } from '@/envConfig';
import { ogImageUrl } from '@/components/og/ogCard';

// Locales build-statisch (kein DB-Lookup) — Root-Param-Pflicht am Build.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// Haertung (ensureStatic, docs .../route-segment-config/ensureStatic.md):
// 'shell' = App Shell des default-Link-Prefetchs muss statisch bleiben
// (Partial Prefetching ist aktiv). 'navigation' scheidet aus: das
// [locale]-Layout enthaelt den NotFoundGate als bewussten Blocking-Render
// (connection()/headers() Outside-Suspense, Pre-Flush-404) — vollstaetige
// statische Output-Validation schlaegt dort an (empirisch am Build
// verifiziert, Message static-route-dynamic). 'shell' ist der engste
// Level, der mit dem Gate und instant=false am Layout kompatibel bleibt
// (instant=false deaktiviert nur die Instant-Navigation-Validation).
export const ensureStatic = 'shell';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = envConfig.serverUrl;
  return {
    title: 'Impressum - Mostheimer',
    // AEO-Layer OG/Twitter-Parity (Profile der Catch-All-Pages, ohne eigenes
    // og-title: Plattformen übernehmen <title>/og:title-Fallback).
    // AEO-Layer OG/Twitter-Parity (per-Page-Karte via /og-Route —
    // opengraph-image-Dateikonvention ist im Catch-All nicht möglich,
    // siehe src/app/og/route.tsx).
    openGraph: {
      title: 'Impressum',
      type: 'website',
      siteName: 'Mostheimer',
      url: `${baseUrl}/de/impressum`,
      images: [ogImageUrl('Impressum', 'de')],
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `${baseUrl}/de/impressum`,
      languages: {
        en: `${baseUrl}/en/impressum`,
        de: `${baseUrl}/de/impressum`,
      },
      // x-default held back — unverified Key-Passthrough (siehe
      // [[...slug]]/page.tsx generateMetadata).
    },
  };
}

export default async function ImpressumPage() {
  return (
    <article className="prose max-w-2xl mx-auto w-full">
      <h1 className="font-averia text-3xl font-bold">Impressum</h1>

      <h2 className="font-averia text-xl font-semibold mt-6 mb-2">Angaben gemäß § 5 DDG</h2>
      <p className="text-foreground">
        Mayra Ostheimer
        <br />
        Ringstraße 60
        <br />
        25368 Kiebitzreihe
      </p>

      <h2 className="font-averia text-xl font-semibold mt-6 mb-2">Kontakt</h2>
      <p className="text-foreground">
        E-Mail:{' '}
        <a href="mailto:mail@mostheimer.de" className="text-primary hover:underline">
          mail@mostheimer.de
        </a>
        <br />
        Telefon:{' '}
        <a href="tel:+4917663787951" className="text-primary hover:underline">
          0176 63787951
        </a>
      </p>
    </article>
  );
}
