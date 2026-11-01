import { cacheLife, cacheTag } from 'next/cache';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Navigation, NotFound, Page, SiteSetting, Translation } from '@/payload-types';
import { CACHE_TAGS } from './constants';
import { normalizeSlug } from './utils';

export type FrontendLocale = 'en' | 'de';

/**
 * Safety-Net-TTL: stale 1 h, Neubefuellung nach max. 7 Tagen.
 * Die eigentliche Frische steuern die Payload-Hooks via revalidateTag;
 * cacheLife ist nur der Fallback dafuer, dass auf Produktion nichts
 * unaufgeloest steckenbleibt.
 */
const CACHE_LIFE_FRONTEND = { stale: 3600, revalidate: 604800 } as const;

async function getPayloadClient() {
  return getPayload({ config: configPromise });
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

/** Interne 'use cache'-Variante — oeffentliches Modul nutzt getCachedPageBySlug. */
export async function getCachedPageBySlugStatic(
  slug: string,
  locale: FrontendLocale,
): Promise<Page | null> {
  'use cache';
  const normalized = normalizeSlug(slug);
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.pages, CACHE_TAGS.pageByPath(normalized));
  cacheLife(CACHE_LIFE_FRONTEND);
  return fetchPageBySlug(normalized, locale);
}

/** Oeffentlicher Page-Read (immer statisch, keine draftMode-Divergenz). */
export function getCachedPageBySlug(slug: string, locale: FrontendLocale) {
  // Build-ohne-DB-Guard (Skill §4): kein DB-Fetch und kein Cache-Write
  // waehrend der Produktion-Build-Phase (Coolify-Docker: keine DB erreichbar).
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
  return result.docs ?? [];
}

export async function getCachedAllPagesStatic(): Promise<Page[]> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.pages, CACHE_TAGS.sitemap);
  cacheLife(CACHE_LIFE_FRONTEND);
  return fetchAllPages();
}

export function getCachedAllPages() {
  // Build-ohne-DB-Guard (Skill §4) — siehe getCachedPageBySlug.
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
  cacheLife(CACHE_LIFE_FRONTEND);
  return fetchSiteSettings(locale);
}

export function getCachedSiteSettings(locale: FrontendLocale) {
  // Wird nur nach Layout-connection() im Request-Kontext gerendert →
  // kein Build-Guard noetig.
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
  cacheLife(CACHE_LIFE_FRONTEND);
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
  cacheLife(CACHE_LIFE_FRONTEND);
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
  cacheLife(CACHE_LIFE_FRONTEND);
  return fetchNotFound(locale);
}

export function getCachedNotFound(locale: FrontendLocale) {
  return getCachedNotFoundStatic(locale);
}
