import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { getCachedAllPages, getCachedAllProjects } from '@/cms/cache/frontend/frontendCache';
import { PROJECT_SHOWCASE_SLUG, normalizeRouteSlug } from '@/cms/cache/frontend/routes';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';

// Pages come from the DB, which only exists at runtime (the Coolify build has
// no DB). connection() aborts the build prerender so an empty DB fallback is
// never cached.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  let docs: Awaited<ReturnType<typeof getCachedAllPages>>;
  let projects: Awaited<ReturnType<typeof getCachedAllProjects>>;
  try {
    [docs, projects] = await Promise.all([getCachedAllPages(), getCachedAllProjects()]);
  } catch {
    // DB not reachable or not migrated yet (first request on a fresh volume):
    // serve an empty sitemap instead of failing the request.
    return [];
  }

  const baseUrl = envConfig.serverUrl;
  const locales: readonly FrontendLocale[] = ['en', 'de'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  docs.forEach((page) => {
    const slugPath = page.slug === 'home' ? '' : `/${page.slug}`;
    // `updatedAt` is document-wide, not per locale: both language variants
    // carry the same lastmod.
    const lastModified = page.updatedAt ? new Date(page.updatedAt) : undefined;
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified,
        changeFrequency: 'monthly',
        alternates: {
          languages: {
            en: `${baseUrl}/en${slugPath}`,
            de: `${baseUrl}/de${slugPath}`,
            // x-default → German: de is the primary audience.
            'x-default': `${baseUrl}/de${slugPath}`,
          },
        },
      });
    });
  });

  // Project-Showcase: the listing itself comes from the `pages` loop above
  // (it IS a page document with the slug `projects`). Details are one entry
  // per project per locale — the FULL unfiltered set, never a page slice.
  //
  // NEVER list a `?page=N` or `?tag=<slug>` URL here: those are faceted
  // variants that declare the bare listing as canonical and carry
  // `noindex, follow` (design §10.2) — putting them in the sitemap would ask
  // crawlers for pages we explicitly ask them to drop.
  projects.forEach((project) => {
    if (!project) return;
    // The slug is normalized the same way the route builder normalizes it, so
    // the sitemap URL is byte-identical to the rendered path.
    const slug = normalizeRouteSlug(project.slug ?? '');
    if (!slug) return;
    const slugPath = `/${PROJECT_SHOWCASE_SLUG}/${slug}`;
    const lastModified = project.updatedAt ? new Date(project.updatedAt) : undefined;
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified,
        changeFrequency: 'monthly',
        alternates: {
          languages: {
            en: `${baseUrl}/en${slugPath}`,
            de: `${baseUrl}/de${slugPath}`,
            'x-default': `${baseUrl}/de${slugPath}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}
