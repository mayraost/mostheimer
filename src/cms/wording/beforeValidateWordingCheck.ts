import { APIError } from 'payload';
import { findWordingViolations } from '@/cms/aeo/constraints';

/**
 * Editor feedback for the wording guardrail: scans the incoming document for
 * banned terms (hierarchy overreach, retired brand label) before Payload runs
 * its own field validation, so a bad save fails with a readable message instead
 * of shipping.
 *
 * Kept deliberately cheap:
 * - only string leaves are inspected (walking objects/arrays, never payloads);
 * - the walk stops collecting after a bounded number of hits;
 * - no DB access, no regex over non-string data.
 *
 * The check is intentionally NOT applied to `autosave` (live preview writes the
 * same document on every keystroke) — editors would be blocked mid-word.
 */

/** Max violations surfaced in one message; the rest are summarized. */
const MAX_REPORTED = 6;

/** Max depth walked; CMS documents nest blocks/groups a handful of levels. */
const MAX_DEPTH = 12;

/** String leaves shorter than this cannot hold a banned term meaningfully. */
const MIN_STRING_LENGTH = 5;

/**
 * Payload's `BeforeValidateHook` argument subset this hook needs. Declared
 * locally (instead of importing the hook type) to avoid Payload's `any`
 * default generic inside this module.
 */
export interface WordingHookArgs {
  data?: unknown;
  operation: string;
}

/** Only localized strings matter; a number/text pair id never carries copy. */
function collectStrings(value: unknown, path: string, out: string[], depth = 0): string[] {
  if (depth > MAX_DEPTH) return out;
  if (typeof value === 'string') {
    if (value.length >= MIN_STRING_LENGTH) out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, path, out, depth + 1);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      collectStrings(entry, path, out, depth + 1);
    }
  }
  return out;
}

/** User-facing message, German first (primary audience), English second. */
function buildMessage(violations: string[]): string {
  const shown = violations.slice(0, MAX_REPORTED).join(', ');
  const more = violations.length > MAX_REPORTED ? ` (+${violations.length - MAX_REPORTED})` : '';
  return (
    `Wortlaut nicht erlaubt: ${shown}${more}. ` +
    'Die Positionierung ist "Senior"; höhere Stufen (Staff/Principal) und der alte Markenname ' +
    'dürfen nicht als sichtbarer Text erscheinen. ' +
    `Disallowed wording: ${shown}${more}. Positioning is "Senior"; higher levels ` +
    '(Staff/Principal) and the retired brand label must not appear in visible copy.'
  );
}

/**
 * Builds a `beforeValidate` hook for a collection/global that carries visible
 * copy. Returns `undefined` data unchanged so Payload's own pipeline is never
 * altered on the happy path.
 */
export function wordingBeforeValidate({ data, operation }: WordingHookArgs): void {
  if (operation === 'autosave') return;
  if (!data) return;

  const strings = collectStrings(data, '', []);
  if (strings.length === 0) return;

  const violations: string[] = [];
  for (const text of strings) {
    for (const hit of findWordingViolations(text)) {
      if (!violations.includes(hit)) violations.push(hit);
    }
    if (violations.length > MAX_REPORTED * 4) break;
  }

  if (violations.length > 0) {
    // 400 + `isPublic: true` → the message is shown verbatim in the admin
    // error toast / REST response, without leaking internals.
    throw new APIError(buildMessage(violations), 400, null, true);
  }
}
