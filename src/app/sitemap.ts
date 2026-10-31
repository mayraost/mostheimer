import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Die Sitemap liest Seiten aus der DB; DB-Verbindung existiert erst zur Laufzeit.
// Deshalb dynamisch rendern statt zur Build-Zeit prerendernder Versuch.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let payload;
  try {
    payload = await getPayload({ config: configPromise });
  } catch {
    // DB not reachable/migrated yet (z. B. Build-Prerender auf frischem Volume):
    // Sitemap mit leerer Seitenliste ausgeben statt Build zu brechen.
    return [];
  }

  let result;
  try {
    result = await payload.find({
      collection: 'pages',
      limit: 1000,
    });
  } catch {
    // DB not reachable/migrated yet (z. B. Build-Prerender auf frischem Volume):
    // Sitemap mit leerer Seitenliste ausgeben statt Build zu brechen.
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  const locales = ['en', 'de'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  result.docs.forEach((page) => {
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
