import { cacheLife, cacheTag } from 'next/cache';
import { getPayload } from 'payload';
import type { DataFromCollectionSlug } from 'payload';
import configPromise from '@payload-config';
import type { Navigation, NotFound, Page, SiteSetting, Translation } from '@/payload-types';
import { CACHE_TAGS } from './constants';
import {
  LISTING_SLUGS,
  registerPageSlugs,
  registerVibeProjectSlugs,
  registerVibeShowcasePageCount,
} from './revalidate';
import type { FrontendLocale } from './routes';
import { LISTING_ROUTE, normalizePageNumber, normalizeTagSlug, vibeListingPath } from './routes';
import { normalizeSlug } from './utils';

export type { FrontendLocale } from './routes';

/**
 * Cache profiles feeding BOTH layers of the cache stack:
 *
 * - Next.js data cache (server): a tag flush (`revalidateTag(tag, { expire: 0 })`
 *   from the Payload hooks) re-renders on the next request.
 * - Browser/router + Cloudflare edge: the profile's RSS-derived
 *   `cacheLife.revalidate` becomes the client/router stale time; the edge TTL
 *   itself comes from the public `Cache-Control` header (next.config.ts,
 *   mirroring these values) which Cloudflare honours (cache rule "respect
 *   origin").
 *
 * Stale/expire ratio (decision 05.11.2026): a background refresh every 5
 * minutes, an entry lifetime of 30 days.
 *
 *   revalidate  300    → background revalidation on the next request after 5 min
 *   stale       2592000 → a stale entry is still SERVED for 30 days (also when
 *                        the origin is down or a revalidation fails)
 *   expire      2592000 → entries are never dropped early
 *
 * This is deliberately NOT "short TTL for freshness": correctness comes from
 * the synchronous invalidation path, not from the clock —
 *   Payload hook → safeRevalidate(..., 'blocking') → revalidateTag({expire: 0})
 *                → enqueueCloudflarePurge(urls)
 * so a publish is visible on the next request without any TTL expiring. The
 * long stale window is purely outage resistance: while the single origin
 * container restarts (every deploy) the edge keeps answering from its copy
 * instead of erroring.
 *
 * Consequence to keep in mind: between two CMS edits an entry may serve up to
 * 5 minutes of old content if a hook did not fire (e.g. a direct DB write).
 * Deliberately accepted — writes go through Payload, which always fires them.
 */
const MONTH = 2_592_000;
const REFRESH = 300;

const CACHE_PROFILES = {
  page: { stale: MONTH, revalidate: REFRESH, expire: MONTH },
  sitemap: { stale: MONTH, revalidate: REFRESH, expire: MONTH },
  global: { stale: MONTH, revalidate: REFRESH, expire: MONTH },
} as const;

async function getPayloadClient() {
  return getPayload({ config: configPromise });
}

/**
 * Listing-slug registration that does NOT depend on a DB read. Runs at module
 * load, so the very first `cms:pages` / `cms:global:*` / `cms:all` flush on a
 * cold process already purges `/de/vibe-coding` and `/en/vibe-coding` — the
 * listing is a `pages` document, but the edge cache must not wait for the page
 * list to have rendered once before it becomes purgeable.
 *
 * `LISTING_SLUGS` (./revalidate.ts) is the one set of listing routes; this
 * module must not keep its own copy of the slug. (A side effect at import time is
 * intentional here: the registry is the process-wide purge state.)
 */
registerPageSlugs([...LISTING_SLUGS]);

/** Records every slug the site knows about, for the edge-purge route mapping. */
async function fetchAllSlugs(): Promise<void> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    depth: 0,
    select: { slug: true },
  });
  registerPageSlugs((result.docs ?? []).map((doc) => doc.slug));
}

// -- Route registry ----------------------------------------------------------

/**
 * Slug list for the edge purge: a single cached list of `cms:pages`, so the
 * purge mapping of a bare `cms:pages` flush stays exact without a DB query per
 * flush. Not rendered, never part of the page cache entry.
 */
