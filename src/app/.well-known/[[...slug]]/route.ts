import { wellKnownBody } from '@/cms/aeo/agentFiles';

/**
 * `/.well-known/*` discovery files for agents and MCP clients.
 *
 * One optional catch-all keeps the well-known surface in a single place:
 * - `/.well-known/mcp/manifest.json` — MCP server manifest
 * - `/.well-known/mcp.json` — alias
 * - `/.well-known/agent-skills/index.json` — agent skill discovery
 * - `/.well-known/agent-skills/mostheimer-site/SKILL.md` — when-to-use guidance
 *
 * The Proxy skips dotted paths, so these requests never enter the locale
 * catch-all. Everything here is a constant: no DB, no auth, cacheable.
 */
export function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<Response> | Response {
  return params.then(({ slug }) => {
    const resolved = wellKnownBody(slug ?? []);
    if (!resolved) {
      return new Response('Not Found\n', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response(resolved.body, {
      headers: {
        'Content-Type': resolved.contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  });
}
