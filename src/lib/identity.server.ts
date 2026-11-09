import type { SiteSetting } from '@/payload-types';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import { getCachedSiteSettings } from '@/cms/cache/frontend/queries';
import { getCachedTranslation } from './translations.server';
import { buildPerson } from '@/components/StructuredData';
import type { JsonLdObject, PersonIdentity } from '@/components/StructuredData';

/**
 * Identity bundle for the JSON-LD graph, the OG card and the layout metadata.
 *
 * Sources, deliberately split:
 * - `site-settings.identity` → DATA (name, address, phone, profiles). An
 *   address is a fact, not a UI label, and it is maintained from the imprint.
 * - `translations` (`seo.person*`) → COPY (job title, description, company
 *   name as displayed). Editable per locale in the CMS.
 *
 * Every value is a cached read (site-settings + translations tags), so
 * resolving this per request costs no database round-trip while the cache is
 * warm. Blank fields stay blank; the builders drop them from the graph.
 */
export async function loadPersonIdentity(
  locale: FrontendLocale,
  siteSettings: SiteSetting,
): Promise<PersonIdentity> {
  const [jobTitle, description, worksFor, contactType] = await Promise.all([
    getCachedTranslation(locale, 'seo.personJobTitle'),
    getCachedTranslation(locale, 'seo.personDescription'),
    getCachedTranslation(locale, 'seo.worksFor'),
    getCachedTranslation(locale, 'seo.contactType'),
  ]);

  const identity = siteSettings.identity;
  const sameAs = (identity?.sameAs ?? [])
    .map((entry) => entry.url?.trim())
    .filter((url): url is string => Boolean(url));
  const knowsLanguage = (identity?.knowsLanguage ?? [])
    .map((entry) => entry.code?.trim())
    .filter((code): code is string => Boolean(code));

  return {
    siteName: siteSettings.siteName?.trim() ?? '',
    personName: identity?.personName?.trim() ?? '',
    email: identity?.email?.trim() ?? '',
    telephone: identity?.telephone?.trim() ?? '',
    streetAddress: identity?.streetAddress?.trim() ?? '',
    postalCode: identity?.postalCode?.trim() ?? '',
    addressLocality: identity?.addressLocality?.trim() ?? '',
    addressCountry: identity?.addressCountry?.trim() ?? '',
    sameAs,
    knowsLanguage,
    jobTitle,
    description,
    worksFor,
    contactType,
    localePath: `/${locale}`,
  };
}

/**
 * Loads the identity AND returns the ready-to-embed Person node.
 *
 * The extra round-trip is avoided by handing the already-read `site-settings`
 * in (the caller needs `siteName` for the metadata anyway).
 */
export async function loadPersonJsonLd(
  locale: FrontendLocale,
  siteSettings: SiteSetting,
): Promise<JsonLdObject> {
  return buildPerson(await loadPersonIdentity(locale, siteSettings));
}

/** Convenience for callers that have not read `site-settings` yet. */
export async function loadPersonJsonLdFor(locale: FrontendLocale): Promise<JsonLdObject> {
  return loadPersonJsonLd(locale, await getCachedSiteSettings(locale));
}
