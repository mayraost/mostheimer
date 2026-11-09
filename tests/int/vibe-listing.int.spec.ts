import { describe, expect, it } from 'vitest';
import {
  buildListingHref,
  isPaginatedRoute,
  normalizePageNumber,
  normalizeTagSlug,
  PAGINATED_ROUTES,
  pageWindow,
  paginatedRoutePaths,
  paginatedRoutePrefixes,
  resolvePageRequest,
  vibeListingPath,
  vibeProjectPath,
} from '@/cms/cache/frontend/routes';
import {
  chunkOps,
  MAX_OPS_PER_REQUEST,
  planPurgeRequests,
  toPurgePrefixes,
} from '@/cms/cache/frontend/cloudflare';

/**
 * Contract of the vibe-coding LISTING/PURGE layer — pure, no network, no DB,
 * no React.
 *
 * This file is the cache/purge side of the pagination + tag-filter design
 * (design doc §6 / §10). The render parsers (`parsePageRequest`,
 * `parseTagParam`) and the URL builder now live HERE, in the client-safe
 * `cms/cache/frontend/routes.ts`, so render, cache key and edge purge cannot
 * drift apart — a second copy in a component module was the earlier design and
 * a second copy in a test is what this file replaced.
 *
 * Every assertion below is a promise another layer relies on:
 * - a variant URL (`?page=N`, `?tag=`) is a SEPARATE edge object → prefix purge;
 * - `?page=1` is never advertised (a duplicate of the listing);
 * - `/_next/static` can never become a purge op, neither as a `files` entry nor
 *   as a `prefixes` entry (prefixes are the widest possible violation);
 * - Cloudflare caps a request at 100 ops → batches must be exact, never silent
 *   truncation.
 */

describe('listing route model', () => {
  it('declares exactly one paginated route and matches it by segment', () => {
    expect(PAGINATED_ROUTES).toEqual(['/vibe-coding']);
    expect(isPaginatedRoute('/vibe-coding')).toBe(true);
    expect(isPaginatedRoute('vibe-coding')).toBe(true);
    expect(isPaginatedRoute('/vibe-coding/audit-scanner')).toBe(true);
    // Never a string prefix: a neighbouring route stays untouched.
    expect(isPaginatedRoute('/vibe-coding-old')).toBe(false);
    expect(isPaginatedRoute('/career')).toBe(false);
  });

  it('builds one path per route and locale (no query, no asset)', () => {
    const paths = paginatedRoutePaths();
    expect(paths).toEqual(['/en/vibe-coding', '/de/vibe-coding']);
    for (const path of paths) {
      expect(path.startsWith('/')).toBe(true);
      expect(path).not.toContain('?');
      expect(path).not.toContain('#');
      expect(path.includes('_next')).toBe(false);
    }
  });

  it('builds host+path prefixes per host and locale — never scheme/query/fragment', () => {
    const prefixes = paginatedRoutePrefixes(['https://mostheimer.de', 'https://www.mostheimer.de']);
    expect(prefixes).toEqual([
      'mostheimer.de/en/vibe-coding',
      'mostheimer.de/de/vibe-coding',
      'www.mostheimer.de/en/vibe-coding',
      'www.mostheimer.de/de/vibe-coding',
    ]);
    // ONE op per route × locale × host — not one per `?page=N` variant.
    expect(prefixes).toHaveLength(4);
    for (const prefix of prefixes) {
      expect(prefix).not.toContain('://');
      expect(prefix).not.toContain('?');
      expect(prefix).not.toContain('#');
      expect(prefix.endsWith('/')).toBe(false);
    }
    expect(paginatedRoutePrefixes(['not a url'])).toEqual([]);
  });

  it('builds the listing and detail paths from one normalizer', () => {
    expect(vibeListingPath('de')).toBe('/de/vibe-coding');
    expect(vibeProjectPath('de', 'Audit Scanner')).toBe('/de/vibe-coding/audit-scanner');
    expect(vibeProjectPath('en', '/audit-scanner/')).toBe('/en/vibe-coding/audit-scanner');
    expect(vibeProjectPath('de', 'Umlaut Ärger')).toBe('/de/vibe-coding/umlaut-arger');
  });
});

