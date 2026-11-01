'use server';

/**
 * Manueller Cache-Flush "ohne Publish" — Server Action (verbindliche
 * Praeferenz vor API-Routen: kein externer Trigger noetig, Admin-Session
 * reicht). Wird aus der Custom-Admin-View /admin/cache-clear getriggert.
 *
 * Wichtig: Server Actions laufen ausschliesslich im Request-Kontext —
 * hier gilt kein Prerender-Gotcha fuer payload.auth (vgl. Skill:
 * auth erst nach connection() gilt nur in prerenderbaren Routen).
 */
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { CACHE_TAGS } from './constants';
import { safeRevalidate } from './revalidate';

type ClearCachesResult = { ok: true; tags: string[] } | { ok: false; error: string };

/**
 * Auth-Gate: payload.auth gegen den payload-token-Cookie der Admin-Session.
 * Users-Collection hat keine Rollen — jeder authentifizierte User gilt als
 * berechtigt; Anonymous scheitert.
 */
async function requireAdminUser() {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({
    headers: await headers(),
  });
  if (!user || user.collection !== 'users') {
    return null;
  }
  return user;
}

export async function clearAllFrontendCaches(): Promise<ClearCachesResult> {
  let user;
  try {
    user = await requireAdminUser();
  } catch (error) {
    console.warn('[cms-cache] Auth-Check im manuellen Flush fehlgeschlagen.', error);
    return { ok: false, error: 'Auth-Check fehlgeschlagen. Siehe Server-Logs.' };
  }

  if (!user) {
    return { ok: false, error: 'Nicht authentifiziert — Anmelde-Session noetig.' };
  }

  // Breiter Flush: alle Scalar-Tags dieser App + RSC/HTML-Shell per
  // revalidatePath (Notanker des Skills fuer Sonderfaelle wie Home-Route).
  // Breiter Flush: alle Scalar-Tags dieser App + RSC/HTML-Shell per
  // revalidatePath (Notanker des Skills fuer Sonderfaelle wie Home-Route).
  const tags: string[] = [
    CACHE_TAGS.ALL,
    CACHE_TAGS.pages,
    CACHE_TAGS.sitemap,
    CACHE_TAGS.siteSettings,
    CACHE_TAGS.navigation,
    CACHE_TAGS.translations,
    CACHE_TAGS.notFound,
  ];
  for (const tag of tags) {
    safeRevalidate(tag, `manual flush by user ${user.email}`);
  }

  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.warn('[cms-cache] revalidatePath im manuellen Flush uebersprungen.', error);
  }

  return { ok: true, tags };
}
