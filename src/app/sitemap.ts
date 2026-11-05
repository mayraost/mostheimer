import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { getCachedAllPages } from '@/cms/cache/frontend/frontendCache';

// Pages come from the DB, which only exists at runtime (the Coolify build has
// no DB). connection() aborts the build prerender so an empty DB fallback is
// never cached.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  let docs;
  try {
    docs = await getCachedAllPages();
  } catch {
    // DB not reachable or not migrated yet (first request on a fresh volume):
    // serve an empty sitemap instead of failing the request.
    return [];
  }

  const baseUrl = envConfig.serverUrl;
  const locales = ['en', 'de'];

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

  return sitemapEntries;
}
