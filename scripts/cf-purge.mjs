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
 * PAGINATED / FILTERED ROUTES ARE PURGED BY PREFIX
 *
 * `?page=N` and `?tag=<slug>` variants of the vibe-coding listing are separate
 * edge objects with an open-ended URL space. They are NOT enumerated: the app
 * publishes its `PAGINATED_ROUTES` at `/api/purge-manifest`, and each route is
 * purged once per locale as a `prefixes` entry (`host+path`, no scheme/query/
 * fragment). One prefix evicts the bare URL and every variant below it.
 * `?page=N` / `?tag=` URLs are never warmed either (only the bare listing).
 * Both op kinds are batched at 100 per request; `files` and `prefixes` ride in
 * the same request.
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
 * CACHE WARMING AFTER A SUCCESSFUL PURGE
 *
 * A purge empties the edge; without warming the next visitors pay the origin
 * round-trip for every route and every new-build chunk. After a successful
 * purge the script warms:
 *   - every public route from the sitemap (`/de`, `/en`, every slug, plus
 *     `/sitemap.xml`, `/robots.txt`, `/llms.txt`); `/` is no-store and skipped,
 *   - every `/_next/static/**` asset referenced by those pages, including CSS
 *     `url(...)` fonts/media (assets are never purged, but a new build's chunks
 *     are cold).
 * Warming goes through the public host (the edge), not the local origin, so it
 * actually populates the cache. It waits until the public `/api/health` reports
 * the SAME release as the local container, otherwise it would re-cache the
 * previous release during the Traefik switch. Best-effort, bounded concurrency,
 * fail-soft. `--warm-only` re-warms without purging; `CF_WARM=0` or `--no-warm`
 * disables warming.
 *
 * MULTIPLE ZONES → ONE CONTENT ZONE
 *
 * Cloudflare purges are ZONE-scoped and there is no host-based purge. The site
 * is reachable under hosts of two separate zones (`mosthi.de` and
 * `mostheimer.de`), but only the `mostheimer.de` zone holds cached content:
 * `mosthi.de`/`www.mosthi.de` answer 301 to `https://mostheimer.de` (Traefik
 * redirect, see AGENTS.md § "Domain-Konsolidierung"), and redirect responses are
 * not stored as content objects. Purging that zone evicts nothing while spending
 * one of the five Free-plan purge requests per minute that CMS edits need.
 *
 * So the purge runs for the content zone ONLY, with the two hosts it serves.
 * The mapping is shared with src/cms/cache/frontend/cloudflare.ts — a URL is
 * never sent to a zone that does not own its host.
 *
 *   CLOUDFLARE_PURGE_ZONES
 *     Optional. Semicolon separated `zoneId:host1,host2` entries. When set it
 *     replaces CLOUDFLARE_ZONE_ID / NEXT_PUBLIC_SERVER_URL entirely.
 *   CLOUDFLARE_ZONE_ID
 *     Fallback zone id; default = the `mostheimer.de` content zone. Hosts stay
 *     the two content hosts (legacy redirect hosts are never purged).
 *
 * Token permission: Zone → Cache Purge → Purge for the content zone.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

// Single source of truth for the route model. Imported straight from the app:
// `routes.ts` has no imports of its own, so this stays a plain-Node script (no
// Next/Payload module graph) while the paginated-route list and the
// never-purge-assets rule cannot drift from src/cms/cache/frontend.
import { PAGINATED_ROUTES, isPurgeablePath } from '../src/cms/cache/frontend/routes.ts';

const API_BASE = 'https://api.cloudflare.com/client/v4';
const REQUEST_TIMEOUT_MS = 10_000;
/** How long the deploy purge waits for the new build to answer /api/health. */
const WAIT_TIMEOUT_MS = 180_000;
const WAIT_INTERVAL_MS = 2_000;
const RELEASE_FILE = process.env.CF_RELEASE_FILE || '/app/.cf-release';
/** The site's own host; the sitemap needs no auth and lists every live route. */
const SITE_ORIGIN = process.env.CF_SITE_ORIGIN || 'https://mostheimer.de';
/** Documented `mostheimer.de` zone id — the only zone that caches content. */
const DEFAULT_CONTENT_ZONE_ID = '97b8bfd76c5ddbe777f5f185631859bc';
/** Hosts that serve content (both in the `mostheimer.de` zone). */
const CONTENT_ORIGINS = ['https://mostheimer.de', 'https://www.mostheimer.de'];

