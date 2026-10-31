import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    limit: 1000,
  });

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
