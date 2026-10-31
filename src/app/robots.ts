import type { MetadataRoute } from 'next';
import { envConfig } from '@/envConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = envConfig.serverUrl;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/settings'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
