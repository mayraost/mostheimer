import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './constants';
import { normalizeSlug } from './utils';

/**
 * ─── On-Demand-Cache-Invalidierung (OSR) ─────────────────────────────────
 *
 * ROOT-CAUSE-LEARNING (04.11.2026, Findings v2 B1 „stale pages"):
 *
 * Next 16 markiert eine invalidation NICHT als „geflushtes Tag", sondern
 * als **In-Doubt-Timestamp** (`revalidatedAt = jetzt`). Cache-Entries werden
 * danach ausschliesslich lazy beim naechsten READ als stale erkannt
 * (`isStale(entry, now) = entry.timestamp <= revalidatedAt`), siehe
 * node_modules/next/dist/server/lib/incremental-cache/file-system-cache.js.
 *
 * Die frueheren `revalidateTag(tag, 'max')`-Aufrufe waren daher fuer die
 * Seiteninhalte wirkungslos: 'max' erlaubt ein 1-Jahres-Stale-Fenster —
 * das System liefert bei einem Treffer weiter den ALTEN Entry aus und
 * revalidiert nur im Hintergrund, ohne je auf frische Daten umzuschalten,
 * solange der langlaufende Container-Prozess keinen neuen Request auf
 * genau dieser Route bekommt. (Nur `expire: 0` = deprecated Single-Arg
 * erzwingt „beim naechsten Request blockierend neu rendern".)
 *
 * Zusaetzlich collidierte der Globals-Pfad mit dem Layout: `get()` im
 * filesystem-handler entscheidet pro ENTRY-Key. Der Layout-Key cached
 * `getCachedSiteSettings` (Tag `cms:global:site-settings`) und
 * `getCachedNavigation` (Tag `cms:global:navigation`) in derselben
 * Komponenten-/Segment-Einheit — ein Globals-Flush traf deshalb die
 * komplette Layout-Shell (Navigation + Shell-Refresh) und fiel beim
 * naechsten Request sichtbar aus dem Cache, waehrend der (separat
 * gerenderte) Page-Block-Key mit `'max'` weiter den alten Inhalt blieb.
 *
 * FIX: Content-Mutationen (Pages/Globals/Media) invalidieren mit
 * `{ expire: 0 }` → naechster Request rendert frisch (blockierend, eine
 * Anfrage lang). Der Pfad ist ohnehin `connection()`-dynamisch (Blocking-
 * Render-Shell), daher ist die Render-Latenz des Folge-Requests
 * unkritisch — Korrektheit geht vor Stale-Serving.
 */

type RevalidateMode = 'blocking' | 'swr';

/**
 * Zielpunkt aller Flushes: `(tag, label)`-Helper mit try/catch-Pflicht.
 * Payload-Hooks laufen innerhalb des Request-Kontexts der Admin-API, aber
 * Migrationen/Seeding/CLI-Kontexte tun es evtl. nicht — und revalidateTag
 * wirft dort sonst unhandled („static generation store missing", AGENTS.md).
 */
export function safeRevalidate(
  tag: string,
  label: string,
  mode: RevalidateMode = 'blocking',
): boolean {
  try {
    // mode 'blocking' = { expire: 0 }: stale wird NIE serviert, der naechste
    // Request wartet auf das frische Rendering (Read-your-own-writes nach
    // CMS-Edit). mode 'swr' = explizites 1h-Stale-Fenster.
    revalidateTag(tag, mode === 'blocking' ? { expire: 0 } : { expire: 3600 });
    return true;
  } catch (error) {
    console.warn(
      `[cms-cache] Revalidation '${label}' (tag: ${tag}) uebersprungen — kein Next.js-Request-Kontext.`,
      error,
    );
    return false;
  }
}

/**
 * Punktgenauer Flush einer Page-Route nach Slug ('home' oder 'a/b').
 * Betrifft beide Locales (Tag ohne Locale-Praefix) und invalidiert die
 * Sitemap mit, weil die Listenliste abhaengig ist.
 *
 * Zusaetzlich `cms:pages` (Domain-Tag): der NotFoundGate-Lookup im Layout
 * und die Sitemap-Liste haengen am Kollektions-Tag; ein neuer Slug muss
 * sofort aufloesen, ein geloeschter sofort 404-en.
 */
export function revalidatePagePathCache(slug: string | null | undefined): void {
  if (!slug) return;
  safeRevalidate(CACHE_TAGS.pageByPath(normalizeSlug(slug)), `page path ${slug}`);
  safeRevalidate(CACHE_TAGS.pages, 'pages domain (page changed)');
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

/**
 * Ergebnis eines Flush-Versuchs (fuer diagnostizierbare Aufrufer wie die
 * Admin-Cache-Clear-View: zeigt, ob der Hook im Request-Kontext lief).
 */
export function collectRevalidationResults(tags: readonly { tag: string; label: string }[]): {
  done: string[];
  skipped: string[];
} {
  const done: string[] = [];
  const skipped: string[] = [];
  for (const { tag, label } of tags) {
    if (safeRevalidate(tag, label)) done.push(tag);
    else skipped.push(tag);
  }
  return { done, skipped };
}
