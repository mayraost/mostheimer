import type { Metadata } from 'next';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page as CmsPage } from '@/payload-types';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
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

// Required because `locale` is a root dynamic segment: without it the build's
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

export default async function Page({ params }: PageProps<'/[locale]/[[...slug]]'>) {
  // Aborts the build-time prerender attempt: the Coolify build container has no
  // DB, so pages render at runtime against the 'use cache' layer instead.
  await connection();

  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) {
    return notFound();
  }

  const siteSettings = await getCachedSiteSettings(locale);
  const jsonLd = buildPageJsonLd(
    slug,
    locale,
    page,
    derivePageDescription(page),
    siteSettings.siteName || 'Mostheimer',
  );

  // Semantic <h1> guarantee: case-studies / tech-radar / career have no block
  // that emits one. The title renders as h1 only when no hero block exists,
  // since the hero already emits its own (one h1 per page).
  const layout = page.layout ?? [];
  const hasHeroBlock = layout.some((block) => block.blockType === 'hero');

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <article className="mx-auto w-full max-w-6xl">
        {!hasHeroBlock && (
          <header className="mb-8 border-b border-border pb-6 pt-6 lg:pt-10">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
              {page.title}
            </h1>
          </header>
        )}
        {layout.map((block, index: number) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </article>
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[[...slug]]'>): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) return { title: 'Mostheimer 404' };

  const baseUrl = envConfig.serverUrl;
  const canonical = `${baseUrl}${pagePath(locale, slug)}`;
  // Derived from CMS content; falls back to the layout default — the node
  // carries no own description field so Next inherits the layout value
  // instead of rendering an empty tag.
  const description = derivePageDescription(page);

  return {
    // `absolute` keeps the layout's template from wrapping the brand suffix
    // a second time if a `%s` template is added later.
    title: { absolute: `${page.title} - Mostheimer` },
    ...(description ? { description } : {}),
    // Per-page OG card via the /og route: the opengraph-image file convention
    // cannot live inside the [[...slug]] catch-all (see src/app/og/route.tsx).
    openGraph: {
      title: page.title,
      type: 'website',
      siteName: 'Mostheimer',
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
      languages: {
        en: `${baseUrl}/en${slug === 'home' ? '' : `/${slug}`}`,
        de: `${baseUrl}/de${slug === 'home' ? '' : `/${slug}`}`,
        // x-default → German: de is the primary audience.
        'x-default': `${baseUrl}/de${slug === 'home' ? '' : `/${slug}`}`,
      },
    },
  };
}
