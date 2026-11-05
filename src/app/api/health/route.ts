// Runtime-evaluated on purpose (`connection()` aborts the build-time prerender):
// a static prerender would bake the value in at build time. With
// cacheComponents the route segment config `dynamic` is not allowed, so this is
// the supported way. Also the Docker HEALTHCHECK target.
import { connection } from 'next/server';

/**
 * `release` is the release id of the running build, inlined from
 * `next.config.ts` (`env.NEXT_RELEASE_ID`, derived from the CI commit or the
 * build time). `ReleaseGuard` compares it and reloads an open tab once after a
 * deploy instead of letting the tab navigate with the previous build's chunks.
 */
export async function GET() {
  await connection();
  return Response.json(
    { status: 'ok', release: process.env.NEXT_RELEASE_ID ?? null },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
