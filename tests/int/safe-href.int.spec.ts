import { describe, expect, it } from 'vitest';

import { isSafeHref, safeHrefOrNull, validateHref } from '@/lib/safeHref';

/**
 * The invariant: a CMS-authored link may be a path, an in-page anchor, or an
 * http(s)/mailto/tel URL — never a script-capable scheme, never a
 * protocol-relative value, never anything with smuggled control characters.
 */
describe('isSafeHref', () => {
  it.each([
    '#architecture',
    '#architektur',
    '/de',
    '/de/projects',
    '/en/privacy',
    './relative',
    '../up',
    'https://mostheimer.de/de',
    'http://example.com/x?y=1#z',
    'mailto:mail@mostheimer.de',
    'tel:+4917663787951',
    'tel:+49 (176) 63 78 79 51',
  ])('accepts legitimate editorial link %s', (value) => {
    expect(isSafeHref(value)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\u0000script:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.example/x',
    'mailto:',
    'tel:call-me',
    'not a url',
    '',
    '   ',
    'www.example.com',
  ])('rejects dangerous or malformed value %j', (value) => {
    expect(isSafeHref(value)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isSafeHref(undefined)).toBe(false);
    expect(isSafeHref(null)).toBe(false);
    expect(isSafeHref(42)).toBe(false);
    expect(isSafeHref({ href: '/de' })).toBe(false);
  });

  it('rejects http(s) values that do not parse', () => {
    expect(isSafeHref('https://')).toBe(false);
  });
});

describe('safeHrefOrNull', () => {
  it('returns the value unchanged when safe', () => {
    expect(safeHrefOrNull('/de/projects')).toBe('/de/projects');
  });

  it('returns null for a script URL so renderers can drop the anchor', () => {
    expect(safeHrefOrNull('javascript:alert(1)')).toBeNull();
  });
});

describe('validateHref (Payload field validation)', () => {
  it('passes empty values so optional link fields keep working', () => {
    expect(validateHref('', {} as never)).toBe(true);
    expect(validateHref(undefined, {} as never)).toBe(true);
    expect(validateHref(null, {} as never)).toBe(true);
  });

  it('passes a safe link', () => {
    expect(validateHref('#architektur', {} as never)).toBe(true);
  });

  it('returns an explanatory message instead of true for a script URL', () => {
    const result = validateHref('javascript:alert(1)', {} as never);
    expect(typeof result).toBe('string');
    expect(result).toContain('http(s)');
  });
});
