/**
 * Cloudflare edge-cache purger for the public site.
 *
 * ARCHITECTURE (see AGENTS.md § "Cloudflare Edge-Cache")
 *
 * - Next.js owns the edge TTL. Cloudflare's cache rules only decide
 *   *eligibility* (respect origin headers / bypass); there is no hard-coded
 *   edge TTL anywhere in the zone.
 * - Because the TTL is long (cacheLife.revalidate = 7 days, browser TTLs 1 h),
 *   correctness rests on this module: every Next.js tag flush is followed by a
 *   purge of the matching edge objects, in the same code path
 *   (`safeRevalidate` in ./revalidate.ts calls `purgeCloudflareForTags`).
 * - Fail-soft: a purge failure must never break a CMS save. Errors are caught,
 *   logged loudly (a stale window is the consequence) and never rethrown; the
 *   token never appears in a log line.
 *
 * INVARIANT: static assets are never purged
 *
 * `/_next/static/**` is immutable and content-addressed by build. Purging HTML
 * is cheap and correct; purging assets is wasteful (Free-plan budget, 5/min)
 * and destroys outage resilience — with the origin down, the warm edge copies
 * of the CSS/JS are what keep the site styled. Every purge path therefore goes
 * through `isPurgeablePath` (./routes.ts) and `toPurgeUrls` filters there, and
 * `purge_everything` is not reachable from application code at all.
 *
 * WHY URL PURGE, NOT CACHE TAGS
 *
 * Tag purge needs a `Cache-Tag` response header attached to the cached object.
 * Measured on this zone (05.11.2026): a Cache Response Rule *can* add a
 * `Cache-Tag` header (it is visible in the response), and the purge API accepts
 * `{ tags: [...] }` with `success: true`, but purging by that tag is a silent
 * no-op — the object kept `cf-cache-status: HIT` with a monotonically growing
 * `Age` (445 → 449 → 453 s). The transform runs after the cache key is
 * computed, so tags are not indexed. URL purge needs nothing from the origin
 * and is exact here because the route set is tiny and known (2 locales × page
 * slugs). Verified for this zone: **Free plan** — URL purge is available,
 * rate-limited to 5 purge requests/min per account (token bucket 25, max 100
 * URLs per request), so each flush collects its paths and sends ONE request. On
 * 429 the affected objects stay stale until the next successful purge (or
 * s-maxage, 7 days); that failure is logged.
 *
 * INERT OUTSIDE CLOUDFLARE
 *
 * No token/zone configured (local dev, build phase) → no-op, nothing logged.
 * A failed API call opens a circuit breaker, so a broken token cannot slow down
 * every CMS save with a hanging request.
 */

import { isPurgeablePath } from './routes';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const REQUEST_TIMEOUT_MS = 5000;
/** Cloudflare accepts up to 100 URLs per single-file purge request. */
const MAX_URLS_PER_REQUEST = 100;
/** After a failed API call, skip purges for this long (Free bucket refills per minute). */
const CIRCUIT_OPEN_MS = 2 * 60_000;

/**
 * Purge targets. Deliberately there is NO `everything` variant in the public
 * type: `purge_everything` would also wipe `/_next/static/**`, which must never
 * be purged (see `isPurgeablePath` in ./routes.ts). A broad flush is still a
 * single API call — `cms:all` resolves to the full set of content routes.
 *
 * `type: 'urls'` carries site-relative paths; `toPurgeUrls` expands them across
 * every public host.
 */
export type CloudflarePurgeTarget = { type: 'urls'; paths: readonly string[] };

/** Outcome of a purge attempt — logged by the caller, never contains the token. */
export type CloudflarePurgeResult =
  | {
      status: 'skipped';
      reason: 'build-phase' | 'not-configured' | 'circuit-open' | 'nothing-to-purge';
    }
  | { status: 'purged'; urls: number }
  | { status: 'failed'; reason: string };

let circuitOpenUntil = 0;

/**
 * Test seam: replaces the fetch implementation used for the API call.
 * Production code never calls this.
 */
let fetchImpl: typeof fetch = (input, init) => fetch(input, init);

/** @internal test seam — see `tests/int/cloudflare-purge.int.spec.ts`. */
export function setCloudflareFetchForTests(impl: typeof fetch | null): void {
  fetchImpl = impl ?? ((input, init) => fetch(input, init));
}