describe('parsePageRequest degrades safely', () => {
  it('treats an absent param as page 1 and canonical', () => {
    expect(normalizePageNumber(undefined)).toBeNull();
    expect(resolvePageRequest(undefined, 3)).toEqual({ page: 1, isCanonical: true });
  });

  it('accepts real page numbers (string and array form)', () => {
    expect(resolvePageRequest('2', 3)).toEqual({ page: 2, isCanonical: true });
    expect(resolvePageRequest(['3'], 3)).toEqual({ page: 3, isCanonical: true });
    // `?page=1` names page 1 (canonical); the chrome never LINKS to it.
    expect(resolvePageRequest('1', 3)).toEqual({ page: 1, isCanonical: true });
  });

  it('degrades invalid input to page 1 without claiming canonical', () => {
    for (const raw of ['0', 'abc', '-2', '1.5', '', ' 2', '2a', '2.0', '+2', '1e3']) {
      expect(normalizePageNumber(raw)).toBeNull();
      expect(resolvePageRequest(raw, 3)).toEqual({ page: 1, isCanonical: false });
    }
    // A leading zero is a digit run but not the canonical spelling.
    expect(normalizePageNumber('01')).toBe(1);
  });

  it('clamps an over-long page but keeps it non-canonical', () => {
    expect(resolvePageRequest('99', 3)).toEqual({ page: 3, isCanonical: false });
    // A single-page set still answers page 1 for `?page=1`.
    expect(resolvePageRequest('1', 1)).toEqual({ page: 1, isCanonical: true });
  });
});

describe('parseTagParam degrades safely', () => {
  it('accepts a well-formed slug, normalised to lowercase', () => {
    expect(normalizeTagSlug('developer-tooling')).toBe('developer-tooling');
    expect(normalizeTagSlug(' Home-Automation ')).toBe('home-automation');
    expect(normalizeTagSlug(['ai-assisted'])).toBe('ai-assisted');
  });

  it('returns null (= unfiltered) for unknown or malformed input', () => {
    for (const raw of [
      undefined,
      null,
      '',
      'home_automation',
      '../etc',
      '<script>',
      'a--b',
      '-leading',
      'trailing-',
      'a b',
      42,
    ]) {
      expect(normalizeTagSlug(raw)).toBeNull();
    }
  });
});

describe('buildListingHref never emits ?page=1', () => {
  const base = '/de/vibe-coding';

  it('page 1 is the bare listing URL', () => {
    expect(buildListingHref({ basePath: base })).toBe(base);
    expect(buildListingHref({ basePath: base, page: 1 })).toBe(base);
    expect(buildListingHref({ basePath: base, tag: null, page: 1 })).toBe(base);
    expect(buildListingHref({ basePath: base, page: 0 })).toBe(base);
    expect(buildListingHref({ basePath: base, page: Number.NaN })).toBe(base);
  });

  it('keeps the tag across pages; tag first, then page', () => {
    expect(buildListingHref({ basePath: base, tag: 'ai-assisted' })).toBe(
      `${base}?tag=ai-assisted`,
    );
    expect(buildListingHref({ basePath: base, tag: 'ai-assisted', page: 3 })).toBe(
      `${base}?tag=ai-assisted&page=3`,
    );
    expect(buildListingHref({ basePath: base, page: 2 })).toBe(`${base}?page=2`);
  });

  it('drops a malformed tag instead of emitting an unusable filter URL', () => {
    expect(buildListingHref({ basePath: base, tag: 'a b' })).toBe(base);
    expect(buildListingHref({ basePath: `${base}/`, page: 2 })).toBe(`${base}?page=2`);
  });
});

