import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './constants';
import { normalizeSlug } from './utils';

/**
 * Zielpunkt aller Flushes: `(tag, label)`-Helper mit try/catch-Pflicht.
 * Payload-Hooks laufen innerhalb des Request-Kontexts der Admin-API, aber
 * Migrationen/Seeding/CLI-Kontexte tun es evtl. nicht — und revalidateTag
 * wirft dort sonst unhandled.
 */
export function safeRevalidate(tag: string, label: string): void {
  try {
    // Next 16 verlangt das 2-Arg-Formular; 'max' = stale-while-revalidate
    // Serve-Fenster (empfohlen), damit Requests waehrend der Revalidation
    // nicht blockieren.
    revalidateTag(tag, 'max');
  } catch (error) {
    console.warn(
      `[cms-cache] Revalidation '${label}' (tag: ${tag}) uebersprungen — kein Next.js-Request-Kontext.`,
      error,
    );
  }
}

/**
 * Punktgenauer Flush einer Page-Route nach Slug ('home' oder 'a/b').
 * Betrifft beide Locales (Tag ohne Locale-Praefix) und invalidiert die
 * Sitemap mit, weil die Listenliste abhaengig ist.
 */
export function revalidatePagePathCache(slug: string | null | undefined): void {
  if (!slug) return;
  safeRevalidate(CACHE_TAGS.pageByPath(normalizeSlug(slug)), `page path ${slug}`);
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (page changed)');
}

/** Alter Pfad bei Slug-Umbenennung mit invalidieren (muss fortan notFound dienen). */
export function revalidatePreviousPagePathCache(
  previousSlug: string | null | undefined,
  nextSlug: string | null | undefined,
): void {
  if (!previousSlug || !nextSlug || previousSlug === nextSlug) return;
  safeRevalidate(
    CACHE_TAGS.pageByPath(normalizeSlug(previousSlug)),
    `old page path ${previousSlug}`,
  );
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (page renamed)');
}

/** Sitemap-Liste hart invalidieren (Pages-Listen-Delta). */
export function revalidateSitemapCache(): void {
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap');
}

/** Breiter Flush: alle Frontend-CMS-Caches (z. B. nach Media-Aenderung). */
export function revalidateAllFrontendCmsCaches(): void {
  safeRevalidate(CACHE_TAGS.ALL, 'all frontend cms caches');
  safeRevalidate(CACHE_TAGS.pages, 'pages');
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap');
}

export function revalidateSiteSettingsCache(): void {
  safeRevalidate(CACHE_TAGS.siteSettings, 'site settings');
}

export function revalidateNavigationCache(): void {
  safeRevalidate(CACHE_TAGS.navigation, 'navigation');
}

export function revalidateTranslationsCache(): void {
  safeRevalidate(CACHE_TAGS.translations, 'translations');
}

export function revalidateNotFoundCache(): void {
  safeRevalidate(CACHE_TAGS.notFound, 'not-found global');
}
