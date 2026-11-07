// Runtime-evaluated on purpose (`connection()` aborts the build-time prerender):
// a static prerender would bake the value in at build time. With
// cacheComponents the route segment config `dynamic` is not allowed, so this is
// the supported way. Also the Docker HEALTHCHECK target.
import { connection } from 'next/server';

import { getReleaseId } from '@/lib/release';

/**
 * `release` is the identity of the running **image** (Next BUILD_ID, baked into
 * `/app/.cf-release`), NOT a per-build timestamp — see `src/lib/release.ts`.
 * `ReleaseGuard` compares it against the id its tab loaded with and performs at
 * most one reload per release, so an unchanged commit can never trigger a
 * reload loop.
 */
export async function GET() {
  await connection();
  return Response.json(
    { status: 'ok', release: getReleaseId() },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
