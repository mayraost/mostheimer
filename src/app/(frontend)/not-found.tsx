import { StaticNotFoundChrome } from '@/components/layout/StaticNotFoundChrome';
import { StatusScreen } from '@/components/layout/StatusScreen';
import { CRITICAL_404_HASH } from '@/404-critical.generated';

/**
 * Global 404 (route-group level, above the [locale] layout) — ALWAYS ENGLISH,
 * NO DATA ACCESS — BODY CONTENT ONLY.
 *
 * Reached only when a notFound() throw escapes the `[[...slug]]` segment: the
 * page's notFound() is caught by `[[...slug]]/not-found.tsx`, which renders the
 * localized 404 with full CMS chrome. This file is the safety net for
 * everything outside the locale tree and therefore must not
 * touch headers(), cookies(), connection() or Payload — a broken CMS/DB must
 * still yield a styled 404, never a 500.
 *
 * Document shell rule: <html>/<body>, fonts, theme and consent bootstrap live
 * ONLY in the [locale] layout; this boundary never duplicates them — it renders
 * the content column only (static EN header/footer + status card).
 *
 * Styling: Next renders this boundary in its own error document (`<html
 * id="__next_error__">`, no lang/class, no stylesheet link, no body classes).
 * Injecting the app stylesheet later is not possible either (React re-renders
 * the boundary and would fall back to Next's default 404). So the boundary links
 * `/404-critical.css` EAGERLY: a route serving the subset generated from
 * globals.css (`npm run generate:css`), with the hash as cache-buster. No
 * CSS-in-JS, no inline styles in this file.
 */
export default function GlobalNotFound() {
  return (
    <>
      {/* Eager critical subset: the error document carries no stylesheet link
          of its own (see file header). */}
      {}
      <link rel="stylesheet" href={`/404-critical.css?v=${CRITICAL_404_HASH}`} />
      {/* The error shell has no <html>/<body> attributes at all: this wrapper
          only scopes the temporary first-paint rules (see the stylesheet). */}
      <div data-404-critical>
        <StaticNotFoundChrome>
          <StatusScreen
            code="HTTP 404 · Not Found"
            title="Page not found"
            message="The page you are looking for does not exist or has moved."
            primary={{ label: 'Back to home', href: '/' }}
          />
        </StaticNotFoundChrome>
      </div>
    </>
  );
}
