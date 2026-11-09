import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page } from '@/payload-types';
import type { VibeProjectView } from '@/components/vibe/projectView';
import { envConfig } from '@/envConfig';

/**
 * JSON-LD building blocks for the AEO/discovery layer:
 *
 * - Homepage: `WebSite` + `Person` as an @graph — the homepage is not a
 *   ProfilePage candidate (Google wants an "About me" page, not a site home).
 * - About-me-like pages: `ProfilePage` with the required `mainEntity` =
 *   `Person`.
 * - Other content pages: slim `WebPage` nodes, extended per page (`ItemList`
 *   for listings, `ProfilePage` for the CV).
 *
 * Every fact in the Person node is backed by `site-settings.identity` (which is
 * maintained from the imprint, § 5 DDG), public profiles or the site's own
 * case-study/timeline content — no invented degrees, titles or availability
 * claims. The node is built per request by `buildPerson()`; there is no module
 * level `PERSON` constant any more (08.11.2026), because that was the last
 * place where shipping identity copy lived in code.
 *
 * Types are minimal local structures instead of the `schema-dts` package to
 * keep this feature dependency-free.
 */

const BASE_URL = envConfig.serverUrl;

export type JsonLdObject = Record<string, unknown>;

/** BCP-47 tags for `inLanguage` fields. */
export function jsonLdLanguageTag(locale: FrontendLocale): 'de-DE' | 'en-US' {
  return locale === 'de' ? 'de-DE' : 'en-US';
}

/**
 * Identity facts for the Person node.
 *
 * DATA lives in `site-settings.identity` (an address is not a UI label), copy
 * in the `translations` registry (`seo.person*`). The builder below stays a
 * pure function so the JSON-LD can be unit-tested without a database.
 */
export interface PersonIdentity {
  siteName: string;
  personName: string;
  email: string;
  telephone: string;
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: string;
  sameAs: string[];
  knowsLanguage: string[];
  jobTitle: string;
  description: string;
  worksFor: string;
  contactType: string;
  /** Locale root path for `url` (`/de` or `/en`). */
  localePath: string;
}

/**
 * Identity anchor: the Person object with a stable `@id`.
 *
 * Deliberately omitted:
 * - `image`: Google requires a real crawlable photo; a missing image is
 *   harmless, a placeholder OG card posing as the person's photo is not.
 * - `seeks`/`makesOffer`/"available for work": that badge is marketing copy,
 *   not a verified availability status.
 *
 * Empty fields are DROPPED rather than emitted blank — schema.org validators
 * reject `""` for most properties, and an editor clearing a field must degrade
 * the graph, not break it.
 */
export function buildPerson(input: PersonIdentity): JsonLdObject {
  const contactPoint: JsonLdObject = {
    '@type': 'ContactPoint',
    ...(input.email ? { email: input.email } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.contactType ? { contactType: input.contactType } : {}),
    ...(input.knowsLanguage.length > 0 ? { availableLanguage: input.knowsLanguage } : {}),
  };

  const address: JsonLdObject = {
    '@type': 'PostalAddress',
    ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
    ...(input.postalCode ? { postalCode: input.postalCode } : {}),
    ...(input.addressLocality ? { addressLocality: input.addressLocality } : {}),
    ...(input.addressCountry ? { addressCountry: input.addressCountry } : {}),
  };

  return {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    name: input.personName || input.siteName,
    url: `${BASE_URL}${input.localePath}`,
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(Object.keys(address).length > 1 ? { address } : {}),
    ...(input.worksFor ? { worksFor: { '@type': 'Organization', name: input.worksFor } } : {}),
    ...(input.knowsLanguage.length > 0 ? { knowsLanguage: input.knowsLanguage } : {}),
    ...(Object.keys(contactPoint).length > 1 ? { contactPoint } : {}),
  };
}

