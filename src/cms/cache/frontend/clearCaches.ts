'use server';

/**
 * Manual cache flush without a publish. A Server Action rather than an API route
 * because no external trigger is needed — the admin session suffices. Triggered
 * from the custom admin view /admin/cache-clear.
 *
 * Server Actions always run in a request context, so the "call connection()
 * before payload.auth" prerender rule does not apply here.
 */
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { CACHE_TAGS } from './constants';
import { collectRevalidationResults } from './revalidate';

type ClearCachesResult = { ok: true; tags: string[] } | { ok: false; error: string };

/**
 * Auth gate via the admin session's payload-token cookie. The users collection
 * has no roles, so any authenticated user may flush; anonymous is rejected.
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

  // Broad flush of every scalar tag, plus the RSC/HTML shell via revalidatePath
  // as a safety net for special cases like the home route. Blocking
  // invalidation ({ expire: 0 }, see revalidate.ts): the next request must see
  // fresh CMS data for certain.
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
