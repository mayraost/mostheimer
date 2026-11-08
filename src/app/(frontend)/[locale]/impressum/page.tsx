import type { Metadata } from 'next';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { ogImageUrl } from '@/components/og/ogCard';
import { BentoTile, CardHeader, splitParagraphs } from '@/components/ui/industrial';
import { KeyFactActionButton } from '@/components/ui/KeyFactActionButton';
import { getCachedPageBySlug, getCachedSiteSettings } from '@/cms/cache/frontend/frontendCache';
import { loadImprintCopy } from '@/lib/translationBundles.server';
import { derivePageDescription } from '@/cms/aeo/pageMetadata';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';

// Requires a root param at build time; locales are build-static, no DB lookup.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

/*
 * The imprint is a CMS page (`slug: 'imprint'`) that stays reachable under the
 * historical `/impressum` URL. This route is NOT part of the `[[...slug]]`
 * catch-all: the Proxy lists `impressum` in STATIC_CHILD_ROUTES, so requests
 * always land here, and the content is read through the same `'use cache'`
 * layer as every content page (tag `cms:pages:imprint`, payload hooks flush it).
 *
 * Same rendering vocabulary as `TechSectionBlock` (mono eyebrow, heading,
 * paragraphs, key facts) so the legal page looks like the rest of the site
 * instead of a forgotten HTML template.
 */

const IMPRINT_SLUG = 'imprint';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/impressum'>): Promise<Metadata> {
  const baseUrl = envConfig.serverUrl;
  const { locale: rawLocale } = await params;
  const locale: FrontendLocale = rawLocale === 'en' ? 'en' : 'de';
  // Frame copy lives in the translations global (`routes.imprint`), so the
  // legal page is editable like the rest of the site. Falls back to the CMS
  // page title when the global has no title yet.
  //
  // DB-less build guard: metadata resolves BEFORE `connection()`, so during the
  // prerender attempt (no DB in the Coolify build container) every read must be
  // skipped instead of throwing — see `getCachedPageBySlug`.
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
  const frame = isBuild
    ? { title: '', eyebrow: '', empty: '', metaDescription: '' }
    : await loadImprintCopy(locale);
  const page = await getCachedPageBySlug(IMPRINT_SLUG, locale);
  const siteSettings = isBuild ? null : await getCachedSiteSettings(locale);
  const siteName = siteSettings?.siteName ?? '';
  const title = frame.title || page?.title || '';
  const description = frame.metaDescription || (page ? derivePageDescription(page) : '') || '';
  const canonical = `${baseUrl}/${locale}/impressum`;

  return {
    title: siteName && title ? { absolute: `${title} - ${siteName}` } : title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName,
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [ogImageUrl(title, locale)],
    },
    twitter: { card: 'summary_large_image', description },
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en/impressum`,
        de: `${baseUrl}/de/impressum`,
        // x-default → German: de is the primary audience.
        'x-default': `${baseUrl}/de/impressum`,
      },
    },
  };
}

export default async function ImpressumPage({ params }: PageProps<'/[locale]/impressum'>) {
  // Aborts the build-time prerender attempt (the build container has no DB).
  await connection();

  const { locale: rawLocale } = await params;
  const locale: FrontendLocale = rawLocale === 'en' ? 'en' : 'de';
  const frame = await loadImprintCopy(locale);
  const page = await getCachedPageBySlug(IMPRINT_SLUG, locale);
  const sections = (page?.layout ?? []).filter((block) => block.blockType === 'techSection');

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="mb-8 border-b border-border pb-6 pt-2">
        <p className="mono-label flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {frame.eyebrow}
        </p>
        <h1 className="mb-0 mt-3 font-heading text-3xl font-bold tracking-[-0.02em] text-foreground">
          {page?.title || frame.title}
        </h1>
      </header>

      {sections.length === 0 ? (
        <BentoTile className="p-5 lg:p-8">
          <p className="text-base leading-relaxed text-foreground">{frame.empty}</p>
        </BentoTile>
      ) : (
        <div className="flex flex-col gap-2">
          {sections.map((section, index) => (
            <BentoTile key={section.id ?? index} as="section" className="p-5 lg:p-8">
              <CardHeader label={section.sectionLabel} />

              <h2 className="mb-4 font-heading text-xl font-bold leading-tight tracking-[-0.02em] text-foreground lg:text-2xl">
                {section.heading}
              </h2>

              <div className="space-y-3">
                {splitParagraphs(section.body).map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line break-words text-base leading-relaxed text-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {section.keyFacts && section.keyFacts.length > 0 && (
                <dl className="mt-6 grid grid-cols-1 gap-2 border-t border-border pt-5 sm:grid-cols-2">
                  {section.keyFacts.map((fact) => (
                    <div
                      key={fact.id ?? fact.label}
                      className="flex flex-col justify-between gap-2 rounded-[6px] border border-border bg-surface-raised/50 p-3"
                    >
                      <div>
                        <dt className="mono-label mb-1 text-muted-foreground">{fact.label}</dt>
                        <dd className="break-words font-mono text-sm font-semibold text-primary">
                          {fact.value}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-2 empty:hidden">
                        <KeyFactActionButton value={fact.value} className="w-full justify-center" />
                      </div>
                    </div>
                  ))}
                </dl>
              )}
            </BentoTile>
          ))}
        </div>
      )}
    </article>
  );
}
