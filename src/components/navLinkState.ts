/**
 * Active-state detection for navigation links.
 *
 * CMS links are always locale-prefixed absolute paths (`/de/leadership`), while
 * `usePathname()` returns the same shape without query/hash. Rules:
 *
 * - Only locale-prefixed paths can be active. Hash and external targets never
 *   are: `#architektur` is an in-page jump, `https://…` belongs to another
 *   document (the drawer must not claim that page is open here).
 * - Trailing slashes are ignored so `/de/leadership/` matches `/de/leadership`.
 * - The locale root (`/de`) matches exactly — otherwise it would light up on
 *   every sub-page. Sub-pages match exactly or as a path prefix
 *   (`/de/leadership/foo`), so nested routes keep their section highlighted.
 * - Query strings in the CMS link (`?x=1`) are dropped for the comparison.
 */
export function isActiveNavLink(href: string, pathname: string | null): boolean {
  if (!pathname) return false;

  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) return false;

  const strip = (value: string) =>
    value.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/+$/, '');
  const target = strip(trimmed);
  const current = strip(pathname);

  if (!target.startsWith('/')) return false;
  // `/de` (and any single-segment path) is exact-only.
  if (target.split('/').filter(Boolean).length < 2) return current === target;

  return current === target || current.startsWith(`${target}/`);
}
