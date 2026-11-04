import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page } from '@/payload-types';
import { envConfig } from '@/envConfig';

/**
 * JSON-LD-Bausteine für den AEO/Discovery-Layer (Spec-Basis:
 * llm-wiki research aeo-discovery-layer, verifiziert 03.11.2026 gegen
 * Google-Search-Doku „ProfilePage" + llmstxt.org v2):
 *
 * - Homepage: `WebSite` + `Person` als @graph — die Homepage selbst ist
 *   KEIN ProfilePage-Kandidat (Google: „About Me"-Page, nicht Store-Home).
 * - Über-Mich-artige Inhaltsseiten: `ProfilePage` mit Pflicht-`mainEntity`
 *   = `Person` (Google-validierte Pflicht-Eigenschaft).
 * - Weitere Inhaltsseiten: schlanke `WebPage`-Knoten + page-spezifische
 *   Erweiterung (`ItemList` für Verzeichnisse, `ProfilePage` für den CV).
 *
 * Alle Fakten (`PERSON`) sind belegt: Impressum (§ 5 DDG), eigene
 * öffentliche Profile (GitHub/LinkedIn) und die Case-Study-/Timeline-
 * Inhalte der Site selbst. Keine erfundenen Grade, Titel oder Angaben
 * zur Verfügbarkeit.
 *
 * Typing: minimale lokale Strukturtypen statt Paket `schema-dts` —
 * Zero-Dependency-Anforderung (kein npm-Install in diesem Feature).
 */

const BASE_URL = envConfig.serverUrl;

export type JsonLdObject = Record<string, unknown>;

/** `de-DE`/`en-US` — BCP-47-Tags für `inLanguage`-Felder. */
export function jsonLdLanguageTag(locale: FrontendLocale): 'de-DE' | 'en-US' {
  return locale === 'de' ? 'de-DE' : 'en-US';
}

/**
 * Identitäts-Anker: Ich-Objekt mit stabiler `@id`. Werte aus dem
 * Impressum (§ 5 DDG — verifiziert in src/app/(frontend)/[locale]/impressum)
 * plus öffentliche Profile und die auf der Site selbst genannten
 * Berufsangaben (Case Studies / Career-Timeline).
 *
 * Bewusst NICHT enthalten:
 * - `image`: Google fordert ein echtes, crawlbares Foto (≥ 50k px, kein
 *   Placeholder). Ein fehlendes `image` ist unkritisch; ein
 *   Platzhalter-OG-Card als Person-Foto wäre dagegen eine Spec-Verletzung.
 * - `seeks`/`makesOffer`/„available for work": Die Badge auf der
 *   Startseite ist Marketing-Copy, kein belegter Verfügbarkeitsstatus.
 */
const PERSON: JsonLdObject = {
  '@type': 'Person',
  '@id': `${BASE_URL}/#person`,
  name: 'Mayra Ostheimer',
  url: `${BASE_URL}/de`,
  jobTitle: 'Senior Fullstack Developer',
  description:
    'Senior Fullstack Developer für resiliente Web- und Anwendungsarchitekturen: Next.js, React, TypeScript, Payload CMS und Pimcore im Enterprise-Umfeld.',
  sameAs: ['https://github.com/mayraost', 'https://de.linkedin.com/in/mayra-ostheimer-207355438'],
  email: 'mayraostheimer@gmail.com',
  telephone: '+49 176 63787951',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ringstraße 60',
    postalCode: '25368',
    addressLocality: 'Kiebitzreihe',
    addressCountry: 'DE',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'valantic DXA',
  },
  knowsLanguage: ['de', 'en'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'mayraostheimer@gmail.com',
    telephone: '+49 176 63787951',
    contactType: 'personal',
    availableLanguage: ['de', 'en'],
  },
};

/** Person als eigenständige Referenz (gleicher `@id` → Graph-Verknüpfung). */
function personRef(): JsonLdObject {
  return { '@id': `${BASE_URL}/#person` };
}

export interface SiteJsonLdInput {
  locale: FrontendLocale;
  siteName: string;
  description?: string | null;
}

/**
 * Homepage-Graph: `WebSite` + `Person` im selben `@graph` (Identität
 * über stabile `@id`s verlinkbar — „#person"-Wiring wie im Research
 * empfohlen).
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
      PERSON,
    ],
  };
}

export interface ProfilePageJsonLdInput {
  locale: FrontendLocale;
  /** Slug-path ohne Basis-URL, mit Locale-Präfix (z. B. `/en/about`). */
  path: string;
  /** CMS-Titel der Seite (sichtbarer Name der Entität). */
  name?: string;
  /** Meta-Description der Seite (bereits aus CMS-Inhalt abgeleitet). */
  description?: string | null;
  dateModified?: string | null;
}

