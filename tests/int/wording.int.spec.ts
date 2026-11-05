import { describe, expect, it } from 'vitest';
import {
  BANNED_WORDING_PATTERNS,
  REQUIRED_WORDING,
  findWordingViolations,
  hasRequiredWording,
} from '@/cms/aeo/constraints';
import { LLMS_TXT } from '@/cms/aeo/llmsTxt';
import { PERSON } from '@/components/StructuredData';
import { wordingBeforeValidate } from '@/cms/wording/beforeValidateWordingCheck';

/**
 * Wording guardrail contract:
 * - the matcher itself (exemptions included — the consent storage key and the
 *   live domains must never be flagged),
 * - the hook's rejection behaviour,
 * - the code-side identity strings that ship without passing through Payload.
 *
 * No DB, no network, no Payload bootstrap.
 */

/** Flattens every string leaf of a JSON-LD-ish value. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectStrings(entry, out);
  }
  return out;
}

describe('findWordingViolations', () => {
  it('flags hierarchy overreach as standalone words, case-insensitively', () => {
    expect(findWordingViolations('Staff-Level Engineer')).toEqual(['Staff']);
    // The hit is returned verbatim, so editors see the text they typed.
    expect(findWordingViolations('staff engineer')).toEqual(['staff']);
    expect(findWordingViolations('Principal Engineer')).toEqual(['Principal']);
    expect(findWordingViolations('PRINCIPAL')).toEqual(['PRINCIPAL']);
  });

  it('flags the retired brand as a visible label', () => {
    expect(findWordingViolations('Mostheimer')).toEqual(['Mostheimer']);
    expect(findWordingViolations('© mostheimer · Alle Rechte')).toEqual(['mostheimer']);
    expect(findWordingViolations('mostheimer — Startseite')).toEqual(['mostheimer']);
  });

  it('exempts identifiers, hosts and the mailbox (no false positives)', () => {
    // Consent persistence: renaming this key without a migration would silently
    // drop stored decisions for returning visitors.
    expect(findWordingViolations('mosthi.consent.v1')).toEqual([]);
    expect(findWordingViolations('mosthi:consent:open')).toEqual([]);
    // Live infrastructure, not a label.
    expect(findWordingViolations('https://mosthi.de')).toEqual([]);
    expect(findWordingViolations('https://mostheimer.de/de')).toEqual([]);
    expect(findWordingViolations('https://www.mostheimer.de')).toEqual([]);
    expect(findWordingViolations('mail@mostheimer.de')).toEqual([]);
  });

  it('leaves clean senior copy alone and deduplicates hits', () => {
    const clean = 'Mayra Ostheimer — Senior Fullstack Developer für resiliente Architekturen.';
    expect(findWordingViolations(clean)).toEqual([]);
    expect(findWordingViolations('Staff und Staff und STAFF')).toEqual(['Staff', 'STAFF']);
    expect(findWordingViolations('')).toEqual([]);
  });
});

describe('required wording', () => {
  it('requires the Senior positioning', () => {
    expect(REQUIRED_WORDING).toContain('Senior');
    expect(hasRequiredWording('Senior Fullstack Developer')).toBe(true);
    expect(hasRequiredWording('Senior Fullstack Developer')).toBe(
      hasRequiredWording('senior fullstack developer'),
    );
    expect(hasRequiredWording('Fullstack Developer')).toBe(false);
    expect(hasRequiredWording('')).toBe(false);
  });

  it('keeps every banned pattern global + case-insensitive', () => {
    for (const { id, pattern } of BANNED_WORDING_PATTERNS) {
      expect(pattern.flags, id).toContain('g');
      expect(pattern.flags, id).toContain('i');
    }
  });
});

describe('wordingBeforeValidate hook', () => {
  it('rejects nested banned copy with a bilingual message', () => {
    const data = {
      title: 'Über mich',
      layout: [
        {
          blockType: 'techSection',
          body: { root: { children: [{ text: 'Als Staff Engineer bei valantic.' }] } },
        },
      ],
    };
    expect(() => wordingBeforeValidate({ data, operation: 'create' })).toThrowError(
      /Wortlaut nicht erlaubt: Staff.*Senior.*Disallowed wording/s,
    );
  });

  it('accepts clean data and skips autosave', () => {
    const data = {
      title: 'Mayra Ostheimer',
      description: 'Senior Fullstack Developer für resiliente Architekturen.',
    };
    expect(() => wordingBeforeValidate({ data, operation: 'update' })).not.toThrow();
    expect(() =>
      wordingBeforeValidate({ data: { title: 'Staff Engineer' }, operation: 'autosave' }),
    ).not.toThrow();
    expect(() => wordingBeforeValidate({ data: undefined, operation: 'update' })).not.toThrow();
  });
});

describe('code-side identity strings', () => {
  const identityStrings = collectStrings(PERSON);

  it('JSON-LD Person carries no banned wording and states Senior', () => {
    const joined = identityStrings.join('\n');
    expect(findWordingViolations(joined)).toEqual([]);
    expect(hasRequiredWording(joined)).toBe(true);
  });

  it('llms.txt carries no banned wording and states Senior', () => {
    expect(findWordingViolations(LLMS_TXT)).toEqual([]);
    expect(hasRequiredWording(LLMS_TXT)).toBe(true);
  });

  /**
   * The metadata object lives in its own module (`layoutMetadata.ts`) so the
   * test can import the real exported constant without pulling in the document
   * shell — `next/font` instances are only constructible inside the Next build.
   */
  it('layout metadata carries no banned wording and states Senior', async () => {
    const { layoutMetadata } = await import('@/app/(frontend)/[locale]/layoutMetadata');
    const joined = collectStrings({
      title: layoutMetadata.title,
      description: layoutMetadata.description,
      siteName: layoutMetadata.openGraph?.siteName,
    }).join('\n');

    expect(joined.length).toBeGreaterThan(0);
    expect(findWordingViolations(joined)).toEqual([]);
    expect(hasRequiredWording(joined)).toBe(true);
  });
});
