import { LLMS_TXT } from '@/cms/aeo/llmsTxt';

/**
 * /llms.txt (llmstxt.org v2, curated): markdown overview for agents and AI
 * search surfaces. Structure: H1 (required) → blockquote TL;DR → context
 * paragraphs → H2 link lists.
 *
 * Route handler instead of a public file because this repo keeps static assets
 * in src/public (copied by the Dockerfile), which the dev server does not
 * serve — the handler behaves identically in dev and prod without a Dockerfile
 * change.
 *
 * No request-time APIs and no DB read, so the handler is default-cached and
 * statically generated at build time (safe for the DB-less build).
 */
export function GET(): Response {
  return new Response(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
