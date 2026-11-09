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
 * TWO INDEPENDENT SNAPSHOTS (one document = one route)
 *
 * - `pages`        → the page slugs (`/de/<slug>`, `[[...slug]]`)
 * - `projects` → the projects detail slugs (`/de/projects/<slug>`)
 * They are separate Sets with their own fingerprint, so a project publish never
 * invalidates the page snapshot (and vice versa). Both use the same policy code.
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

/** Collection with a public route per document (`slug` column). */
type SlugCollection = 'pages' | 'projects';

type SlugSnapshot = {
  statusCache: Map<string, SlugEntry>;
  knownSlugs: Set<string> | null;
  knownCountAt: number;
  knownNewestUpdatedAt: number;
  loadedAt: number;
  inFlight: Promise<Set<string> | null> | null;
};

/**
 * One independent snapshot per collection. A factory (not a hook into the
 * payload's own state) keeps the two sets completely decoupled: a burst on a
 * project route can never reload the page list.
 */
function createSignature(): SlugSnapshot {
  return {
    statusCache: new Map<string, SlugEntry>(),
    knownSlugs: null,
    knownCountAt: -1,
    knownNewestUpdatedAt: -1,
    loadedAt: 0,
    inFlight: null,
  };
}

const PAGE_SIGNATURE = createSignature();
const PROJECT_SIGNATURE = createSignature();

async function payload() {
  return getPayload({ config: configPromise });
}

/**
 * The collection types are generated from `payload.config.ts` (`generate:types`)
 * by the collection owner. Until then — and to keep this module independent of
 * the generated union — the document shape is the minimum this cache needs.
 */
type SlugDocument = { slug?: unknown; updatedAt?: unknown };

/**
 * `slug` column only, published rows only: the whole point of the design is
 * that this query carries no page content (docs: "avoid fetching full
 * content").
 */
async function loadSlugsInto(
  snapshot: SlugSnapshot,
  collection: SlugCollection,
): Promise<Set<string> | null> {
  try {
    const client = await payload();
    const result = await client.find({
      // Payload's collection slug union is generated from the CMS config; the
      // snapshot only ever receives the two route-bearing collections above.
      collection: collection as 'pages',
      draft: false,
      limit: 10_000,
      depth: 0,
      pagination: false,
      select: { slug: true },
      where: { _status: { equals: 'published' } },
    });
    const slugs = new Set<string>(
      (result.docs ?? [])
        .map((doc) => normalizeSlug(String((doc as { slug?: unknown }).slug ?? '')))
        .filter(Boolean),
    );

    // Remember the cheap fingerprint the freshness probe compares against.
    const probe = await client.find({
      collection: collection as 'pages',
      draft: false,
      depth: 0,
      limit: 1,
      pagination: false,
      select: { updatedAt: true },
      where: { _status: { equals: 'published' } },
      sort: '-updatedAt',
    });
    const newest = (probe.docs?.[0] as SlugDocument | undefined)?.updatedAt;

    snapshot.knownSlugs = slugs;
    snapshot.knownCountAt = (result as { totalDocs?: number }).totalDocs ?? slugs.size;
    snapshot.knownNewestUpdatedAt = newest ? Date.parse(String(newest)) : -1;
    snapshot.loadedAt = Date.now();
    snapshot.statusCache.clear();
    return slugs;
  } catch (error) {
    // Fail-open: keep whatever snapshot exists (a stale one is still better
    // than 404s), and report "no fresh answer" to the caller.
    console.warn(
      `[proxy-cache] Slug-Liste (${collection}) nicht ladbar — Fail-open:`,
      (error as Error)?.message,
    );
    return null;
  }
}

/**
 * Single-flight refresh: concurrent callers share one promise, so a cold start
 * or a burst of CMS edits produces exactly one query.
 */
function refreshSnapshot(
  snapshot: SlugSnapshot,
  collection: SlugCollection,
): Promise<Set<string> | null> {
  if (!snapshot.inFlight) {
    snapshot.inFlight = loadSlugsInto(snapshot, collection).finally(() => {
      snapshot.inFlight = null;
    });
  }
  return snapshot.inFlight;
}

/**
 * Cheap freshness probe: does the cached snapshot still match the DB? Two
 * aggregate reads (no slug transfer): the published count and the newest
 * `updatedAt`. A rename that keeps the count stable changes `updatedAt`, so
 * both are needed. Any failure counts as "unchanged" (fail-open).
 */
