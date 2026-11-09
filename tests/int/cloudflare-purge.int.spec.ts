import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TAGS } from '@/cms/cache/frontend/constants';
import {
  purgeCloudflareCache,
  MAX_OPS_PER_REQUEST,
  resetCloudflareCircuitForTests,
  setCloudflareFetchForTests,
  toPurgePrefixes,
  toPurgeUrls,
} from '@/cms/cache/frontend/cloudflare';
import {
  edgePurgePathsForTag,
  pageWindowUrls,
  registerPageSlugs,
  registerProjectSlugs,
  registerProjectShowcasePageCount,
  revalidateProjectCache,
} from '@/cms/cache/frontend/revalidate';
import { runPendingCloudflarePurges } from '@/cms/cache/frontend/purges';
import {
  PAGINATED_ROUTES,
  isPaginatedRoute,
  paginatedRoutePaths,
} from '@/cms/cache/frontend/routes';

/**
 * Edge-purge contract: tag → routes mapping and the fail-soft behaviour of the
 * Cloudflare client. No network: fetch is replaced through the test seam.
 */

describe('edge purge routes', () => {
  beforeEach(() => {
    registerPageSlugs(['home', 'imprint', 'privacy']);
  });

  it('maps a page tag to both locales', () => {
    expect(edgePurgePathsForTag(CACHE_TAGS.pageByPath('privacy'))).toEqual([
      '/en/privacy',
      '/de/privacy',
    ]);
    // `home` is the bare locale route, not `/en/home`.
    expect(edgePurgePathsForTag(CACHE_TAGS.pageByPath('home'))).toEqual(['/en', '/de']);
  });

  it('flushes every known route for the page set and for layout-level globals', () => {
    const paths = edgePurgePathsForTag(CACHE_TAGS.pages);
    expect(paths).toContain('/de');
    expect(paths).toContain('/en/imprint');
    expect(paths).toEqual(
      edgePurgePathsForTag(
        CACHE_TAGS.pageByPath('site-settings').replace('cms:pages:', 'cms:global:'),
      ),
    );
  });

  it('maps the sitemap tag to /sitemap.xml', () => {
    expect(edgePurgePathsForTag(CACHE_TAGS.sitemap)).toEqual(['/sitemap.xml']);
  });

  it('keeps the home route in a page-set flush even without a registered slug list', () => {
    expect(edgePurgePathsForTag(CACHE_TAGS.pages, ['imprint'])).toEqual([
      '/en',
      '/de',
      // The listing is a `pages` document and part of every page-set flush —
      // even when the caller passes a slug list that predates it.
      '/en/projects',
      '/de/projects',
      '/en/imprint',
      '/de/imprint',
    ]);
  });

  it('tests the content hosts (the purge API needs the exact host)', () => {
    const saved = process.env.NEXT_PUBLIC_SERVER_URL;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    try {
      const urls = toPurgeUrls(['/de']);
      // Both hosts the site is actually served from — `www` included.
      expect(urls).toContain('https://mostheimer.de/de');
      expect(urls).toContain('https://www.mostheimer.de/de');
      // Legacy hosts only answer 301 to the canonical host: nothing to evict.
      expect(urls.some((url) => new URL(url).hostname.endsWith('mosthi.de'))).toBe(false);
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_SERVER_URL;
      else process.env.NEXT_PUBLIC_SERVER_URL = saved;
    }
  });
});

/**
 * INVARIANT: static assets are immutable and content-addressed, so they are
 * never purged — wasting the Free-plan budget and, worse, discarding the warm
 * CSS/JS the edge needs to keep an origin outage *styled*. These tests exist so
 * a future mapping cannot silently reintroduce asset purges.
 */