/**
 * Über-Mich-/CV-Page: `ProfilePage` — Pflicht-Eigenschaft `mainEntity` =
 * `Person` (Google ProfilePage-Richtlinie, verifiziert 03.11.2026).
 * (Referenz-Einheit des Research: ISO 8601, ohne Datum weiterhin gültig).
 * `dateModified` basiert auf dem CMS-`updatedAt` der Page, wenn vorhanden.
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
    mainEntity: PERSON,
  };
}

export interface WebPageJsonLdInput {
  locale: FrontendLocale;
  /** Slug-path ohne Basis-URL, mit Locale-Präfix (z. B. `/de/contact`). */
  path: string;
  name?: string | null;
  description?: string | null;
  dateModified?: string | null;
  /**
   * `/contact`: Kontaktfakten als zweiter Graph-Knoten (Person-Referenz +
   * ContactPoint) — dieselbe Datenquelle wie `PERSON`, kein Duplikat.
   */
  includeContact?: boolean;
}

/**
 * Schlanker `WebPage`-Knoten für Inhaltsseiten ohne eigene Rich-Result-
 * Typen: `isPartOf` → `#website`, `inLanguage`, `about`/`author` →
 * `#person`. `mainEntity` nur, wenn die Seite eine benennbare Entität
 * trägt (Kontakt → Person) — sonst bewusst weggelassen.
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
    '@graph': [
      page,
      {
        ...PERSON,
        url: `${BASE_URL}/${input.locale === 'de' ? 'de' : 'en'}`,
      },
    ],
  };
}

// -- CV-Daten aus der Career-Page (Timeline-Block) ---------------------------

type PageBlock = NonNullable<Page['layout']>[number];

/**
 * Monats-genaues Datum aus den CMS-`period`-Strings parsen.
 * Erwartet Muster wie `09/2024`, `Seit 09/2024 – Heute`, `2012 – 2014`.
 * Nur `JJJJ` oder `MM/JJJJ` werden akzeptiert; alles andere (z. B.
 * „Heute", „Jetzt", freie Texte) liefert `null` → Feld wird weggelassen
 * (kein erfundenes Enddatum).
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
 * `period`-String in ein `startDate`/`endDate`-Paar übersetzen — nur wenn
 * beide Enden maschinell lesbar sind. Offene Zeiträume („Heute") und
 * unklare Angaben liefern nur `startDate`; nicht parsebare Strings `null`.
 */
export function parsePeriod(period: string | null | undefined): ParsedPeriod | null {
  if (!period) return null;
  const normalized = period
    .replace(/^[ \t]*Seit[ \t]+/i, '')
    .replace(/^[ \t]*Since[ \t]+/i, '')
    // Jahres-/Jahresbereich mit Suffix („2012 – 2014") bleibt unverändert;
    // reine Jahresangaben mit Sprachwort („2014 erworben") sind keine Zeiträume.
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
  locale: FrontendLocale;
  path: string;
  name?: string | null;
  description?: string | null;
  dateModified?: string | null;
  layout: PageBlock[];
}

/**
 * Career-Page: `ProfilePage` + `Person.hasOccupation`-Liste, gebaut aus den
 * echten Timeline-Einträgen des CMS (Rolle = `role`, Firma = `company`,
 * Zeitraum nur wenn maschinell lesbar). Keine `hasCredential`/`alumniOf`-
 * Angaben — das CMS liefert keine Grade, und „Studium" ist kein Abschluss.
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
      ...PERSON,
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
 * Case-Studies-Page: `WebPage` + `ItemList` aus den `caseStudy`-Blöcken
 * (Name = `client`, Beschreibung = `context`, Kanonische URL = `link`).
 * `headline` = Rollen-Angabe des Blocks, nur wenn gesetzt.
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

/**
 * Offizielles Injektions-Pattern (Next-Doku json-ld.md): natives
 * `<script type="application/ld+json">` in einer Server Component —
 * NICHT `next/script` (optimiert auf Code-Ausführung, nicht Daten).
 * `<`-Scrubbing mit `\u003c` (XSS-Gegenmechanismus aus der Doku).
 */
export function JsonLdScript({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
