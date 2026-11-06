import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import '../../globals.css';
import { SettingsProvider } from '@/components/SettingsProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import { DocumentShell } from '@/components/layout/DocumentShell';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { getCachedNavigation, getCachedTranslations } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { envConfig } from '@/envConfig';
import { CookieConsent } from '@/components/consent/CookieConsent';
import { ReleaseGuard } from '@/components/ReleaseGuard';
import { runPendingCloudflarePurges } from '@/cms/cache/frontend/purges';
import { getCachedRouteRegistry } from '@/cms/cache/frontend/queries';

import { getCommandItems } from '@/components/ui/commandItems';
import { layoutMetadata } from './layoutMetadata';

/**
 * Base metadata for every `[locale]` segment; the object itself lives in
 * `layoutMetadata.ts` (kept import-light for the wording guardrail test).
 */
export const metadata: Metadata = layoutMetadata;

// The shell renders `connection()`-guarded content inside a Suspense boundary
// (skeleton streams first, real chrome follows), which Next's [block]
// navigation check flags. That streaming is deliberate: unknown slugs are
// answered by `[[...slug]]` (page-level notFound → [locale]/not-found.tsx), so
// the layout no longer needs a blocking pre-flush gate at all.
export const instant = false;

/**
 * Static skeleton fallback: layout chrome only, no Payload reads and no dynamic
 * APIs — so it stays statically prerenderable.
 */
function LayoutSkeleton() {
  return (
    <div className="flex min-h-page flex-col" aria-hidden="true">
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

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';

  return (
    // Document shell (html/body, fonts, theme + consent bootstrap, skip link)
    // lives HERE and only here — see src/components/layout/DocumentShell.tsx.
    <DocumentShell locale={locale}>
      <Suspense fallback={<LayoutSkeleton />}>
        <LayoutShell locale={locale}>{children}</LayoutShell>
      </Suspense>
    </DocumentShell>
  );
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

  // Route registry for the edge purge: refreshes the slug -> route map (cached
  // under cms:pages) so a globals/media flush purges every real page even after
  // a cold start. No-op during the build phase.
  await getCachedRouteRegistry();

  // Cloudflare phase coupling: a CMS save flushes the Next tag AND enqueues the
  // matching edge purge. The purge runs HERE, before anything renders, so this
  // response can never re-cache stale content behind the purge (see
  // src/cms/cache/frontend/purges.ts). No-op without Cloudflare credentials.
  const edgePurge = await runPendingCloudflarePurges();
  if (edgePurge.pending > 0) {
    console.info(
      `[cf-cache] Purge beim Request: ${edgePurge.status} ` +
        `(${edgePurge.pending} Flush(es), ${edgePurge.urls} URLs)`,
    );
  }

  // Shell data is cache-tag based only: no auth, no direct Payload boot. The
  // site-settings read is a cached query (not a per-visitor auth path), so the
  // entry stays shared across requests.
  //
  // No await may run inside this component BEFORE a notFound() throw from a
  // child page: the first await flushes the stream (status 200).
  const [translations, navigation] = await Promise.all([
    getCachedTranslations(locale),
    getCachedNavigation(locale),
  ]);

  // Command-palette entries are static information architecture (no CMS read),
  // shared here with the header and the mobile drawer.
  const commandItems = getCommandItems(locale);

  return (
    <TranslationsProvider translations={translations}>
      <SettingsProvider>
        <SiteChrome
          header={
            <Header
              locale={locale}
              navLinks={navigation.headerLinks ?? []}
              commandItems={commandItems}
            />
          }
          footer={
            <Footer
              locale={locale}
              navLinks={navigation.footerLinks ?? []}
              cookieSettingsLabel={translations.cookies}
              rightsReserved={translations.footer}
            />
          }
        >
          {children}
        </SiteChrome>
        <CookieConsent gtmId={envConfig.gtmId} />
        {/* Reloads an open tab once after a deploy, instead of letting it
            navigate with the previous build's client bundle. */}
        <ReleaseGuard />
      </SettingsProvider>
    </TranslationsProvider>
  );
}
