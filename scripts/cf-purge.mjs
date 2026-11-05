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
 * MULTIPLE ZONES
 *
 * The content is served under several hosts and those hosts do NOT share one
 * Cloudflare zone: `mosthi.de` and `mostheimer.de` are separate zones. Purging
 * only one of them leaves the other serving pre-deploy HTML, which looks exactly
 * like "the purge silently failed". So the purge runs once per configured zone,
 * each with the hosts that zone actually serves.
 *
 *   CLOUDFLARE_PURGE_ZONES
 *     Optional. Semicolon separated `zoneId:host1,host2` entries. When set it
 *     replaces CLOUDFLARE_ZONE_ID / NEXT_PUBLIC_SERVER_URL entirely.
 *   CLOUDFLARE_ZONE_ID + NEXT_PUBLIC_SERVER_URL
 *     Fallback: one zone, hosts derived from NEXT_PUBLIC_SERVER_URL (the
 *     canonical origin list the app already needs). CF_SITE_ORIGIN is the last
 *     resort single host.
 *
 * Token permission: Zone → Cache Purge → Purge, for EVERY zone listed.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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

/**
 * Where the "already purged" marker lives.
 *
 * It MUST outlive the container: Coolify's restart *recreates* the container,
 * so its `/tmp` is empty again — a tmpdir marker made every restart purge, which
 * is the very bug this dedupe exists to prevent. `CF_STATE_DIR` points at a
 * small named volume (`cf-state`) mounted for exactly this purpose.
 *
 * Falls back to the tmpdir only when that directory is absent (local run), and
 * says so: a silent fallback would reintroduce the purge storm in production.
 */
function stateDir() {
  const configured = process.env.CF_STATE_DIR || '/app/.cf-state';
  try {
    if (statSync(configured).isDirectory()) return configured;
  } catch {
    // Not mounted (local run) — fall through.
  }
  if (process.env.CF_STATE_DIR) {
    warn(`CF_STATE_DIR '${configured}' is not a directory — marker falls back to the tmpdir`);
  }
  return tmpdir();
}

function markerPath(release) {
  const hash = createHash('sha256').update(release).digest('hex').slice(0, 16);
  return join(stateDir(), `.cf-purge-${hash}.done`);
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

/** Origins that actually serve the content (see "MULTIPLE ZONES" in the header). */
function resolveOrigins() {
  const configured = (process.env.NEXT_PUBLIC_SERVER_URL || '')
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = configured.length > 0 ? configured : [SITE_ORIGIN];
  return [...new Set(origins.map((value) => value.replace(/\/+$/, '')))];
}

/**
 * `[{ zoneId, origins }]` — one entry per Cloudflare zone.
 *
 * Cloudflare purges are zone-scoped and there is no host-based purge, so a host
 * in a different zone silently keeps its stale objects. That is exactly how
 * `mostheimer.de` served pre-deploy HTML while every purge reported success.
 */
function resolveZones() {
  const explicit = (process.env.CLOUDFLARE_PURGE_ZONES || '').trim();
  if (explicit) {
    const entries = [];
    for (const chunk of explicit
      .split(';')
      .map((value) => value.trim())
      .filter(Boolean)) {
      // Split on the FIRST colon only: the hosts that follow contain `https://`.
      const separator = chunk.indexOf(':');
      const zoneId = separator === -1 ? chunk : chunk.slice(0, separator);
      const hosts = separator === -1 ? '' : chunk.slice(separator + 1);
      if (!zoneId) continue;
      const origins = hosts
        .split(',')
        .map((value) => value.trim().replace(/\/+$/, ''))
        .filter(Boolean);
      entries.push({ zoneId, origins: origins.length > 0 ? origins : resolveOrigins() });
    }
    if (entries.length > 0) return entries;
  }

  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  if (!zoneId) return [];
  return [{ zoneId, origins: resolveOrigins() }];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const token = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zones = resolveZones();
  const release = resolveRelease(args);

  if (process.env.CLOUDFLARE_PURGE_ON_START === '0') {
    log('disabled via CLOUDFLARE_PURGE_ON_START=0');
    return;
  }
  if (!token || zones.length === 0) {
    log('no CLOUDFLARE_API_TOKEN / zone configuration — deploy purge skipped');
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
  let paths = null;
  if (args.everything) {
    // Nothing to collect: the body below flushes the whole zone.
  } else {
    paths = (await fetchContentPaths(process.env.PORT || '3000'))?.filter(isPurgeable) ?? null;
    if (!paths || paths.length === 0) {
      warn('could not read the content route list from /sitemap.xml — deploy purge skipped');
      return;
    }
  }

  // One request per zone: a zone only evicts objects of hosts it serves, and
  // the same URL exists in more than one zone here (see "MULTIPLE ZONES").
  let failed = 0;
  for (const zone of zones) {
    const body = args.everything
      ? { purge_everything: true }
      : { files: zone.origins.flatMap((origin) => paths.map((path) => `${origin}${path}`)) };
    const description = args.everything
      ? 'EVERYTHING (manual)'
      : `${paths.length} content URLs x ${zone.origins.length} host(s), static assets excluded`;
    try {
      const status = await purge({ token, zoneId: zone.zoneId, body });
      if (status < 200 || status >= 300) {
        failed += 1;
        warn(
          `purge failed for zone ${zone.zoneId.slice(0, 8)} (HTTP ${status}) — the edge keeps the previous release until the next successful purge`,
        );
        continue;
      }
      log(`purged ${description} in zone ${zone.zoneId.slice(0, 8)} (release ${release})`);
    } catch (error) {
      failed += 1;
      // Message only: the request object carries the token.
      const message = error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error';
      warn(
        `purge request failed for zone ${zone.zoneId.slice(0, 8)} (${message}) — the edge keeps the previous release until the next successful purge`,
      );
    }
  }

  // Marker only when every zone succeeded, otherwise the next run retries.
  if (!args.everything && failed === 0) writeFileSync(marker, new Date().toISOString());
}

// Always exit 0: a purge problem must never block container start.
main()
  .catch((error) => {
    warn(`unexpected error (${error instanceof Error ? error.message : 'unknown'})`);
  })
  .finally(() => process.exit(0));
