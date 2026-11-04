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
import { collectRevalidationResults } from './revalidate';

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
  // revalidatePath (Notanker fuer Sonderfaelle wie die Home-Route).
  // Blocking-Invalidierung ({ expire: 0 }, siehe revalidate.ts) — der
  // naechste Request muss garantiert frische CMS-Daten sehen.
  const tags = [
    { tag: CACHE_TAGS.ALL, label: `manual flush by user ${user.email}` },
    { tag: CACHE_TAGS.pages, label: 'manual flush: pages' },
    { tag: CACHE_TAGS.sitemap, label: 'manual flush: sitemap' },
    { tag: CACHE_TAGS.siteSettings, label: 'manual flush: site settings' },
    { tag: CACHE_TAGS.navigation, label: 'manual flush: navigation' },
    { tag: CACHE_TAGS.translations, label: 'manual flush: translations' },
    { tag: CACHE_TAGS.notFound, label: 'manual flush: not-found' },
  ];
  const { done } = collectRevalidationResults(tags);

  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.warn('[cms-cache] revalidatePath im manuellen Flush uebersprungen.', error);
  }

  return { ok: true, tags: done };
}
