import { OPENAPI_SPEC } from '@/cms/aeo/openapi';

/**
 * Machine-readable API surface for agents and tool loaders.
 *
 * Served at `/openapi.json` (the conventional discovery URL). The spec is a
 * plain constant, so the route is statically generated at build time and works
 * without a database — the same constraint as `/llms.txt` and `/sitemap.xml`'s
 * fallback path.
 */
export function GET(): Response {
  return new Response(JSON.stringify(OPENAPI_SPEC, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      // Discovery documents are meant to be fetched by external agents.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