/**
 * Warming (see header). Bounded so a deploy never turns into a request storm:
 * routes are warmed sequentially, assets with a small worker pool and a hard
 * cap. Every request is best-effort and fail-soft.
 */
const WARM_CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.CF_WARM_CONCURRENCY || '4', 10) || 4,
);
const WARM_MAX_ASSETS = Math.max(
  1,
  Number.parseInt(process.env.CF_WARM_MAX_ASSETS || '500', 10) || 500,
);
const WARM_SWITCH_TIMEOUT_MS = Math.max(
  5_000,
  Number.parseInt(process.env.CF_WARM_SWITCH_TIMEOUT_MS || '120000', 10) || 120_000,
);
const WARM_USER_AGENT = 'mostheimer-deploy-warmer/1.0 (+https://mostheimer.de)';
const WARM_ASSET_PREFIXES = ['/_next/static/', '/media/', '/api/media/file/'];
const WARM_ASSET_EXACT = new Set(['/favicon.ico', '/og']);
const WARM_ASSET_EXTENSION =
  /\.(?:css|js|mjs|woff2?|ttf|otf|eot|png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|pdf)$/i;

/** Parse `--flag [value]` pairs; unknown flags are ignored on purpose. */
function parseArgs(argv) {
  const args = {
    waitForRelease: false,
    release: '',
    dryRun: false,
    everything: false,
    noWarm: false,
    warmOnly: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--wait-for-release') args.waitForRelease = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--everything') args.everything = true;
    else if (arg === '--no-warm') args.noWarm = true;
    else if (arg === '--warm-only') args.warmOnly = true;
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
  // `/` and `/sitemap.xml` are part of every deploy purge; the two text
  // endpoints are edge-cached for 1 h and are not in the sitemap, so a deploy
  // must evict them explicitly (they only change with a build).
  const paths = new Set(['/', '/sitemap.xml', '/robots.txt', '/llms.txt']);
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
 * Site-relative routes whose page-1 HTML carries query-string variants
 * (`?page=N`, `?tag=<slug>`), served by the app at `/api/purge-manifest`.
 *
 * Read from the app instead of hardcoding the list in this script: the routes
 * are `PAGINATED_ROUTES` in src/cms/cache/frontend/routes.ts, and a second copy
 * here would silently drift when a paginated route is added. Fail-soft: no
 * manifest → no prefix purge (the exact sitemap URLs are still purged).
 */
async function fetchPaginatedRoutes(port) {
  const sources = [
    `http://127.0.0.1:${port}/api/purge-manifest`,
    `${SITE_ORIGIN}/api/purge-manifest`,
  ];
  for (const source of sources) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(source, {
          headers: { 'cache-control': 'no-cache' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.ok) {
          const body = await response.json();
          // The manifest is the primary source (it is per-image); the imported
          // constant is the fallback for a partially booted container.
          const routes = Array.isArray(body?.paginatedRoutes) ? body.paginatedRoutes : [];
          const clean = routes.filter(
            (route) =>
              typeof route === 'string' &&
              route.startsWith('/') &&
              !route.includes('?') &&
              isPurgeable(route),
          );
          // An empty or unusable list is not an answer: fall back instead of
          // purging zero prefixes.
          if (clean.length === 0) {
            warn('purge manifest returned no usable paginated route — using the built-in list');
            return [...PAGINATED_ROUTES];
          }
          return clean;
        }
      } catch {
        // Retry below; a missing manifest only costs the prefix purge.
      }
      await sleep(WAIT_INTERVAL_MS);
    }
  }
  // Fail-soft fallback: the constant the manifest serves, so a manifest hiccup
  // costs a log line, not the prefix purge.
  warn('purge manifest unavailable — using the built-in paginated route list');
  return [...PAGINATED_ROUTES];
}

