/**
 * Tag-Namensraum für den Frontend-Cache-Datenlayer.
 *
 * Granularität: `cms:all` (Breitpunkt-Flush) + Domain-Tag (`cms:pages`) +
 * Punkt-Tag pro Slug (`cms:pages:<slug>`) bzw. Global-Tag (`cms:global:<slug>`).
 * Payload-Hooks flusen entweder breit (Media, alle Seiten invalidiert) oder
 * punktgenau (Publish einer Page / eines Globals).
 */
export const CACHE_TAGS = {
  ALL: 'cms:all',
  pages: 'cms:pages',
  // Slug-Schluessel ohne Locale-Praefix: Slugs sind locale-agnostisch
  // (nur die Felder sind localized), der Punkt-Flush invalidiert also
  // en + de derselben Route gemeinsam.
  pageByPath: (slug: string) => `cms:pages:${slug}`,
  sitemap: 'cms:sitemap',
  siteSettings: 'cms:global:site-settings',
  navigation: 'cms:global:navigation',
  translations: 'cms:global:translations',
  notFound: 'cms:global:not-found',
} as const;