export async function getCachedRouteRegistryStatic(): Promise<void> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.pages);
  cacheLife(CACHE_PROFILES.sitemap);
  await fetchAllSlugs();
}

export function getCachedRouteRegistry(): Promise<void> {
  // DB-less build guard — see getCachedPageBySlug.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve();
  }
  return getCachedRouteRegistryStatic();
}

/**
 * Warms the page-slug registry through its own cached read. Used by the purge
 * manifest so its ops view lists the real page slugs even before any page has
 * rendered.
 *
 * The reader is already `'use cache'`-tagged; this wrapper adds no new tag and
 * performs no extra DB read of its own. It also (re)registers the listing slug,
 * so the manifest's `pageSlugs` always contains `vibe-coding`.
 */
export function primeRouteRegistries(): Promise<void> {
  // DB-less build guard — see getCachedPageBySlug.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve();
  }
  return primeRouteRegistriesStatic();
}

async function primeRouteRegistriesStatic(): Promise<void> {
  await getCachedAllPagesStatic();
}

// -- Pages -------------------------------------------------------------------

async function fetchPageBySlug(slug: string, locale: FrontendLocale): Promise<Page | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] ?? null;
}

/** Internal 'use cache' variant — callers go through getCachedPageBySlug. */
export async function getCachedPageBySlugStatic(
  slug: string,
  locale: FrontendLocale,
): Promise<Page | null> {
  'use cache';
  const normalized = normalizeSlug(slug);
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.pages, CACHE_TAGS.pageByPath(normalized));
  cacheLife(CACHE_PROFILES.page);
  return fetchPageBySlug(normalized, locale);
}

/** Public page read: always cached, never diverges on draftMode. */
export function getCachedPageBySlug(slug: string, locale: FrontendLocale) {
  // DB-less build guard: no fetch and no cache write during the production
  // build phase (the Coolify build container cannot reach the DB).
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve(null);
  }
  return getCachedPageBySlugStatic(slug, locale);
}

// -- Pages (Sitemap) ---------------------------------------------------------

async function fetchAllPages(): Promise<Page[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
  });
  const docs = result.docs ?? [];
  // Full route set for the edge purge (cms:pages / cms:all mapping).
  registerPageSlugs(docs.map((doc) => doc.slug));
  return docs;
}

export async function getCachedAllPagesStatic(): Promise<Page[]> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.pages, CACHE_TAGS.sitemap);
  cacheLife(CACHE_PROFILES.sitemap);
  return fetchAllPages();
}

export function getCachedAllPages() {
  // DB-less build guard — see getCachedPageBySlug.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve([]);
  }
  return getCachedAllPagesStatic();
}

// -- Globals -----------------------------------------------------------------

async function fetchSiteSettings(locale: FrontendLocale): Promise<SiteSetting> {
  const payload = await getPayloadClient();
  return payload.findGlobal({
    slug: 'site-settings',
    locale,
    depth: 0,
  });
}

export async function getCachedSiteSettingsStatic(locale: FrontendLocale): Promise<SiteSetting> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.siteSettings);
  cacheLife(CACHE_PROFILES.global);
  return fetchSiteSettings(locale);
}

export function getCachedSiteSettings(locale: FrontendLocale) {
  // Only rendered in a request context after the layout's connection(), so no
  // build guard is needed.
  return getCachedSiteSettingsStatic(locale);
}

async function fetchTranslations(locale: FrontendLocale): Promise<Translation> {
  const payload = await getPayloadClient();
  return payload.findGlobal({
    slug: 'translations',
    locale,
  });
}

export async function getCachedTranslationsStatic(locale: FrontendLocale): Promise<Translation> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.translations);
  cacheLife(CACHE_PROFILES.global);
  return fetchTranslations(locale);
}

export function getCachedTranslations(locale: FrontendLocale) {
  return getCachedTranslationsStatic(locale);
}