/** Locale prefixes of this app; paginated routes exist once per locale. */
const LOCALE_PREFIXES = ['/de', '/en'];

/**
 * Site-relative prefix PATHS (`/de/vibe-coding`) for the paginated routes.
 *
 * The purge API wants `host+path` WITHOUT scheme/query/fragment and matches
 * "starts with", so one entry per locale route evicts the bare URL plus every
 * `?page=N` / `?tag=<slug>` variant. Static assets can never be produced here:
 * every entry comes from a route of the manifest plus a locale prefix.
 */
function paginatedRoutePaths(routes) {
  const paths = [];
  const seen = new Set();
  for (const route of routes ?? []) {
    for (const locale of LOCALE_PREFIXES) {
      // No trailing slash: a prefix purge matches "starts with", so
      // `/de/vibe-coding/` would miss the bare listing.
      const path = `${locale}${route}`.replace(/\/+$/, '');
      if (seen.has(path) || !isPurgeable(path)) continue;
      seen.add(path);
      paths.push(path);
    }
  }
  return paths;
}

/**
 * True for paths that must never be warmed: admin/API surface, Next internals
 * (except static), preview/settings, Cloudflare internals. `/api/media/file/`
 * is deliberately allowed (Payload's file endpoint is a public image asset).
 */
function isForbiddenAssetPath(pathname) {
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/_next') && !pathname.startsWith('/_next/static/')) return true;
  if (pathname.startsWith('/cdn-cgi') || pathname.startsWith('/mcp')) return true;
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/media/file/')) return true;
  if (/\/preview(?:\/|$)/.test(pathname) || /\/settings(?:\/|$)/.test(pathname)) return true;
  return false;
}