describe('static assets are never purged', () => {
  it('drops /_next/static paths from the URL list', () => {
    const urls = toPurgeUrls(['/de', '/_next/static/chunks/a.css', '/_next/static/chunks/b.js']);
    expect(urls.every((url) => !url.includes('/_next/static'))).toBe(true);
    expect(urls).toContain('https://mostheimer.de/de');
  });

  it('reports nothing-to-purge instead of calling the API for asset-only input', async () => {
    const env = process.env;
    process.env = {
      ...env,
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'a'.repeat(32),
    };
    const fetchSpy = vi.fn();
    setCloudflareFetchForTests(fetchSpy);
    try {
      await expect(
        purgeCloudflareCache({ type: 'urls', paths: ['/_next/static/chunks/a.css'] }),
      ).resolves.toEqual({ status: 'skipped', reason: 'nothing-to-purge' });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      process.env = env;
      setCloudflareFetchForTests(null);
    }
  });

  it('never maps a tag onto an asset path', () => {
    registerPageSlugs(['home', 'imprint']);
    for (const tag of [
      CACHE_TAGS.ALL,
      CACHE_TAGS.pages,
      CACHE_TAGS.sitemap,
      CACHE_TAGS.pageByPath('imprint'),
      CACHE_TAGS.siteSettings,
    ]) {
      for (const path of edgePurgePathsForTag(tag)) {
        expect(path.startsWith('/_next/static/')).toBe(false);
      }
    }
  });
});

