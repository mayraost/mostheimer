import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { User } from '@/payload-types';

/**
 * Gemeinsamer Seed-Route-Guard (seed-home, seed-globals):
 *
 * 1. Prod-Gate: In Produktion sind Seed-Routen per Default GESPERRT — eine
 *    Seed-Route an der Single-Site-Produktion ist per se ein Fallback-Werkzeug,
 *    kein Betriebselement. Freischaltung bewusst via `ALLOW_SEED=true`-Env
 *    (opt-in, dokumentiert in .env.example).
 * 2. Auth-Gate: Nur mit gueltiger Payload-Admin-Session; unauthentifiziert
 *    waere die Route sonst Seed-Spam-Oberflaeche.
 *
 * Der Prod-Gate-Block laeuft VOR getPayload() (kein Adapter-Connect/Migrate),
 * bevor irgendein Write-Call ausgefuehrt werden kann.
 */
export type SeedAccessResult =
  { payload: Awaited<ReturnType<typeof getPayload>>; user: User } | { response: Response };

export async function assertSeedAccess(req: Request): Promise<SeedAccessResult> {
  const forHeaders = req.headers;

  // Prod-Gate: BEFORE irgendein Payload-Init/Delete/Write. 403 plain-text,
  // kein body mit Debug-Details (kein Info-Leak).
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