/** Person as a standalone reference (same `@id` → graph link). */
function personRef(): JsonLdObject {
  return { '@id': `${BASE_URL}/#person` };
}

export interface SiteJsonLdInput {
  locale: FrontendLocale;
  siteName: string;
  description?: string | null;
  person: JsonLdObject;
}

/**
 * Homepage graph: `WebSite` + `Person` in one `@graph`, wired through stable
 * `@id` references.
 */
export function buildSiteJsonLd(input: SiteJsonLdInput): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: `${BASE_URL}/${input.locale}`,
        name: input.siteName,
        inLanguage: jsonLdLanguageTag(input.locale),
        publisher: personRef(),
        ...(input.description ? { description: input.description } : {}),
      },
      input.person,
    ],
  };
}

export interface ProfilePageJsonLdInput {
  person: JsonLdObject;
  locale: FrontendLocale;
  /** Slug path without base URL, with locale prefix (e.g. `/en/about`). */
  path: string;
  /** CMS page title (visible name of the entity). */
  name?: string;
  /** Meta description of the page (already derived from CMS content). */
  description?: string | null;
  dateModified?: string | null;
}

/**
 * About-me/CV page: `ProfilePage` with the required `mainEntity` = `Person`
 * (Google's ProfilePage guideline). Dates are ISO 8601; `dateModified` comes
 * from the page's CMS `updatedAt` when present.
 */
export function buildProfilePageJsonLd(input: ProfilePageJsonLdInput): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${BASE_URL}${input.path}#profilepage`,
    url: `${BASE_URL}${input.path}`,
    inLanguage: jsonLdLanguageTag(input.locale),
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: personRef(),
    ...(input.name ? { name: input.name } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntity: input.person,
  };
}

export interface WebPageJsonLdInput {
  person: JsonLdObject;
  locale: FrontendLocale;
  /** Slug path without base URL, with locale prefix (e.g. `/de/contact`). */
  path: string;
  name?: string | null;
  description?: string | null;
  dateModified?: string | null;
  /**
   * `/contact`: contact facts as a second graph node (Person reference +
   * ContactPoint), from the same source as the Person node — not a duplicate.
   */
  includeContact?: boolean;
}

/**
 * Slim `WebPage` node for content pages without their own rich-result type:
 * `isPartOf` → `#website`, `inLanguage`, `about`/`author` → `#person`.
 * `mainEntity` only when the page carries a nameable entity (contact →
 * Person), otherwise omitted on purpose.
 */
export function buildWebPageJsonLd(input: WebPageJsonLdInput): JsonLdObject {
  const url = `${BASE_URL}${input.path}`;
  const page: JsonLdObject = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    inLanguage: jsonLdLanguageTag(input.locale),
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: personRef(),
    author: personRef(),
    ...(input.includeContact ? { mainEntity: personRef() } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };

  if (!input.includeContact) {
    return { '@context': 'https://schema.org', '@graph': [page] };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [page, input.person],
  };
}

// -- CV data from the career page (timeline block) ---------------------------

type PageBlock = NonNullable<Page['layout']>[number];

/**
 * Parses a month-precise date token from the CMS `period` strings (e.g.
 * `09/2024`, `2014`). Anything else ("Heute", "Jetzt", free text) returns
 * `null` so the field is omitted rather than invented.
 */
function parsePeriodToken(token: string): string | null {
  const yearOnly = /^(\d{4})$/.exec(token);
  if (yearOnly) return yearOnly[1];
  const monthYear = /^(\d{1,2})\/(\d{4})$/.exec(token);
  if (monthYear) {
    const month = Number(monthYear[1]);
    if (month < 1 || month > 12) return null;
    return `${monthYear[2]}-${String(month).padStart(2, '0')}`;
  }
  return null;
}

export interface ParsedPeriod {
  startDate: string;
  endDate?: string;
}

