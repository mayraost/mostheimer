import type { TextFieldValidation } from 'payload';

/**
 * Allowed link shapes for CMS-authored href fields.
 *
 * WHY THIS EXISTS: several block and global fields store strings that are
 * rendered directly into an anchor `href` (Hero CTAs, navigation, footer,
 * consent privacy link, 404 button). Payload treats them as opaque `text`, so
 * anything a user or an API key writes — including `javascript:` — reached the
 * browser verbatim. This module is the single write-boundary control; the
 * renderers apply the same rule again as a second layer.
 *
 * DELIBERATELY PERMISSIVE for legitimate editorial content:
 * - in-page anchors (`#architecture`), which the home hero uses per locale;
 * - root-relative paths (`/de/projects`, `/en/privacy`);
 * - `http(s)`, `mailto:` and `tel:` URLs.
 *
 * REJECTED: every other scheme (`javascript:`, `data:`, `vbscript:`, `file:`),
 * protocol-relative values (`//evil.example`), and control characters used to
 * smuggle a scheme past a naive check (`java\tscript:`, `%0Ajavascript:`).
 */

/** Schemes that may appear in a CMS-authored link. */
const ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/**
 * Control characters and whitespace-encoded smuggling tricks. A leading `%0A`
 * or a NUL inside the scheme name is a classic way to defeat a prefix test, so
 * the value is rejected outright rather than normalised into something else.
 */
const FORBIDDEN_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * True when `value` is a link the renderers may emit.
 *
 * Kept pure and dependency-free so the CMS validation and the render-side
 * guard cannot drift apart, and so it is unit-testable without a database.
 */
export function isSafeHref(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (FORBIDDEN_CHARS.test(trimmed)) return false;

  // In-page anchor.
  if (trimmed.startsWith('#')) return true;

  // Protocol-relative URLs resolve against the current scheme but let another
  // host win; they have no legitimate use in this CMS.
  if (trimmed.startsWith('//')) return false;

  // Root-relative or dot-relative path.
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true;
  }

  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (!schemeMatch) return false;
  const scheme = schemeMatch[1].toLowerCase();
  if (!ALLOWED_SCHEMES.has(scheme)) return false;

  // A scheme that is allowed is not automatically sound: `mailto:` and `tel:`
  // must carry a payload, and http(s) must survive `URL` construction.
  if (scheme === 'mailto') return trimmed.length > 'mailto:'.length;
  if (scheme === 'tel') return /^tel:[+\d\s().-]+$/i.test(trimmed);
  try {
    const url = new URL(trimmed);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Render-side guard: the href to emit, or `null` when the string is not a
 * link the page may use.
 *
 * WHY A SECOND LAYER: the CMS `validate` above stops new writes, but content
 * stored before it existed (or written straight into the database) would still
 * be rendered. Returning `null` lets each renderer fall back to plain text or
 * drop the anchor, so a bad value can never become a clickable `javascript:`.
 */
export function safeHrefOrNull(value: unknown): string | null {
  return isSafeHref(value) ? (value as string) : null;
}

/** Message shown in the admin panel and returned by the REST API. */
const ERROR_MESSAGE =
  'Use a path (/de/projects), an in-page anchor (#section), or an http(s)/mailto/tel URL.';

/**
 * Payload `validate` for a text field that becomes an `href`.
 *
 * Empty values pass, so optional link fields keep working and `required` stays
 * the field's own concern rather than being duplicated here.
 */
export const validateHref: TextFieldValidation = (value) => {
  if (value === null || value === undefined || value === '') return true;
  return isSafeHref(value) || ERROR_MESSAGE;
};
