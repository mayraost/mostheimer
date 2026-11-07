import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Release identity of the running build — the ONE source for `/api/health`,
 * `ReleaseGuard` and the Cloudflare deploy purge.
 *
 * The id MUST be a property of the *image*, never of the process. A
 * process-local value (build timestamp, restart-time env) makes an open tab
 * see a "new" release on every redeploy of an unchanged commit and reload in a
 * loop — measured on prod 07.11.2026: Coolify sets
 * `include_source_commit_in_build=false`, so `SOURCE_COMMIT` is empty at build
 * time and `next.config.ts` fell back to `build-${Date.now()}`.
 *
 * Order (first non-empty wins):
 *   1. `/app/.cf-release` — the Next BUILD_ID baked into the image by the
 *      Dockerfile. Identical for every container of the same image, so a
 *      restart (or a redeploy of the same build) never changes it.
 *   2. `.next/BUILD_ID` — same value when running from a local build tree.
 *   3. `NEXT_RELEASE_ID` — explicit operator override / CI commit.
 *   4. `'unknown'` — `/api/health` then reports `release: null`, which
 *      `ReleaseGuard` deliberately ignores instead of reloading.
 */

const RELEASE_FILE = process.env.CF_RELEASE_FILE || '/app/.cf-release';

function readTrimmed(path: string): string | null {
  try {
    const value = readFileSync(path, 'utf8').trim();
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

let cached: string | null | undefined;

/** Resolved once per process; cheap to call from route handlers. */
export function getReleaseId(): string | null {
  if (cached !== undefined) return cached;

  cached =
    readTrimmed(RELEASE_FILE) ??
    readTrimmed(join(process.cwd(), '.next', 'BUILD_ID')) ??
    (process.env.NEXT_RELEASE_ID?.trim() || null);

  return cached;
}

/** Test-only: drop the memoised value. */
export function resetReleaseIdCache(): void {
  cached = undefined;
}
