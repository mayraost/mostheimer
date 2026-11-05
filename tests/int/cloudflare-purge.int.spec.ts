import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TAGS } from '@/cms/cache/frontend/constants';
import {
  purgeCloudflareCache,
  resetCloudflareCircuitForTests,
  setCloudflareFetchForTests,
  toPurgeUrls,
} from '@/cms/cache/frontend/cloudflare';
import { edgePurgePathsForTag, registerPageSlugs } from '@/cms/cache/frontend/revalidate';

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
    expect(result).toEqual({ status: 'purged', urls: 2, zones: 1 });

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
    expect(result).toEqual({ status: 'purged', urls: 4, zones: 1 });
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
    expect(result).toEqual({ status: 'purged', urls: 3, zones: 2 });
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
