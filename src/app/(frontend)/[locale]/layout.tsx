import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { Averia_Serif_Libre, Geist_Mono } from 'next/font/google';
import '../../globals.css';
import { SettingsProvider } from '@/components/SettingsProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import {
  getCachedNavigation,
  getCachedPageBySlug,
  getCachedSiteSettings,
  getCachedTranslations,
} from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { envConfig } from '@/envConfig';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';

const averia = Averia_Serif_Libre({
  weight: ['300', '400', '700'],
  variable: '--font-averia',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mostheimer',
  description: 'Personal Website',
  metadataBase: new URL(envConfig.serverUrl),
};

// [block]-Opt-out (docs 01-app/03-api-reference/03-file-conventions/
// 02-route-segment-config/instant.md): der NotFoundGate im Layout liest
// x-pathname (headers()) und connection() OUTSIDE der Suspense-Boundary,
// um unbekannte Slugs VOR dem ersten Header-Flush zu 404-en — das ist
// bewusst ein Blocking-Render. Diese Export erlaubt das Segment-weit;
// der Build-Container erreicht die DB ohnehin nicht (Coolify-Profil
// „Build ohne DB"), die Routen rendern runtime-seitig.
export const instant = false;

/**
 * Statischer Skeleton-Fallback: nur Layout/Deko, KEINE Payload-Reads und
 * keine Dynamic-APIs — bleibt im Prerender statisch erzeugbar.
 */
function LayoutSkeleton() {
  return (
    <div className="flex flex-col min-h-screen" aria-hidden="true">
      <div className="h-16 border-b border-border bg-surface animate-pulse" />
      <main className="flex-1 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto w-full space-y-4 animate-pulse">
          <div className="h-10 w-2/3 mx-auto rounded-lg bg-surface" />
          <div className="h-40 rounded-2xl bg-surface/60" />
        </div>
      </main>
      <div className="h-24 border-t border-border bg-surface animate-pulse" />
    </div>
  );
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';

  return (
    <html lang={locale}>
      <body className={`${averia.variable} ${geistMono.variable} antialiased`}>
        <NotFoundGate locale={locale}>
          <Suspense fallback={<LayoutSkeleton />}>
            <LayoutShell locale={locale}>{children}</LayoutShell>
          </Suspense>
        </NotFoundGate>
      </body>
    </html>
  );
}

/**
 * Eigene statische Routen unter [locale] — sie rendern NICHT den
 * [[...slug]] Catch-All, daher hat das Gate dort nichts zu pruefen.
 */
const STATIC_CHILD_ROUTES = new Set(['preview', 'settings', 'impressum']);

/**
 * 404-Status vor dem ersten Header-Flush (Doku-Basis:
 * docs/01-app/03-api-reference/03-file-conventions/not-found.md,
 * "Before streaming starts, Next.js returns a 404 status code." +
 * docs/01-app/02-guides/streaming.md, "The HTTP contract":
 * die Response flusht Header, sobald ein Suspense-Fallback rendert —
 * danach laesst sich der Status nicht mehr aendern).
 *
 * Das dynamische Shell (LayoutSkeleton) streams nach einem await im
 * Suspense-Boundary sofort — die Page-Komponente wirft ihr notFound()
 * zu diesem Zeitpunkt zu spaet (sonst: 200 + noindex-Meta). Daher
 * gleicht das Gate hier OUTSIDE der Suspense-Boundary den Slug gegen
 * die gecachten Pages-Daten. Bei null -> notFound(), bevor irgendwas
 * geflusht ist -> echter HTTP-404. Fuer gefundene Slugs blockiert das
 * Gate nur den ersten gecachten Lookup ('use cache', warm microseconds),
 * das Skeleton-Streaming bleibt unverändert erhalten (der Suspense-Fallback
 * flusht weiter bei den Shell-Reads darunter).
 */
async function NotFoundGate({
  locale,
  children,
}: {
  locale: FrontendLocale;
  children: React.ReactNode;
}) {
  await connection();

  const headersList = await headers();
  const pathname = headersList.get('x-pathname');

  // Ohne x-pathname (Proxy nicht gelaufen: interne Requests, _next)
  // faellt das Gate pass-through auf das bestehende Verhalten zurueck.
  if (!pathname) return children;

  // Nur der [[...slug]]-Catch-All wird geprueft; eigenstaendige
  // Routen unter [locale] (settings/impressum/preview) durchlassen.
  const localePrefix = `/${locale}`;
  let rest: string | null;
  if (pathname === localePrefix) {
    rest = '';
  } else if (pathname.startsWith(`${localePrefix}/`)) {
    rest = pathname.slice(localePrefix.length + 1);
  } else {
    rest = null;
  }

  if (rest === null || rest === '' || STATIC_CHILD_ROUTES.has(rest.split('/')[0])) {
    return children;
  }

  const slug = rest;
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) {
    // Wirft, bevor irgendein Header geflusht ist -> echter HTTP-404.
    notFound();
  }

  return children;
}

/**
 * Dynamische Shell: connection() bricht den Build-Prerender-Versuch ab
 * (Coolify-Docker-Build erreicht die DB nicht) und rendert bei Real-Requests
 * sofort. Alle Payload-Reads laufen ueber 'use cache'-Queries — DB-Hits nur
 * bei Cache-Miss; Frische steuern die Payload-Hooks via revalidateTag.
 */
async function LayoutShell({
  locale,
  children,
}: {
  locale: FrontendLocale;
  children: React.ReactNode;
}) {
  await connection();

  const [siteSettings, translations, navigation] = await Promise.all([
    getCachedSiteSettings(locale),
    getCachedTranslations(locale),
    getCachedNavigation(locale),
  ]);

  // Wartungsmodus: Komplett-Screen ohne Header/Footer/Inhalt auf jeder Seite
  if (siteSettings.maintenanceMode) {
    return <MaintenanceScreen locale={locale} />;
  }

  return (
    <>
      <TranslationsProvider translations={translations}>
        <SettingsProvider>
          <div className="flex flex-col min-h-screen">
            <Header locale={locale} navLinks={navigation.headerLinks ?? []} />
            <main className="flex-1 py-10 px-4 md:px-8">{children}</main>
            <Footer locale={locale} navLinks={navigation.footerLinks ?? []} />
          </div>
        </SettingsProvider>
      </TranslationsProvider>
    </>
  );
}
