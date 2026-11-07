import { describe, expect, it } from 'vitest';
import { isActiveNavLink } from '@/components/navLinkState';
import { ICON_CATALOG, ICON_NAMES, isKnownIcon } from '@/components/blocks/Icon';

/**
 * Navigation + icon contracts (no DB, no browser).
 *
 * Both were observed broken on the live site:
 * - the mobile drawer gave no indication which page was open (no
 *   `aria-current`, no visual state), and
 * - CMS icons outside `ICON_CATALOG` rendered as an empty ring instead of not
 *   rendering at all.
 */
describe('isActiveNavLink', () => {
  it('marks the page itself', () => {
    expect(isActiveNavLink('/de/leadership', '/de/leadership')).toBe(true);
    expect(isActiveNavLink('/en/leadership', '/en/leadership')).toBe(true);
  });

  it('keeps the section highlighted on nested routes', () => {
    expect(isActiveNavLink('/de/leadership', '/de/leadership/2025')).toBe(true);
  });

  it('treats the locale root as exact-only', () => {
    expect(isActiveNavLink('/de', '/de')).toBe(true);
    // The home link must not claim every sub-page.
    expect(isActiveNavLink('/de', '/de/leadership')).toBe(false);
  });

  it('does not mark a sibling or a prefix-lookalike', () => {
    expect(isActiveNavLink('/de/tech-stack', '/de/engineering')).toBe(false);
    // `/de/tech` must not match `/de/tech-stack`.
    expect(isActiveNavLink('/de/tech', '/de/tech-stack')).toBe(false);
  });

  it('ignores trailing slashes and query strings', () => {
    expect(isActiveNavLink('/de/leadership/', '/de/leadership')).toBe(true);
    expect(isActiveNavLink('/de/leadership?x=1', '/de/leadership')).toBe(true);
    expect(isActiveNavLink('/de/leadership#team', '/de/leadership')).toBe(true);
  });

  it('never marks in-page anchors or external targets', () => {
    expect(isActiveNavLink('#architektur', '/de')).toBe(false);
    expect(isActiveNavLink('https://example.com/de', '/de')).toBe(false);
    expect(isActiveNavLink('mailto:mail@mostheimer.de', '/de')).toBe(false);
  });

  it('is inert without a pathname', () => {
    expect(isActiveNavLink('/de/leadership', null)).toBe(false);
  });
});

describe('icon catalog contract', () => {
  it('resolves every name the CMS select offers', () => {
    for (const name of ICON_NAMES) {
      expect(isKnownIcon(name), `catalog name ${name} must resolve`).toBe(true);
      expect(ICON_CATALOG[name].length).toBeGreaterThan(0);
    }
  });

  it('resolves the bento pillar icons that are live in the CMS', () => {
    // Zap/Users/Bot/Heart/Layers — Users, Bot and Heart were missing once and
    // rendered as empty circles.
    for (const name of ['Zap', 'Bot', 'Users', 'Layers', 'Heart']) {
      expect(isKnownIcon(name), `${name} must resolve`).toBe(true);
    }
  });

  it('reports unknown names as missing instead of rendering a placeholder', () => {
    expect(isKnownIcon('DefinitelyNotAnIcon')).toBe(false);
    expect(isKnownIcon('')).toBe(false);
    expect(isKnownIcon(null)).toBe(false);
    expect(isKnownIcon(undefined)).toBe(false);
  });
});