/** Static chunks, media uploads, favicon/OG renders and anything with an asset extension. */
function isWarmableAsset(pathname) {
  if (WARM_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (WARM_ASSET_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/icon') || pathname.startsWith('/apple-icon')) return true;
  return WARM_ASSET_EXTENSION.test(pathname);
}

/** Resolves a same-origin asset reference to a site-relative path + query. */
function toSiteAsset(value, baseUrl) {
  const raw = value.trim().replace(/&amp;/g, '&');
  if (!raw || raw.startsWith('#') || /^(?:data|mailto|tel|javascript):/i.test(raw)) return null;
  let url;
  try {
    url = new URL(raw, baseUrl);
  } catch {
    return null;
  }
  if (url.origin !== new URL(baseUrl).origin) return null;
  if (url.pathname === '/' || url.pathname.startsWith('//')) return null;
  if (isForbiddenAssetPath(url.pathname)) return null;
  if (!isWarmableAsset(url.pathname)) return null;
  return `${url.pathname}${url.search}`;
}

/** Assets referenced by a rendered page: src/href/poster, srcset, og/twitter images. */
function extractHtmlAssets(html, pageUrl) {
  const assets = new Set();
  for (const match of html.matchAll(/(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) {
    const asset = toSiteAsset(match[1], pageUrl);
    if (asset) assets.add(asset);
  }
  for (const match of html.matchAll(/(?:srcset|imagesrcset)\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      const [url] = candidate.trim().split(/\s+/);
      const asset = toSiteAsset(url, pageUrl);
      if (asset) assets.add(asset);
    }
  }
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const key = (tag.match(
      /(?:property|name)\s*=\s*["'](og:image(?::url|:secure_url)?|twitter:image(?::src)?)["']/i,
    ) ?? [])[1];
    if (!key) continue;
    const content = (tag.match(/content\s*=\s*["']([^"']+)["']/i) ?? [])[1];
    const asset = toSiteAsset(content ?? '', pageUrl);
    if (asset) assets.add(asset);
  }
  return [...assets];
}

/** Fonts/images referenced from CSS, resolved relative to the CSS file URL. */
function extractCssAssets(css, cssUrl) {
  const assets = new Set();
  for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
    const asset = toSiteAsset(match[2], cssUrl);
    if (asset) assets.add(asset);
  }
  return [...assets];
}

/** Public routes worth warming (no `/`, no admin/API/preview/settings, no trailing slash). */
function collectWarmPaths(paths) {
  const out = [];
  const seen = new Set();
  for (const raw of paths ?? []) {
    if (typeof raw !== 'string' || raw.length === 0) continue;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    if (path === '/' || path.startsWith('//') || path.includes('..')) continue;
    if (path.length > 1 && path.endsWith('/')) continue;
    // `?page=N` / `?tag=<slug>` are variants, never the canonical URL: warming
    // them would populate edge objects that no link and no sitemap points to.
    if (path.includes('?')) continue;
    if (isForbiddenAssetPath(path)) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    out.push(path);
  }
  return out;
}

/** `/api/health` release of an origin (local or public), or null. */
async function readRelease(origin) {
  try {
    const response = await fetch(`${origin}/api/health`, {
      headers: { 'user-agent': WARM_USER_AGENT, 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const body = await response.json().catch(() => null);
    return typeof body?.release === 'string' ? body.release : null;
  } catch {
    return null;
  }
}

/**
 * Waits until the PUBLIC host serves the same release as the local container.
 * Without this, warming during a Traefik switch could re-cache the previous
 * release instead of the new one.
 */
async function waitForPublicRelease(port) {
  const local = await readRelease(`http://127.0.0.1:${port}`);
  if (!local) return false;
  const deadline = Date.now() + WARM_SWITCH_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if ((await readRelease(SITE_ORIGIN)) === local) return true;
    await sleep(WAIT_INTERVAL_MS);
  }
  return false;
}

/**
 * Warms routes and their assets through the public edge. Fail-soft: every
 * request is independent, a failure only increments the counter.
 */
async function warmCache(paths, { origin = SITE_ORIGIN, concurrency = WARM_CONCURRENCY } = {}) {
  const routes = collectWarmPaths(paths);
  const base = origin.replace(/\/+$/, '');
  const assetQueue = [];
  const assetSeen = new Set();
  let failed = 0;

  const addAssets = (assets) => {
    for (const asset of assets) {
      if (assetQueue.length >= WARM_MAX_ASSETS) return;
      if (assetSeen.has(asset)) continue;
      assetSeen.add(asset);
      assetQueue.push(asset);
    }
  };

  const fetchOne = async (path, referer) => {
    const url = `${base}${path}`;
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': WARM_USER_AGENT,
          ...(referer ? { referer } : {}),
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const type = response.headers.get('content-type') ?? '';
      if (!response.ok) {
        failed += 1;
        warn(`warm ${path} → HTTP ${response.status}`);
        await response.arrayBuffer().catch(() => {});
        return;
      }
      if (type.includes('text/html')) {
        addAssets(extractHtmlAssets(await response.text(), url));
      } else if (type.includes('text/css')) {
        addAssets(extractCssAssets(await response.text(), url));
      } else {
        // Consume the body so the edge stores the complete object (fonts,
        // images, JS). Assets are small; the cap bounds memory.
        await response.arrayBuffer().catch(() => {});
      }
    } catch (error) {
      failed += 1;
      warn(`warm ${path} failed (${error instanceof Error ? error.message : 'unknown'})`);
    }
  };

  // Routes first: their HTML yields the asset list (chunks, fonts, images, OG).
  for (const route of routes) await fetchOne(route, base);

  // Assets: small worker pool; CSS responses can append fonts/images live.
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (index < assetQueue.length) {
        const asset = assetQueue[index];
        index += 1;
        await fetchOne(asset, base);
      }
    }),
  );

  return { routes: routes.length, assets: assetSeen.size, failed };
}

/**
 * Static assets are immutable and content-addressed; a purge must never touch
 * them (see header). This is THE rule from src/cms/cache/frontend/routes.ts,
 * imported instead of mirrored: a second copy drifted the moment the rule
 * learned about `/_next/static` without a trailing slash.
 */
const isPurgeable = isPurgeablePath;

/** Cloudflare accepts at most 100 URLs / prefixes per purge request. */
const MAX_OPS_PER_REQUEST = 100;

/** Splits a list into chunks of at most `size` (empty in → empty out). */
function chunk(list, size = MAX_OPS_PER_REQUEST) {
  const chunks = [];
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }
  return chunks;
}

