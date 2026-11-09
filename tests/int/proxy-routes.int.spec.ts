import { describe, expect, it } from 'vitest';
import { PAGINATED_ROUTES, pathnameToSlug } from '@/cms/cache/frontend/routes';

/**
 * Proxy route model for the static child routes (`preview`, `settings`,
 * `impressum`) and the projects detail route.
 *
 * `proxy.ts` itself imports `next/server` and `server-only` helpers, so the
 * STATUS decision is exercised end-to-end in the e2e suite; what is pinned here
 * is the pure mapping it builds on (`pathnameToSlug`), because every branch of
 * `handleLocalizedRequest` is a decision over that value:
 *
 * - `''`            → locale root, always 200;
 * - `null`          → not a page path (trailing slash, file, other locale);
 * - `'projects'` → the listing, a `pages` slug;
 * - `'projects/<x>'` → a project detail (own snapshot, 404 when unpublished);
 * - `'projects/<x>/<y>'` → not a route at all, always 404;
 * - `'impressum'`   → the static route renders;
 * - `'impressum/<x>'` → no route exists, 404 (never a page slug).
 */
describe('pathnameToSlug feeds every proxy branch', () => {
  it('maps the locale root and page slugs', () => {
    expect(pathnameToSlug('de', '/de')).toBe('');
    expect(pathnameToSlug('de', '/de/projects')).toBe('projects');
    expect(pathnameToSlug('en', '/en/impressum')).toBe('impressum');
  });

  it('separates the listing, a detail and a too-deep path', () => {
    const listing = pathnameToSlug('de', '/de/projects');
    const detail = pathnameToSlug('de', '/de/projects/audit-scanner');
    const tooDeep = pathnameToSlug('de', '/de/projects/audit-scanner/extra');
    expect(listing).toBe('projects');
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
    expect(pathnameToSlug('de', '/de/projects/')).toBeNull();
    expect(pathnameToSlug('de', '/en/projects')).toBeNull();
  });

  it('keeps the paginated route list in sync with the listing slug', () => {
    expect(PAGINATED_ROUTES).toContain('/projects');
    expect(pathnameToSlug('de', '/de/projects')).toBe(PAGINATED_ROUTES[0]?.slice(1));
  });

  it('knows only the current listing route, never the retired one', () => {
    // Decision 09.11.2026: the retired slug is intentionally unsupported — no
    // redirect, no registry entry. It must map to a plain unknown slug so the
    // Proxy answers 404 like for any other non-existent page.
    expect(PAGINATED_ROUTES).toEqual(['/projects']);
    expect(PAGINATED_ROUTES.join(',')).not.toMatch(/vibe/);
  });
});
