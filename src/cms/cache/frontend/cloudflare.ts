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
 * filtered by host (`purgeGroupsByZone`), never the other way round.
 *
 * FILES vs PREFIXES
 *
 * Exact URLs (`files`) are the default: a page slug or a project detail page is
 * one object. Routes whose page-1 HTML carries query-string variants
 * (`?page=N`, `?tag=<slug>` — see `PAGINATED_ROUTES` in ./routes.ts) have an
 * open-ended URL space, so they are evicted with `prefixes` (`host+path`, no
 * scheme/query/fragment) instead of enumerating every variant. Both shapes ride
 * in ONE request per zone when a flush has both, and both are capped at 100 ops
 * per request (longer lists are batched, a dropped op is logged loudly).
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
/** After a failed API call, skip purges for this long (Free bucket refills per minute). */
const CIRCUIT_OPEN_MS = 2 * 60_000;
/**
 * 429 pacing: the Free plan allows 5 purge REQUESTS per minute account-wide (a
 * token bucket of 25). One retry after a short pause rides out a burst; a
 * second 429 fails the purge so the circuit breaker can stop hammering.
 */
const RATE_LIMIT_RETRY_MS = 1_500;
const MAX_RATE_LIMIT_RETRIES = 1;

/**
 * Purge targets — three shapes, one request body each:
 *
 * - `urls`: exact site-relative paths (detail pages, page slugs). Expanded
 *   across the content hosts.
 * - `prefixes`: site-relative route PATHS whose whole subtree must go (the
 *   paginated/filtered listing: bare URL, `?page=N`, `?tag=<slug>`). The API
 *   wants `host+path` WITHOUT scheme/query/fragment, so the hosts are prepended
 *   and nothing else is added.
 * - `mixed`: both in ONE request — the Free budget is 5 requests/min, so a
 *   project publish must not fan out into one call per target type.
 *
 * Deliberately there is NO `everything` variant in the public type:
 * `purge_everything` would also wipe `/_next/static/**`, which must never be
 * purged (see `isPurgeablePath` in ./routes.ts). A broad flush is still a
 * single API call — `cms:all` resolves to the full set of content routes.
 */
export type CloudflarePurgeTarget =
  | { type: 'urls'; paths: readonly string[] }
  | { type: 'prefixes'; paths: readonly string[] }
  | { type: 'mixed'; paths?: readonly string[]; prefixes?: readonly string[] };

/** Outcome of a purge attempt — logged by the caller, never contains the token. */
export type CloudflarePurgeResult =
  | {
      status: 'skipped';
      reason: 'build-phase' | 'not-configured' | 'circuit-open' | 'nothing-to-purge';
    }
  | { status: 'purged'; urls: number; prefixes: number; zones: number }
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

