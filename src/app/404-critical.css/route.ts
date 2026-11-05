import { CRITICAL_404_CSS } from '@/404-critical.generated';

/**
 * Serves the pre-hydration 404 stylesheet: the critical subset of
 * `src/app/globals.css`, generated at build time
 * (scripts/generate-404-critical-css.ts).
 *
 * Why a route instead of an inline <style>: the subset is a real stylesheet like
 * any other asset (cacheable, no CSS-in-JS in TSX), but it must be part of the
 * 404 document from the very first parse — so the boundary links it EAGERLY
 * with the content hash as query (`?v=<hash>`), see
 * src/app/(frontend)/not-found.tsx. Route-handler exception (Server Actions
 * first rule): byte/plain-text response for a browser, no writes.
 */
export function GET() {
  return new Response(CRITICAL_404_CSS, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      // Generated artifact: hash in the URL busts the cache, so it may be cached long.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
