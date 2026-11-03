import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
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
 *
 * Typing: minimale lokale Strukturtypen statt Paket `schema-dts` —
 * Zero-Dependency-Anforderung (kein npm-Install in diesem Feature).
 */

const BASE_URL = envConfig.serverUrl;

export type JsonLdObject = Record<string, unknown>;

/**
 * Identitäts-Anker: Ich-Objekt mit stabiler `@id`. Werte aus dem
 * Impressum (§ 5 DDG — verifiziert in src/app/(frontend)/[locale]/impressum).
 *
 * Bewusst NICHT enthalten:
 * - `image`: Google fordert ein echtes, crawlbares Foto (≥ 50k px, kein
 *   Placeholder). Ein fehlendes `image` ist unkritisch; ein
 *   Platzhalter-OG-Card als Person-Foto wäre dagegen eine Spec-Verletzung.
 * - `jobTitle`/`description`: keine verifizierten Datenquellen (CMS
 *   `siteSettings` ist Branding, kein CV-Feld) — lieber weglassen als
 *   erfinden.
 */
const PERSON: JsonLdObject = {
  '@type': 'Person',
  '@id': `${BASE_URL}/#person`,
  name: 'Mayra Ostheimer',
  sameAs: ['https://github.com/mayraost'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ringstraße 60',
    postalCode: '25368',
    addressLocality: 'Kiebitzreihe',
    addressCountry: 'DE',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'mailto:mail@mostheimer.de',
    telephone: '+49 176 63787951',
    contactType: 'personal',
    availableLanguage: ['de', 'en'],
  },
};

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
        inLanguage: input.locale === 'de' ? 'de-DE' : 'en-US',
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
  dateModified?: string | null;
}

/**
 * Über-Mich-Page: `ProfilePage` — Pflicht-Eigenschaft `mainEntity` =
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
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntity: PERSON,
  };
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
