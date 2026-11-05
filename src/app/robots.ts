import type { MetadataRoute } from 'next';
import { envConfig } from '@/envConfig';

/**
 * AI crawler policy — deliberately differentiates only the OpenAI bot split:
 *
 * - `OAI-SearchBot` — surfaces sites in ChatGPT Search → ALLOW (direct AEO
 *   traffic/citation channel).
 * - `GPTBot` — foundation-model training crawl → ALLOW (a judgement call, not
 *   spec): this is a deliberately public profile with curated CV facts.
 * - `ChatGPT-User` — user-initiated interactive fetches; already covered by the
 *   `*` rule, so no separate block.
 *
 * Other AI bots are not explicitly blocked (unverified behaviour, low added
 * value). `host` is a Yandex-specific, non-standard top-level directive;
 * engines without support ignore it.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = envConfig.serverUrl;
  const disallow = ['/admin/', '/api/', '/settings'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
