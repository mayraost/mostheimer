import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('tests every production host (the purge API needs the exact host)', () => {
    const urls = toPurgeUrls(['/de']);
    expect(urls).toContain('https://mosthi.de/de');
    expect(urls).toContain('https://mostheimer.de/de');
    expect(urls).toContain('https://www.mostheimer.de/de');
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
    expect(urls).toContain('https://mosthi.de/de');
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
    expect(result.status).toBe('purged');

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://api.cloudflare.com/client/v4/zones/${'a'.repeat(32)}/purge_cache`);
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' });
    const body = JSON.parse(String(init.body)) as { files: string[] };
    expect(body.files).toContain('https://mosthi.de/de');
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
