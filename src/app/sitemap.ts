import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { getCachedAllPages } from '@/cms/cache/frontend/frontendCache';

// Die Sitemap liest Seiten aus der DB; DB-Verbindung existiert erst zur
// Laufzeit (Coolify-Docker-Build ohne DB). connection() bricht den Build-
// Prerender-Versuch ab — so landet kein leerer DB-Fallback als Cache-Eintrag.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  let docs;
  try {
    docs = await getCachedAllPages();
  } catch {
    // DB not reachable/migrated yet (z. B. erster Request auf frischem Volume):
    // Sitemap mit leerer Seitenliste ausgeben statt Request zu brechen.
    return [];
  }

  const baseUrl = envConfig.serverUrl;
  const locales = ['en', 'de'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  docs.forEach((page) => {
    locales.forEach((locale) => {
      const slugPath = page.slug === 'home' ? '' : `/${page.slug}`;
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${slugPath}`,
        lastModified: page.updatedAt,
        changeFrequency: 'monthly',
        alternates: {
          languages: {
            en: `${baseUrl}/en${slugPath}`,
            de: `${baseUrl}/de${slugPath}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}