describe('cloudflare purge client', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'a'.repeat(32),
    };
    delete process.env.CLOUDFLARE_PURGE_ZONES;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    resetCloudflareCircuitForTests();
  });

  afterEach(() => {
    process.env = env;
    setCloudflareFetchForTests(null);
    vi.restoreAllMocks();
  });

  it('is a no-op without credentials', async () => {
    delete process.env.CLOUDFLARE_API_TOKEN;
    const fetchSpy = vi.fn();
    setCloudflareFetchForTests(fetchSpy);
    await expect(purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).resolves.toEqual({
      status: 'skipped',
      reason: 'not-configured',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends one files purge for a URL target', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);
    const result = await purgeCloudflareCache({ type: 'urls', paths: ['/de'] });
    expect(result).toEqual({ status: 'purged', urls: 2, prefixes: 0, zones: 1 });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://api.cloudflare.com/client/v4/zones/${'a'.repeat(32)}/purge_cache`);
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' });
    const body = JSON.parse(String(init.body)) as { files: string[] };
    expect(body.files).toEqual(['https://mostheimer.de/de', 'https://www.mostheimer.de/de']);
  });

  /**
   * POLICY: only the `mostheimer.de` content zone is purged. Its two hosts are
   * both served (canonical + `www`) and both must be evicted; the legacy
   * `mosthi.de` hosts only redirect, so their zone is never contacted.
   */
  it('purges both content hosts and never the legacy redirect hosts by default', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    const result = await purgeCloudflareCache({ type: 'urls', paths: ['/de', '/en/imprint'] });
    expect(result).toEqual({ status: 'purged', urls: 4, prefixes: 0, zones: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/zones/${'a'.repeat(32)}/purge_cache`);
    const files = (JSON.parse(String(init.body)) as { files: string[] }).files;
    expect(files).toContain('https://mostheimer.de/de');
    expect(files).toContain('https://www.mostheimer.de/de');
    expect(files).toContain('https://mostheimer.de/en/imprint');
    expect(files).toContain('https://www.mostheimer.de/en/imprint');
    // No legacy host anywhere, and no static asset.
    for (const file of files) {
      expect(new URL(file).hostname.endsWith('mosthi.de')).toBe(false);
      expect(file.includes('/_next/static')).toBe(false);
    }
  });

  it('drops asset paths even when they are mixed into a content flush', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    await purgeCloudflareCache({
      type: 'urls',
      paths: ['/de', '/_next/static/chunks/a.js', '/_next/static/chunks/b.css'],
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const files = (JSON.parse(String(init.body)) as { files: string[] }).files;
    expect(files.every((file) => !file.includes('/_next/static'))).toBe(true);
    expect(files).toHaveLength(2);
  });

  /**
   * A configuration that still lists a foreign zone must not leak URLs into it:
   * the mapping stays zone → own hosts, and a legacy redirect host is never
   * purged (its zone holds no cached content).
   */
  it('splits one flush into one request per configured zone and never crosses hosts', async () => {
    const zoneMostheimer = '1'.repeat(32);
    const zoneMosthi = '2'.repeat(32);
    process.env.CLOUDFLARE_PURGE_ZONES =
      `${zoneMostheimer}:https://mostheimer.de,https://www.mostheimer.de;` +
      `${zoneMosthi}:https://mosthi.de`;
    delete process.env.CLOUDFLARE_ZONE_ID;

    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    const result = await purgeCloudflareCache({ type: 'urls', paths: ['/de'] });
    expect(result).toEqual({ status: 'purged', urls: 3, prefixes: 0, zones: 2 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const sent = fetchSpy.mock.calls.map(([url, init]) => ({
      url: String(url),
      files: (JSON.parse(String((init as RequestInit).body)) as { files: string[] }).files,
    }));

    const mostheimer = sent.find((call) => call.url.includes(zoneMostheimer));
    const mosthi = sent.find((call) => call.url.includes(zoneMosthi));
    expect(mostheimer?.files).toEqual(['https://mostheimer.de/de', 'https://www.mostheimer.de/de']);
    expect(mosthi?.files).toEqual(['https://mosthi.de/de']);

    // Neither zone receives a URL belonging to the other zone.
    for (const call of sent) {
      const ownsMosthiHost = !call.url.includes(zoneMostheimer);
      for (const file of call.files) {
        expect(file.includes('mostheimer.de')).toBe(!ownsMosthiHost);
      }
    }
  });

  it('treats a partial zone failure as a failure so the stale zone is visible', async () => {
    process.env.CLOUDFLARE_PURGE_ZONES = `${'1'.repeat(32)}:https://mostheimer.de;${'2'.repeat(32)}:https://www.mostheimer.de`;
    delete process.env.CLOUDFLARE_ZONE_ID;

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 403 }));
    setCloudflareFetchForTests(fetchSpy);

    const result = await purgeCloudflareCache({ type: 'urls', paths: ['/de'] });
    expect(result.status).toBe('failed');
    expect(result.status === 'failed' ? result.reason : '').toContain('403');
    // The failing zone opens the circuit — no hammering on every CMS save.
    expect(await purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).toEqual({
      status: 'skipped',
      reason: 'circuit-open',
    });
  });

  it('never throws on an API error and logs without the token', async () => {
    setCloudflareFetchForTests(vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { purgeCloudflareNow } = await import('@/cms/cache/frontend/cloudflare');

    await expect(purgeCloudflareNow({ type: 'urls', paths: ['/de'] }, 'test')).resolves.toEqual({
      status: 'failed',
      reason: 'rate limited (429)',
    });
    expect(warn).toHaveBeenCalled();
    expect(JSON.stringify(warn.mock.calls)).not.toContain('test-token');
  });

  it('opens the circuit after a failure instead of hammering the API', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('boom'));
    setCloudflareFetchForTests(fetchSpy);
    expect((await purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).status).toBe('failed');
    expect(await purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).toEqual({
      status: 'skipped',
      reason: 'circuit-open',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

/**
 * Deploy purge (`scripts/cf-purge.mjs`) — the process-external twin of the hook
 * purger. It reads the same `CLOUDFLARE_PURGE_ZONES` syntax, so the zone policy
 * is asserted here against the script's own exported resolver: content zone
 * only, both content hosts, legacy redirect hosts never.
 */
describe('deploy purge script (cf-purge.mjs)', () => {
  type Zones = { zoneId: string; origins: string[] }[];
  let resolveZones: (env: Record<string, string | undefined>) => Zones;
  let CONTENT_ORIGINS: string[];

  beforeAll(async () => {
    const purgeScript = (await import('../../scripts/cf-purge.mjs')) as unknown as {
      resolveZones: (env: Record<string, string | undefined>) => Zones;
      CONTENT_ORIGINS: string[];
    };
    resolveZones = purgeScript.resolveZones;
    CONTENT_ORIGINS = purgeScript.CONTENT_ORIGINS;
  });

  it('defaults to the single content zone with both content hosts', () => {
    const zones = resolveZones({});
    expect(zones).toHaveLength(1);
    expect(zones[0].zoneId).toBe('97b8bfd76c5ddbe777f5f185631859bc');
    expect(zones[0].origins).toEqual(['https://mostheimer.de', 'https://www.mostheimer.de']);
  });

  it('honours CLOUDFLARE_ZONE_ID but keeps the content hosts', () => {
    const zones = resolveZones({ CLOUDFLARE_ZONE_ID: 'c'.repeat(32) });
    expect(zones).toEqual([
      { zoneId: 'c'.repeat(32), origins: ['https://mostheimer.de', 'https://www.mostheimer.de'] },
    ]);
  });

  it('never includes a legacy redirect host, even from a stale SERVER_URL', () => {
    const zones = resolveZones({
      NEXT_PUBLIC_SERVER_URL: 'https://mosthi.de; https://www.mosthi.de; https://mostheimer.de',
    });
    expect(CONTENT_ORIGINS).toEqual(['https://mostheimer.de', 'https://www.mostheimer.de']);
    const allOrigins = zones.flatMap((zone) => zone.origins);
    expect(allOrigins.some((origin) => new URL(origin).hostname.endsWith('mosthi.de'))).toBe(false);
    expect(allOrigins).toContain('https://www.mostheimer.de');
  });

  it('parses an explicit single-zone mapping', () => {
    const zones = resolveZones({
      CLOUDFLARE_PURGE_ZONES:
        '97b8bfd76c5ddbe777f5f185631859bc:https://mostheimer.de,https://www.mostheimer.de',
    });
    expect(zones).toEqual([
      {
        zoneId: '97b8bfd76c5ddbe777f5f185631859bc',
        origins: ['https://mostheimer.de', 'https://www.mostheimer.de'],
      },
    ]);
  });
});

/**
 * PREFIX PURGE — paginated/filtered routes (`?page=N`, `?tag=<slug>`).
 *
 * A variant URL is a separate edge object and the purge API has neither a
 * wildcard URL nor a tag purge that works on this zone (measured 05.11.2026:
 * tag purge returns success and evicts nothing). A prefix entry (`host+path`,
 * no scheme/query/fragment) evicts the whole subtree in ONE op — so the listing
 * costs one entry instead of N URLs, and there is no page-count to enumerate.
 */
describe('prefix purge for paginated routes', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'a'.repeat(32),
    };
    delete process.env.CLOUDFLARE_PURGE_ZONES;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    resetCloudflareCircuitForTests();
  });

  afterEach(() => {
    process.env = env;
    setCloudflareFetchForTests(null);
    vi.restoreAllMocks();
  });

  it('declares the projects listing as the only paginated route', () => {
    expect(PAGINATED_ROUTES).toEqual(['/projects']);
    expect(isPaginatedRoute('/projects')).toBe(true);
    expect(isPaginatedRoute('projects')).toBe(true);
    expect(isPaginatedRoute('/projects/audit-scanner')).toBe(true);
    // No string-prefix false positive.
    expect(isPaginatedRoute('/projects-old')).toBe(false);
    expect(isPaginatedRoute('/career')).toBe(false);
  });

  it('sends host+path prefixes — no scheme, query or fragment', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    const result = await purgeCloudflareCache({ type: 'prefixes', paths: ['/de/projects'] });
    // One op per route and host — NOT one per `?page=N` variant.
    expect(result).toEqual({ status: 'purged', urls: 0, prefixes: 2, zones: 1 });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/zones/${'a'.repeat(32)}/purge_cache`);
    const body = JSON.parse(String(init.body)) as { files?: string[]; prefixes: string[] };
    expect(body.files).toBeUndefined();
    expect(body.prefixes).toEqual(['mostheimer.de/de/projects', 'www.mostheimer.de/de/projects']);
    for (const prefix of body.prefixes) {
      expect(prefix.startsWith('http')).toBe(false);
      expect(prefix).not.toContain('?');
      expect(prefix).not.toContain('#');
      expect(prefix.includes('/_next/static')).toBe(false);
    }
  });

  it('keeps both locale prefixes for a two-op listing flush', () => {
    const prefixes = toPurgePrefixes(['/de/projects', '/en/projects']);
    expect(prefixes).toHaveLength(4);
    expect(prefixes).toContain('mostheimer.de/de/projects');
    expect(prefixes).toContain('www.mostheimer.de/en/projects');
  });

  it('never derives a prefix from a static asset path', async () => {
    const fetchSpy = vi.fn();
    setCloudflareFetchForTests(fetchSpy);
    await expect(
      purgeCloudflareCache({ type: 'prefixes', paths: ['/_next/static/chunks'] }),
    ).resolves.toEqual({ status: 'skipped', reason: 'nothing-to-purge' });
    expect(fetchSpy).not.toHaveBeenCalled();

    // Mixed input: the asset prefix is dropped, the route prefix survives.
    expect(toPurgePrefixes(['/_next/static', '/de/projects'])).toEqual([
      'mostheimer.de/de/projects',
      'www.mostheimer.de/de/projects',
    ]);
  });

  it('batches at exactly 100 ops per request and keeps the remainder', async () => {
    expect(MAX_OPS_PER_REQUEST).toBe(100);
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    // 60 paths × 2 hosts = 120 files → 100 + 20 (two requests, no silent drop).
    const paths = Array.from({ length: 60 }, (_, index) => `/de/page-${index + 1}`);
    const result = await purgeCloudflareCache({ type: 'urls', paths });
    expect(result).toEqual({ status: 'purged', urls: 120, prefixes: 0, zones: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const sizes = fetchSpy.mock.calls.map(
      ([, init]) =>
        (JSON.parse(String((init as RequestInit).body)) as { files: string[] }).files.length,
    );
    expect(sizes).toEqual([100, 20]);
  });

  it('sends files and prefixes in the same request (one request per flush)', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    const result = await purgeCloudflareCache({
      type: 'mixed',
      paths: ['/de/projects/audit-scanner'],
      prefixes: ['/de/projects'],
    });
    expect(result).toEqual({ status: 'purged', urls: 2, prefixes: 2, zones: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.files).toHaveLength(2);
    expect(body.prefixes).toHaveLength(2);
  });

  it('still counts a partial batch failure as a failure and opens the circuit', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 500 }));
    setCloudflareFetchForTests(fetchSpy);
    const paths = Array.from({ length: 60 }, (_, index) => `/de/page-${index + 1}`);
    const result = await purgeCloudflareCache({ type: 'urls', paths });
    expect(result.status).toBe('failed');
    expect(await purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).toEqual({
      status: 'skipped',
      reason: 'circuit-open',
    });
  });

  it('retries a 429 once, then succeeds', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);
    await expect(purgeCloudflareCache({ type: 'urls', paths: ['/de'] })).resolves.toEqual({
      status: 'purged',
      urls: 2,
      prefixes: 0,
      zones: 1,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  }, 10_000);
});

/**
 * Tag → route mapping of the projects showcase. A project edit purges the
 * detail URLs AND the listing (a publish changes the listing); the listing
 * itself is purged by prefix, which the queue merges into ONE request.
 */
describe('projects purge mapping', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'a'.repeat(32),
    };
    delete process.env.CLOUDFLARE_PURGE_ZONES;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    resetCloudflareCircuitForTests();
    registerProjectSlugs(['audit-scanner', 'halloween-counter']);
    registerPageSlugs(['home', 'imprint']);
  });

  afterEach(() => {
    process.env = env;
    setCloudflareFetchForTests(null);
    vi.restoreAllMocks();
  });

  it('maps one project tag to exactly its two detail URLs', () => {
    expect(edgePurgePathsForTag(CACHE_TAGS.project('audit-scanner'))).toEqual([
      '/en/projects/audit-scanner',
      '/de/projects/audit-scanner',
    ]);
    // A blank slug must never fall back to every detail URL.
    expect(edgePurgePathsForTag(CACHE_TAGS.project(''))).toEqual([]);
  });

  it('maps the listing tags to page 1 of both locales', () => {
    expect(edgePurgePathsForTag(CACHE_TAGS.projectShowcase)).toEqual([
      '/en/projects',
      '/de/projects',
    ]);
    expect(edgePurgePathsForTag(CACHE_TAGS.projectTags)).toEqual(['/en/projects', '/de/projects']);
  });

  it('maps the project-set tag to every known detail plus the listing', () => {
    const paths = edgePurgePathsForTag(CACHE_TAGS.projects);
    expect(paths).toContain('/de/projects');
    expect(paths).toContain('/en/projects/audit-scanner');
    expect(paths).toContain('/de/projects/halloween-counter');
    expect(paths).not.toContain('/de/projects?page=2');
  });

  it('keeps the listing slug in the page-slug registry', () => {
    // The listing IS a `pages` document: its own tag maps to both locale routes
    // and a page-set / global flush always contains it. The registry entry is
    // module-level (`LISTING_SLUGS`), so it survives a bare `registerPageSlugs([])`
    // and the very first flush of a cold process already purges the listing.
    expect(edgePurgePathsForTag(CACHE_TAGS.pageByPath('projects'))).toEqual([
      '/en/projects',
      '/de/projects',
    ]);
    registerPageSlugs([]);
    expect(edgePurgePathsForTag(CACHE_TAGS.pages, ['home'])).toContain('/de/projects');
    expect(edgePurgePathsForTag(CACHE_TAGS.pages, ['home'])).toContain('/en/projects');
    // The eager entry is exactly one slug per locale, not a wildcard.
    expect(edgePurgePathsForTag(CACHE_TAGS.pages, ['home'])).toEqual([
      '/en',
      '/de',
      '/en/projects',
      '/de/projects',
    ]);
  });

  it('never maps a project tag onto an asset path', () => {
    for (const tag of [
      CACHE_TAGS.ALL,
      CACHE_TAGS.projects,
      CACHE_TAGS.projectShowcase,
      CACHE_TAGS.projectTags,
      CACHE_TAGS.project('audit-scanner'),
      CACHE_TAGS.pageByPath('projects'),
    ]) {
      for (const path of edgePurgePathsForTag(tag)) {
        expect(path.startsWith('/_next/static/')).toBe(false);
      }
    }
  });

  it('purges detail + listing in ONE request for a project edit', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    revalidateProjectCache('audit-scanner');
    const summary = await runPendingCloudflarePurges();

    expect(summary.status).toBe('purged');
    expect(summary.prefixes).toBeGreaterThan(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.files).toContain('https://mostheimer.de/de/projects/audit-scanner');
    expect(body.prefixes).toContain('mostheimer.de/de/projects');
  });

  it('builds the exact ?page=N window without ever emitting ?page=1', () => {
    expect(pageWindowUrls(1, 6)).toEqual(['/en/projects', '/de/projects']);
    expect(pageWindowUrls(13, 6)).toEqual([
      '/en/projects',
      '/en/projects?page=2',
      '/en/projects?page=3',
      '/de/projects',
      '/de/projects?page=2',
      '/de/projects?page=3',
    ]);
    expect(pageWindowUrls(13, 6).some((url) => url.includes('page=1'))).toBe(false);
    // Degenerate input degrades to the bare listing, never to an empty map.
    expect(pageWindowUrls(0, 6)).toEqual(['/en/projects', '/de/projects']);
    // The observed page count is a fallback for the prefix-less callers only:
    // it must never invent a page for an empty set.
    registerProjectShowcasePageCount('/en/projects', 4);
    expect(pageWindowUrls(1, 6)).toEqual(['/en/projects', '/de/projects']);
  });
});

/**
 * A project PUBLISH must evict BOTH its detail URLs and the listing subtree —
 * one publish shifts every project after it onto another page, so a detail-only
 * purge would leave `?page=2` serving the previous order.
 */
describe('projects publish purges detail AND listing', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      CLOUDFLARE_API_TOKEN: 'test-token',
      CLOUDFLARE_ZONE_ID: 'a'.repeat(32),
    };
    delete process.env.CLOUDFLARE_PURGE_ZONES;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    resetCloudflareCircuitForTests();
    registerProjectSlugs(['audit-scanner']);
    registerPageSlugs(['home', 'imprint']);
  });

  afterEach(() => {
    process.env = env;
    setCloudflareFetchForTests(null);
    vi.restoreAllMocks();
  });

  it('sends the detail files and the listing prefix in ONE api request', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    setCloudflareFetchForTests(fetchSpy);

    revalidateProjectCache('audit-scanner');
    const summary = await runPendingCloudflarePurges();

    expect(summary.status).toBe('purged');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body)) as {
      files: string[];
      prefixes: string[];
    };
    // The detail URLs are present …
    for (const locale of ['de', 'en']) {
      expect(body.files).toContain(`https://mostheimer.de/${locale}/projects/audit-scanner`);
      expect(body.files).toContain(`https://www.mostheimer.de/${locale}/projects/audit-scanner`);
    }
    // … next to the sitemap (a project changes it) — in the SAME request.
    expect(body.files).toContain('https://mostheimer.de/sitemap.xml');
    expect(body.prefixes).toHaveLength(4);
    for (const locale of ['de', 'en']) {
      expect(body.prefixes).toContain(`mostheimer.de/${locale}/projects`);
      expect(body.prefixes).toContain(`www.mostheimer.de/${locale}/projects`);
    }
    // The prefix covers `?page=N` / `?tag=`, so no variant URL is enumerated.
    expect(body.prefixes.every((prefix) => !prefix.includes('?page='))).toBe(true);
    expect(body.files.every((file) => !file.includes('?page='))).toBe(true);
  });

  it('purges nothing when the tag has no route mapping', () => {
    expect(edgePurgePathsForTag('cms:unknown')).toEqual([]);
  });

  it('keeps the detail route spelling identical to the renderer', () => {
    // `projectPath` normalizes the segment; a purge built from a raw admin
    // value must hit the SAME object the page renders.
    registerProjectSlugs(['Audit Scanner']);
    expect(edgePurgePathsForTag(CACHE_TAGS.project('Audit Scanner'))).toEqual([
      '/en/projects/audit-scanner',
      '/de/projects/audit-scanner',
    ]);
  });
});

/**
 * The deploy purge reads its route model from the app. These assertions pin the
 * SHARED constants (imported by `scripts/cf-purge.mjs` from
 * `src/cms/cache/frontend/routes.ts`), not a copy in the script.
 */
describe('deploy purge route model', () => {
  it('derives one path per locale from PAGINATED_ROUTES', () => {
    expect(paginatedRoutePaths()).toEqual(['/en/projects', '/de/projects']);
    expect(PAGINATED_ROUTES).toEqual(['/projects']);
  });

  it('never turns an asset path into a purge or a prefix', () => {
    for (const asset of ['/_next/static', '/_next/static/chunks/a.js']) {
      expect(toPurgeUrls([asset])).toEqual([]);
      expect(toPurgePrefixes([asset])).toEqual([]);
    }
  });
});
