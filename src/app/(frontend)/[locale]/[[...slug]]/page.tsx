import type { Metadata } from 'next';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page as CmsPage } from '@/payload-types';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
import { HeroBlock } from '@/components/blocks/HeroBlock';
import { envConfig } from '@/envConfig';
import {
  getCachedPageBySlug,
  getCachedSiteSettings,
  getCachedVibeProjectPage,
  getCachedVibeTags,
} from '@/cms/cache/frontend/frontendCache';
import { VIBE_SHOWCASE_SLUG, normalizeTagSlug } from '@/cms/cache/frontend/routes';
import { loadChromeCopy, loadHeroCopy } from '@/lib/translationBundles.server';
import {
  JsonLdScript,
  buildCareerJsonLd,
  buildCaseStudiesJsonLd,
  buildProfilePageJsonLd,
  buildSiteJsonLd,
  buildVibeListingJsonLd,
  buildWebPageJsonLd,
} from '@/components/StructuredData';
import type { JsonLdObject } from '@/components/StructuredData';
import { derivePageDescription } from '@/cms/aeo/pageMetadata';
import { ogImageUrl } from '@/components/og/ogCard';
import { loadPersonJsonLd } from '@/lib/identity.server';
import { getCachedTranslation } from '@/lib/translations.server';
import type { VibeListingPage } from '@/cms/cache/frontend/queries';
import type { VibeTagDoc } from '@/cms/cache/frontend/queries';
import type { VibeShowcaseTag, VibeShowcaseView } from '@/components/vibe/showcaseView';
import { toShowcaseView } from '@/components/vibe/showcaseView';
import { toProjectView } from '@/components/vibe/projectView';

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

/**
 * True when the page renders the paginated vibe-coding listing.
 *
 * Two conditions, both required: the page IS the listing route and its layout
 * actually carries a `vibeShowcase` block. The block is what consumes
 * `?page=`/`?tag=`, so a page without it stays a normal, canonical, indexable
 * content page.
 */
function isVibeListingPage(slug: string, page: CmsPage): boolean {
  return (
    slug === VIBE_SHOWCASE_SLUG &&
    (page.layout ?? []).some((block) => block.blockType === 'vibeShowcase')
  );
}

/**
 * Listings are faceted URLs (design § 10.2): a filtered view (`?tag=`) or any
 * `?page=` other than the bare first page is `noindex, follow` and declares the
 * bare listing as canonical. The bare listing is indexable and self-canonical.
 */
function listingIsVariant(listing: VibeListingPage): boolean {
  return listing.hasTagParam || listing.page > 1 || listing.requestedPage > 1;
}

/** `?page=` / `?tag=` values as the listing reader expects them. */
type ListingSearchParams = { page?: string | string[]; tag?: string | string[] };

/**
 * Resolves the vibe-coding listing for one request.
 *
 * The listing page is a normal CMS page that happens to carry a paginated
 * block, so `?page=`/`?tag=` arrive here as `searchParams` and are handed to the
 * cached reader (both are part of its cache key). The block itself never reads
 * the URL — it gets the resolved view.
 *
 * Chip counts: the cached reader returns the UNFILTERED total plus the count of
 * the ACTIVE filter. One aggregate per tag would mean one extra query per chip
 * on every listing render, so a chip only shows a number when it is known —
 * never a guessed one. The active count comes from the filtered slice, which is
 * exact.
 */
async function resolveVibeListing(
  locale: FrontendLocale,
  pageSize: number,
  search: ListingSearchParams,
): Promise<{
  listing: VibeListingPage;
  view: VibeShowcaseView;
}> {
  const [listing, tags] = await Promise.all([
    getCachedVibeProjectPage(locale, {
      rawPage: search.page,
      rawTag: search.tag,
      pageSize,
    }),
    getCachedVibeTags(locale),
  ]);

  const counts = new Map<string, number>();
  // With no filter the whole published set is the "all" bucket; a chip's own
  // number stays unknown (0 = "do not claim a number").
  if (listing.tagSlug) counts.set(listing.tagSlug, listing.totalDocs);

  const chips = toShowcaseTagsForListing(tags, counts, listing.tagSlug);
  return { listing, view: toShowcaseView(locale, listing, chips) };
}

