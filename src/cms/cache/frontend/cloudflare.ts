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
 * URLs per request), so each flush collects its paths and sends ONE request
 * PER ZONE. On 429 the affected objects stay stale until the next successful
 * purge (or s-maxage, 7 days); that failure is logged.
 *
 * ONE ZONE BY DEFAULT: THE CONTENT ZONE (`mostheimer.de`)
 *
 * Cloudflare purges are zone-scoped and there is no host-based purge. The site
 * is *reachable* under hosts of two separate zones — `mosthi.de`
 * (`fc81dba8…`) and `mostheimer.de` (`97b8bfd7…`) — but only the
 * `mostheimer.de` zone owns cached content: `mosthi.de`/`www.mosthi.de` answer
 * with a **301** to `https://mostheimer.de` (Traefik, see AGENTS.md §
 * "Domain-Konsolidierung"), and redirect responses are not stored as content
 * objects. Purging that zone therefore evicts nothing while consuming the
 * account-wide Free-plan budget (5 purge requests/min) that CMS edits need.
 *
 * So the default zone set is exactly ONE zone with its two content hosts
 * (`https://mostheimer.de`, `https://www.mostheimer.de`). The zone → hosts
 * mapping comes from `CLOUDFLARE_PURGE_ZONES` (same syntax as
 * `scripts/cf-purge.mjs`), so the deploy purge and this hook purge cannot
 * disagree; both fall back to the same single content zone.
 *
 * A URL is only ever sent to the zone that owns its host: the mapping is
 * filtered by host (`purgeUrlsByZone`), never the other way round.
 *
 * TOKEN PERMISSION
 *
 * `Zone → Cache Purge → Purge` for the content zone (`mostheimer.de`). A zone
 * in `CLOUDFLARE_PURGE_ZONES` that the token cannot purge fails with HTTP
 * 401/403, which is reported as a failure (partial success counts as failure,
 * see `sendPurge`).
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
 * the content hosts (`mostheimer.de`, `www.mostheimer.de`).
 */
export type CloudflarePurgeTarget = { type: 'urls'; paths: readonly string[] };

/** Outcome of a purge attempt — logged by the caller, never contains the token. */
export type CloudflarePurgeResult =
  | {
      status: 'skipped';
      reason: 'build-phase' | 'not-configured' | 'circuit-open' | 'nothing-to-purge';
    }
  | { status: 'purged'; urls: number; zones: number }
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
 * A Cloudflare zone and the hosts whose cached objects it owns.
 *
 * Cloudflare purges are ZONE-scoped and there is no host-based purge: handing a
 * URL of another zone to `/zones/<id>/purge_cache` returns `success: true` and
 * evicts nothing. Only the content zone is purged by default — see the module
 * header ("ONE ZONE BY DEFAULT"). Purging a foreign zone is not merely useless,
 * it is indistinguishable from "the hook did not run" while it burns the
 * Free-plan purge budget.
 */
type PurgeZone = { zoneId: string; origins: string[] };

/**
 * Read at call time (not from `envConfig` at import): keeps this module usable
 * from the plain-Node deploy script (`scripts/cf-purge.mjs`) and avoids turning
 * a missing credential into an import-time failure.
 */
function credential(): { token: string; zones: PurgeZone[] } | null {
  const token = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zones = resolveZones();
  if (!token || zones.length === 0) return null;
  return { token, zones };
}

/**
 * `CLOUDFLARE_PURGE_ZONES` — the zone configuration shared with
 * `scripts/cf-purge.mjs` (same syntax, so the deploy purge and the CMS-hook
 * purge can never disagree):
 *
 *   `zoneId:https://host1,https://host2[;zoneId2:https://host3]`
 *
 * When set it replaces `CLOUDFLARE_ZONE_ID` + host derivation entirely.
 * Entries without hosts fall back to the default content hosts.
 *
 * Without it, the default is a SINGLE zone: `CLOUDFLARE_ZONE_ID` when set
 * (documented default = the `mostheimer.de` content zone), with exactly the two
 * hosts that serve content from it. There is deliberately no second, implicit
 * zone: the legacy `mosthi.de` hosts only redirect and are not purged.
 */
