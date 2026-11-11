/**
 * Same-origin media URLs → local path for `next/image`.
 *
 * Payload builds upload URLs from `serverURL` (set since the CSRF allowlist,
 * 10.11.2026), so `media.url` and every variant URL arrive as
 * `https://mostheimer.de/api/media/file/<name>.png` instead of
 * `/api/media/file/<name>.png`.
 *
 * `next/image` treats an absolute URL as REMOTE. Without `images.remotePatterns`
 * the optimizer rejects it and answers
 * `400 "url" parameter is not allowed` — every CMS image on the site stayed
 * blank (measured 11.11.2026 on `/de/projects`).
 *
 * The file is served by this same app, so the absolute form buys nothing: it
 * only adds a network round-trip through the optimizer back to ourselves and
 * breaks on every other host (dev `localhost:3000`, preview URLs). Reducing it
 * to a path makes the optimizer read the file locally — no allowlist needed,
 * host-agnostic by construction.
 *
 * Client-safe (no Node APIs, no React) so blocks, the project view model and
 * the live preview can all share it.
 */

/** Path prefixes that are served by this app's upload pipeline. */
const LOCAL_MEDIA_PREFIXES = ['/api/media/file/', '/media/'];

/**
 * Returns a path for media hosted by this app, and the input unchanged for
 * anything else (relative paths, external URLs, `null`/empty).
 *
 * Query and hash are preserved — Payload appends `?v=` style cache-busters in
 * some configurations, and dropping them would pin a stale file.
 */
export function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Relative (`/api/...`, `./x.png`) and data URIs pass through untouched.
  if (!/^(?:https?:)?\/\//i.test(trimmed)) return trimmed;

  let parsed: URL;
  try {
    parsed = new URL(trimmed, 'http://localhost');
  } catch {
    return trimmed;
  }

  if (!LOCAL_MEDIA_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))) {
    return trimmed;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
