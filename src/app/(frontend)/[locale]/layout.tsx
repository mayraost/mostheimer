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
import {
  getCachedNavigation,
  getCachedSiteSettings,
  getCachedTranslations,
} from '@/cms/cache/frontend/frontendCache';
import { getCachedTranslation, getCachedTranslationsGlobal } from '@/lib/translations.server';
import { loadChromeCopy, loadErrorCopy } from '@/lib/translationBundles.server';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { envConfig } from '@/envConfig';
import { CookieConsent } from '@/components/consent/CookieConsent';
import { ReleaseGuard } from '@/components/ReleaseGuard';
import { runPendingCloudflarePurges } from '@/cms/cache/frontend/purges';
import { getCachedRouteRegistry } from '@/cms/cache/frontend/queries';

import { getCommandItems } from '@/components/ui/commandItems';
import { perRequestMetadata } from './layoutMetadata';

/**
 * Base metadata for every `[locale]` segment.
 *
 * Generated per request instead of a static export so the values can come from
 * the CMS (`seo.*` copy + `site-settings` brand). Static export with literals
 * was the last place where shipping copy lived in code. The fallbacks inside
 * `perRequestMetadata` are the registry seeds, so a cold cache still renders
 * real text; the wording guardrail test validates `layoutMetadata` (same
 * seeds).
 *
 * DB-less build guard: metadata resolves BEFORE `connection()`, so during the
 * prerender attempt every cached read is skipped and the seeds apply.
 */
export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

  if (isBuild) {
    return perRequestMetadata({ title: '', description: '', siteName: '' });
  }

  const [title, description, siteSettings] = await Promise.all([
    getCachedTranslation(locale, 'seo.title'),
    getCachedTranslation(locale, 'seo.description'),
    getCachedSiteSettings(locale),
  ]);

  return perRequestMetadata({
    title,
    description,
    siteName: siteSettings.siteName ?? '',
  });
}

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

  // Skip link copy comes from the translations cache (own `'use cache'` entry
  // under the translations tag), not from a literal: it is the first focusable
  // element of every page. Outside the Suspense boundary on purpose — it is a
  // cached read, not a request-time one, and it must exist on the first paint.
  //
  // DB-less build guard (same pattern as `getCachedPageBySlug`): the Coolify
  // build container cannot reach Postgres, and this await renders OUTSIDE the
  // Suspense boundary, so an unguarded read would abort the prerender. During
  // the build the shell is only a skeleton anyway; the real request resolves
  // the copy.
  const skipToContent =
    process.env.NEXT_PHASE === 'phase-production-build'
      ? ''
      : await getCachedTranslation(locale, 'chrome.skipToContent');

  return (
    // Document shell (html/body, fonts, theme + consent bootstrap, skip link)
    // lives HERE and only here — see src/components/layout/DocumentShell.tsx.
    <DocumentShell locale={locale} skipToContent={skipToContent}>
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
  const [translations, navigation, siteSettings, chrome, errorCopy, commandItems] =
    await Promise.all([
      getCachedTranslations(locale),
      getCachedNavigation(locale),
      // Brand name for the accessible names of the logo/footer links.
      getCachedSiteSettings(locale),
      // One typed bundle: the header/footer labels in a single cached read set.
      loadChromeCopy(locale),
      // Error-card copy for the client boundaries (they cannot await the cache).
      loadErrorCopy(locale),
      // Structure (id → href/anchor) is static; labels + keywords are CMS copy.
      getCachedTranslationsGlobal(locale).then((global) => getCommandItems(global, locale)),
    ]);

  const brandName = siteSettings.siteName?.trim() ?? '';

  return (
    <TranslationsProvider translations={translations} errorCopy={errorCopy}>
      <SettingsProvider>
        <SiteChrome
          header={
            <Header
              locale={locale}
              navLinks={navigation.headerLinks ?? []}
              commandItems={commandItems}
              brandName={brandName}
              copy={{
                homeAria: chrome.homeAria,
                languageName: chrome.languageName,
                languageSwitchAria: chrome.languageSwitchAria,
                closeMenu: chrome.closeMenu,
                drawerStatus: chrome.drawerStatus,
                currentPage: chrome.currentPage,
              }}
            />
          }
          footer={
            <Footer
              navLinks={navigation.footerLinks ?? []}
              cookieSettingsLabel={translations.cookies}
              rightsReserved={translations.footer}
              brandName={brandName}
              brandClaim={chrome.brandClaim}
              navAria={chrome.footerNavAria}
              credits={chrome.footerCredits}
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