describe('pageWindow edge cases', () => {
  it('clamps to the valid range', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 3)).toEqual([1, 2]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(3, 3)).toEqual([2, 3]);
  });

  it('survives out-of-range and degenerate input', () => {
    expect(pageWindow(99, 3)).toEqual([2, 3]);
    expect(pageWindow(0, 3)).toEqual([1, 2]);
    expect(pageWindow(-5, 0)).toEqual([1]);
    expect(pageWindow(Number.NaN, 2)).toEqual([1, 2]);
    expect(pageWindow(Number.NaN, Number.NaN)).toEqual([1]);
    expect(pageWindow(2, 5, 2)).toEqual([1, 2, 3, 4]);
  });
});

describe('purge batching', () => {
  it('splits at exactly 100 ops and keeps the remainder', () => {
    expect(MAX_OPS_PER_REQUEST).toBe(100);
    expect(chunkOps(Array.from({ length: 120 }, (_, index) => index))).toHaveLength(2);
    const [first, second] = chunkOps(Array.from({ length: 120 }, (_, index) => index));
    expect(first).toHaveLength(100);
    expect(second).toHaveLength(20);
    expect(chunkOps([])).toEqual([]);
    expect(chunkOps(['a'], 0)).toEqual([['a']]);
  });

  it('plans one body per 100 files and rides prefixes in the trailing request', () => {
    const files = Array.from({ length: 60 }, (_, index) => `/de/page-${index + 1}`);
    const prefixes = ['mostheimer.de/de/vibe-coding', 'www.mostheimer.de/de/vibe-coding'];
    // 60 paths × 2 hosts = 120 files, 2 prefixes.
    const plan = planPurgeRequests(
      files.flatMap((path) => [`https://mostheimer.de${path}`, `https://www.mostheimer.de${path}`]),
      prefixes,
    );
    // 2 requests, not 3: the prefix op shares the trailing files request.
    expect(plan).toHaveLength(2);
    expect(plan[0]?.prefixes).toEqual(prefixes);
    expect(plan[0]?.files).toHaveLength(100);
    expect(plan[1]?.files).toHaveLength(20);
    expect(plan[1]?.prefixes).toBeUndefined();
  });

  it('never yields an empty request body', () => {
    expect(planPurgeRequests([], [])).toEqual([]);
    expect(planPurgeRequests([], ['mostheimer.de/de/vibe-coding'])).toEqual([
      { prefixes: ['mostheimer.de/de/vibe-coding'] },
    ]);
  });
});

/**
 * INVARIANT: static assets are immutable and content-addressed by build. They
 * are never purged — neither as an exact URL nor as a prefix (which would evict
 * the whole chunk subtree). These cases exist so a future mapping cannot
 * silently reintroduce asset purges through the prefix path.
 */
describe('asset paths are never prefixable', () => {
  it('drops every spelling of a static asset prefix', () => {
    for (const asset of [
      '/_next/static',
      '/_next/static/',
      '/_next/static/chunks',
      '/_next/static/chunks/a.js',
      '/_Next/Static/chunks',
    ]) {
      expect(toPurgePrefixes([asset])).toEqual([]);
    }
  });

  it('keeps the route prefix when mixed with an asset prefix', () => {
    expect(toPurgePrefixes(['/_next/static', '/de/vibe-coding'])).toEqual([
      'mostheimer.de/de/vibe-coding',
      'www.mostheimer.de/de/vibe-coding',
    ]);
  });

  it('strips a query and a trailing slash from a prefix candidate', () => {
    expect(toPurgePrefixes(['/de/vibe-coding/?page=2'])).toEqual([
      'mostheimer.de/de/vibe-coding',
      'www.mostheimer.de/de/vibe-coding',
    ]);
    // An absolute URL is not a prefix path: the scheme makes it invalid, and the
    // host in a prefix always comes from the zone, never from the input.
    expect(toPurgePrefixes(['https://mostheimer.de/de/vibe-coding'])).toEqual([]);
  });
});
