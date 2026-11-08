/**
 * SERVER-ONLY readers for the translations global.
 *
 * These wrap the `'use cache'` layer in `src/cms/cache/frontend/translations.ts`,
 * so this module may only be imported from Server Components: importing it into
 * a Client Component is a build error ("It is not allowed to define inline
 * \"use cache\" annotated functions in Client Components"). Client components
 * use the sync readers from `translations.ts` with the provider context.
 *
 * Cache contract: every entry is tagged `CACHE_TAGS.translations`
 * (`cms:global:translations`) + `cms:all` — the SAME tag the Payload
 * translations hook flushes.
 */
import type { Translation } from '@/payload-types';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import {
  getCachedTranslationGlobal,
  getCachedTranslationGroupValue,
} from '@/cms/cache/frontend/translations';
import type { TranslationGroupName } from '@/cms/cache/frontend/translations';
import { commandItemCopy, getTranslation, getTranslationList, interpolate } from './translations';
import type { TranslationKey, TranslationListKey, TranslationVars } from './translations';

/**
 * Server-side read of one copy string; typed key, `''` never throws.
 *
 * @example
 * const claim = await getCachedTranslation(locale, 'chrome.brandClaim');
 */
export async function getCachedTranslation(
  locale: FrontendLocale,
  key: TranslationKey,
  vars?: TranslationVars,
): Promise<string> {
  const global = await getCachedTranslationGlobal(locale);
  return getTranslation(global, key, vars);
}

/** Server-side read of one copy LIST (stack chips, hero metrics). */
export async function getCachedTranslationList(
  locale: FrontendLocale,
  key: TranslationListKey,
): Promise<string[]> {
  const global = await getCachedTranslationGlobal(locale);
  return getTranslationList(global, key);
}

/**
 * One LEGACY group (`cookies`, `common`, …) as a flat string record.
 *
 * Legacy groups still map to real columns, so they are read as a whole. The
 * newer copy is read key by key via `getCachedTranslation`.
 */
export async function getCachedTranslationGroup(
  locale: FrontendLocale,
  group: TranslationGroupName,
): Promise<Record<string, string>> {
  return getCachedTranslationGroupValue(locale, group);
}

/**
 * A legacy group mapped to a TYPED shape, so a renamed column is a compile
 * error rather than an `undefined` in the markup.
 *
 * @example
 * const t = await getCachedTranslationGroupAs(locale, 'cookies', COOKIE_COPY_KEYS);
 * t.title; // string
 */
export async function getCachedTranslationGroupAs<Key extends string>(
  locale: FrontendLocale,
  group: TranslationGroupName,
  keys: readonly Key[],
): Promise<Record<Key, string>> {
  const source = await getCachedTranslationGroupValue(locale, group);
  const output = {} as Record<Key, string>;
  for (const key of keys) output[key] = source[key] ?? '';
  return output;
}

/** Command-palette copy for one entry id (`commandItems.<id>.label`). */
export async function getCachedCommandItemCopy(
  locale: FrontendLocale,
  id: string,
): Promise<{ label: string; keywords: string[] | null }> {
  const global = await getCachedTranslationGlobal(locale);
  return commandItemCopy(global, id);
}

/** Whole global, for readers that branch on many values at once. */
export async function getCachedTranslationsGlobal(locale: FrontendLocale): Promise<Translation> {
  return getCachedTranslationGlobal(locale);
}

/** Re-exported so server modules need one import for reader + interpolate. */
export { interpolate };
