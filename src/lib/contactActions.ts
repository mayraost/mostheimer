/**
 * Derive action targets from the display text of a contact key fact.
 *
 * WHY A HELPER: the CMS copy is the single source of truth for what a visitor
 * reads ("(+49) 176 63 78 79 51", "github.com/mayraost"). The machine-readable
 * target (`tel:` / `https:` href) must therefore be DERIVED from that text, not
 * stored as a second copy that can drift from it. Pure functions only — no
 * DOM, no config — so they are unit-testable.
 */

/**
 * `tel:` URI for a human-formatted phone number, or `null` when the text is not
 * a phone number.
 *
 * Rules (RFC 3966 target form, digits only):
 * - whitespace, dots, hyphens, slashes and parentheses are formatting and drop;
 * - the contact page writes "(+49) 176 …", so a single `+` marks the number as
 *   international wherever the parentheses put it; a second `+` disqualifies;
 * - a leading `00` international prefix becomes `+`;
 * - anything else (letters, `#`, `,`, `;`) disqualifies the whole string —
 *   returning `null` is safer than emitting an `href` a phone app dials wrongly.
 *
 * Minimum length 6 digits keeps short labels ("123") from becoming a button.
 */
export function phoneToTelHref(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // A phone number never contains letters or dial modifiers. The hyphen sits at
  // the end of the class — anywhere else it would form a character range.
  if (/[^\d\s()./+-]/.test(trimmed)) return null;
  // At most one plus, and it means "international" wherever the parentheses put
  // it: "(+49) …" and "+49 …" describe the same number, "4+9" does not.
  if ((trimmed.match(/\+/g) ?? []).length > 1) return null;

  const digits = trimmed.replace(/[\s()./-]+/g, '').replace(/^\+/, '');
  if (!/^\d+$/.test(digits)) return null;

  const international = trimmed.includes('+') || digits.startsWith('00');
  const national = digits.startsWith('00') ? digits.slice(2) : digits;
  if (national.length < 6) return null;

  return `tel:${international ? '+' : ''}${national}`;
}

/**
 * `https:` href for a social/profile target, or `null` when the text does not
 * look like a host.
 *
 * - `github.com/mayraost` → `https://github.com/mayraost`
 * - `https://x.dev/@me` → unchanged apart from `URL` normalisation
 * - `mail@example.com` → `null` (that is an address, not a profile URL)
 * - `Mayra Ostheimer` → `null`
 */
export function profileToHref(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  if (/^mailto:/i.test(trimmed) || trimmed.includes('@')) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // A host needs a dot and a TLD-ish tail; `localhost`/`foo` are not profiles.
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return null;
  return url.toString();
}

/** Action rendered below a key-fact value, derived from that value. */
export type KeyFactAction =
  | { kind: 'copy'; labelKey: 'copyLabel'; value: string }
  | { kind: 'call'; labelKey: 'callLabel'; href: string }
  /** A profile host we recognise → its own brand label. */
  | { kind: 'external'; labelKey: 'githubLabel' | 'linkedinLabel'; href: string }
  /** Any other host → labelled with its bare hostname. */
  | { kind: 'external'; labelKey: null; href: string; host: string }
  | null;

/**
 * Which action a key-fact card gets, derived purely from its display value.
 *
 * Order matters: phone first (a formatted number never parses as a host),
 * e-mail before profile (an address must not become a link target).
 */
export function keyFactAction(value: string): KeyFactAction {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const tel = /^tel:/i.test(trimmed) ? trimmed : phoneToTelHref(trimmed);
  if (tel) return { kind: 'call', labelKey: 'callLabel', href: tel };

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { kind: 'copy', labelKey: 'copyLabel', value: trimmed };
  }

  const href = profileToHref(trimmed);
  if (href) {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'github.com') return { kind: 'external', labelKey: 'githubLabel', href };
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) {
      return { kind: 'external', labelKey: 'linkedinLabel', href };
    }
    return { kind: 'external', labelKey: null, href, host };
  }

  return null;
}