/**
 * One purge request. `body` carries `files` and/or `prefixes` — both shapes
 * ride in the SAME request so a flush never costs two of the five Free-plan
 * requests per minute.
 */
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

/** All `host+path` prefixes of a zone (no scheme/query — the API's shape). */
function zonePrefixes(zone, routePaths) {
  return zone.origins.flatMap((origin) => {
    const host = new URL(origin).host;
    return (routePaths ?? []).filter(isPurgeable).map((path) => `${host}${path}`);
  });
}

/**
 * Content hosts for purges: `mostheimer.de` + `www.mostheimer.de`.
 *
 * The legacy `mosthi.de` hosts (`www.` included) only redirect, so they are
 * filtered out even when a stale `NEXT_PUBLIC_SERVER_URL` still lists them —
 * their zone holds no cached content to evict.
 */
function resolveOrigins(env = process.env) {
  const isLegacyRedirectHost = (value) => {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return host === 'mosthi.de' || host.endsWith('.mosthi.de');
    } catch {
      return false;
    }
  };
  const configured = (env.NEXT_PUBLIC_SERVER_URL || '')
    .split(';')
    .map((value) => value.trim().replace(/\/+$/, ''))
    .filter((value) => value.length > 0 && !isLegacyRedirectHost(value));
  return [...new Set([...CONTENT_ORIGINS, ...configured])];
}

/**
 * `[{ zoneId, origins }]` — the content zone (and only it) by default.
 *
 * Pure: takes the env it reads as a parameter so the policy is unit-testable
 * (`tests/int/cloudflare-purge.int.spec.ts`). Cloudflare purges are zone-scoped
 * and there is no host-based purge, so a URL must never be handed to a zone that
 * does not own its host: the API answers `success: true` and evicts nothing
 * while spending purge budget (see header).
 */
function resolveZones(env = process.env) {
  const explicit = (env.CLOUDFLARE_PURGE_ZONES || '').trim();
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
      entries.push({ zoneId, origins: origins.length > 0 ? origins : resolveOrigins(env) });
    }
    if (entries.length > 0) return entries;
  }

  const zoneId = (env.CLOUDFLARE_ZONE_ID || '').trim() || DEFAULT_CONTENT_ZONE_ID;
  return [{ zoneId, origins: resolveOrigins(env) }];
}

