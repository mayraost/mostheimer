/**
 * purges.ts — Cloudflare purge queue for the request/tag flush path.
 *
 * Why a queue: a purge only removes objects that are ALREADY cached, so a purge
 * sent in the middle of request N can be overtaken by request N's own origin
 * response being cached after the purge ran. Flushes therefore enqueue; the
 * root layout awaits `runPendingCloudflarePurges()` before the first byte of a
 * render, so purges always happen at the START of a request and no in-flight
 * render can re-cache stale content behind them.
 *
 * Outside a request (CLI, seed, migrations, unit tests) nothing would drain the
 * queue until the next page render — acceptable, because after a seed exactly
 * that next visit is the request that triggers the purge.
 */

import { purgeCloudflareNow, toPurgeUrls, type CloudflarePurgeTarget } from './cloudflare';

type PendingPurge = { target: CloudflarePurgeTarget; label: string };

/**
 * The queue hangs off `globalThis`: route handlers, server actions and the RSC
 * render tree may be separate module instances, while the symbol is shared per
 * process. Enqueue (mutation request) and drain (render request) never overlap.
 */
const QUEUE_KEY = Symbol.for('mostheimer.cf-purge-queue');

type GlobalWithQueue = typeof globalThis & { [QUEUE_KEY]?: PendingPurge[] };

/**
 * Queues a purge for the start of the next render. Never throws: a purge
 * problem must never break a CMS save.
 */
export function enqueueCloudflarePurge(target: CloudflarePurgeTarget, label: string): void {
  try {
    const store = globalThis as GlobalWithQueue;
    const queue = store[QUEUE_KEY] ?? [];
    queue.push({ target, label });
    store[QUEUE_KEY] = queue;
  } catch (error) {
    console.warn(`[cf-cache] Purge '${label}' konnte nicht eingereiht werden.`, error);
  }
}

export type PurgeRunSummary = {
  pending: number;
  urls: number;
  status: 'idle' | 'purged' | 'failed' | 'skipped';
};

function drainQueue(): PendingPurge[] {
  const store = globalThis as GlobalWithQueue;
  const queue = store[QUEUE_KEY] ?? [];
  store[QUEUE_KEY] = [];
  return queue;
}

/**
 * Awaited by the root layout before it renders anything: runs every purge that
 * was enqueued since the previous render. Never throws.
 */
export async function runPendingCloudflarePurges(): Promise<PurgeRunSummary> {
  let purges: PendingPurge[];
  try {
    purges = drainQueue();
  } catch {
    return { pending: 0, urls: 0, status: 'idle' };
  }
  if (purges.length === 0) return { pending: 0, urls: 0, status: 'idle' };

  const labels = purges.map((purge) => purge.label).join(', ');
  // Merge every queued flush into ONE URL purge — the Free-plan bucket allows
  // 5 requests/min, so a cascade of hooks must not fan out. Static assets are
  // filtered in `toPurgeUrls` (never purged, see routes.ts).
  const paths = new Set<string>();
  for (const purge of purges) {
    for (const path of purge.target.paths) paths.add(path);
  }

  const result = await purgeCloudflareNow({ type: 'urls', paths: [...paths] }, labels);
  return {
    pending: purges.length,
    urls: toPurgeUrls([...paths]).length,
    status: result.status === 'failed' ? 'failed' : result.status,
  };
}