async function fetchNavigation(locale: FrontendLocale): Promise<Navigation> {
  const payload = await getPayloadClient();
  return payload.findGlobal({
    slug: 'navigation',
    locale,
  });
}

export async function getCachedNavigationStatic(locale: FrontendLocale): Promise<Navigation> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.navigation);
  cacheLife(CACHE_PROFILES.global);
  return fetchNavigation(locale);
}

export function getCachedNavigation(locale: FrontendLocale) {
  return getCachedNavigationStatic(locale);
}

async function fetchNotFound(locale: FrontendLocale): Promise<NotFound> {
  const payload = await getPayloadClient();
  return payload.findGlobal({
    slug: 'not-found',
    locale,
  });
}

export async function getCachedNotFoundStatic(locale: FrontendLocale): Promise<NotFound> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.notFound);
  cacheLife(CACHE_PROFILES.global);
  return fetchNotFound(locale);
}

export function getCachedNotFound(locale: FrontendLocale) {
  return getCachedNotFoundStatic(locale);
}

// -- Vibe-Coding showcase ----------------------------------------------------

/**
 * Vibe projects (`vibeProjects`) are public documents with a route of their own
 * (`/[locale]/vibe-coding/<slug>`). Every reader here is PUBLISHED-only: the
 * public path must never see a draft, and drafts are served exclusively by the
 * preview route (`draft: true` + `overrideAccess: false` + user).
 *
 * Tag contract (§6 of the design):
 * - one project   → `cms:all`, `cms:vibeprojects`, `cms:vibeprojects:<slug>`
 * - listing slice → `cms:all`, `cms:vibeshowcase`
 * - chip row      → `cms:all`, `cms:vibetags`
 * A project edit therefore flushes the detail tag AND the listing tag; a tag
 * rename flushes the chip row AND the listing (every `?tag=` variant).
 */

const DEFAULT_VIBE_PAGE_SIZE = 6;

const PUBLISHED_ONLY = { _status: { equals: 'published' } } as const;

/**
 * Published `vibeProjects` document returned by the payload client (typed from
 * the generated `Config` collection union). `VibeProject` is the nullable
 * variant a "lookup by slug" reader returns.
 */
type VibeProjectDoc = DataFromCollectionSlug<'vibeProjects'>;

/**
 * Unfiltered published count (`totalDocs` only, no document transfer). The one
 * query that feeds both the paginated reader's page count and the standalone
 * count reader, so the purge never sees two different totals.
 */
async function publishedVibeProjectCount(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  return payload.find({
    collection: 'vibeProjects',
    draft: false,
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    where: PUBLISHED_ONLY,
  });
}

export type VibeProject = VibeProjectDoc | null;
export type VibeTagDoc = DataFromCollectionSlug<'vibeTags'>;

/** One page of the listing projection. */
export type VibeProjectPage = {
  docs: VibeProject[];
  totalDocs: number;
  /** Total pages for the CURRENT filter (≥ 1); drives `?page=N` and the purge. */
  totalPages: number;
  /** Total pages for the UNFILTERED set (drives the prefix-purge fallback). */
  unfilteredTotalPages: number;
  page: number;
  pageSize: number;
  tagSlug: string | null;
};

async function fetchVibeProjectBySlug(
  slug: string,
  locale: FrontendLocale,
): Promise<VibeProjectDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'vibeProjects',
    draft: false,
    limit: 1,
    locale,
    // `overrideAccess: true` is safe here: `access.read` already restricts the
    // query to published rows and this reader asks for exactly that.
    overrideAccess: true,
    where: {
      and: [{ slug: { equals: normalizeSlug(slug) } }, PUBLISHED_ONLY],
    },
  });
  const doc: VibeProjectDoc | undefined = result.docs?.[0];
  return doc ?? null;
}

