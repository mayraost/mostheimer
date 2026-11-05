import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { User } from '@/payload-types';

/**
 * Shared guard for the seed routes (seed-home, seed-globals):
 *
 * 1. Prod gate: seed routes are disabled in production by default — they are
 *    a fallback tool, not an operating feature. Explicit opt-in via
 *    `ALLOW_SEED=true` (documented in .env.example).
 * 2. Auth gate: a valid Payload admin session is required; otherwise the route
 *    is an unauthenticated seed-spam surface.
 *
 * The prod gate blocks BEFORE getPayload(), so no adapter connect/migrate and
 * no write can happen for a rejected request.
 */
export type SeedAccessResult =
  { payload: Awaited<ReturnType<typeof getPayload>>; user: User } | { response: Response };

export async function assertSeedAccess(req: Request): Promise<SeedAccessResult> {
  const forHeaders = req.headers;

  // Before any Payload init/delete/write. Plain-text 403 without a debug body.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    return {
      response: new Response('Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      }),
    };
  }

  const payload = await getPayload({ config: configPromise });

  const { user } = await payload.auth({ headers: forHeaders });
  if (!user) {
    return {
      response: Response.json({ error: 'Unauthorized: admin session required' }, { status: 401 }),
    };
  }

  return { payload, user };
}
