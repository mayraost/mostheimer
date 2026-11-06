import { describe, expect, it } from 'vitest';
import { keyFactAction, phoneToTelHref, profileToHref } from '@/lib/contactActions';

/**
 * Contact action derivation: the displayed CMS string is the single source of
 * truth, so these functions decide every `tel:`/`https:` href on the contact
 * page. No DOM, no network.
 */

describe('phoneToTelHref', () => {
  it('derives an RFC 3966 target from the contact-page display text', () => {
    expect(phoneToTelHref('(+49) 176 63 78 79 51')).toBe('tel:+4917663787951');
  });

  it('keeps a national number without inventing a country code', () => {
    expect(phoneToTelHref('0176 63 78 79 51')).toBe('tel:017663787951');
    expect(phoneToTelHref('0176/63787951')).toBe('tel:017663787951');
  });

  it('turns a 00-prefix into the international +', () => {
    expect(phoneToTelHref('0049 176 63787951')).toBe('tel:+4917663787951');
  });

  it('drops dotted and hyphenated formatting', () => {
    expect(phoneToTelHref('+49 176.637.879.51')).toBe('tel:+4917663787951');
    expect(phoneToTelHref('+49-176-63787951')).toBe('tel:+4917663787951');
  });

  it('never emits a second plus sign', () => {
    expect(phoneToTelHref('+49 (176) 63 78 79 51')).toBe('tel:+4917663787951');
    expect(phoneToTelHref('4+9')).toBeNull();
    expect(phoneToTelHref('+4+9')).toBeNull();
  });

  it('rejects values that are not phone numbers', () => {
    for (const value of [
      '',
      '   ',
      'Mayra Ostheimer',
      'mail@example.com',
      'github.com/mayraost',
      '12345',
      '+49 176 ext 12',
      'tel:+4917663787951',
      '2024 – 2026',
    ]) {
      expect(phoneToTelHref(value), value).toBeNull();
    }
  });
});

describe('profileToHref', () => {
  it('adds https to a bare host', () => {
    expect(profileToHref('github.com/mayraost')).toBe('https://github.com/mayraost');
    expect(profileToHref('linkedin.com/in/mayra-ostheimer')).toBe(
      'https://linkedin.com/in/mayra-ostheimer',
    );
  });

  it('keeps an explicit scheme', () => {
    expect(profileToHref('https://github.com/mayraost')).toBe('https://github.com/mayraost');
  });

  it('rejects addresses, sentences and non-http schemes', () => {
    for (const value of [
      'mail@example.com',
      'Mayra Ostheimer',
      'localhost',
      'not a url',
      'javascript:alert(1)',
      'ftp://files.example.com',
      'tel:+4917663787951',
    ]) {
      expect(profileToHref(value), value).toBeNull();
    }
  });
});

describe('keyFactAction', () => {
  const kind = (value: string) => keyFactAction(value)?.kind ?? null;

  it('routes each contact-page key fact to its own action', () => {
    expect(kind('(+49) 176 63 78 79 51')).toBe('call');
    expect(kind('mail@mostheimer.de')).toBe('copy');
    expect(kind('github.com/mayraost')).toBe('external');
    expect(kind('linkedin.com/in/mayra-ostheimer')).toBe('external');
  });

  it('labels the brand profiles and falls back to the hostname otherwise', () => {
    expect(keyFactAction('github.com/mayraost')).toMatchObject({ labelKey: 'githubLabel' });
    expect(keyFactAction('www.linkedin.com/in/me')).toMatchObject({ labelKey: 'linkedinLabel' });
    expect(keyFactAction('codeberg.org/me')).toMatchObject({
      labelKey: null,
      host: 'codeberg.org',
    });
  });

  it('still recognizes an explicit tel: value and an already-schemed profile', () => {
    expect(keyFactAction('tel:+4917663787951')).toMatchObject({
      kind: 'call',
      href: 'tel:+4917663787951',
    });
    expect(keyFactAction('https://github.com/mayraost')).toMatchObject({
      kind: 'external',
      href: 'https://github.com/mayraost',
    });
  });

  it('leaves plain facts without an action', () => {
    for (const value of ['München, DE', 'Remote-first', 'TypeScript 6', '']) {
      expect(keyFactAction(value), value).toBeNull();
    }
  });
});