/** One page of a vibe-coding listing render, including the request state. */
export type VibeListingPage = {
  docs: VibeProject[];
  totalDocs: number;
  /** Pages of the CURRENT filter (≥ 1) and of the UNFILTERED set (purge). */
  totalPages: number;
  unfilteredTotalPages: number;
  /** The page that was actually rendered (≥ 1). */
  page: number;
  pageSize: number;
  tagSlug: string | null;
  /** The page the URL asked for, before clamping (`?page=99` → 99). */
  requestedPage: number;
  /** False for a malformed `?page=` or a page that does not exist. */
  isCanonicalPage: boolean;
  /** True when the URL carried `?tag=` at all (even an unknown one). */
  hasTagParam: boolean;
};

/**
 * Empty listing result for the DB-less build phase: page 1, no docs, and no
 * `?page=` request outstanding.
 */
export function emptyListingPage(pageSize: number, tagSlug: string | null): VibeListingPage {
  return {
    docs: [],
    totalDocs: 0,
    totalPages: 1,
    unfilteredTotalPages: 1,
    page: 1,
    pageSize,
    tagSlug,
    requestedPage: 1,
    isCanonicalPage: true,
    hasTagParam: false,
  };
}

async function fetchVibeProjectPage(
  locale: FrontendLocale,
  page: number,
  pageSize: number,
  tagSlug: string | null,
): Promise<VibeProjectPage> {
  const payload = await getPayloadClient();
  const tagFilter = tagSlug ? [{ 'tags.slug': { equals: tagSlug } }] : [];

  const [result, unfiltered] = await Promise.all([
    payload.find({
      collection: 'vibeProjects',
      draft: false,
      limit: pageSize,
      page,
      locale,
      depth: 2,
      overrideAccess: true,
      // Featured first, then the editorial order (ascending), then newest — the
      // tiebreak keeps the order stable across pages. `-` is a prefix, so the
      // literal order is preserved (never reversed - the array is shared).
      sort: ['-featured', 'order', '-publishedAt'],
      where: { and: [PUBLISHED_ONLY, ...tagFilter] },
    }),
    // Unfiltered page count: the purge needs it even when the visitor looks at
    // a filtered view (the filtered set may fit on one page while the
    // unfiltered listing has many).
    publishedVibeProjectCount(payload),
  ]);

  const totalDocs = result.totalDocs ?? 0;
  // Payload echoes the applied limit (`limit`, not `pagination.limit`); a
  // degenerate 0 falls back to the requested size.
  const resolvedPageSize =
    typeof result.limit === 'number' && result.limit > 0 ? result.limit : pageSize;
  const totalPages = Math.max(1, result.totalPages ?? 1);
  const unfilteredDocs = unfiltered.totalDocs ?? 0;
  const unfilteredTotalPages = Math.max(1, Math.ceil(unfilteredDocs / resolvedPageSize));

  return {
    docs: result.docs ?? [],
    totalDocs,
    totalPages,
    unfilteredTotalPages,
    page: Math.min(Math.max(1, page), totalPages),
    pageSize: resolvedPageSize,
    tagSlug,
  };
}

async function fetchVibeTags(locale: FrontendLocale): Promise<VibeTagDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'vibeTags',
    locale,
    depth: 0,
    limit: 100,
    pagination: false,
    sort: 'label',
    overrideAccess: true,
  });
  return result.docs ?? [];
}

async function fetchAllVibeProjects(): Promise<VibeProject[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'vibeProjects',
    draft: false,
    limit: 1000,
    pagination: false,
    depth: 0,
    select: { slug: true, updatedAt: true },
    overrideAccess: true,
    sort: ['order'],
    where: PUBLISHED_ONLY,
  });
  const docs = result.docs ?? [];
  // Route registry for the sibling edge purge (detail URLs of a broad or
  // set-level flush). Never the source of truth for the 404 decision.
  registerVibeProjectSlugs(docs.map((doc) => doc.slug).filter(Boolean));
  // The query projects `slug` + `updatedAt` only, which is exactly what the
  // sitemap reads; the declared element type is the full document.
  return docs as VibeProject[];
}

