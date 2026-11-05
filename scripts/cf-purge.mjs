/**
 * Cloudflare edge-cache purge after a deploy.
 *
 * WHAT IS PURGED (and what never is)
 *
 * A deploy changes every rendered route, so all public content URLs are purged
 * once per release: the locale roots, one URL per page slug and locale, and
 * `/sitemap.xml` — derived from the live `/sitemap.xml` so the list cannot drift
 * from the CMS.
 *
 * `/_next/static/**` is NEVER purged. Those objects are immutable
 * (`public, max-age=31536000`) and content-addressed by build; a CMS edit or a
 * deploy cannot change what an existing chunk URL returns. Purging them would
 * waste the Free-plan purge budget (5 requests/min) and, worse, would throw
 * away the warm CSS/JS the edge needs to keep serving a *styled* page while the
 * single origin container restarts. An unstyled page during an outage is the
 * exact failure this script must not cause.
 *
 * Escape hatch: if a deploy ever ships different bytes under an unchanged chunk
 * filename (the documented `immutable` hazard), the only remedy is a full flush
 * — run `cf-purge.mjs --everything` by hand during the incident. It is
 * deliberately not the default and not reachable from the entrypoint.
 *
 * WHY NOT `purge_everything` BY DEFAULT
 *
 * It also drops every static asset (see above). Measured alternative — purge by
 * cache tag — is not usable here: a Cache Response Rule can set `Cache-Tag`,
 * but purging by that tag leaves the object `HIT` with a growing `Age`, i.e. it
 * is a silent no-op. So the default is an explicit URL list.
 *
 * IDEMPOTENCY PER RELEASE
 *
 *   - The Dockerfile bakes the build id into `/app/.cf-release` at build time,
 *     so it is identical for every container started from the same image. It is
 *     the PRIMARY release identity.
 *   - `RELEASE_ID` / `--release` is an explicit operator override only.
 *   - `SOURCE_COMMIT` / `COOLIFY_COMMIT` are a LOCAL-RUN fallback only. They
 *     must never outrank the baked id: Coolify sets `SOURCE_COMMIT` on a
 *     *restart* to the restart's synthetic commit, which made every plain
 *     restart re-purge everything. On the Free plan (5 purges/min) a crash loop
 *     would exhaust the bucket and CMS edits would stop purging.
 *   - A successful purge writes `/tmp/.cf-purge-<hash>.done`, so even a
 *     restart that somehow resolves a different id still skips.
 *   - `--wait-for-release` waits for the new build to answer `/api/health`, so
 *     the purge never runs before the new origin serves (otherwise the edge
 *     would immediately re-cache the old origin).
 *
 * Fail-soft: missing credentials, kill switch, no release, network errors,
 * non-2xx — each logs one concise warning and exits 0. The app never fails to
 * start because of a purge. The token is never logged.
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
/** The site's own host; the sitemap needs no auth and lists every live route. */
const SITE_ORIGIN = process.env.CF_SITE_ORIGIN || 'https://mosthi.de';

/** Parse `--flag [value]` pairs; unknown flags are ignored on purpose. */
function parseArgs(argv) {
  const args = { waitForRelease: false, release: '', dryRun: false, everything: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--wait-for-release') args.waitForRelease = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--everything') args.everything = true;
    else if (arg === '--release') args.release = argv[index + 1] ?? '';
  }
  return args;
}

const log = (message) => console.log(`[cf-purge] ${message}`);
const warn = (message) => console.warn(`[cf-purge] ${message}`);

/**
 * Release identity. Order is the whole point (see header): explicit override,
 * then the image-baked id, and only then the environment.
 */
function resolveRelease(args) {
  if (args.release) return args.release;
  if (process.env.RELEASE_ID) return process.env.RELEASE_ID;
  try {
    const baked = readFileSync(RELEASE_FILE, 'utf8').trim();
    if (baked) return baked;
  } catch {
    // No build info baked in (local run) — fall through to the env vars.
  }
  // Local-run fallback only. Never trusted inside the container: Coolify rewrites
  // SOURCE_COMMIT on a restart to the restart's synthetic commit.
  for (const key of ['SOURCE_COMMIT', 'COOLIFY_COMMIT']) {
    const value = process.env[key];
    if (value) return value;
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

/** Parses a sitemap document into site-relative paths. */
function parseSitemap(xml) {
  const paths = new Set(['/', '/sitemap.xml']);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      paths.add(new URL(match[1].trim()).pathname);
    } catch {
      // Ignore malformed entries rather than aborting the whole purge.
    }
  }
  return [...paths];
}

/**
 * Site-relative paths from the live sitemap.
 *
 * Read from the LOCAL origin first: at purge time the public hostname still
 * points at the previous release and goes through the edge, and the sitemap is
 * itself a dynamic route that may not have rendered yet right after boot. A
 * single noisy fetch must never skip the whole deploy purge, so this retries and
 * only then falls back to the public URL.
 */
async function fetchContentPaths(port) {
  const sources = [`http://127.0.0.1:${port}/sitemap.xml`, `${SITE_ORIGIN}/sitemap.xml`];
  for (const source of sources) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const response = await fetch(source, {
          headers: { 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.ok) {
          const xml = await response.text();
          if (xml.includes('<loc>')) return parseSitemap(xml);
        }
      } catch {
        // Retry below; a transient boot-time failure must not skip the purge.
      }
      await sleep(WAIT_INTERVAL_MS);
    }
  }
  return null;
}

/**
 * Static assets are immutable and content-addressed; a purge must never touch
 * them (see header). Mirrors `isPurgeablePath` in src/cms/cache/frontend/routes.ts.
 */
function isPurgeable(path) {
  return !path.startsWith('/_next/static/');
}

async function purge({ token, zoneId, body }) {
  const response = await fetch(`${API_BASE}/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  if (existsSync(marker) && !args.everything) {
    log(`release ${release} already purged — skipping`);
    return;
  }
  if (args.dryRun) {
    log(`dry run: release ${release}, would wait for health then purge content URLs`);
    return;
  }

  if (args.waitForRelease) {
    const healthy = await waitForHealthy(process.env.PORT || '3000');
    if (!healthy) {
      warn(`origin not healthy within ${WAIT_TIMEOUT_MS / 1000}s — deploy purge skipped`);
      return;
    }
  }

  // Operator escape hatch only (see header); never the default path.
  let body;
  let description;
  if (args.everything) {
    body = { purge_everything: true };
    description = 'EVERYTHING (manual)';
  } else {
    const paths = (await fetchContentPaths(process.env.PORT || '3000'))?.filter(isPurgeable);
    if (!paths || paths.length === 0) {
      warn('could not read the content route list from /sitemap.xml — deploy purge skipped');
      return;
    }
    body = { files: paths.map((path) => `${SITE_ORIGIN}${path}`) };
    description = `${paths.length} content URLs (static assets excluded)`;
  }

  try {
    const status = await purge({ token, zoneId, body });
    if (status < 200 || status >= 300) {
      warn(
        `purge failed (HTTP ${status}) — the edge keeps the previous release until the next successful purge`,
      );
      return;
    }
    if (!args.everything) writeFileSync(marker, new Date().toISOString());
    log(`purged ${description} (release ${release})`);
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
