/**
 * Normalisiert Seiten-Slugs fuer Cache-Tag-Keys.
 * - fuehrende/trailende Slashes abwerfen (`/impressum/` => `impressum`)
 * - Wildcard-Match abfangen (Pflicht, sonst Tag-Gleichheit brechen)
 * - leerer Root-Slug => `home` (Page slug `home` = Wurzelseite)
 */
export function normalizeSlug(slug: string): string {
  const cleaned = slug.replace(/^\/+|\/+$/g, '');
  return cleaned === '' ? 'home' : cleaned;
}
