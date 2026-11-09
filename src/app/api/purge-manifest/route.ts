import { connection } from 'next/server';
import { PAGINATED_ROUTES, paginatedRoutePaths } from '@/cms/cache/frontend/routes';
import { getCachedAllProjects, primeRouteRegistries } from '@/cms/cache/frontend/queries';
import {
  registeredPageSlugs,
  registeredProjectDetailPaths,
  registeredProjectSlugs,
} from '@/cms/cache/frontend/revalidate';

/**
 * Purge manifest for the DEPLOY purge (`scripts/cf-purge.mjs`).
 *
 * WHY AN API ROUTE (and not a Server Action / not a hardcoded list)
 *
 * - The caller is EXTERNAL: the entrypoint starts the server and then runs the
 *   purge script in the background (`node scripts/cf-purge.mjs`). A plain Node
 *   process cannot invoke a Server Action (they require the Next request
 *   protocol + an action id), and the script must not import the app's Next
 *   module graph (it may run against a partially booted container). The
 *   route-model MODULE it does import (`routes.ts`) is plain TypeScript without
 *   any Next/Payload imports.
 * - A second hardcoded list in the script would drift from `PAGINATED_ROUTES`:
 *   adding a paginated route would silently stop being purged at deploy time.
 *   Serving the constant from the app keeps ONE source of truth.
 * - Read-only, no writes, no auth needed: the list is public route shape (it is
 *   derivable from the sitemap), so there is nothing to protect.
 *
 * The route is STATIC (no dynamic API) and `no-store`: a deploy purge must never
 * read a cached manifest from the edge which might predate the image.
 * `connection()` is only there because `cacheComponents` would otherwise try to
 * prerender it at build time and the value is per-image.
 *
 * FIELDS
 *
 * - `paginatedRoutes` — bare route paths (`/projects`), the source of truth.
 * - `paginatedPaths` — `/en/projects`, `/de/projects`: what the purge
 *   turns into `host+path` prefixes.
 * - `pageSlugs` / `projects` / `projectDetailPaths` — the ops view of the route
 *   registries. Optional for the caller (fail-soft), useful for diagnosing a
 *   broad flush.
 */
export const PAGINATED_ROUTE_PATHS: readonly string[] = PAGINATED_ROUTES;

export async function GET() {
  // Not a DB read — but the value belongs to the running image, so it must not
  // be baked into a build-time prerender.
  await connection();

  // Ops view of the route registries: page slugs and the detail URLs a broad
  // flush would purge. Every reader is `'use cache'`-tagged; a DB outage
  // degrades to empty lists instead of failing the manifest (the deploy purge
  // must never abort on an optional field).
  let pageSlugs: string[] = [];
  let projects: string[] = [];
  let projectDetailPaths: string[] = [];
  try {
    // `primeRouteRegistries` reads the page list; the project reads are served
    // from the data cache when a render already populated them.
    await primeRouteRegistries();
    await getCachedAllProjects();
    pageSlugs = registeredPageSlugs();
    projects = registeredProjectSlugs();
    projectDetailPaths = registeredProjectDetailPaths();
  } catch (error) {
    console.warn(
      '[purge-manifest] Route-Registry nicht lesbar — leere Zusatzlisten:',
      error instanceof Error ? error.message : 'unknown error',
    );
  }

  return Response.json(
    {
      paginatedRoutes: PAGINATED_ROUTE_PATHS,
      // `host+path` prefixes are derived by the caller (it owns the zone → host
      // map); the manifest stays a pure route model: paths only.
      paginatedPaths: paginatedRoutePaths(PAGINATED_ROUTES),
      pageSlugs,
      projects,
      projectDetailPaths,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
