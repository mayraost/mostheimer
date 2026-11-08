import { cacheLife, cacheTag } from 'next/cache';
import type { Translation } from '@/payload-types';
import { CACHE_TAGS } from './constants';
import type { FrontendLocale } from './routes';
import { getCachedTranslations } from './queries';

/**
 * Dedicated cache layer for translations copy.
 *
 * One cache entry per `(locale, view)` so a component asks for exactly what it
 * renders instead of threading the whole global down the tree:
 *
 * - `getCachedTranslationGlobal` → the full global (legacy groups + `copy` rows)
 * - `getCachedTranslationGroup`  → one legacy group (`cookies`, `common`, …)
 *
 * Cache contract — must stay identical to the translations API cache:
 *
 * - Tag: {@link CACHE_TAGS.translations} (`cms:global:translations`) plus
 *   {@link CACHE_TAGS.ALL}. That is the SAME tag the Payload `translations` hook
 *   flushes (`revalidateTranslationsCache`), so one CMS save invalidates the
 *   global read, these entries AND the Cloudflare edge purge queued by the hook.
 *   Never introduce a separate tag here — it would survive a publish and serve
 *   stale copy.
 * - Profile: the `global` `cacheLife` profile (5 min background refresh,
 *   30 d stale/expire), identical to `queries.ts`. Correctness comes from the
 *   blocking tag flush, not from the TTL.
 *
 * `'use cache'` needs an async function and a Server Component: client modules
 * must NOT import this file (build error). They use the sync readers in
 * `src/lib/translations.ts` with the provider context.
 */

const MONTH = 2_592_000;
const REFRESH = 300;

const TRANSLATIONS_CACHE_PROFILE = { stale: MONTH, revalidate: REFRESH, expire: MONTH } as const;

/**
 * The whole translations global.
 *
 * The body delegates to `getCachedTranslations` (itself `'use cache'`), so a tag
 * flush invalidates both entries together and the database is read once through
 * `payload.findGlobal`.
 */
export async function getCachedTranslationGlobal(locale: FrontendLocale): Promise<Translation> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.translations);
  cacheLife(TRANSLATIONS_CACHE_PROFILE);
  return getCachedTranslations(locale);
}

/**
 * One LEGACY group of the global (`cookies`, `common`, `clipboard`, …), cached
 * per `(locale, group)`.
 *
 * The newer copy lives in the `copy` row array and is read through
 * `src/lib/translations.ts`; this reader exists for the groups that still map to
 * real columns.
 */
export async function getCachedTranslationGroupValue(
  locale: FrontendLocale,
  group: TranslationGroupName,
): Promise<Record<string, string>> {
  'use cache';
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.translations);
  cacheLife(TRANSLATIONS_CACHE_PROFILE);

  const global = await getCachedTranslationGlobal(locale);
  const value = (global as unknown as Record<string, unknown>)[group];
  const output: Record<string, string> = {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return output;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === 'string') output[key] = entry;
  }
  return output;
}

/**
 * Legacy groups that exist as real columns in `translations_locales`.
 * Kept explicit so a typo is a compile error and the list cannot silently drift
 * (the `copy` row array is deliberately not a group — it has its own readers).
 */
export type TranslationGroupName =
  'settings' | 'common' | 'commandPalette' | 'footer' | 'cookies' | 'clipboard' | 'contactActions';
