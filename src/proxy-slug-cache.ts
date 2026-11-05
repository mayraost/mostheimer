import 'server-only';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { normalizeSlug } from '@/cms/cache/frontend/utils';

/**
 * Published-slug cache for the Proxy's 404 check.
 *
 * WHY THIS EXISTS
 * With `cacheComponents` the [locale] shell streams, and the status is fixed at
 * 200 from the first streamed byte on (Next docs: `file-conventions/loading.md`
 * § "Status codes"). The only place left for a REAL 404 is the Proxy — which is
 * also what the docs recommend ("check the slug in Proxy, then rewrite it to a
 * not-found route … Keep Proxy checks fast"). But the request render cache does
 * not exist in the Proxy: `'use cache'` throws outside a request store, and
 * `unstable_cache` is a silent no-op there (both measured 05.11.2026 — every
 * request still hit Postgres). So the Proxy needs its own cache layer.
 *
 * WHY THIS SHAPE
 * - One query returns the whole slug list; every check afterwards is a Set
 *   lookup. Next's docs ask exactly for that ("avoid fetching full content"):
 *   `depth: 0`, `select: { slug: true }`, published rows only.
 * - Negative results are cached too: an unknown slug is remembered as
 *   missing, so a crawler hammering `/de/gibtsnicht` does not hit the DB.
 * - Single-flight: concurrent misses await ONE in-flight promise, so a cold
 *   start (or a CMS burst) produces one query, not one per request.
 * - Fail-open: if the DB does not answer, the cache reports "unknown set" and
 *   the Proxy lets the request through. A DB outage must never turn existing
 *   pages into 404s.
 *
 * INVALIDATION
 * The Proxy runs in a separate module instance from the app (and, with several
 * replicas, in separate processes), so a Payload hook cannot reach this Map
 * directly. Three layers cover it:
 *   1. TTL (default 120 s) — the hard upper bound for any staleness.
 *   2. A cheap freshness probe: one `count` query (`limit: 0`) per request once
 *      the soft window has passed. It reports whether the published set changed
 *      (count) or a write happened after the cached load (`newest updatedAt`),
 *      and reloads only then — no slug list transferred on a normal check.
 *   3. `invalidatePublishedSlugs()` for same-process callers (tests, seeds).
 * Chosen over a webhook/signal endpoint: no new public surface, no shared
 * secret, no message channel that can silently stop working.
 */

/** Kill switch (`PROXY_SLUG_CACHE=0`): every check goes straight to the DB. */
function cacheEnabled(): boolean {
  return process.env.PROXY_SLUG_CACHE !== '0';
}

function envSeconds(name: string, fallbackSeconds: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? raw * 1000 : fallbackSeconds * 1000;
}

/**
 * Background refresh interval of the slug snapshot (default 300 s).
 *
 * Two meanings, both intentional:
 * - the snapshot ages past this → the next check runs the cheap freshness
 *   probe (count + newest `updatedAt`) and reloads only if the set changed;
 * - a NEGATIVE ("missing") status is dropped after this window, so a page that
 *   gets published is reachable at most 5 minutes after … except that the
 *   freshness probe notices a publish immediately on the next check.
 */
function refreshMs(): number {
  return envSeconds('PROXY_SLUG_CACHE_REFRESH', 300);
}

/**
 * Maximum lifetime of the snapshot (default 30 days).
 *
 * Purely outage resistance: while the DB does not answer, the last known slug
 * set keeps being served instead of failing open on every request. It is not a
 * freshness budget — the refresh probe above decides freshness.
 */
function maxAgeMs(): number {
  return envSeconds('PROXY_SLUG_CACHE_MAX_AGE', 2_592_000);
}

/**
 * Negative-cache lifetime (default 60 s), always ≤ refreshMs().
 *
 * MUST stay short: a falsy "missing" would hide a freshly published page. The
 * probe already catches a changed published set (count/updatedAt), but a page
 * published *while the probe still matches* would otherwise stay invisible.
 * 60 s is the compromise between crawler protection and publish latency.
 */
function missingTtlMs(): number {
  return Math.min(envSeconds('PROXY_SLUG_CACHE_MISSING_TTL', 60), refreshMs());
}

/** Bound on remembered slugs (LRU); pages beyond it fall back to the DB. */
const MAX_ENTRIES = 5_000;

