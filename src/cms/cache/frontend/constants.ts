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
  // -- Project-Showcase (collection `projects`, filter `projectTags`) -----
  // Three levels, mirroring the page tags:
  //   `cms:projects`          → collection domain (sitemap list, counts)
  //   `cms:projects:<slug>`   → ONE project detail
  //   `cms:project-showcase`          → the listing projection (every page-1 HTML is
  //                                 a different slice per `?page=N` / `?tag=`)
  //   `cms:project-tags`              → the tag CHIP row only (§10.4)
  // `projectShowcase` is a separate entry from `projects` because the listing
  // read is a different query than a single document; a project edit flushes
  // both. `projectTags` never replaces `projectShowcase`: a tag rename/delete changes
  // every `?tag=` variant (and which chips exist), so it flushes the listing.
  projects: 'cms:projects',
  project: (slug: string) => `cms:projects:${slug}`,
  projectShowcase: 'cms:project-showcase',
  projectTags: 'cms:project-tags',
  sitemap: 'cms:sitemap',
  siteSettings: 'cms:global:site-settings',
  navigation: 'cms:global:navigation',
  translations: 'cms:global:translations',
  notFound: 'cms:global:not-found',
} as const;
