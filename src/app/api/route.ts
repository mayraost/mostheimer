import { apiIndex } from '@/cms/aeo/openapi';

/**
 * JSON index at `/api`.
 *
 * Why an explicit route: `/api` used to fall through to the `[locale]`
 * catch-all and rendered an HTML page with `lang="api"` — a machine client
 * asking for the API root got a website. The index lists the real endpoints and
 * points at the docs, OpenAPI spec, llms.txt and MCP page, so a discovery crawl
 * starting at `/api` has a useful next step.
 *
 * Static and unauthenticated: it contains no data beyond the public route shape.
 */
export function GET(): Response {
  return new Response(JSON.stringify(apiIndex(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