/** Cloudflare accepts at most 100 ops (`files` or `prefixes`) per request. */
export const MAX_OPS_PER_REQUEST = 100;

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
 * API call groups these by zone — see `purgeGroupsByZone`.
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
 * Absolute `host+path` PREFIX entries (no scheme, no query, no fragment — the
 * shape Cloudflare's `prefixes` field expects) across the content hosts.
 *
 * Diagnostic view of `type: 'prefixes'` targets; the asset filter is the same
 * single choke point as for URLs.
 */
export function toPurgePrefixes(paths: readonly string[]): string[] {
  return purgeGroupsByZone({ paths: [], prefixes: paths }, resolveZones()).flatMap(
    (group) => group.prefixes,
  );
}

/**
 * `[{ zoneId, files, prefixes }]` — one group per zone, each containing ONLY
 * the URLs/prefixes of hosts that zone serves. A URL is never sent to a zone
 * that does not own it: Cloudflare would answer `success: true` and evict
 * nothing (see `PurgeZone`) while still spending one request of the
 * account-wide Free-plan budget.
 *
 * The host filter runs in BOTH directions: a zone only receives entries built
 * from its own origins, and an entry is dropped entirely when no zone owns its
 * host (e.g. a legacy `mosthi.de` origin from a stale configuration).
 *
 * Prefix entries are `host+path` (no scheme, no query, no fragment) as the purge
 * API requires, and they run through `isPurgeablePath` too — a prefix derived
 * from an asset path is impossible by construction (`normalizePrefixPath`
 * returns `null` for it), so the never-purge-assets invariant covers both
 * request shapes.
 */
type ZoneGroup = { zoneId: string; files: string[]; prefixes: string[] };

function toPrefix(origin: string, path: string): string | null {
  if (!isPurgeablePath(path)) return null;
  const host = originHost(origin);
  if (!host) return null;
  // `originHost` lowercases the hostname without a port: prefix purges are
  // path-based and the site is served on the default port.
  return `${host}${path}`;
}

/**
 * Normalizes a prefix CANDIDATE path, or `null` when it must never become a
 * prefix entry:
 *
 * - `/_next/static/**` → `null` (the asset invariant; a prefix is the widest
 *   possible way to violate it),
 * - a query/fragment is stripped (Cloudflare rejects `?`/`#` in `prefixes`),
 * - a trailing `/` is stripped, because a prefix purge matches "starts with"
 *   and `/de/vibe-coding/` would miss the bare listing while
 *   `/de/vibe-coding` covers its whole subtree,
 * - anything that is not a path (`http://…`, `//host/…`) → `null`.
 */
function normalizePrefixPath(pathname: string): string | null {
  const path = pathname.split(/[?#]/, 1)[0] ?? '';
  if (!path) return null;
  // An absolute URL carries a scheme — never a prefix path (the host of a
  // prefix comes from the zone, never from the input).
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return null;
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const trimmed = withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
  // A protocol-relative value (`//host/...`) would prefix a foreign host.
  if (trimmed.startsWith('//')) return null;
  if (!isPurgeablePath(trimmed)) return null;
  return trimmed;
}

function purgeGroupsByZone(
  { paths, prefixes }: { paths: readonly string[]; prefixes: readonly string[] },
  zones: readonly PurgeZone[],
): ZoneGroup[] {
  const files = paths
    .map((path) => (path.startsWith('/') ? path : `/${path}`))
    .filter(isPurgeablePath);
  // Prefix entries go through the same choke point as files (`isPurgeablePath`
  // inside `normalizePrefixPath`), so an asset prefix is impossible by
  // construction — see the INVARIANT in the module header.
  const prefixPaths = prefixes
    .map(normalizePrefixPath)
    .filter((path): path is string => path !== null);

  const groups: ZoneGroup[] = [];
  for (const zone of zones) {
    const zoneFiles = new Set<string>();
    const zonePrefixes = new Set<string>();
    for (const path of files) {
      for (const origin of zone.origins) {
        const url = `${origin}${path}`;
        if (!urlBelongsToOrigin(url, origin)) continue;
        zoneFiles.add(url);
      }
    }
    for (const path of prefixPaths) {
      for (const origin of zone.origins) {
        if (!urlBelongsToOrigin(`${origin}${path}`, origin)) continue;
        const prefix = toPrefix(origin, path);
        if (prefix) zonePrefixes.add(prefix);
      }
    }
    if (zoneFiles.size > 0 || zonePrefixes.size > 0) {
      groups.push({ zoneId: zone.zoneId, files: [...zoneFiles], prefixes: [...zonePrefixes] });
    }
  }
  return groups;
}

/** One API call for a zone: `files` and/or `prefixes`, visible in one request. */
async function postPurge(
  zoneId: string,
  token: string,
  body: { files?: string[]; prefixes?: string[] },
): Promise<Response> {
  return fetchImpl(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Splits a list into chunks of at most `size`, preserving order.
 *
 * `files` and `prefixes` are batched with the SAME helper, so a flush of 120
 * URLs becomes `100 + 20` and not `100` with 20 silently dropped. The API caps
 * a request at 100 ops TOTAL, which is why the batches are sent as pairs (see
 * `opBatches`).
 */
export function chunkOps<T>(ops: readonly T[], size: number = MAX_OPS_PER_REQUEST): T[][] {
  const normalized = Math.max(1, Math.trunc(size) || MAX_OPS_PER_REQUEST);
  const chunks: T[][] = [];
  for (let index = 0; index < ops.length; index += normalized) {
    chunks.push(ops.slice(index, index + normalized));
  }
  return chunks;
}

/** One request body: up to 100 files and up to 100 prefixes. */
export type PurgeRequestBody = { files?: string[]; prefixes?: string[] };

/**
 * Batch plan for one zone: `[{files: 100}, {files: 20, prefixes: 4}, …]`.
 *
 * Files are consumed first so that a flush of pure URLs keeps its exact
 * `ceil(n / 100)` request count (a Free-plan budget concern), and the prefixes
 * ride along in the trailing requests: both shapes share one request whenever
 * they overlap, which keeps a mixed flush at `max(ceil(files/100),
 * ceil(prefixes/100))` requests instead of the sum.
 */
export function planPurgeRequests(
  files: readonly string[],
  prefixes: readonly string[],
): PurgeRequestBody[] {
  const batches: PurgeRequestBody[] = [];
  const fileChunks = chunkOps(files);
  const prefixChunks = chunkOps(prefixes);
  const count = Math.max(fileChunks.length, prefixChunks.length);
  for (let index = 0; index < count; index += 1) {
    const body: PurgeRequestBody = {};
    const fileChunk = fileChunks[index];
    const prefixChunk = prefixChunks[index];
    if (fileChunk?.length) body.files = fileChunk;
    if (prefixChunk?.length) body.prefixes = prefixChunk;
    if (body.files || body.prefixes) batches.push(body);
  }
  return batches;
}

/**
 * Runs every batch of one zone. Any non-2xx (after the single 429 retry) makes
 * the whole zone a failure: a partially purged zone is indistinguishable from an
 * untouched one while the stale objects keep serving.
 */
async function sendZoneBatches(
  zoneId: string,
  token: string,
  batches: readonly PurgeRequestBody[],
): Promise<{ ok: true; files: number; prefixes: number } | { ok: false; reason: string }> {
  let files = 0;
  let prefixes = 0;
  for (let index = 0; index < batches.length; index += 1) {
    const body = batches[index];
    if (!body) continue;
    try {
      let response = await postPurge(zoneId, token, body);
      if (response.status === 429) {
        // Paced retry: one after a short pause, then give up (circuit breaker).
        for (let attempt = 0; attempt < MAX_RATE_LIMIT_RETRIES; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_MS));
          response = await postPurge(zoneId, token, body);
          if (response.status !== 429) break;
        }
      }

      if (!response.ok) {
        const batchLabel = batches.length > 1 ? ` (batch ${index + 1}/${batches.length})` : '';
        return {
          ok: false,
          // Rate limiting is reported verbatim (no zone prefix): the caller maps
          // it to the one reason string every consumer keys on.
          reason:
            response.status === 429
              ? `rate limited (429)${batchLabel}`
              : `zone ${zoneId}: HTTP ${response.status}${batchLabel}`,
        };
      }
      files += body.files?.length ?? 0;
      prefixes += body.prefixes?.length ?? 0;
    } catch (error) {
      // Name + message only: the request object carries the token.
      return {
        ok: false,
        reason:
          error instanceof Error
            ? `zone ${zoneId}: ${error.name}: ${error.message}`
            : `zone ${zoneId}: unknown error`,
      };
    }
  }
  return { ok: true, files, prefixes };
}

async function sendPurge(
  target: CloudflarePurgeTarget,
  { token, zones }: { token: string; zones: PurgeZone[] },
): Promise<CloudflarePurgeResult> {
  const groups = purgeGroupsByZone(resolveTargetOps(target), zones);
  if (groups.length === 0) return { status: 'skipped', reason: 'nothing-to-purge' };

  // Requests are batched per zone (the Free-plan bucket is per ACCOUNT, 5/min),
  // never one request per URL. A flush of 240 files therefore costs
  // `ceil(240 / 100) = 3` requests in that zone.
  const failures: string[] = [];
  let urls = 0;
  let prefixes = 0;
  let purgedZones = 0;
  let batches = 0;

  for (const group of groups) {
    const plan = planPurgeRequests(group.files, group.prefixes);
    batches += plan.length;
    const outcome = await sendZoneBatches(group.zoneId, token, plan);
    if (outcome.ok) {
      purgedZones += 1;
      urls += outcome.files;
      prefixes += outcome.prefixes;
      continue;
    }
    failures.push(outcome.reason);
  }

  // Partial success is a failure: the zone (or the batch) that failed keeps
  // serving stale content, and the caller must see that (and the circuit must
  // open) — reporting `success` for the sent subset is the silent-drift trap.
  if (failures.length > 0) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    console.warn(
      `[cf-cache] Purge unvollstaendig: ${batches - failures.length}/${batches} Request(s) ok, ` +
        `${failures.length} fehlgeschlagen`,
    );
    return { status: 'failed', reason: failures.join('; ') };
  }
  return { status: 'purged', urls, prefixes, zones: purgedZones };
}

/** Normalizes a target into the two op lists (a `mixed` target may omit one). */
function resolveTargetOps(target: CloudflarePurgeTarget): {
  paths: readonly string[];
  prefixes: readonly string[];
} {
  if (target.type === 'urls') return { paths: target.paths, prefixes: [] };
  if (target.type === 'prefixes') return { paths: [], prefixes: target.paths };
  return { paths: target.paths ?? [], prefixes: target.prefixes ?? [] };
}

/** True when a target carries nothing purgeable (skip before touching the API). */
function isEmptyTarget(target: CloudflarePurgeTarget): boolean {
  const { paths, prefixes } = resolveTargetOps(target);
  return paths.length === 0 && prefixes.length === 0;
}

/**
 * Purges the target at the edge. Never throws.
 */
export async function purgeCloudflareCache(
  target: CloudflarePurgeTarget,
): Promise<CloudflarePurgeResult> {
  if (isBuildPhase()) return { status: 'skipped', reason: 'build-phase' };
  if (isEmptyTarget(target)) return { status: 'skipped', reason: 'nothing-to-purge' };
  const credentials = credential();
  if (!credentials) return { status: 'skipped', reason: 'not-configured' };
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
