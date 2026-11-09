import { describe, expect, it } from 'vitest';
import { PAGINATED_ROUTES, pathnameToSlug } from '@/cms/cache/frontend/routes';

/**
 * Proxy route model for the static child routes (`preview`, `settings`,
 * `impressum`) and the vibe-coding detail route.
 *
 * `proxy.ts` itself imports `next/server` and `server-only` helpers, so the
 * STATUS decision is exercised end-to-end in the e2e suite; what is pinned here
 * is the pure mapping it builds on (`pathnameToSlug`), because every branch of
 * `handleLocalizedRequest` is a decision over that value:
 *
 * - `''`            → locale root, always 200;
 * - `null`          → not a page path (trailing slash, file, other locale);
 * - `'vibe-coding'` → the listing, a `pages` slug;
 * - `'vibe-coding/<x>'` → a project detail (own snapshot, 404 when unpublished);
 * - `'vibe-coding/<x>/<y>'` → not a route at all, always 404;
 * - `'impressum'`   → the static route renders;
 * - `'impressum/<x>'` → no route exists, 404 (never a page slug).
 */
describe('pathnameToSlug feeds every proxy branch', () => {
  it('maps the locale root and page slugs', () => {
    expect(pathnameToSlug('de', '/de')).toBe('');
    expect(pathnameToSlug('de', '/de/vibe-coding')).toBe('vibe-coding');
    expect(pathnameToSlug('en', '/en/impressum')).toBe('impressum');
  });

  it('separates the listing, a detail and a too-deep path', () => {
    const listing = pathnameToSlug('de', '/de/vibe-coding');
    const detail = pathnameToSlug('de', '/de/vibe-coding/audit-scanner');
    const tooDeep = pathnameToSlug('de', '/de/vibe-coding/audit-scanner/extra');
    expect(listing).toBe('vibe-coding');
    expect(detail?.split('/')).toHaveLength(2);
    expect(tooDeep?.split('/')).toHaveLength(3);
  });

  it('exposes the static child routes as a one-segment child', () => {
    for (const route of ['preview', 'settings', 'impressum']) {
      expect(pathnameToSlug('de', `/de/${route}`)).toBe(route);
      expect(pathnameToSlug('de', `/de/${route}/x`)?.split('/')).toEqual([route, 'x']);
    }
  });

  it('never treats an asset request or a trailing slash as a slug', () => {
    // `_next` was once parsed as a locale slug and hit the DB enum (AGENTS.md).
    expect(pathnameToSlug('de', '/_next/static/chunks/a.js')).toBeNull();
    expect(pathnameToSlug('de', '/de/vibe-coding/')).toBeNull();
    expect(pathnameToSlug('de', '/en/vibe-coding')).toBeNull();
  });

  it('keeps the paginated route list in sync with the listing slug', () => {
    expect(PAGINATED_ROUTES).toContain('/vibe-coding');
    expect(pathnameToSlug('de', '/de/vibe-coding')).toBe(PAGINATED_ROUTES[0]?.slice(1));
  });
});
