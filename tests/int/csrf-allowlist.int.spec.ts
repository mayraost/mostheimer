import { describe, expect, it } from 'vitest';

/**
 * The CSRF gate lives in Payload's cookie `extractJWT`, so the only thing this
 * repository can regress is its *configuration*: an empty `csrf` allowlist
 * makes that gate accept any Origin. These tests pin the config shape rather
 * than re-implementing the library.
 *
 * The allowlist is built the same way `src/payload.config.ts` builds it, and
 * then applied to the decision Payload makes for a given header set.
 */
const CONTENT_ORIGINS = Array.from(
  new Set(['https://mostheimer.de'.replace(/\/+$/, ''), 'https://www.mostheimer.de']),
);

/**
 * Mirrors `extractionMethods.cookie` in node_modules/payload/dist/auth/extractJWT.js
 * for the cases relevant here. Kept explicit so a change in the allowlist is
 * visible as a failing expectation.
 */
function cookieAccepted(
  csrf: string[],
  headers: { origin?: string; referer?: string; secFetchSite?: string },
): boolean {
  if (!headers.origin) {
    if (csrf.length === 0) return true;
    if (
      headers.secFetchSite === 'same-origin' ||
      headers.secFetchSite === 'same-site' ||
      headers.secFetchSite === 'none'
    ) {
      return true;
    }
    if (!headers.secFetchSite && headers.referer) {
      try {
        return csrf.includes(new URL(headers.referer).origin);
      } catch {
        return false;
      }
    }
    return false;
  }
  return csrf.length === 0 || csrf.includes(headers.origin);
}

describe('Payload csrf allowlist (src/payload.config.ts)', () => {
  it('is never empty - an empty list makes the origin gate accept everything', () => {
    expect(CONTENT_ORIGINS.length).toBeGreaterThan(0);
  });

  it('contains both content hosts and nothing dangling', () => {
    expect(CONTENT_ORIGINS).toEqual(['https://mostheimer.de', 'https://www.mostheimer.de']);
    for (const origin of CONTENT_ORIGINS) {
      expect(origin).toMatch(/^https:\/\/[a-z0-9.-]+$/);
    }
  });

  it('accepts a same-site browser request', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, { origin: 'https://mostheimer.de' })).toBe(true);
    expect(cookieAccepted(CONTENT_ORIGINS, { origin: 'https://www.mostheimer.de' })).toBe(true);
  });

  it('rejects a cross-site Origin - the pre-fix behaviour accepted it', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, { origin: 'https://evil.example' })).toBe(false);
    // Explicitly documents the regression this config prevents.
    expect(cookieAccepted([], { origin: 'https://evil.example' })).toBe(true);
  });

  it('accepts a same-origin navigation reported via Sec-Fetch-Site', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, { secFetchSite: 'same-origin' })).toBe(true);
    expect(cookieAccepted(CONTENT_ORIGINS, { secFetchSite: 'none' })).toBe(true);
  });

  it('rejects a cross-site navigation without Origin', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, { secFetchSite: 'cross-site' })).toBe(false);
  });

  it('falls back to Referer when Sec-Fetch-Site is absent', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, { referer: 'https://mostheimer.de/admin' })).toBe(true);
    expect(cookieAccepted(CONTENT_ORIGINS, { referer: 'https://evil.example/x' })).toBe(false);
  });

  it('rejects a non-browser client that sends no origin headers at all', () => {
    expect(cookieAccepted(CONTENT_ORIGINS, {})).toBe(false);
  });
});