/** @internal test seam: closes the circuit breaker. */
export function resetCloudflareCircuitForTests(): void {
  circuitOpenUntil = 0;
}

/**
 * Read at call time (not from `envConfig` at import): keeps this module usable
 * from the plain-Node deploy script (`scripts/cf-purge.mjs`) and avoids turning
 * a missing credential into an import-time failure.
 */
function credential(): { token: string; zoneId: string } | null {
  const token = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  if (!token || !zoneId) return null;
  return { token, zoneId };
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * `NEXT_PUBLIC_SERVER_URL` may list several production hosts separated by `;`
 * (`https://mosthi.de; https://mostheimer.de; …`): the purge API needs the
 * exact host an object was cached under and there is no Vary-like purge, so
 * every host is listed. Default = all three hosts the zone serves the site on.
 */
const DEFAULT_PURGE_ORIGINS = 'https://mosthi.de; https://mostheimer.de; https://www.mostheimer.de';

function origins(): string[] {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL || DEFAULT_PURGE_ORIGINS;
  const configured = raw
    .split(';')
    .map((entry) => entry.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  // Always include the site's own hosts: a single-host NEXT_PUBLIC_SERVER_URL
  // (metadata base) must not silently skip the other two cached hosts.
  const defaults = DEFAULT_PURGE_ORIGINS.split(';').map((entry) => entry.trim());
  return [...new Set([...configured, ...defaults])];
}

/**
 * Absolute purge URLs for host-relative paths, across every public host.
 *
 * Static assets are filtered out here as the last line of defence, so no caller
 * — present or future — can hand a `/_next/static/**` URL to the purge API.
 */
export function toPurgeUrls(paths: readonly string[]): string[] {
  const urls = new Set<string>();
  for (const path of paths) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!isPurgeablePath(normalized)) continue;
    for (const origin of origins()) {
      urls.add(`${origin}${normalized}`);
    }
  }
  return [...urls];
}

async function sendPurge(
  target: CloudflarePurgeTarget,
  { token, zoneId }: { token: string; zoneId: string },
): Promise<CloudflarePurgeResult> {
  const files = toPurgeUrls(target.paths);
  if (files.length === 0) return { status: 'skipped', reason: 'nothing-to-purge' };
  const body: Record<string, unknown> = { files: files.slice(0, MAX_URLS_PER_REQUEST) };

  try {
    const response = await fetchImpl(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) return { status: 'purged', urls: files.length };

    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    return {
      status: 'failed',
      reason: response.status === 429 ? 'rate limited (429)' : `HTTP ${response.status}`,
    };
  } catch (error) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    // Name + message only: the request object carries the token.
    return {
      status: 'failed',
      reason: error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error',
    };
  }
}

/**
 * Purges the target at the edge. Never throws.
 */
export async function purgeCloudflareCache(
  target: CloudflarePurgeTarget,
): Promise<CloudflarePurgeResult> {
  if (isBuildPhase()) return { status: 'skipped', reason: 'build-phase' };
  if (!credential()) return { status: 'skipped', reason: 'not-configured' };
  if (target.type === 'urls' && target.paths.length === 0) {
    return { status: 'skipped', reason: 'nothing-to-purge' };
  }
  if (Date.now() < circuitOpenUntil) return { status: 'skipped', reason: 'circuit-open' };
  return sendPurge(target, credential() as { token: string; zoneId: string });
}

/**
 * Purges and logs failures loudly (`reason` only, never the token).
 * Never throws — used on the CMS hook path.
 */
export async function purgeCloudflareNow(
  target: CloudflarePurgeTarget,
  label: string,
): Promise<CloudflarePurgeResult> {
  try {
    const result = await purgeCloudflareCache(target);
    if (result.status === 'failed') {
      console.warn(
        `[cf-cache] Edge-Purge '${label}' fehlgeschlagen (${result.reason}). ` +
          'Der Edge-Cache kann bis zur naechsten erfolgreichen Purge veraltete Inhalte liefern.',
      );
    }
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    console.warn(`[cf-cache] Edge-Purge '${label}' unerwartet fehlgeschlagen: ${reason}`);
    return { status: 'failed', reason };
  }
}