/**
 * Tag chips for the row: known slugs, deduplicated, plus the count when it is
 * known. Unlike `toShowcaseTags` (which drops tags without a count for the
 * JSON-LD/ops views) the filter row keeps every tag — hiding a tag because its
 * number is not known would make a whole facet unreachable.
 */
function toShowcaseTagsForListing(
  tags: readonly VibeTagDoc[],
  counts: ReadonlyMap<string, number>,
  activeSlug: string | null,
) {
  const seen = new Set<string>();
  const chips: VibeShowcaseTag[] = [];
  for (const tag of tags) {
    const slug = normalizeTagSlug(tag.slug);
    if (!slug || seen.has(slug)) continue;
    // The tag slug is validated by the manual check above; the active tag's
    // chip carries the exact filtered count.
    chips.push({
      slug,
      label: tag.label?.trim() || slug,
      count: slug === activeSlug ? (counts.get(slug) ?? 0) : 0,
    });
  }
  return chips;
}

/** Page-level JSON-LD, built on the server from already cached page data (no extra read, no client JS). */
function buildPageJsonLd(
  slug: string,
  locale: FrontendLocale,
  page: CmsPage,
  description: string | null,
  siteName: string,
  person: JsonLdObject,
): JsonLdObject {
  const path = pagePath(locale, slug);

  if (slug === 'home') {
    return buildSiteJsonLd({ locale, siteName, description, person });
  }

  if (PROFILE_PAGE_SLUGS.has(slug)) {
    return buildProfilePageJsonLd({
      person,
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
    });
  }

  if (slug === 'career') {
    return buildCareerJsonLd({
      person,
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
    person,
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
  searchParams,
}: PageProps<'/[locale]/[[...slug]]'>): Promise<Metadata> {
  const { locale, slug, page } = await resolvePage(params);
  if (!page) notFound();
  // Brand from the CMS (site-settings), never a literal: title suffix and
  // `og:site_name` are public brand copy.
  const siteSettings = await getCachedSiteSettings(locale);
  const brandTitle = await getCachedTranslation(locale, 'seo.title');
  // The listing page adds facet metadata (canonical → bare listing,
  // `noindex, follow` for `?page=`/`?tag=`). Resolved here, before the stream,
  // so the crawler-facing head is correct even if the body streams later.
  const listing = isVibeListingPage(slug, page)
    ? await getCachedVibeProjectPage(locale, {
        rawPage: (await searchParams).page,
        rawTag: (await searchParams).tag,
        pageSize: vibePageSizeOf(page),
      })
    : null;
  return buildPageMetadata(locale, slug, page, siteSettings.siteName ?? '', brandTitle, listing);
}

/** `pageSize` of the listing block, clamped exactly like the cached reader. */
function vibePageSizeOf(page: CmsPage): number {
  const block = (page.layout ?? []).find((entry) => entry.blockType === 'vibeShowcase');
  const value = block && block.blockType === 'vibeShowcase' ? block.pageSize : undefined;
  return Math.min(12, Math.max(3, Math.trunc(value ?? 6) || 6));
}

export default async function Page({ params, searchParams }: PageProps<'/[locale]/[[...slug]]'>) {
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

  // Paginated block data: only the listing page needs it, and only when a
  // `vibeShowcase` block is actually placed. Reading the two `searchParams` the
  // listing understands is the whole plumbing — the block stays a pure renderer.
  const listingPage = isVibeListingPage(slug, page);
  const search = await searchParams;
  const listingData = listingPage
    ? await resolveVibeListing(locale, vibePageSizeOf(page), {
        page: search.page,
        tag: search.tag,
      })
    : null;

  const [siteSettings, chrome] = await Promise.all([
    getCachedSiteSettings(locale),
    loadChromeCopy(locale),
  ]);
  // Hero shell copy carries the brand name from site-settings (it is the same
  // entity name the metadata uses, so it is data, not copy).
  const heroCopy = await loadHeroCopy(locale, siteSettings.siteName ?? '');
  // A filtered or paginated listing emits NO ItemList (design § 10.3): an
  // ItemList on a page we ask Google to drop is noise.
  const jsonLd =
    listingData && !listingIsVariant(listingData.listing)
      ? buildVibeListingJsonLd({
          locale,
          path: pagePath(locale, slug),
          name: page.title,
          description: derivePageDescription(page),
          items: listingData.view.items.flatMap((item) => {
            // The JSON-LD node needs the full view (links, stack, hero); the
            // tile model omits the narrative fields it does not draw.
            const match = listingData.listing.docs.find((doc) => doc?.slug === item.slug);
            const project = match ? toProjectView(match, locale) : null;
            return project ? [project] : [];
          }),
          totalDocs: listingData.listing.totalDocs,
        })
      : buildPageJsonLd(
          slug,
          locale,
          page,
          derivePageDescription(page),
          siteSettings.siteName ?? '',
          await loadPersonJsonLd(locale, siteSettings),
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
  // Breadcrumb eyebrow for subpage heroes: `Start // Werdegang`. The leading
  // label is CMS copy (`chrome.breadcrumbHome`), the page title is CMS content.
  const heroEyebrow =
    isHome || heroIndex === -1
      ? undefined
      : [chrome.breadcrumbHome, page.title].filter(Boolean).join(' // ');

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
            <HeroBlock
              key={index}
              block={block}
              variant={heroVariant}
              eyebrow={heroEyebrow}
              copy={heroCopy}
            />
          ) : (
            <BlockRenderer
              key={index}
              block={block}
              locale={locale}
              // Only the first `vibeShowcase` renders (design § 3): two listings
              // would duplicate the `?page=` set, the pagination landmark and
              // the `ItemList`. Later copies render nothing.
              request={
                listingData &&
                block.blockType === 'vibeShowcase' &&
                layout.findIndex((entry) => entry.blockType === 'vibeShowcase') === index
                  ? { listing: { vibeShowcase: listingData.view } }
                  : undefined
              }
            />
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

/**
 * Page metadata: title, description, OG card, canonicals and hreflang.
 *
 * `listing` is present only for the vibe-coding listing page. Then the head
 * follows the faceted-URL rules (design § 10.2):
 * - bare listing → self-canonical, indexable;
 * - `?tag=` / `?page>1` / malformed `?page` → canonical to the BARE listing,
 *   `robots: noindex, follow` (links stay crawlable, equity is passed on).
 * Paginated variants (`?page=2 …`) stay self-canonical and indexable, because
 * each page of a paginated series is a distinct document.
 */
function buildPageMetadata(
  locale: FrontendLocale,
  slug: string,
  page: CmsPage,
  siteName: string,
  brandTitle: string,
  listing: VibeListingPage | null = null,
): Metadata {
  const baseUrl = envConfig.serverUrl;
  const barePath = baseUrl + pagePath(locale, slug);
  const canonical = barePath;
  const description = derivePageDescription(page);
  const enUrl = baseUrl + '/en' + (slug === 'home' ? '' : '/' + slug);
  const deUrl = baseUrl + '/de' + (slug === 'home' ? '' : '/' + slug);

  // A filtered view (`?tag=`, whatever the page) is a subset, not a document:
  // canonical to the bare listing and ask crawlers to drop it while following.
  const isFilteredVariant = listing !== null && listing.hasTagParam;
  // A malformed or overreaching `?page=` is a duplicate of the clamped page.
  const isMalformedPage = listing !== null && !listing.isCanonicalPage;

  // Homepage: the BRAND title (`seo.title`, e.g. "Mayra Ostheimer — Web &
  // Application Architect"). The CMS page title there is a short label
  // ("Startseite"); appending the site name to it produced the duplicated
  // "… Architect - Mayra Ostheimer", and using it alone dropped the brand.
  // Every other page gets "<Page title> - <site name>".
  const isHomePage = slug === 'home';
  const title = isHomePage
    ? brandTitle || page.title
    : siteName
      ? `${page.title} - ${siteName}`
      : page.title;

  return {
    title: { absolute: title },
    ...(description ? { description } : {}),
    ...(isFilteredVariant || isMalformedPage ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      // Share cards show the same headline as the document title, so a shared
      // homepage link never reads "Startseite".
      title,
      type: 'website',
      siteName,
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      ...(description ? { description } : {}),
      images: [ogImageUrl(page.title, locale, siteName)],
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