async function snapshotStillValid(
  snapshot: SlugSnapshot,
  collection: SlugCollection,
): Promise<boolean> {
  try {
    const client = await payload();
    const [countResult, newestResult] = await Promise.all([
      client.find({
        collection: collection as 'pages',
        draft: false,
        depth: 0,
        limit: 0,
        pagination: false,
        where: { _status: { equals: 'published' } },
      }),
      client.find({
        collection: collection as 'pages',
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
    const newest = (newestResult.docs?.[0] as SlugDocument | undefined)?.updatedAt;
    const newestAt = typeof newest === 'string' ? Date.parse(newest) : -1;
    const same = count === snapshot.knownCountAt && newestAt === snapshot.knownNewestUpdatedAt;
    console.info('[proxy-cache-probe]', {
      collection,
      count,
      knownCountAt: snapshot.knownCountAt,
      newestAt,
      knownNewestUpdatedAt: snapshot.knownNewestUpdatedAt,
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
async function currentSnapshot(
  snapshot: SlugSnapshot,
  collection: SlugCollection,
  { probe = false }: { probe?: boolean } = {},
): Promise<Set<string> | null> {
  if (!snapshot.knownSlugs) return refreshSnapshot(snapshot, collection);

  const age = Date.now() - snapshot.loadedAt;
  if (age < refreshMs() && !probe) return snapshot.knownSlugs;

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
    if (!(await snapshotStillValid(snapshot, collection))) {
      const reloaded = await refreshSnapshot(snapshot, collection);
      if (reloaded) return reloaded;
    }
    return snapshot.knownSlugs;
  }

  // Snapshot older than its maximum lifetime: correctness of a 404 check is no
  // longer guaranteed, so fail open until a reload succeeds.
  return refreshSnapshot(snapshot, collection);
}

/** Remembers a decision per slug, bounded LRU (Map keeps insert order). */
function remember(snapshot: SlugSnapshot, slug: string, status: SlugStatus): void {
  if (snapshot.statusCache.has(slug)) snapshot.statusCache.delete(slug);
  const ttl =
    status === 'exists' ? maxAgeMs() : status === 'missing' ? missingTtlMs() : refreshMs();
  snapshot.statusCache.set(slug, { status, expiresAt: Date.now() + ttl });
  if (snapshot.statusCache.size > MAX_ENTRIES) {
    const oldest = snapshot.statusCache.keys().next();
    if (!oldest.done) snapshot.statusCache.delete(oldest.value);
  }
}

/**
 * Status of one slug against a (cached) published set.
 *
 * `'exists'` / `'missing'` are both remembered — negative caching is the point:
 * a crawler walking unknown paths must not produce a DB read per request.
 * `'unknown'` means the set could not be produced (fail-open: never 404 on it).
 */
async function snapshotStatus(
  snapshot: SlugSnapshot,
  collection: SlugCollection,
  slug: string,
): Promise<SlugStatus> {
  if (!cacheEnabled()) {
    const slugs = await loadSlugsInto(snapshot, collection);
    return slugs === null ? 'unknown' : slugs.has(slug) ? 'exists' : 'missing';
  }

  const cached = snapshot.statusCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    // Refresh LRU position without re-inserting.
    snapshot.statusCache.delete(slug);
    snapshot.statusCache.set(slug, cached);
    return cached.status;
  }
  if (cached) snapshot.statusCache.delete(slug);

  // A re-evaluated NEGATIVE answer must be checked against a snapshot that is
  // known to be current: inside the 5-minute refresh window the cached set
  // could still be missing a page that was published seconds ago. Without this
  // a new page stayed 404 forever (measured 05.11.2026 — the negative entry
  // expired, the stale snapshot re-confirmed it).
  const needsFreshProbe = cached?.status === 'missing' || cached?.status === 'unknown';
  const slugs = await currentSnapshot(snapshot, collection, { probe: needsFreshProbe });
  if (slugs === null) {
    remember(snapshot, slug, 'unknown');
    return 'unknown';
  }

  const status: SlugStatus = slugs.has(slug) ? 'exists' : 'missing';
  remember(snapshot, slug, status);
  return status;
}

/** Drops every cached slug + both snapshots (same-process callers, tests). */
export function invalidatePublishedSlugs(): void {
  for (const snapshot of [PAGE_SIGNATURE, PROJECT_SIGNATURE]) {
    snapshot.statusCache.clear();
    snapshot.knownSlugs = null;
    snapshot.knownCountAt = -1;
    snapshot.knownNewestUpdatedAt = -1;
    snapshot.loadedAt = 0;
    snapshot.inFlight = null;
  }
}

/** Snapshot of the loaded state — for diagnostics and tests. */
export function publishedSlugCacheStats(): {
  entries: number;
  slugCount: number;
  loadedAt: number;
  stale: boolean;
} {
  const snapshot = PAGE_SIGNATURE;
  return {
    entries: snapshot.statusCache.size,
    slugCount: snapshot.knownSlugs?.size ?? 0,
    loadedAt: snapshot.loadedAt,
    stale: snapshot.knownSlugs === null || Date.now() - snapshot.loadedAt > refreshMs(),
  };
}

/**
 * Published page slugs for the Proxy check. `null` = unknown (cache disabled, DB
 * down, nothing loaded yet) — callers must let the request through.
 */
export async function getPublishedSlugs(): Promise<Set<string> | null> {
  if (!cacheEnabled()) return loadSlugsInto(PAGE_SIGNATURE, 'pages');
  return currentSnapshot(PAGE_SIGNATURE, 'pages');
}

/** Status of one page slug against the (cached) published page set. */
export async function publishedSlugStatus(slug: string): Promise<SlugStatus | 'unknown'> {
  return snapshotStatus(PAGE_SIGNATURE, 'pages', slug);
}

/**
 * Status of one project detail slug (`/[locale]/projects/<slug>`)
 * against the (cached) published project set.
 *
 * Own snapshot, own fingerprint, same policy: 60 s negative TTL, single-flight,
 * fail-open — so a newly published project is reachable within 60 s and a DB
 * outage never 404s an existing one.
 */
export async function publishedProjectStatus(slug: string): Promise<SlugStatus | 'unknown'> {
  return snapshotStatus(PROJECT_SIGNATURE, 'projects', slug);
}
