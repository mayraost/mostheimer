/**
 * Cloudflare edge-cache purge after a deploy.
 *
 * Why: two different Next.js builds emit IDENTICAL static chunk filenames
 * (`/_next/static/chunks/0fkvblgiahdcs.js`) which are served
 * `public, max-age=31536000, immutable` and cached at the edge. A deploy changes
 * what those URLs return, so without a flush the edge keeps serving the previous
 * release's JS next to the new HTML ("works in CI, broken for visitors").
 * CMS edits purge their own routes through the hooks; a new release changes
 * every route, so it purges everything exactly once.
 *
 * Invocation: `scripts/entrypoint.sh` starts `node server.js` and then runs this
 * script in the background. Plain Node on purpose — the standalone runner image
 * has Node, no curl.
 *
 * Idempotency per release:
 *   - The Dockerfile bakes the build info into `/app/.cf-release` (build time =
 *     per image). A restart of the same image therefore sees the same release
 *     id and skips → no purge storm from crash loops or Coolify restarts.
 *   - A successful purge writes `/tmp/.cf-purge-<release>.done`; a restart of
 *     the same release skips immediately even if the release id was passed in
 *     via the environment.
 *   - `--wait-for-release` waits for the new build to answer `/api/health`, so
 *     the purge never runs before the new origin is actually serving (otherwise
 *     the edge would re-cache the old origin).
 *
 * Fail-soft: missing credentials, the kill switch, network errors, non-2xx —
 * each logs one concise warning and exits 0. The app never fails to start
 * because of a purge. The token is never logged.
 *
 * Token permission: Zone → Cache Purge → Purge, scoped to the mosthi.de zone.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const API_BASE = 'https://api.cloudflare.com/client/v4';
const REQUEST_TIMEOUT_MS = 10_000;
/** How long the deploy purge waits for the new build to answer /api/health. */
const WAIT_TIMEOUT_MS = 180_000;
const WAIT_INTERVAL_MS = 2_000;
const RELEASE_FILE = process.env.CF_RELEASE_FILE || '/app/.cf-release';

/** Parse `--flag [value]` pairs; unknown flags are ignored on purpose. */
function parseArgs(argv) {
  const args = { waitForRelease: false, release: '', dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--wait-for-release') args.waitForRelease = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--release') args.release = argv[index + 1] ?? '';
  }
  return args;
}

const log = (message) => console.log(`[cf-purge] ${message}`);
const warn = (message) => console.warn(`[cf-purge] ${message}`);

/** Release identity: explicit flag, env (Coolify SOURCE_COMMIT), or image info. */
function resolveRelease(args) {
  if (args.release) return args.release;
  for (const key of ['RELEASE_ID', 'SOURCE_COMMIT', 'COOLIFY_COMMIT']) {
    const value = process.env[key];
    if (value) return value;
  }
  try {
    const baked = readFileSync(RELEASE_FILE, 'utf8').trim();
    if (baked) return `${baked}${process.env.IMAGE_TAG ? `-${process.env.IMAGE_TAG}` : ''}`;
  } catch {
    // No build info baked in (local run) — fall through.
  }
  return '';
}

function markerPath(release) {
  const hash = createHash('sha256').update(release).digest('hex').slice(0, 16);
  return join(tmpdir(), `.cf-purge-${hash}.done`);
}

/** Resolves true once the locally served app answers 200 on /api/health. */
async function waitForHealthy(port) {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  const url = `http://127.0.0.1:${port}/api/health`;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
      if (response.ok) return true;
    } catch {
      // Still booting (connection refused) — retry.
    }
    await sleep(WAIT_INTERVAL_MS);
  }
  return false;
}

async function purgeEverything({ token, zoneId }) {
  const response = await fetch(`${API_BASE}/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purge_everything: true }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return response.status;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const token = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const release = resolveRelease(args);

  if (process.env.CLOUDFLARE_PURGE_ON_START === '0') {
    log('disabled via CLOUDFLARE_PURGE_ON_START=0');
    return;
  }
  if (!token || !zoneId) {
    log('no CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID configured — deploy purge skipped');
    return;
  }
  if (!release) {
    warn(
      'no release id (flag/RELEASE_ID/baked build info) — skipping to avoid one purge per restart',
    );
    return;
  }

  const marker = markerPath(release);
  if (existsSync(marker)) {
    log(`release ${release} already purged — skipping`);
    return;
  }
  if (args.dryRun) {
    log(`dry run: release ${release}, would wait for health then purge everything`);
    return;
  }

  if (args.waitForRelease) {
    const healthy = await waitForHealthy(process.env.PORT || '3000');
    if (!healthy) {
      warn(`origin not healthy within ${WAIT_TIMEOUT_MS / 1000}s — deploy purge skipped`);
      return;
    }
  }

  try {
    const status = await purgeEverything({ token, zoneId });
    if (status < 200 || status >= 300) {
      warn(
        `purge failed (HTTP ${status}) — the edge keeps the previous release until the next successful purge`,
      );
      return;
    }
    writeFileSync(marker, new Date().toISOString());
    log(`purged everything (release ${release})`);
  } catch (error) {
    // Message only: the request object carries the token.
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error';
    warn(
      `purge request failed (${message}) — the edge keeps the previous release until the next successful purge`,
    );
  }
}

// Always exit 0: a purge problem must never block container start.
main()
  .catch((error) => {
    warn(`unexpected error (${error instanceof Error ? error.message : 'unknown'})`);
  })
  .finally(() => process.exit(0));