/**
 * Per-slug decision, bounded LRU:
 * - `exists` — the slug is in the snapshot (never expires by itself; the
 *   snapshot reload drops the whole map, so a deleted page is caught too);
 * - `missing` — negative cache with its own short expiry (`expiresAt`);
 * - `unknown` — the snapshot could not be produced (DB down, empty set): kept
 *   for one refresh window so a burst does not retry the DB per request.
 */
type SlugStatus = 'exists' | 'missing' | 'unknown';

type SlugEntry = { status: SlugStatus; expiresAt: number };

const statusCache = new Map<string, SlugEntry>();
let knownSlugs: Set<string> | null = null;
let knownCountAt = -1;
let knownNewestUpdatedAt = -1;
let loadedAt = 0;
let inFlight: Promise<Set<string> | null> | null = null;

/** Remembers a decision per slug, bounded LRU (Map keeps insert order). */
function remember(slug: string, status: SlugStatus): void {
  if (statusCache.has(slug)) statusCache.delete(slug);
  const ttl =
    status === 'exists' ? maxAgeMs() : status === 'missing' ? missingTtlMs() : refreshMs();
  statusCache.set(slug, { status, expiresAt: Date.now() + ttl });
  if (statusCache.size > MAX_ENTRIES) {
    const oldest = statusCache.keys().next();
    if (!oldest.done) statusCache.delete(oldest.value);
  }
}

/** Drops every cached slug + the snapshot (same-process callers, tests). */
export function invalidatePublishedSlugs(): void {
  statusCache.clear();
  knownSlugs = null;
  knownCountAt = -1;
  knownNewestUpdatedAt = -1;
  loadedAt = 0;
  inFlight = null;
}

/** Snapshot of the loaded state — for diagnostics and tests. */
export function publishedSlugCacheStats(): {
  entries: number;
  slugCount: number;
  loadedAt: number;
  stale: boolean;
} {
  return {
    entries: statusCache.size,
    slugCount: knownSlugs?.size ?? 0,
    loadedAt,
    stale: knownSlugs === null || Date.now() - loadedAt > refreshMs(),
  };
}

async function payload() {
  return getPayload({ config: configPromise });
}

/**
 * `slug` column only, published rows only: the whole point of the design is
 * that this query carries no page content (docs: "avoid fetching full
 * content").
 */
async function loadSlugs(): Promise<Set<string> | null> {
  try {
    const client = await payload();
    const result = await client.find({
      collection: 'pages',
      draft: false,
      limit: 10_000,
      depth: 0,
      pagination: false,
      select: { slug: true },
      where: { _status: { equals: 'published' } },
    });
    const slugs = new Set<string>((result.docs ?? []).map((doc) => normalizeSlug(doc.slug)));

    // Remember the cheap fingerprint the freshness probe compares against.
    const probe = await client.find({
      collection: 'pages',
      draft: false,
      depth: 0,
      limit: 1,
      pagination: false,
      select: { updatedAt: true },
      where: { _status: { equals: 'published' } },
      sort: '-updatedAt',
    });
    const newest = probe.docs?.[0]?.updatedAt;

    knownSlugs = slugs;
    knownCountAt = (result as { totalDocs?: number }).totalDocs ?? slugs.size;
    knownNewestUpdatedAt = newest ? Date.parse(newest) : -1;
    loadedAt = Date.now();
    statusCache.clear();
    return slugs;
  } catch (error) {
    // Fail-open: keep whatever snapshot exists (a stale one is still better
    // than 404s), and report "no fresh answer" to the caller.
    console.warn('[proxy-cache] Slug-Liste nicht ladbar — Fail-open:', (error as Error)?.message);
    return null;
  }
}

/**
 * Single-flight refresh: concurrent callers share one promise, so a cold start
 * or a burst of CMS edits produces exactly one query.
 */