/**
 * Turns a `period` string into a `startDate`/`endDate` pair. Open-ended
 * ranges ("Heute") and unclear values yield only `startDate`; unparseable
 * strings yield `null`.
 */
export function parsePeriod(period: string | null | undefined): ParsedPeriod | null {
  if (!period) return null;
  const normalized = period
    .replace(/^[ \t]*Seit[ \t]+/i, '')
    .replace(/^[ \t]*Since[ \t]+/i, '')
    // Year ranges split on the dash; a lone year followed by prose is not a
    // range and yields only a startDate.
    .trim();
  const parts = normalized.split(/\s*[–—-]\s*/).filter(Boolean);
  if (parts.length === 0) return null;

  const startDate = parsePeriodToken(parts[0]);
  if (!startDate) return null;

  const endToken = parts.length > 1 ? parts[parts.length - 1] : null;
  const endDate = endToken ? parsePeriodToken(endToken) : null;

  return endDate ? { startDate, endDate } : { startDate };
}

export interface CareerJsonLdInput {
  person: JsonLdObject;
  locale: FrontendLocale;
  path: string;
  name?: string | null;
  description?: string | null;
  dateModified?: string | null;
  layout: PageBlock[];
}

/**
 * Career page: `ProfilePage` plus a `Person.hasOccupation` list built from the
 * real timeline entries (role, company, period only when machine-readable).
 * No `hasCredential`/`alumniOf` — the CMS holds no degrees, and "studied" is
 * not a completed degree.
 */