function resolveZones(): PurgeZone[] {
  const explicit = (process.env.CLOUDFLARE_PURGE_ZONES ?? '').trim();
  if (explicit) {
    const zones: PurgeZone[] = [];
    for (const chunk of explicit
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)) {
      // Split on the FIRST colon only: the hosts that follow contain `https://`.
      const separator = chunk.indexOf(':');
      const zoneId = (separator === -1 ? chunk : chunk.slice(0, separator)).trim();
      const hosts = separator === -1 ? '' : chunk.slice(separator + 1);
      if (!zoneId) continue;
      const configuredHosts = hosts
        .split(',')
        .map((host) => host.trim().replace(/\/+$/, ''))
        .filter(Boolean);
      zones.push({
        zoneId,
        origins: configuredHosts.length > 0 ? configuredHosts : contentOrigins(),
      });
    }
    if (zones.length > 0) return zones;
  }

  const zoneId = (process.env.CLOUDFLARE_ZONE_ID ?? '').trim() || DEFAULT_CONTENT_ZONE_ID;
  return [{ zoneId, origins: contentOrigins() }];
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * The hosts the content is actually *served* from: `mostheimer.de` (canonical)
 * and `www.mostheimer.de`. Both live in the `mostheimer.de` zone and both must
 * be purged — the purge API needs the exact host an object was cached under and
 * there is no Vary-like purge.
 *
 * The legacy hosts (`mosthi.de`, `www.mosthi.de`) are intentionally absent: they
 * answer 301 to `https://mostheimer.de`, and a redirect response is not a
 * cached content object. Purging their zone buys nothing and costs one of the
 * five Free-plan purge requests per minute.
 */
const CONTENT_ORIGINS: readonly string[] = ['https://mostheimer.de', 'https://www.mostheimer.de'];

/** Documented `mostheimer.de` zone id — the ONLY zone the site caches content in. */
const DEFAULT_CONTENT_ZONE_ID = '97b8bfd76c5ddbe777f5f185631859bc';

/**
 * Content hosts for purges. `NEXT_PUBLIC_SERVER_URL` may list additional
 * production hosts (`;`-separated); the two content hosts are always present, so
 * a single-host value (metadata base) cannot silently skip the `www` host.
 * Entries that do not belong to the legacy redirect hosts are appended.
 */
function contentOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL ?? '';
  const configured = raw
    .split(';')
    .map((entry) => entry.trim().replace(/\/+$/, ''))
    .filter((entry) => entry.length > 0 && !isLegacyRedirectHost(entry));
  return [...new Set([...CONTENT_ORIGINS, ...configured])];
}

/**
 * Hosts that only redirect to the canonical host (`301`), i.e. hosts whose zone
 * holds no cached content. Used to keep them out of every purge list.
 */
function isLegacyRedirectHost(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'mosthi.de' || host.endsWith('.mosthi.de');
  } catch {
    return false;
  }
}

/** Host (lowercase, no port) of an absolute URL, or `''` when unparsable. */
function originHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** True when `url` belongs to `origin`'s host — never send it to a foreign zone. */
function urlBelongsToOrigin(url: string, origin: string): boolean {
  const urlHost = originHost(url);
  return urlHost !== '' && urlHost === originHost(origin);
}

/**
 * Absolute purge URLs for host-relative paths, across the content hosts.
 *
 * Static assets are filtered out here as the last line of defence, so no caller
 * — present or future — can hand a `/_next/static/**` URL to the purge API.
 *
 * This is the diagnostic/URL view (content hosts, no zone split). The actual
 * API call groups these by zone — see `purgeUrlsByZone`.
 */
export function toPurgeUrls(paths: readonly string[]): string[] {
  const urls = new Set<string>();
  for (const path of paths) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!isPurgeablePath(normalized)) continue;
    for (const origin of contentOrigins()) {
      urls.add(`${origin}${normalized}`);
    }
  }
  return [...urls];
}

