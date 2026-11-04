import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
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
import { MaintenanceScreen, MaintenanceBadge } from '@/components/MaintenanceScreen';
import { getCommandItems } from '@/components/ui/commandItems';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Display + Body: Space Grotesk (Industrial Grotesk, tight tracking im
// Utility-Layer). Code/Metadaten: JetBrains Mono.
const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mostheimer — Web & Application Architect',
  description:
    'Mayra Ostheimer — Web & Application Architect und Staff-Level Fullstack Engineer. Composable Architekturen, Next.js/Payload, Team- & Projektleitung für produktionsreife Systeme.',
  metadataBase: new URL(envConfig.serverUrl),
  // AEO-Layer (Research 03.11.2026): OG/Twitter-Basis für alle Segmente;
  // per-Page-Cards kommen aus der /og-Route (catch-all-Konvention).
  openGraph: { siteName: 'Mostheimer', type: 'website' },
  twitter: { card: 'summary_large_image' },
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
 * Pre-Hydration-Theme-Bootstrap: setzt die Theme-Klasse VOR dem ersten
 * Paint, damit Default-Dark (auch bei light-preferring OS) und ein
 * gespeichertes User-Theme ohne Flash greifen. SettingsProvider liest
 * dieselbe Quelle ('theme' in localStorage) beim Mount.
 */
const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark'||s==='system')?s:'dark';var c=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(c);}catch(e){document.documentElement.classList.add('dark');}})();`;

/**
 * Statischer Skeleton-Fallback: nur Layout/Deko, KEINE Payload-Reads und
 * keine Dynamic-APIs — bleibt im Prerender statisch erzeugbar.
 */
function LayoutSkeleton() {
  return (
    <div className="flex min-h-screen flex-col" aria-hidden="true">
      <div className="h-16 animate-pulse border-b border-border bg-surface" />
      <main className="flex-1 px-4 md:px-8">
        <div className="mx-auto w-full max-w-6xl animate-pulse space-y-2">
          <div className="h-8 w-2/3 rounded-[6px] bg-surface" />
          <div className="h-40 rounded-[6px] bg-surface/60" />
        </div>
      </main>
      <div className="h-24 animate-pulse border-t border-border bg-surface" />
    </div>
  );
}

function SkipLink({ locale }: { locale: string }) {
  const label = locale === 'de' ? 'Zum Inhalt springen' : 'Skip to content';
  return (
    <a
      href="#main-content"
      className="sr-only rounded-[6px] border border-primary bg-surface-raised px-4 py-2 font-mono text-sm text-primary focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-block"
    >
      {label}
    </a>
  );
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';

  return (
    <html lang={locale} className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <SkipLink locale={locale} />
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

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  // Command-Palette-Einträge sind statische Informationsarchitektur (kein
  // CMS-Read) — im Layout verfügbar für Header und Mobile-Drawer.
  const commandItems = getCommandItems(locale);

  // Wartungsmodus: Komplett-Screen ohne Header/Footer/Inhalt auf jeder Seite
  if (siteSettings.maintenanceMode) {
    if (!user) {
      return <MaintenanceScreen locale={locale} />;
    }
    return (
      <>
        <MaintenanceBadge locale={locale} />
        <TranslationsProvider translations={translations}>
          <SettingsProvider>
            <div className="flex min-h-screen flex-col">
              <Header
                locale={locale}
                navLinks={navigation.headerLinks ?? []}
                commandItems={commandItems}
              />
              <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8">
                {children}
              </main>
              <Footer locale={locale} navLinks={navigation.footerLinks ?? []} />
            </div>
          </SettingsProvider>
        </TranslationsProvider>
      </>
    );
  }

  return (
    <TranslationsProvider translations={translations}>
      <SettingsProvider>
        <div className="flex min-h-screen flex-col">
          <Header
            locale={locale}
            navLinks={navigation.headerLinks ?? []}
            commandItems={commandItems}
          />
          <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8">
            {children}
          </main>
          <Footer locale={locale} navLinks={navigation.footerLinks ?? []} />
        </div>
      </SettingsProvider>
    </TranslationsProvider>
  );
}
