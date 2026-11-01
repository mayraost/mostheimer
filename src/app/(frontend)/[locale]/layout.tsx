import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { Averia_Serif_Libre, Geist_Mono } from 'next/font/google';
import '../../globals.css';
import { SettingsProvider } from '@/components/SettingsProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import {
  getCachedNavigation,
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
        <Suspense fallback={<LayoutSkeleton />}>
          <LayoutShell locale={locale}>{children}</LayoutShell>
        </Suspense>
      </body>
    </html>
  );
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
