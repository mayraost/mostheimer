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

// Display + body text: Space Grotesk (tight tracking lives in the utility
// layer). Code/metadata: JetBrains Mono.
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
  // Base OG/Twitter defaults for every segment; per-page cards come from the
  // /og route.
  openGraph: { siteName: 'Mostheimer', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

// Opt-out of Next's [block] navigation check: the NotFoundGate below reads
// `x-pathname` and calls connection() OUTSIDE the Suspense boundary on
// purpose, so unknown slugs can 404 before the first header flush. That is a
// deliberate blocking render; routes still render at runtime because the build
// container has no DB.
export const instant = false;

/**
 * Pre-hydration theme bootstrap: sets the theme class before the first paint so
 * default-dark (also on light-preferring OS) and a stored user theme apply
 * without a flash. SettingsProvider reads the same 'theme' localStorage key on
 * mount.
 */
const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark'||s==='system')?s:'dark';var c=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(c);}catch(e){document.documentElement.classList.add('dark');}})();`;

/**
 * Static skeleton fallback: layout chrome only, no Payload reads and no dynamic
 * APIs — so it stays statically prerenderable.
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
 * Routes under [locale] that render their own tree instead of the
 * [[...slug]] catch-all — the gate has nothing to check there.
 */
const STATIC_CHILD_ROUTES = new Set(['preview', 'settings', 'impressum']);

/**
 * Returns a real 404 status before the first header flush.
 *
 * Once a Suspense fallback renders, the response headers are flushed and the
 * status can no longer change. LayoutSkeleton streams as soon as the boundary
 * awaits, which is far too late for the page component to throw notFound()
 * (that would yield 200 + noindex). So the gate resolves the slug against the
 * cached pages here, OUTSIDE the Suspense boundary: null → notFound() before
 * anything is flushed. For known slugs it only blocks the first cached lookup
 * ('use cache', warm), so skeleton streaming below is unaffected.
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

  // No x-pathname means the proxy did not run (internal requests, _next):
  // pass through with the previous behaviour.
  if (!pathname) return children;

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
    // Throws before any header was flushed → a real HTTP 404.
    notFound();
  }

  return children;
}

/**
 * Dynamic shell: connection() aborts the build prereender (the Coolify build
 * container has no DB) and renders immediately on real requests. All Payload
 * reads go through 'use cache' queries — DB hits only on a cache miss, with
 * freshness driven by the Payload hooks via revalidateTag.
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
  // Command-palette entries are static information architecture (no CMS read),
  // shared here with the header and the mobile drawer.
  const commandItems = getCommandItems(locale);

  // Maintenance mode replaces header/footer/content on every page.
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