/** Registers the listing slug so the bare `/de/vibe-coding` path is purgeable. */
function registerListingRoute(): void {
  registerPageSlugs([LISTING_ROUTE]);
}

/** Internal 'use cache' variant — callers go through getCachedVibeProjectBySlug. */
export async function getCachedVibeProjectBySlugStatic(
  slug: string,
  locale: FrontendLocale,
): Promise<VibeProject | null> {
  'use cache';
  const normalized = normalizeSlug(slug);
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.vibeProjects, CACHE_TAGS.vibeProject(normalized));
  cacheLife(CACHE_PROFILES.page);
  registerListingRoute();
  if (normalized) registerVibeProjectSlugs([normalized]);
  return fetchVibeProjectBySlug(normalized, locale);
}

export function getCachedVibeProjectBySlug(slug: string, locale: FrontendLocale) {
  // DB-less build guard — see getCachedPageBySlug.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve(null);
  }
  return getCachedVibeProjectBySlugStatic(slug, locale);
}

/**
 * One page of the vibe-coding listing, optionally filtered by tag.
 *
 * `tagSlug` must already be validated by the caller (unknown tags render the
 * UNFILTERED listing, §10.1) — a non-matching tag would simply yield an empty
 * slice, which is the one state the design forbids.
 */
export async function getCachedVibeProjectPageStatic(
  locale: FrontendLocale,
  page: number,
  pageSize: number = DEFAULT_VIBE_PAGE_SIZE,
  tagSlug: string | null = null,
): Promise<VibeProjectPage> {
  'use cache';
  const safeSize = Math.min(12, Math.max(3, Math.trunc(pageSize) || DEFAULT_VIBE_PAGE_SIZE));
  const safePage = Math.max(1, Math.trunc(page) || 1);
  // `normalizeTagSlug` (./routes.ts) is the SAME check the render side applies
  // to `?tag=`: the cache key, the query and the URL can never disagree.
  const safeTag = normalizeTagSlug(tagSlug);
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.vibeShowcase);
  cacheLife(CACHE_PROFILES.page);
  registerListingRoute();

  const result = await fetchVibeProjectPage(locale, safePage, safeSize, safeTag);
  registerVibeProjectSlugs(result.docs.flatMap((doc) => doc?.slug ?? []));
  // Route registry for the paginated listing: the page count the purge
  // fallback (`vibeShowcaseVariantPaths`) needs when the DB is unavailable.
  registerVibeShowcasePageCount(vibeListingPath(locale), result.unfilteredTotalPages);
  return result;
}

/**
 * Paginated listing read for one request.
 *
 * `rawPage` / `rawTag` are the RAW searchParams values (`string | string[] |
 * undefined`), not pre-parsed numbers: the page is checked against the real page
 * count here, and `isCanonicalPage` reports whether the URL names a page that
 * actually exists — `?page=abc` renders page 1 but is non-canonical, while
 * `?page=1` and `?page=2` are canonical (`noindex, follow` + canonical → bare
 * listing only for the non-canonical variants).
 */
export function getCachedVibeProjectPage(
  locale: FrontendLocale,
  {
    rawPage,
    rawTag,
    pageSize = DEFAULT_VIBE_PAGE_SIZE,
  }: { rawPage?: string | string[]; rawTag?: string | string[]; pageSize?: number } = {},
): Promise<VibeListingPage> {
  // Both parsers accept the array form themselves (one shared shape check).
  const tagSlug = normalizeTagSlug(rawTag ?? null);
  const rawPageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const explicitPage = rawPageValue !== undefined;
  const requested = Math.max(1, normalizePageNumber(rawPageValue) ?? 1);
  const hasTagParam = Array.isArray(rawTag) ? rawTag.length > 0 : rawTag !== undefined;
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve({
      ...emptyListingPage(pageSize, tagSlug),
      requestedPage: requested,
      isCanonicalPage: !explicitPage,
      hasTagParam,
    });
  }
  return resolveListingPage(locale, tagSlug, pageSize, {
    requestedPage: requested,
    // A malformed `?page=` is never canonical, whatever the slice turns out to
    // be; an explicit `1` is (it names page 1, which always exists).
    isCanonicalPage: !explicitPage || normalizePageNumber(rawPageValue) !== null,
    hasTagParam,
  });
}