export function buildCareerJsonLd(input: CareerJsonLdInput): JsonLdObject {
  const occupations: JsonLdObject[] = [];

  for (const block of input.layout) {
    if (block.blockType !== 'timeline') continue;
    for (const entry of block.entries ?? []) {
      const name = entry.role?.trim() || entry.company;
      if (!name) continue;
      const period = parsePeriod(entry.period);
      occupations.push({
        '@type': 'Role',
        roleName: name,
        ...(period ? { startDate: period.startDate } : {}),
        ...(period?.endDate ? { endDate: period.endDate } : {}),
        worksFor: {
          '@type': 'Organization',
          name: entry.company,
        },
      });
    }
  }

  const page: JsonLdObject = {
    '@type': 'ProfilePage',
    '@id': `${BASE_URL}${input.path}#profilepage`,
    url: `${BASE_URL}${input.path}`,
    inLanguage: jsonLdLanguageTag(input.locale),
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: personRef(),
    ...(input.name ? { name: input.name } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntity: {
      ...input.person,
      ...(occupations.length > 0 ? { hasOccupation: occupations } : {}),
    },
  };

  return { '@context': 'https://schema.org', '@graph': [page] };
}

export interface CaseStudiesJsonLdInput {
  locale: FrontendLocale;
  path: string;
  name?: string | null;
  description?: string | null;
  dateModified?: string | null;
  layout: PageBlock[];
}

/**
 * Case-studies page: `WebPage` + `ItemList` from the `caseStudy` blocks
 * (name = `client`, description = `context`, URL = `link`). `headline` only
 * when the block sets a role.
 */
export function buildCaseStudiesJsonLd(input: CaseStudiesJsonLdInput): JsonLdObject {
  const url = `${BASE_URL}${input.path}`;
  const works: JsonLdObject[] = [];

  for (const block of input.layout) {
    if (block.blockType !== 'caseStudy') continue;
    const client = block.client?.trim();
    if (!client) continue;
    const link = block.link?.trim();
    works.push({
      '@type': 'CreativeWork',
      name: client,
      creator: personRef(),
      ...(block.role ? { headline: block.role } : {}),
      ...(block.context ? { description: block.context } : {}),
      ...(link && /^https?:\/\//i.test(link) ? { url: link } : {}),
    });
  }

  const graph: JsonLdObject[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      inLanguage: jsonLdLanguageTag(input.locale),
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: personRef(),
      author: personRef(),
      ...(input.name ? { name: input.name } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    },
  ];

  if (works.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      numberOfItems: works.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: works.map((work, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: work,
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// -- Vibe coding showcase ----------------------------------------------------

/**
 * One project as a `CreativeWork`.
 *
 * Type choice (design § 5): `CreativeWork`, NOT `SoftwareSourceCode` (implies a
 * public source tree — halloween-counter's repo is private), NOT `TechArticle`
 * (that is documentation) and NOT `Product` (needs an offer, invalid without).
 */
function vibeProjectNode(project: VibeProjectView): JsonLdObject {
  const image = project.hero?.url ?? project.cover?.url ?? null;
  return {
    '@type': 'CreativeWork',
    name: project.title,
    creator: personRef(),
    url: project.liveUrl ?? `${BASE_URL}${project.path}`,
    ...(project.teaser ? { description: project.teaser } : {}),
    ...(project.stack.length > 0 ? { keywords: project.stack.join(', ') } : {}),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(image ? { image: image.startsWith('http') ? image : `${BASE_URL}${image}` } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
  };
}

/** Home → listing → project breadcrumb (the listing name is the CMS page title). */
function vibeBreadcrumb(listingName: string, project: VibeProjectView): JsonLdObject {
  const listingUrl = `${BASE_URL}${project.listingPath}`;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}${project.path}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: listingName || 'Vibe coding',
        item: listingUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: project.title,
        item: `${BASE_URL}${project.path}`,
      },
    ],
  };
}

export interface VibeProjectJsonLdInput {
  locale: FrontendLocale;
  project: VibeProjectView;
  /** Visible title of the listing page (CMS `pages.title`). */
  listingName?: string | null;
}

/** Detail page: `WebPage` + `mainEntity: CreativeWork` + `BreadcrumbList`. */
export function buildVibeProjectJsonLd(input: VibeProjectJsonLdInput): JsonLdObject {
  const url = `${BASE_URL}${input.project.path}`;
  const page: JsonLdObject = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    inLanguage: jsonLdLanguageTag(input.locale),
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: personRef(),
    author: personRef(),
    name: input.project.title,
    ...(input.project.teaser ? { description: input.project.teaser } : {}),
    ...(input.project.updatedAt ? { dateModified: input.project.updatedAt } : {}),
    mainEntity: vibeProjectNode(input.project),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [page, vibeBreadcrumb(input.listingName ?? '', input.project)],
  };
}

export interface VibeListingJsonLdInput {
  locale: FrontendLocale;
  /** Listing route of this locale (`/de/vibe-coding`). */
  path: string;
  name?: string | null;
  description?: string | null;
  /** The projects of the RENDERED page (never the whole set). */
  items: readonly VibeProjectView[];
  /** Published projects in the whole listing (`numberOfItems`). */
  totalDocs: number;
}

/**
 * Unfiltered listing page: `WebPage` + `ItemList` of the rendered slice,
 * `numberOfItems` = the whole published set.
 *
 * Never emitted for a filtered / `?page>=2` URL (design § 10.3): an ItemList on
 * a page we ask Google to drop is noise.
 */
export function buildVibeListingJsonLd(input: VibeListingJsonLdInput): JsonLdObject {
  const url = `${BASE_URL}${input.path}`;
  const graph: JsonLdObject[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      inLanguage: jsonLdLanguageTag(input.locale),
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: personRef(),
      author: personRef(),
      ...(input.name ? { name: input.name } : {}),
      ...(input.description ? { description: input.description } : {}),
    },
  ];
  if (input.items.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      numberOfItems: Math.max(input.items.length, input.totalDocs),
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: input.items.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: vibeProjectNode(project),
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/**
 * Official injection pattern: a native `<script type="application/ld+json">`
 * in a Server Component, NOT `next/script` (which optimises for code
 * execution, not data). `<` is escaped to `\u003c` to prevent XSS.
 */ export function JsonLdScript({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