// Exported for the policy test (tests/int/cloudflare-purge.int.spec.ts).
export {
  CONTENT_ORIGINS,
  DEFAULT_CONTENT_ZONE_ID,
  MAX_OPS_PER_REQUEST,
  chunk,
  paginatedRoutePaths,
  resolveOrigins,
  resolveZones,
  zonePrefixes,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const port = process.env.PORT || '3000';
  const warmEnabled = !args.noWarm && process.env.CF_WARM !== '0';

  // Operator/verification path: no purge, no token, no marker. Used by the
  // weekly Coolify scheduled task and for manual re-warms.
  if (args.warmOnly) {
    if (!warmEnabled) {
      log('cache warming disabled (CF_WARM=0 / --no-warm)');
      return;
    }
    const paths = await fetchContentPaths(port);
    if (!paths || paths.length === 0) {
      warn('cache warming skipped: no route list from /sitemap.xml');
      return;
    }
    const result = await warmCache(paths);
    log(`warmed ${result.routes} routes + ${result.assets} assets (${result.failed} failed)`);
    return;
  }

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
    log(`dry run: release ${release}, would wait for health then purge content URLs and warm`);
    return;
  }

  if (args.waitForRelease) {
    const healthy = await waitForHealthy(port);
    if (!healthy) {
      warn(`origin not healthy within ${WAIT_TIMEOUT_MS / 1000}s — deploy purge skipped`);
      return;
    }
  }

  // Read the route list for both the purge and the warm step. The operator
  // `--everything` path does not need it for purging, but still uses it for
  // warming when available.
  const paths = (await fetchContentPaths(port))?.filter(isPurgeable) ?? null;
  if (!args.everything && (!paths || paths.length === 0)) {
    warn('could not read the content route list from /sitemap.xml — deploy purge skipped');
    return;
  }

  // Paginated/filtered routes (`?page=N`, `?tag=<slug>`) are evicted by PREFIX,
  // not URL by URL: their variant space is open-ended and every variant is a
  // separate edge object. The list of routes comes from the app
  // (`/api/purge-manifest`), so it cannot drift from PAGINATED_ROUTES.
  const paginatedRoutes = args.everything ? [] : await fetchPaginatedRoutes(port);
  const routePaths = paginatedRoutePaths(paginatedRoutes);
  if (!args.everything && routePaths.length > 0) {
    log(`paginated routes purged by prefix: ${routePaths.join(', ')}`);
  }

  // One request per zone and batch: a zone only evicts objects of hosts it
  // serves (see "MULTIPLE ZONES"), and both op kinds (`files`, `prefixes`) are
  // capped at 100 per request. Batches are sent sequentially to stay inside the
  // Free-plan bucket; `?page=N` / `?tag=` URLs are never warmed (below).
  let failed = 0;
  for (const zone of zones) {
    if (args.everything) {
      try {
        const status = await purge({
          token,
          zoneId: zone.zoneId,
          body: { purge_everything: true },
        });
        if (status < 200 || status >= 300) {
          failed += 1;
          warn(
            `purge failed for zone ${zone.zoneId.slice(0, 8)} (HTTP ${status}) — the edge keeps the previous release until the next successful purge`,
          );
          continue;
        }
        log(`purged EVERYTHING (manual) in zone ${zone.zoneId.slice(0, 8)} (release ${release})`);
      } catch (error) {
        failed += 1;
        const message =
          error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error';
        warn(`purge request failed for zone ${zone.zoneId.slice(0, 8)} (${message})`);
      }
      continue;
    }

    const files = zone.origins.flatMap((origin) => paths.map((path) => `${origin}${path}`));
    const prefixes = zonePrefixes(zone, routePaths);
    const requestCount = Math.max(chunk(files).length, chunk(prefixes).length);
    for (let index = 0; index < requestCount; index += 1) {
      const fileBatch = chunk(files)[index] ?? [];
      const prefixBatch = chunk(prefixes)[index] ?? [];
      const body = {};
      if (fileBatch.length > 0) body.files = fileBatch;
      if (prefixBatch.length > 0) body.prefixes = prefixBatch;
      const description =
        `${fileBatch.length} content URLs + ${prefixBatch.length} prefix(es) x ` +
        `${zone.origins.length} host(s), static assets excluded` +
        (requestCount > 1 ? ` [batch ${index + 1}/${requestCount}]` : '');
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
        const message =
          error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error';
        warn(
          `purge request failed for zone ${zone.zoneId.slice(0, 8)} (${message}) — the edge keeps the previous release until the next successful purge`,
        );
      }
    }
  }

  // Marker only when every zone succeeded, otherwise the next run retries.
  // Write it BEFORE warming: a crash while warming must not trigger a re-purge
  // on the next container start.
  if (!args.everything && failed === 0) writeFileSync(marker, new Date().toISOString());

  if (!warmEnabled) {
    log('cache warming disabled (CF_WARM=0 / --no-warm)');
    return;
  }
  if (failed > 0) {
    log('cache warming skipped: purge failed');
    return;
  }
  if (!paths || paths.length === 0) {
    log('cache warming skipped: no route list');
    return;
  }
  if (!(await waitForPublicRelease(port))) {
    warn('cache warming skipped: public host is not serving this release yet');
    return;
  }

  const result = await warmCache(paths);
  log(`warmed ${result.routes} routes + ${result.assets} assets (${result.failed} failed)`);
}

/**
 * True when this file is the process entry point. Guards the `main()` call so a
 * test can import the policy resolvers without running a purge or exiting.
 */
function isDirectRun() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
}

// Always exit 0: a purge problem must never block container start.
if (isDirectRun()) {
  main()
    .catch((error) => {
      warn(`unexpected error (${error instanceof Error ? error.message : 'unknown'})`);
    })
    .finally(() => process.exit(0));
}