function refresh(): Promise<Set<string> | null> {
  if (!inFlight) {
    inFlight = loadSlugs().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Cheap freshness probe: does the cached snapshot still match the DB? Two
 * aggregate reads (no slug transfer): the published count and the newest
 * `updatedAt`. A rename that keeps the count stable changes `updatedAt`, so
 * both are needed. Any failure counts as "unchanged" (fail-open).
 */
async function snapshotStillValid(): Promise<boolean> {
  try {
    const client = await payload();
    const [countResult, newestResult] = await Promise.all([
      client.find({
        collection: 'pages',
        draft: false,
        depth: 0,
        limit: 0,
        pagination: false,
        where: { _status: { equals: 'published' } },
      }),
      client.find({
        collection: 'pages',
        draft: false,
        depth: 0,
        limit: 1,
        pagination: false,
        select: { updatedAt: true },
        where: { _status: { equals: 'published' } },
        sort: '-updatedAt',
      }),
    ]);
    const count = (countResult as { totalDocs?: number }).totalDocs ?? -1;
    const newest = newestResult.docs?.[0]?.updatedAt;
    const newestAt = newest ? Date.parse(newest) : -1;
    const same = count === knownCountAt && newestAt === knownNewestUpdatedAt;
    console.info('[proxy-cache-probe]', {
      count,
      knownCountAt,
      newestAt,
      knownNewestUpdatedAt,
      same,
    });
    return same;
  } catch {
    return true;
  }
}

/**
 * Fresh snapshot for a check, or `null` when none can be produced (the caller
 * then fails open).
 *
 * Order of decisions:
 * 1. inside the refresh window          → serve the snapshot, no DB at all;
 * 2. inside the max age, probe positive → serve the snapshot (stale-on-error);
 * 3. past the max age                   → must reload; if that fails, fail open
 *                                         instead of trusting a 30-day-old set.
 * Single-flight guarantees one query for concurrent callers.
 */
async function currentSlugs({
  probe = false,
}: { probe?: boolean } = {}): Promise<Set<string> | null> {
  if (!knownSlugs) return refresh();

  const age = Date.now() - loadedAt;
  if (age < refreshMs() && !probe) return knownSlugs;

  if (age < maxAgeMs()) {
    // Background refresh: a changed set is picked up, an unchanged one costs
    // only the two aggregate reads. A failing probe keeps the snapshot.
    //
    // `probe: true` forces this path for a re-evaluated negative answer, because
    // inside the 5-minute window the cached set may already be outdated while
    // `age < refreshMs()` is still true.
    //
    // A positive probe must NOT reset `loadedAt`: the probe only compares count
    // + newest `updatedAt`, so it cannot see every publish — but the per-slug
    // decisions keep their own short expiry and are re-evaluated.
    if (!(await snapshotStillValid())) {
      const reloaded = await refresh();
      if (reloaded) return reloaded;
    }
    return knownSlugs;
  }

  // Snapshot older than its maximum lifetime: correctness of a 404 check is no
  // longer guaranteed, so fail open until a reload succeeds.
  return refresh();
}

/**
 * Published slugs for the Proxy check. `null` = unknown (cache disabled, DB
 * down, nothing loaded yet) — callers must let the request through.
 */
export async function getPublishedSlugs(): Promise<Set<string> | null> {
  if (!cacheEnabled()) return loadSlugs();
  return currentSlugs();
}

/**
 * Status of one slug against the (cached) published set.
 *
 * `'exists'` / `'missing'` are both remembered — negative caching is the point:
 * a crawler walking unknown paths must not produce a DB read per request.
 * `'unknown'` means the set could not be produced (fail-open: never 404 on it).
 */
export async function publishedSlugStatus(slug: string): Promise<SlugStatus | 'unknown'> {
  if (!cacheEnabled()) {
    const slugs = await loadSlugs();
    return slugs === null ? 'unknown' : slugs.has(slug) ? 'exists' : 'missing';
  }

  const cached = statusCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    // Refresh LRU position without re-inserting.
    statusCache.delete(slug);
    statusCache.set(slug, cached);
    return cached.status;
  }
  if (cached) statusCache.delete(slug);

  // A re-evaluated NEGATIVE answer must be checked against a snapshot that is
  // known to be current: inside the 5-minute refresh window the cached set
  // could still be missing a page that was published seconds ago. Without this
  // a new page stayed 404 forever (measured 05.11.2026 — the negative entry
  // expired, the stale snapshot re-confirmed it).
  const needsFreshProbe = cached?.status === 'missing' || cached?.status === 'unknown';
  const slugs = await currentSlugs({ probe: needsFreshProbe });
  if (slugs === null) {
    remember(slug, 'unknown');
    return 'unknown';
  }

  const status: SlugStatus = slugs.has(slug) ? 'exists' : 'missing';
  remember(slug, status);
  return status;
}
