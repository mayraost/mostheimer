import { cacheLife, cacheTag } from 'next/cache';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Navigation, NotFound, Page, SiteSetting, Translation } from '@/payload-types';
import { CACHE_TAGS } from './constants';
import { registerPageSlugs } from './revalidate';
import type { FrontendLocale } from './routes';
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
 *   origin"). Long TTLs are only safe because every hook flushes the tag AND
 *   purges the matching edge objects synchronously (see revalidate.ts).
 *
 * `stale-if-error` keeps the site up while the single origin container is
 * restarting (every deploy), which is why the TTLs are long.
 */
const CACHE_PROFILES = {
  page: { stale: 3600, revalidate: 86400, expire: 604800 },
  sitemap: { stale: 3600, revalidate: 3600, expire: 604800 },
  global: { stale: 3600, revalidate: 86400, expire: 604800 },
} as const;

async function getPayloadClient() {
  return getPayload({ config: configPromise });
}

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
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve();
  }
  return getCachedRouteRegistryStatic();
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