/**
 * `[{ zoneId, files }]` — one group per zone, each containing ONLY the URLs of
 * hosts that zone serves. A URL is never sent to a zone that does not own it:
 * Cloudflare would answer `success: true` and evict nothing (see `PurgeZone`)
 * while still spending one request of the account-wide Free-plan budget.
 *
 * The host filter runs in BOTH directions: a zone only receives URLs built from
 * its own origins, and a URL is dropped entirely when no zone owns its host
 * (e.g. a legacy `mosthi.de` origin from a stale configuration).
 */
function purgeUrlsByZone(
  paths: readonly string[],
  zones: readonly PurgeZone[],
): { zoneId: string; files: string[] }[] {
  const purgeable = paths
    .map((path) => (path.startsWith('/') ? path : `/${path}`))
    .filter(isPurgeablePath);

  const groups: { zoneId: string; files: string[] }[] = [];
  for (const zone of zones) {
    const files = new Set<string>();
    for (const path of purgeable) {
      for (const origin of zone.origins) {
        const url = `${origin}${path}`;
        if (!urlBelongsToOrigin(url, origin)) continue;
        files.add(url);
      }
    }
    if (files.size > 0) groups.push({ zoneId: zone.zoneId, files: [...files] });
  }
  return groups;
}

async function sendPurge(
  target: CloudflarePurgeTarget,
  { token, zones }: { token: string; zones: PurgeZone[] },
): Promise<CloudflarePurgeResult> {
  const groups = purgeUrlsByZone(target.paths, zones);
  if (groups.length === 0) return { status: 'skipped', reason: 'nothing-to-purge' };

  // One request per zone. The Free-plan bucket is per ACCOUNT (5/min), so two
  // zones cost two requests of that bucket — never one request per URL.
  const failures: string[] = [];
  let urls = 0;
  let purgedZones = 0;

  for (const group of groups) {
    const files = group.files.slice(0, MAX_URLS_PER_REQUEST);
    const dropped = group.files.length - files.length;
    if (dropped > 0) {
      // Never drop purges silently: a larger site would otherwise keep serving
      // stale objects while the API still reports success for the sent subset.
      console.warn(
        `[cf-cache] ${group.files.length} URLs exceed the ${MAX_URLS_PER_REQUEST}-URL request cap for zone ${group.zoneId.slice(0, 8)}; ${dropped} URL(s) not purged`,
      );
    }
    const body: Record<string, unknown> = { files };
    try {
      const response = await fetchImpl(`${CLOUDFLARE_API_BASE}/zones/${group.zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        purgedZones += 1;
        urls += files.length;
        continue;
      }
      failures.push(
        response.status === 429
          ? 'rate limited (429)'
          : `zone ${group.zoneId}: HTTP ${response.status}`,
      );
    } catch (error) {
      // Name + message only: the request object carries the token.
      failures.push(
        error instanceof Error
          ? `zone ${group.zoneId}: ${error.name}: ${error.message}`
          : `zone ${group.zoneId}: unknown error`,
      );
    }
  }

  // Partial success is a failure: the zone that failed keeps serving stale
  // content, and the caller must see that (and the circuit must open).
  if (failures.length > 0) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    return { status: 'failed', reason: failures.join('; ') };
  }
  return { status: 'purged', urls, zones: purgedZones };
}

/**
 * Purges the target at the edge. Never throws.
 */
export async function purgeCloudflareCache(
  target: CloudflarePurgeTarget,
): Promise<CloudflarePurgeResult> {
  if (isBuildPhase()) return { status: 'skipped', reason: 'build-phase' };
  const credentials = credential();
  if (!credentials) return { status: 'skipped', reason: 'not-configured' };
  if (target.type === 'urls' && target.paths.length === 0) {
    return { status: 'skipped', reason: 'nothing-to-purge' };
  }
  if (Date.now() < circuitOpenUntil) return { status: 'skipped', reason: 'circuit-open' };
  return sendPurge(target, credentials);
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
