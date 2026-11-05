/**
 * Tag namespace for the frontend cache data layer.
 *
 * Granularity: `cms:all` (broad flush) + domain tag (`cms:pages`) + one tag per
 * slug (`cms:pages:<slug>`) or per global (`cms:global:<slug>`). Payload hooks
 * flush either broadly (media) or precisely (a page or global publish).
 */
export const CACHE_TAGS = {
  ALL: 'cms:all',
  pages: 'cms:pages',
  // No locale prefix: slugs are locale-agnostic (only fields are localized), so
  // a targeted flush invalidates both the en and de variant of the route.
  pageByPath: (slug: string) => `cms:pages:${slug}`,
  sitemap: 'cms:sitemap',
  siteSettings: 'cms:global:site-settings',
  navigation: 'cms:global:navigation',
  translations: 'cms:global:translations',
  notFound: 'cms:global:not-found',
} as const;
