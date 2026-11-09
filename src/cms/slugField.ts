/**
 * Shared slug normalisation for URL-bearing collections.
 *
 * One shape for both the stored value and the derived fallback (title/label),
 * so `/de/…/<slug>` never carries uppercase, umlauts or repeated dashes. The
 * slug is the URL contract: `vibe-coding` or `audit-scanner`, never a
 * translated variant (see design doc § 2 / § 10).
 */
export function toUrlSlug(input: unknown): string {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
