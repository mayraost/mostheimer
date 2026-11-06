import type { Metadata } from 'next';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page as CmsPage } from '@/payload-types';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
import { HeroBlock } from '@/components/blocks/HeroBlock';
import { envConfig } from '@/envConfig';
import { getCachedPageBySlug, getCachedSiteSettings } from '@/cms/cache/frontend/frontendCache';
import {
  JsonLdScript,
  buildCareerJsonLd,
  buildCaseStudiesJsonLd,
  buildProfilePageJsonLd,
  buildSiteJsonLd,
  buildWebPageJsonLd,
} from '@/components/StructuredData';
import type { JsonLdObject } from '@/components/StructuredData';
import { derivePageDescription } from '@/cms/aeo/pageMetadata';
import { ogImageUrl } from '@/components/og/ogCard';

/**
 * About-me-like slugs render as ProfilePage JSON-LD; the homepage itself is a
 * WebSite candidate, not a ProfilePage. All other slugs get their node from
 * `buildPageJsonLd` (career → ProfilePage with `hasOccupation` from the
 * timeline, case studies → WebPage + ItemList, tech-radar/leadership/contact →
 * slim WebPage). Unknown slugs get a neutral WebPage node, never an invented
 * `@type`.
 */
const PROFILE_PAGE_SLUGS = new Set(['about', 'about-me', 'ueber-mich', 'ueber']);

/** Canonical page path including the locale prefix. */
function pagePath(locale: FrontendLocale, slug: string): string {
  return slug === 'home' ? `/${locale}` : `/${locale}/${slug}`;
}

// Required because the locale segment is dynamic: without it the build
// prerender attempt aborts. Locales are build-static, so no DB lookup is needed.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// Allows the blocking render: this route calls connection() without its own
// Suspense boundary, which Next otherwise flags during dev.
export const instant = false;

/** Page-level JSON-LD, built on the server from already cached page data (no extra read, no client JS). */
function buildPageJsonLd(
  slug: string,
  locale: FrontendLocale,
  page: CmsPage,
  description: string | null,
  siteName: string,
): JsonLdObject {
  const path = pagePath(locale, slug);

  if (slug === 'home') {
    return buildSiteJsonLd({ locale, siteName, description });
  }

  if (PROFILE_PAGE_SLUGS.has(slug)) {
    return buildProfilePageJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
    });
  }

  if (slug === 'career') {
    return buildCareerJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
      layout: page.layout ?? [],
    });
  }

  if (slug === 'case-studies') {
    return buildCaseStudiesJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
      layout: page.layout ?? [],
    });
  }

  return buildWebPageJsonLd({
    locale,
    path,
    name: page.title,
    description,
    dateModified: page.updatedAt ?? null,
    includeContact: slug === 'contact',
  });
}

/**
 * Metadata carries the same slug lookup as the page and resolves BEFORE the
 * stream flushes, so an unknown slug throws notFound() from `generateMetadata`.
 *
 * Argument order matters: htmlLimitedBots (set to match every user agent in
 * next.config.ts) disables
 * streaming metadata, so this call blocks the response head — which is exactly
 * what makes a real 404 status possible in the cacheComponents shell. Throwing
 * from the page body instead would already be a streamed 200 + noindex
 * (measured 05.11.2026; Next docs: "Streaming page responses begin with a 200").
 */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[[...slug]]'>): Promise<Metadata> {
  const { locale, slug, page } = await resolvePage(params);
  if (!page) notFound();
  return buildPageMetadata(locale, slug, page);
}

export default async function Page({ params }: PageProps<'/[locale]/[[...slug]]'>) {
  // Aborts the build-time prerender attempt: the Coolify build container has no
  // DB, so pages render at runtime against the 'use cache' layer instead.
  await connection();

  const { locale, slug, page } = await resolvePage(params);

  if (!page) {
    // Only reached if metadata was skipped (e.g. a cached RSC request): the
    // status is already 200 then, Next still appends <meta name="robots"
    // content="noindex"> to the streamed 404 (see Next docs, loading.md §SEO).
    notFound();
  }

  const siteSettings = await getCachedSiteSettings(locale);
  const jsonLd = buildPageJsonLd(
    slug,
    locale,
    page,
    derivePageDescription(page),
    siteSettings.siteName || 'Mayra Ostheimer',
  );

  // Semantic <h1> guarantee: case-studies / tech-radar / career have no block
  // that emits one. The title renders as h1 only when no hero block exists,
  // since the hero already emits its own (one h1 per page).
  //
  // Hero variant: only the homepage keeps the full hero (4-metric strip). Every
  // other route renders the hero as a compact page header, so the actual
  // subpage content starts above the fold instead of after two screens of
  // repeated boilerplate (desktop AND mobile, measured QA iteration 2).
  const layout = page.layout ?? [];
  const isHome = slug === 'home';
  const heroIndex = layout.findIndex((block) => block.blockType === 'hero');
  const heroVariant: 'home' | 'compact' = isHome ? 'home' : 'compact';
  // Breadcrumb eyebrow for subpage heroes: `Start // Werdegang`. Uses the page
  // title (already localized in the CMS) so no extra copy table can drift.
  const homeLabel = locale === 'de' ? 'Start' : 'Home';
  const heroEyebrow = isHome || heroIndex === -1 ? undefined : `${homeLabel} // ${page.title}`;

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <article className="mx-auto w-full max-w-6xl">
        {heroIndex === -1 && (
          <header className="mb-8 border-b border-border pb-6 pt-6 lg:pt-10">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
              {page.title}
            </h1>
          </header>
        )}
        {layout.map((block, index: number) =>
          block.blockType === 'hero' ? (
            <HeroBlock key={index} block={block} variant={heroVariant} eyebrow={heroEyebrow} />
          ) : (
            <BlockRenderer key={index} block={block} locale={locale} />
          ),
        )}
      </article>
    </>
  );
}

/** One cached lookup shared by generateMetadata and the page body. */
async function resolvePage(
  params: Promise<{ locale?: string; slug?: string[] }>,
): Promise<{ locale: FrontendLocale; slug: string; page: CmsPage | null }> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);
  return { locale, slug, page };
}

/** Page metadata: title, description, OG card, canonicals and hreflang. */
function buildPageMetadata(locale: FrontendLocale, slug: string, page: CmsPage): Metadata {
  const baseUrl = envConfig.serverUrl;
  const canonical = baseUrl + pagePath(locale, slug);
  const description = derivePageDescription(page);
  const enUrl = baseUrl + '/en' + (slug === 'home' ? '' : '/' + slug);
  const deUrl = baseUrl + '/de' + (slug === 'home' ? '' : '/' + slug);

  return {
    title: { absolute: page.title + ' - Mayra Ostheimer' },
    ...(description ? { description } : {}),
    openGraph: {
      title: page.title,
      type: 'website',
      siteName: 'Mayra Ostheimer',
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      ...(description ? { description } : {}),
      images: [ogImageUrl(page.title, locale)],
    },
    twitter: {
      card: 'summary_large_image',
      ...(description ? { description } : {}),
    },
    alternates: {
      canonical,
      languages: { en: enUrl, de: deUrl, 'x-default': deUrl },
    },
  };
}
