/**
 * Markdown content negotiation for agents (`Accept: text/markdown`).
 *
 * PURE and edge/proxy-safe: no `next/*`, no Payload, no Node built-ins. The
 * Proxy uses `wantsMarkdown()` to decide whether a content request should be
 * served as Markdown, and the Markdown route uses `markdownResponse()` for the
 * wire format. Keeping the negotiation helpers in one module means the Proxy,
 * the route handler and the tests cannot drift apart.
 *
 * The site keeps HTML as the default representation. Markdown is only served
 * when the client explicitly asks for it and does not rank HTML higher
 * (`text/html;q=1, text/markdown;q=0.9` stays HTML).
 */

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

/**
 * True when the `Accept` header explicitly prefers `text/markdown` over HTML.
 *
 * Rules:
 * - `text/markdown` / `text/x-markdown` (the historical alias) count.
 * - `q=0` explicitly refuses Markdown.
 * - When `text/html` is also listed with an equal-or-higher q-value, HTML
 *   wins (a browser that happens to mention Markdown stays on HTML).
 */
export function wantsMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;

  let markdownQ: number | null = null;
  let htmlQ = 0;

  for (const part of accept.split(',')) {
    const [rawType, ...rawParams] = part.trim().toLowerCase().split(';');
    const type = rawType?.trim();
    if (!type) continue;

    let q = 1;
    for (const rawParam of rawParams) {
      const [key, value] = rawParam.trim().split('=');
      if (key === 'q') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) q = Math.min(1, Math.max(0, parsed));
      }
    }

    if (type === 'text/markdown' || type === 'text/x-markdown') {
      markdownQ = Math.max(markdownQ ?? 0, q);
    } else if (type === 'text/html' || type === 'application/xhtml+xml') {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  return markdownQ !== null && markdownQ > 0 && markdownQ >= htmlQ;
}

/** Internal rewrite target for a Markdown representation of `pathname`. */
export function markdownRoutePath(pathname: string): string {
  return `/api/agent/markdown${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

/**
 * Markdown body for a 404. It explains the error (more than 20 characters) and
 * links to the machine-readable entry points agents should try next. The Proxy
 * returns this directly so the 404 status and the Markdown representation are
 * guaranteed even before the React tree renders.
 */
export function markdownNotFound(pathname: string): string {
  const safePath = pathname.replace(/[`\n\r]/g, '');
  return [
    '# 404 — Not Found',
    '',
    `The path \`${safePath}\` does not exist on mostheimer.de. It may have been renamed, moved or never existed.`,
    '',
    'Try one of these machine-readable entry points instead:',
    '',
    '- [Agent instructions](/llms.txt) — site overview, page index and when to use the API.',
    '- [Sitemap](/sitemap.xml) — every public page in both locales.',
    '- [API documentation](/docs) — REST endpoints, examples and the OpenAPI spec.',
    '- [OpenAPI specification](/openapi.json) — machine-readable API surface.',
    '',
    'If you followed a link from another page, the target was probably removed.',
    '',
  ].join('\n');
}

/** Markdown response with the headers the negotiation contract requires. */
export function markdownResponse(body: string, status = 200): Response {
  const cacheable = status < 400;
  return new Response(body, {
    status,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      // The representation is negotiated, so caches must key on Accept.
      Vary: 'Accept',
      // Successful representations get their own short-lived cache object (the
      // edge rewrites Markdown requests to /api/agent/markdown/<path>, so the
      // cache key is distinct from HTML). Errors are never cached.
      'Cache-Control': cacheable
        ? 'public, s-maxage=300, stale-while-revalidate=3600, stale-if-error=3600'
        : 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