/**
 * Query-string state of the listing request (drives canonical + robots).
 * `hasTagParam` records that the URL carried `?tag=` at all — an UNKNOWN tag
 * renders the unfiltered listing but must stay `noindex`.
 */
type VibeListingRequestState = {
  requestedPage: number;
  isCanonicalPage: boolean;
  hasTagParam: boolean;
};

/** Second-pass bound for `resolveListingPage` (see the comment there). */
const MAX_LISTING_PAGE_PASSES = 1;

/**
 * Reads the cached slice and reports the request state.
 *
 * An over-long page (`?page=99` of 3) is clamped by the slice onto its last
 * page; one explicit second read of that page keeps the rendered `page`, the
 * canonical and the purge registry aligned. The inner read stays `'use cache'`
 * (the recursion is pure control flow, not a cache write).
 */
async function resolveListingPage(
  locale: FrontendLocale,
  tagSlug: string | null,
  pageSize: number,
  state: VibeListingRequestState,
  attempt = 0,
): Promise<VibeListingPage> {
  const slice = await getCachedVibeProjectPageStatic(
    locale,
    state.requestedPage,
    pageSize,
    tagSlug,
  );
  if (slice.page !== state.requestedPage && attempt < MAX_LISTING_PAGE_PASSES) {
    return resolveListingPage(
      locale,
      tagSlug,
      pageSize,
      { ...state, requestedPage: slice.page, isCanonicalPage: false },
      attempt + 1,
    );
  }
  return {
    ...slice,
    requestedPage: state.requestedPage,
    // The URL names a page that does not exist (clamped) or that could not be
    // parsed → non-canonical, so the canonical/meta point at what rendered.
    isCanonicalPage: state.isCanonicalPage && slice.page === state.requestedPage,
    hasTagParam: state.hasTagParam,
  };
}

/** All tags for the chip row (public labels, `cms:vibetags`). */
/** All tags for the chip row (public labels, `cms:vibetags`). */
export async function getCachedVibeTagsStatic(locale: FrontendLocale): Promise<VibeTagDoc[]> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.vibeTags);
  cacheLife(CACHE_PROFILES.page);
  return fetchVibeTags(locale);
}

export function getCachedVibeTags(locale: FrontendLocale) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve([] as VibeTagDoc[]);
  }
  return getCachedVibeTagsStatic(locale);
}

/** Published project slugs + sitemap entries (`cms:vibeprojects` + `cms:sitemap`). */
export async function getCachedAllVibeProjectsStatic(): Promise<VibeProject[]> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.vibeProjects, CACHE_TAGS.sitemap);
  cacheLife(CACHE_PROFILES.sitemap);
  registerListingRoute();
  return fetchAllVibeProjects();
}

export function getCachedAllVibeProjects() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve([] as VibeProject[]);
  }
  return getCachedAllVibeProjectsStatic();
}

/**
 * Total count of published projects — the one reader the paginated purge needs
 * without rendering anything (`vibeShowcaseVariantPaths` in ./revalidate.ts).
 */
export async function getCachedVibeProjectCountStatic(): Promise<number> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.vibeProjects);
  cacheLife(CACHE_PROFILES.sitemap);
  const payload = await getPayloadClient();
  const result = await publishedVibeProjectCount(payload);
  return result.totalDocs ?? 0;
}

export function getCachedVibeProjectCount(): Promise<number> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve(0);
  }
  return getCachedVibeProjectCountStatic();
}
