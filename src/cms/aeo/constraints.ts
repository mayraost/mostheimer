/**
 * Single source of truth for wording constraints on user-visible copy.
 *
 * Two independent consumers read from here so they can never drift:
 *
 * 1. `tests/int/wording.int.spec.ts` — asserts the code-side identity strings
 *    (JSON-LD `Person`, `/llms.txt`, layout metadata) stay clean.
 * 2. The Payload `beforeValidate` hook (`src/cms/wording/beforeValidateWordingCheck.ts`)
 *    — rejects CMS saves that would ship hierarchy overreach or the retired
 *    brand as a person/brand label.
 *
 * Positioning is **Senior**. The site states a seniority level; it never claims
 * a higher rung (staff/principal) that the CV does not back, and it no longer
 * brands itself with the retired site name.
 */

/** One banned term: the matcher plus the reason shown to editors. */
export interface BannedWordingPattern {
  /** Stable identifier, used in messages and test failures. */
  readonly id: string;
  /** Word-boundary matcher; expects the global+insensitive flags. */
  readonly pattern: RegExp;
  /** Why this term must not ship. */
  readonly reason: string;
  /**
   * What to match in the *offending substring* for the violation report.
   * Undefined means the regex match itself is enough.
   */
  readonly stripPrefix?: RegExp;
}

/**
 * Hierarchy overreach. Matched as standalone words (case-insensitive) so that
 * `Staff-Level`, `staff engineer`, `Principal` all hit, while substrings inside
 * other words (e.g. `prINCIPALity` cannot occur, but `Staffel`) never do.
 */
const HIERARCHY_OVERREACH: BannedWordingPattern[] = [
  {
    id: 'staff',
    pattern: /\bstaff\b/gi,
    reason:
      'Die Positionierung ist Senior — "Staff" ist eine höhere Stufe als belegt / Positioning is Senior — "Staff" claims a level above the CV.',
  },
  {
    id: 'principal',
    pattern: /\bprincipal\b/gi,
    reason:
      'Die Positionierung ist Senior — "Principal" ist eine höhere Stufe als belegt / Positioning is Senior — "Principal" claims a level above the CV.',
  },
];

/**
 * Retired brand label. Deliberately narrow:
 *
 * - `mosthi.consent.v1` is a **legacy** localStorage key only: the live key is
 *   `mayraostheimer.consent.v1` (renamed 05.11.2026, deliberately without a
 *   migration — see AGENTS.md). The old key is never parsed, only removed once
 *   on read (`LEGACY_CONSENT_STORAGE_KEYS` in `src/lib/consent/consent.ts`),
 *   so it must survive literal-quoted in that cleanup path without tripping
 *   the guardrail. Exempted as an identifier regardless of its retired state.
 * - `mosthi:consent:open` is a DOM event name — also an identifier, never
 *   rendered. Renaming it would break the footer "cookie settings" trigger
 *   (event producer/consumer drift), not consent persistence.
 *
 *   Neither is user-visible copy. The negative lookahead keeps `mosthi.`/
 *   `mosthi:` identifiers exempt — see the tests that pin this.
 * - `https://mosthi.de` / `https://mostheimer.de` are the live DOMAIN. The
 *   domain is infrastructure (canonical host, purge origins), not a person or
 *   brand label. Any `URL`-prefixed occurrence is exempt.
 * - `mail@mostheimer.de` is a real mailbox in the imprint.
 *
 * Everything else that reads like a name (e.g. a heading `Mostheimer`, a
 * `<span>mostheimer</span>`, `© Mostheimer`) is a violation.
 *
 * NOTE: this module only ever scans CMS copy (see the `beforeValidate` hook) —
 * never source code — so the identifier strings quoted above are documentation,
 * not scan input.
 */
const RETIRED_BRAND: BannedWordingPattern[] = [
  {
    id: 'brand-mosthi',
    // `mosthi` NOT followed by `.`/`:` (identifier separator) and not part of
    // `mostheimer` (handled by its own pattern below).
    pattern: /\bmosthi(?![.:])(?!meier)\w*/gi,
    reason:
      'Alter Markenname als sichtbare Bezeichnung — die Seite trägt den Personennamen / Retired brand label — the site carries the person’s name.',
  },
  {
    id: 'brand-mostheimer',
    // Not preceded by a URL scheme/host prefix (`https://`, `mail@`) and not
    // followed by `.de`-style TLD text used in hosts/mailboxes.
    pattern: /(?<!https?:\/\/)(?<!www\.)(?<!mail@)\bmostheimer(?!\.(?:de|com|org|net)\b)\w*/gi,
    reason:
      'Alter Markenname als sichtbare Bezeichnung — die Seite trägt den Personennamen / Retired brand label — the site carries the person’s name.',
  },
];

/** Every term that must never ship as user-visible copy. */
export const BANNED_WORDING_PATTERNS: readonly BannedWordingPattern[] = Object.freeze([
  ...HIERARCHY_OVERREACH,
  ...RETIRED_BRAND,
]);

/**
 * Required positioning terms. The identity copy must state the seniority
 * level, so an empty/misspelled identity block cannot silently ship.
 */
export const REQUIRED_WORDING: readonly string[] = Object.freeze(['Senior']);

/**
 * Returns the offending substrings found in `text` (empty array = clean).
 * Pure and side-effect free; safe to call from hooks, tests and builds.
 *
 * Only the offending term is returned, not the surrounding sentence, so the
 * result can be shown to editors without echoing large copy blocks.
 */
export function findWordingViolations(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];

  for (const { pattern } of BANNED_WORDING_PATTERNS) {
    // Patterns carry the `g` flag; `matchAll` does not mutate their lastIndex
    // for a fresh clone, and a clone keeps concurrent callers safe.
    const matcher = new RegExp(pattern.source, pattern.flags);
    for (const match of text.matchAll(matcher)) {
      const value = match[0].trim();
      if (value && !hits.includes(value)) hits.push(value);
    }
  }

  return hits;
}

/** True when `text` states the required positioning (case-insensitive). */
export function hasRequiredWording(text: string): boolean {
  if (!text) return false;
  return REQUIRED_WORDING.every((term) => {
    const matcher = new RegExp(`\\b${term}\\b`, 'i');
    return matcher.test(text);
  });
}
