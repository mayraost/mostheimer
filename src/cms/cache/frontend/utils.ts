/**
 * Normalizes page slugs for cache tag keys: strips leading/trailing slashes
 * (`/impressum/` => `impressum`) and maps the empty root slug to `home`, the
 * slug of the root page.
 */
export function normalizeSlug(slug: string): string {
  const cleaned = slug.replace(/^\/+|\/+$/g, '');
  return cleaned === '' ? 'home' : cleaned;
}
