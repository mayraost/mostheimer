# AGENTS.md

## Projekt-Übersicht

**mostheimer** – Next.js 16 + Payload CMS v4 Anwendung mit Mehrsprachigkeit (EN/DE), Tailwind CSS v4 und TypeScript.

## Tech Stack

| Kategorie    | Technologie                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16.4.5 (stable) – App Router, Turbopack                                                                                                                                                                |
| Sprache      | TypeScript 6.0.3 (exakt gepinnt, strict mode) – kanonisch/Build-Autorität; natives TS 7.0.2 als `@typescript/native`-Alias-DevDep für `npm run typecheck` (Go-Compiler, 8–12× schnellerer Advisory-Typecheck)  |
| CMS          | Payload CMS 4.0.0-beta.7 mit Lexical Rich Text (alle `@payloadcms/*` + `payload` exakt auf `4.0.0-beta.7`)                                                                                                     |
| Datenbank    | PostgreSQL (zentrale geteilte coolify-postgres; SQLite entfernt; lokale Dev ebenfalls zentrale Instanz `~/workspace/coolify-postgres` → `DATABASE_URL=postgresql://mostheimer:<pw>@localhost:5432/mostheimer`) |
| Styling      | Tailwind CSS v4                                                                                                                                                                                                |
| Icons        | Lucide React                                                                                                                                                                                                   |
| Node-Version | >= 26 (engine in `package.json`), npm ^11                                                                                                                                                                      |

## Befehle

```bash
npm run dev            # Entwicklungsserver (localhost:3000)
npm run build          # Produktionsbuild
npm start              # Produktionsserver
npm run lint           # ESLint prüfen
npm run lint:fix       # ESLint-Fehler automatisch beheben
npm run typecheck      # Fast-Typecheck mit nativem TS 7 (Advisory; Build/CI bleiben TS 6)
npm run generate:types # Payload CMS TypeScript-Typen generieren
```

## Umgebungsvariablen

| Variable             | Beschreibung                                                                                                                                       | Standard |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `PAYLOAD_SECRET`     | Geheimschlüssel für Payload CMS (Fallback 'ABC' nur lokal – in Coolify zwingend setzen)                                                            | `''`     |
| `APP_PORT`           | Published Host-Port (Compose)                                                                                                                      | `3300`   |
| `DATABASE_URL`       | Zentrale geteilte Postgres-Instanz (kein Default mehr – Projekte ohne `DATABASE_URL` scheitern bewusst am Connect)                                 | –        |
| `NEXT_PUBLIC_GTM_ID` | Google-Tag-Manager-Container-ID (`GTM-XXXXXXX`). Leer = kein Container; Banner/Consent Mode laufen trotzdem. **Build-Time-Variable** (siehe unten) | `''`     |

### `NEXT_PUBLIC_GTM_ID` — Build-Time-Falle (Gegenteil der Secret-Härtung)

`NEXT_PUBLIC_*`-Variablen inlined Next.js **zur Build-Zeit** in das JS-Bundle
(kein Runtime-Read im Browser). Deshalb gilt für `NEXT_PUBLIC_GTM_ID` genau
das umgekehrte Coolify-Flag wie für die Secrets:

| Env                  | Coolify `is_buildtime` | Grund                                                                                                                                |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PAYLOAD_SECRET`     | **`false`**            | Secret darf NICHT im Build-ARG-Layer landen (`docker history`)                                                                       |
| `DATABASE_URL`       | **`false`**            | dito (enthält Passwort)                                                                                                              |
| `NEXT_PUBLIC_GTM_ID` | **`true`**             | unbedenklich öffentlich, MUSS aber beim Build vorhanden sein — mit `false` bleibt die ID leer und das Image lädt nie einen Container |

Merke: eine Änderung von `NEXT_PUBLIC_GTM_ID` in Coolify wirkt **erst nach
einem Rebuild** (Deployment neu auslösen), nicht durch einen Container-Restart.

## Cookie-Consent & Google Tag Manager (Stand 05.11.2026)

- **Consent Mode v2 als `<head>`-Bootstrap:** `ConsentBootstrapScript`
  (`src/lib/consent/ConsentBootstrapScript.tsx`) ist eine Server-Komponente im
  `<head>` des `[locale]`-Layouts, VOR jedem Container-Script. Es pusht
  `gtag('consent','default', …)` mit `ad_storage`/`ad_user_data`/
  `ad_personalization`/`analytics_storage` = `denied`, `functionality_storage`/
  `security_storage` = `granted`, `wait_for_update: 500` und schiebt bei
  wiederkehrenden Besuchern sofort ein `consent`/`update` aus `localStorage`
  nach. Reihenfolgekritisch: ein Tag, der vor `default` feuert, wertet als
  `granted`. Der Container lädt erst nach `load` oder erster Interaktion
  (`src/lib/consent/gtm.ts`) — nie im kritischen Pfad.
- **Storage-Key:** `mayraostheimer.consent.v1` (`{ analytics, marketing, decidedAt, version: 1 }`),
  ausschließlich browser-lokal, kein Server-Roundtrip. Parsing ist defensiv:
  kaputtes/fremdes Shape = „nicht entschieden" → Banner erscheint wieder.
  Inline-Bootstrap und Client nutzen dieselbe Funktion (`parseStoredConsent.toString()`),
  damit kein Drift entsteht.
  - **Rename 05.11.2026 (`mosthi.consent.v1` → `mayraostheimer.consent.v1`) BEWUSST
    OHNE Migration:** der alte Key wird nie gelesen, sondern beim ersten Read
    gelöscht (`LEGACY_CONSENT_STORAGE_KEYS` in `src/lib/consent/consent.ts`).
    Konsequenz: **jeder Bestandsbesucher sieht den Banner erneut und entscheidet neu**.
    Das ist die gewollte Semantik (Consent eines alten Brands still weiterzuverwenden
    wäre der Fehler). Der DOM-Event `mosthi:consent:open` bleibt intern unverändert —
    er ist kein persistierter Zustand.
- **Banner** (`src/components/consent/CookieConsent.tsx`): drei gleich
  gewichtete Aktionen (alle akzeptieren / nur notwendige / Auswahl speichern),
  echte `<input type="checkbox">`, `role="dialog"` + `aria-modal`, Focus-Trap,
  Focus-Restore, Esc fokussiert „Nur notwendige" und schließt NICHT (kein
  stilles Consent). `position: fixed` + Mount via `useSyncExternalStore` →
  kein CLS. Texte kommen aus dem Translations-Global (`cookies`-Gruppe), nur
  mit Fallback, nie als primäre Quelle.
- **Wiederöffnen:** Footer-Link „Cookie-Einstellungen"
  (`ConsentSettingsLink` → `window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))`)
  spiegelt den gespeicherten Zustand in die Toggles.
- **CSP:** `script-src`/`frame-src` erlauben `https://www.googletagmanager.com`;
  `connect-src` (`*.google-analytics.com`, `analytics.google.com`) ist Pflicht —
  ohne sie greift `default-src 'self'` und GTM-Beacons werden geblockt.
  `object-src`/`base-uri`/`form-action`/`frame-ancestors` bleiben unverändert
  strikt.

## Projektstruktur

```
src/
  app/
    (frontend)/
      [locale]/
        [[...slug]]/  # Dynamische Seiten-Route
        settings/     # Einstellungsseite
        layout.tsx    # Locale-Layout
    (payload)/
      admin/          # Payload CMS Admin-Panel
        importMap.js  # Generierte Import Map
      api/            # Payload REST-API-Route
      layout.tsx      # Admin-Layout
    api/
      health/         # Healthcheck-Route ({status:'ok'}, force-dynamic)
    globals.css       # Tailwind CSS v4 Design Tokens & globale Styles
  cms/
    blocks/           # Payload CMS Block-Definitionen (CallToAction, FeatureGrid, Hero, ImageText, RichText)
    cache/
      frontend/       # Datencache-Layer: constants/utils/queries/revalidate/clearCaches (Server Action)/frontendCache.ts (Barrel)
    collections/      # Collections: Media, Pages, Users
    globals/          # Globals: Navigation, SiteSettings, Translations, NotFound
    admin/
      views/          # Custom-Admin-Views (CacheClearView: /admin/cache-clear)
      components/     # Admin-Nav-Components (CacheClearNavLink)
  components/
    blocks/           # Block-Komponenten (CallToActionBlock, FeatureGridBlock, HeroBlock, ImageTextBlock, RichTextBlock, Icon)
    blocks.tsx        # Block-Dispatcher-Komponente
    Header.tsx        # Site-Header
    Logo.tsx          # Logo-Komponente
    SettingsProvider.tsx      # Theme/Schriftgröße/Animations-Settings (Client)
    TranslationsProvider.tsx  # i18n-Kontext (Client)
    TypingHeading.tsx         # Tipp-Animation-Komponente (Client)
  envConfig.ts        # Zod-validierte Umgebungsvariablen
  payload-types.ts    # Generierte Payload-Typen (nicht manuell bearbeiten)
  payload.config.ts   # Payload CMS Konfiguration
  proxy.ts            # Proxy-Hilfsfunktionen
  public/             # Statische Assets (SVGs)
tests/
  e2e/                # Playwright E2E-Tests (admin, frontend)
  int/                # Integrationstests (API)
  helpers/            # Test-Hilfsfunktionen (login, seedUser)
next.config.ts        # Next.js Konfiguration
tsconfig.json         # TypeScript-Konfiguration
eslint.config.mjs     # ESLint Flat Config
vitest.config.mts     # Vitest-Konfiguration
playwright.config.ts  # Playwright-Konfiguration
docker-compose.yml    # Coolify-Deployment (app + postgres)
Dockerfile            # Standalone-Produktionsimage mit HEALTHCHECK
```

## Code-Konventionen

### TypeScript

- **Strict mode** ist aktiv – keine impliziten `any`-Typen
- **`any` vermeiden**: Immer konkrete Typen oder `unknown` verwenden; niemals auf `any` ausweichen
- Type Imports explizit kennzeichnen: `import type { Foo } from '...'`
- Payload-generierte Typen aus `payload-types.ts` verwenden

### Importe & Aliase

```typescript
import { Header } from '@/components/Header'; // Root-Alias
import type { Page } from '@payload-config'; // Payload-Config-Alias
```

### React-Komponenten

- Client-Komponenten mit `'use client'` markieren
- Funktionale Komponenten mit expliziten Prop-Typen:
  ```typescript
  export function Header({ locale }: { locale: string }) { ... }
  ```

### Datei-Benennung

- Komponenten: `PascalCase.tsx`
- Utilities/Config: `camelCase.ts`
- Blöcke: `HeroBlock.tsx`, `FeatureGridBlock.tsx`

### Prettier

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## ESLint-Regeln

- Konfiguration: Flat Config (`eslint.config.mjs`) mit ESLint v10
- Enthält: Next.js Core Web Vitals, TypeScript, Prettier
- **`eslint-disable`-Kommentare vermeiden**: Stattdessen den Code so anpassen, dass er den Regeln entspricht
- Nach **jeder Änderung** `npm run lint:fix` ausführen

## Lokalisierung

- Sprachen: Englisch (`en`), Deutsch (`de`)
- Standard: `en` mit Fallback aktiviert
- Routing: `/{locale}/[...slug]`
- Middleware erkennt Sprache automatisch via `accept-language`-Header

## Payload CMS (v4)

### Kernprinzipien

1. **TypeScript-First** – Immer korrekte Typen aus Payload verwenden
2. **Sicherheit** – Zugriffskontrollen konsequent implementieren (siehe unten)
3. **Typen generieren** – Nach Schema-Änderungen immer `generate:types` ausführen
4. **Transaction Safety** – In Hooks immer `req` an verschachtelte Operationen übergeben
5. **Local API** (seit 4.0.0-beta.6) – enforces Access Control per Default (`overrideAccess` default `false`) — für bewusste administrative Bypasses explizit `overrideAccess: true` setzen
6. **Rollen prüfen** – Sicherstellen, dass Rollen existieren, bevor Access Controls auf Collections/Globals angewendet werden

### Payload 4 spezifika (vs. v3)

- Top-level `sharp`-Config-Option entfernt → `sharpTransformer` aus `@payloadcms/transformer-sharp` über `upload.transformers` einbinden
- `upload.imageSizes` / `formatOptions` entfernt → konsolidiert in `sharpTransformer`-Varianten
- Admin-UI-Imports aus `@payloadcms/ui`
- Env-Prefix: `PAYLOAD_PUBLIC_*` → `NEXT_PUBLIC_*`

### Code-Validierung

- Nach Code-Änderungen TypeScript prüfen: `tsc --noEmit`
- Nach Erstellen oder Ändern von Komponenten Import Maps neu generieren: `payload generate:importmap`

### Collections

| Collection | Beschreibung             |
| ---------- | ------------------------ |
| `users`    | Authentifizierung        |
| `media`    | Asset-Verwaltung         |
| `pages`    | Dynamische Seiteninhalte |

### Globals

| Global         | Beschreibung                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `navigation`   | Seitennavigation                                                                                                          |
| `siteSettings` | Globale Einstellungen                                                                                                     |
| `translations` | Mehrsprachige Texte/Labels (Felder `localized: true` → en/de)                                                             |
| `not-found`    | 404-Inhalte (title/message/buttonLabel/buttonLink, localized) – gerendert von `src/app/(frontend)/[locale]/not-found.tsx` |

### Content Blocks

- `HeroBlock` – Hero-Bereich mit Tipp-Animation; Felder `showStackBadge` (Stack-Badge-Zeile über dem Heading), `ctaLabel/ctaLink` (Primary-Pill) und `ctaLabel2/ctaLink2` (Ghost-Pill) – Pillen nur bei Label+Link
- `RichTextBlock` – echter Lexical-Renderer via `RichText` aus `@payloadcms/richtext-lexical/react` (kein raw-JSON mehr)
- `SkillsetBlock` – Skill-Karten (Items: name, level als **Freitext-Badge** — bewusst kein Skill-Balken, description, iconName-Select mit leerer „Kein Icon"-Option, highlight); Block-CTA nur Label+Link; Featured-Sektion auf Home + Wiederverwendung je Kategorie auf `/skills`. Lucide-Gotcha: `Figma` (Trademark-Removal) und `FileCode2` existieren 2026 nicht mehr → `PenTool`/`FileCode`; iconName leer → gar kein Icon, kein CircleHelp-Fallback im SkillsetBlock.
- `BentoGridBlock` – Bento-Raster (4-Spalten, `featured` = 2 Spalten); Items: highlight/title/description/iconName/ctaLabel/ctaLink/featured (aktive Tile CTA nur mit Link, Label `… →`)
- `StatusBlock` – Status-Karte (badgeLabel/title/description) mit `networkTopics`-Array als Tag-Pillen
- `TechSectionBlock` – Deep-Dive-Sektion (sectionLabel/heading/body, Absätze via `\n\n`) mit `keyFacts`-dl (label/value)
- `CtaBlock` – Call-to-Action; Button-Pill nur rendern wenn `buttonLabel && buttonLink` gesetzt (kein leerer Pill)
- `FeatureGridBlock` – Feature-Raster
- `ImageTextBlock` – Bild + Text

### Typen generieren

Nach Änderungen an Collections oder Globals immer Typen neu generieren:

```bash
npm run generate:types
```

### ⚠️ Kritische Sicherheitsmuster

#### 1. Local API – Zugriffskontrolle

```typescript
// ❌ SICHERHEITSLÜCKE: Zugriffskontrolle wird umgangen
await payload.find({ collection: 'posts', user: someUser });

// ✅ SICHER: Benutzerberechtigungen werden erzwungen
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false });

// ✅ Administrative Operation (bewusstes Bypass)
await payload.find({ collection: 'posts' }); // kein user, overrideAccess defaults to true
```

**Regel**: Wenn `user` an die Local API übergeben wird, IMMER `overrideAccess: false` setzen.

#### 2. Transaction Safety in Hooks

```typescript
// ❌ DATENVERLUST-RISIKO: Separate Transaktion
async ({ doc, req }) => {
  await req.payload.create({ collection: 'audit-log', data: { docId: doc.id } });
  // Fehlendes req = separate Transaktion!
};

// ✅ ATOMAR: Gleiche Transaktion
async ({ doc, req }) => {
  await req.payload.create({ collection: 'audit-log', data: { docId: doc.id }, req });
};
```

**Regel**: In Hooks immer `req` an verschachtelte Operationen übergeben.

#### 3. Infinite Hook Loops verhindern

```typescript
// ❌ ENDLOSSCHLEIFE
afterChange: [
  async ({ doc, req }) => {
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { views: doc.views + 1 },
      req,
    });
    // Löst afterChange erneut aus!
  },
];

// ✅ SICHER: Context-Flag verwenden
afterChange: [
  async ({ doc, req, context }) => {
    if (context.skipHooks) return;
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { views: doc.views + 1 },
      context: { skipHooks: true },
      req,
    });
  },
];
```

### Zugriffskontrollen

```typescript
import type { Access } from 'payload';

// Boolean-Return
export const authenticated: Access = ({ req: { user } }) => Boolean(user);

// Query-Constraint (Row-Level Security)
export const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user?.roles?.includes('admin')) return true;
  return { author: { equals: user.id } };
};
```

**Wichtig**: Field-Level Access gibt nur `boolean` zurück (keine Query-Constraints).

### Queries – Local API

```typescript
import { getPayload } from 'payload';
import config from '@payload-config';

const payload = await getPayload({ config });

// Suchen
const posts = await payload.find({
  collection: 'posts',
  where: { and: [{ status: { equals: 'published' } }] },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
});

// Erstellen / Aktualisieren / Löschen
await payload.create({ collection: 'posts', data: { title: 'Neu' } });
await payload.update({ collection: 'posts', id: '123', data: { status: 'published' } });
await payload.delete({ collection: 'posts', id: '123' });
```

### Hooks

- `beforeValidate` – Daten formatieren
- `beforeChange` – Business-Logik vor dem Speichern
- `afterChange` – Seiteneffekte (z. B. Notifications) – Context-Flags für Loop-Vermeidung
- `afterRead` – Berechnete Felder
- `beforeDelete` – Kaskadierendes Löschen

### Komponenten

- Alle Admin-Komponenten sind standardmäßig **Server Components**
- Client Components benötigen `'use client'` und können Hooks wie `useAuth`, `useForm`, `useField` aus `@payloadcms/ui` verwenden
- Komponenten werden über **Dateipfade** (nicht direkte Imports) in der Config definiert
- Nach Erstellen/Ändern von Komponenten Import Map neu generieren

### Best Practices

**Sicherheit:**

- `overrideAccess: false` immer setzen wenn `user` an Local API übergeben wird
- Standardmäßig restriktive Zugriffskontrollen, schrittweise öffnen
- `saveToJWT: true` für Rollen verwenden (vermeidet Datenbank-Lookups)

**Performance:**

- Häufig abgefragte Felder indexieren
- `select` nutzen um zurückgegebene Felder zu begrenzen
- `depth` auf Relationships begrenzen (Standard: 2; `0` für IDs only)
- Query-Constraints statt async-Operationen in Access-Funktionen bevorzugen

**Datenintegrität:**

- `req` immer an verschachtelte Operationen in Hooks übergeben
- Context-Flags für Hook-Loop-Vermeidung nutzen

### Häufige Fehlerquellen

1. **Local API Default**: Access Control wird bypassed, solange nicht `overrideAccess: false`
2. **Transaction Safety**: Fehlendes `req` in verschachtelten Operationen bricht Atomarität
3. **Hook Loops**: Operationen in Hooks können dieselben Hooks erneut auslösen
4. **Field Access**: Kann keine Query-Constraints zurückgeben, nur boolean
5. **Relationship Depth**: Standard ist 2; für reine IDs `depth: 0` setzen
6. **Draft Status**: `_status`-Feld wird automatisch eingefügt wenn Drafts aktiviert
7. **Typen**: Werden erst nach `generate:types` aktualisiert

## Payload-MCP (CMS-Zugriff)

- **Verbindliche Regel (verschärft 05.11.2026): Content wird AUSSCHLIESSLICH über den Payload-MCP gesetzt.** Jede Inhaltsänderung an Pages, Globals (Navigation, SiteSettings, Translations, NotFound) und Media läuft über den MCP-Server (`payload` lokal, `payload-prod` für Produktion) in der Projekt-`opencode.json`.
- **Verboten für Content** (nicht mehr verwenden, auch nicht „nur schnell"):
  - Seed-Routen — die Routen `/api/seed-home` und `/api/seed-globals` wurden am 05.11.2026 **gelöscht** und kehren nicht zurück; der MCP ersetzt sie vollständig.
  - REST-Writes per Skript (`PATCH /api/pages/<id>`, `curl` gegen die API)
  - Local-API-One-Shots (`payload.create`/`update` in `tsx`-Scripts)
  - direkte SQL-Writes gegen Postgres
- **Erlaubte Ausnahmen** (explizit, damit die Regel nicht überdehnt wird):
  - Migrationen (`npx payload migrate*`) — Schema-Infrastruktur, kein Content
  - Build-Artefakte (`generate:types`, `generate:importmap`, `generate:css`)
  - Tests, die eine **Wegwerf**-Datenbank befüllen
  - Der Payload-Admin selbst (menschliche Redaktion)
- **Warum:** Der MCP läuft durch dieselben Payload-Hooks wie der Admin (Validierung, `overrideAccess`-Semantik, Cache-Invalidierung inkl. Edge-Purge). Skripte und Seed-Routen umgehen genau diese Kette und haben in der Vergangenheit Draft-/Published- und Cache-Zustände inkonsistent gemacht (siehe „Gelernte Fehler": Draft-Default bei Seeds, verpasster OSR-Flush).
- **Server-Bindings** (Projekt-`opencode.json`, beide `type: remote`, Header `Authorization: users API-Key {file:...}` — NICHT Bearer, Beta.6 authentifiziert Payload-native User-API-Keys):
  - `payload` (lokal): `http://localhost:3000/api/mcp`, Secret-File `~/.config/opencode/.secrets/payload-mcp-api-key`
  - `payload-prod` (Produktion): `https://mostheimer.de/api/mcp` (kanonische Domain; die Alt-Domains antworten nur noch mit 301), Secret-File `~/.config/opencode/.secrets/payload-mcp-prod-api-key` (nur Pfad-Referenz — Werte nie lesen/printen)
- **Plugin:** `@payloadcms/plugin-mcp` exakt `4.0.0-beta.7` (in `src/payload.config.ts`); Scope: alle Built-in-Tools ON bis auf `delete@media`; `users` read-only (`find` via `overrideResponse` redigiert `hash`/`salt`). Machtkontrolle = Permissions des Key-Owner-Users (keine per-Key-Toggles in Beta.6).
- **Key-Erzwungene Reveal-Kette:** Key = `useAPIKey` am Owner-User (Users-Collection, `reveal: true`); Migration `20261104_165445_add_mcp_api_keys` legt `api_key`/`api_key_index`/`api_key_last4` an; Prod-Key in `~/.config/opencode/.secrets/payload-mcp-prod-api-key` (chmod 600), Secret-Files nie ins Repo.

### MCP-Write-Muster (aus der Praxis, 07.11.2026)

- **Lokalisierte Felder sind `required: true` — ein Teil-Update wird abgelehnt.** Ein
  `updateGlobal`/`updateDocument` mit nur z. B. `{settings: {themeDescription}}` antwortet
  200, schreibt aber nichts (bzw. scheitert an der Validierung). Muster: **vollständigen
  Datensatz lesen → im Speicher ändern → komplett zurückschreiben** (ohne `id`,
  `createdBy`/`updatedBy`, `updatedAt`, `createdAt`, `globalType`). Danach **re-read**
  und den geänderten Wert prüfen; „updated successfully" ist kein Beweis.
- Lokale Antworten des MCP kommen als Textblock (`Document from collection "pages": {...}`
  bzw. ```json-Fences) — vor dem Weiterverarbeiten auf das JSON-Objekt zuschneiden
  (erste `{` bis letzte `}`).
- Seiten-Updates brauchen `_status: 'published'` + `draft: false`, sonst kippt das
  Dokument in den Draft (siehe Abschnitt „Produktive Payload-Writes").

## Security: `users` darf nie öffentlich ausgeliefert werden (Stand 07.11.2026)

**Symptom (Prod, gemeldet):** `GET /api/pages?depth=1` lieferte über die Relationen
`createdBy`/`updatedBy` vollständige `users`-Dokumente (E-Mail, `apiKey*`, komplettes
`sessions`-Array). `/api/users` antwortete zwar schon 403, aber **Payloads Relation-Populate
umging den Collection-Access** — der Leak saß also in der _populierten_ Relation, nicht im
Endpunkt.

**Zwei unabhängige Schichten (beide nötig, beide drin):**

1. **Users-Collection** (`src/cms/collections/Users.ts`): `access.read` = nur mit Session;
   zusätzlich `defaultPopulate: { name: true }`, damit ein Populate selbst dann nur den
   Anzeigenamen enthält, wenn der Zugriff erlaubt ist.
2. **Authorship-Felder** (`src/cms/security/authorship.ts` → `protectedAuthorshipFields()`):
   `createdBy`/`updatedBy` werden via `createCreatedByField`/`createUpdatedByField`
   (Export aus `payload`) mit `access.read: Boolean(user)` **überschrieben**. Kein
   `authorship: false`! Das würde die Stamping-Hooks verlieren.
   - **Warum manuell statt weglassen:** Payloads `sanitize` **injiziert** die Felder
     automatisch, sobald irgendeine Collection Auth hat (`payload/dist/collections/config/sanitize.js`,
     `authorship` default `{createdBy: true, updatedBy: true}`) — bei `users`, `media`
     und `pages` waren sie also ohne eigenes Zutun da. Weglassen reicht nicht, das Feld
     muss mit Access-Override **deklariert** werden (Spread oder als Feld-Eintrag, danach
     backfillt `sanitize` nur noch `relationTo`).
   - `protectedAuthorshipFields()` liegt in **allen** Collections (`users`, `media`,
     `pages`) und **allen** Globals (`navigation`, `not-found`, `site-settings`,
     `translations`) am Ende des `fields`-Arrays. **Neue Collection/Global → aufnehmen**,
     sonst leakt der Author wieder.
   - Keine Migration nötig (kein Schema-/Spalten-Change, reine Access-/Admin-Config).

**Verifikation (ohne Login-Cookie):** `GET /api/pages?depth=2` → `createdBy`/`updatedBy`
fehlen komplett; `GET /api/users` → 403; `GET /api/globals/translations?depth=1` → kein
`createdBy`/`updatedBy`. Am Origin prüfen (`ssh coolify "curl -s http://127.0.0.1:3300/..."`
bzw. lokaler Standalone), weil der Edge-Cache alte API-Antworten nicht kennt — API ist
`no-store`.

## Theming & UI

### Theme-System

- Light / Dark / System-Theme via CSS Custom Properties (`globals.css`)
- Font-Size-Einstellung (normal/large) via `html.large-font`
- Animations-Toggle (on/off/system) via `body.no-animations`
- User-Einstellungen werden in `localStorage` gespeichert
- Theme-Klassen `.dark` / `.light` werden auf `<html>` gesetzt
- **Default = dark** (Umbau 04.11.2026, „Dark Industrial"): `SettingsProvider`
  startet mit `DEFAULT_THEME='dark'`; ein Pre-Hydration-`<script>`
  (`THEME_BOOTSTRAP` im `[locale]/layout.tsx`) setzt die Klasse vor dem
  ersten Paint (kein Flash). `<html className="dark">` ist der SSR-Default.
- **`:`root`ist IMMER dunkel** — nur`.light`schaltet hell (auch bei
light-preferring OS gilt Dark als App-Default). Kein`@media (prefers-color-scheme: …)`-Token-Block mehr.
- **Token-Overrides in `.dark`/`.light` NICHT mit `!important`** — sonst
  erben `.dark`-Kinder per Kaskade den falschen Fallback-Wert. Ohne
  `!important` gewinnt die Klassen-Spezifität (0,1,0) korrekt.

### Design Tokens (`src/app/globals.css`)

Alle Tokens sind als Tailwind CSS v4 `@theme`-Variablen definiert und stehen als Utilities zur Verfügung (z. B. `bg-primary`, `text-muted-foreground`).

#### Primary (Rose/Pink)

| Token                | Light     | Dark      | Verwendung                        |
| -------------------- | --------- | --------- | --------------------------------- |
| `primary`            | `#C2185B` | `#F06292` | Brand-Farbe, CTAs, Akzente        |
| `primary-hover`      | `#AD1457` | `#EC407A` | Hover-Zustand auf Primary-Flächen |
| `primary-foreground` | `#ffffff` | `#ffffff` | Text auf Primary-Hintergrund      |
| `primary-muted`      | `#FCE4EC` | `#3D1A26` | Subtile Primary-Hintergründe      |

#### Secondary (Violet)

| Token                  | Light     | Dark      | Verwendung                     |
| ---------------------- | --------- | --------- | ------------------------------ |
| `secondary`            | `#6D28D9` | `#A78BFA` | Sekundäre Aktionen, Badges     |
| `secondary-hover`      | `#5B21B6` | `#8B5CF6` | Hover auf Secondary            |
| `secondary-foreground` | `#ffffff` | `#ffffff` | Text auf Secondary-Hintergrund |

#### Accent (Amber)

| Token               | Light     | Dark      | Verwendung                  |
| ------------------- | --------- | --------- | --------------------------- |
| `accent`            | `#F59E0B` | `#FBBF24` | Highlights, Tags, Badges    |
| `accent-foreground` | `#1A1A1A` | `#1A1A1A` | Text auf Accent-Hintergrund |

#### Backgrounds & Surfaces

| Token            | Light     | Dark      | Verwendung                        |
| ---------------- | --------- | --------- | --------------------------------- |
| `background`     | `#FFFFFF` | `#121212` | Seitenhintergrund                 |
| `surface`        | `#F8F8F8` | `#1E1E1E` | Cards, Panels                     |
| `surface-raised` | `#F0F0F0` | `#252525` | Elevated Cards, Modals            |
| `header`         | `#F8F8F8` | `#1E1E1E` | Header-Hintergrund (legacy alias) |

#### Text

| Token                 | Light     | Dark      | Verwendung                   |
| --------------------- | --------- | --------- | ---------------------------- |
| `foreground` / `text` | `#1A1A1A` | `#EDEDED` | Primärer Fließtext           |
| `muted-foreground`    | `#6B6B6B` | `#9E9E9E` | Sekundärer Text, Platzhalter |

#### Border

| Token           | Light     | Dark      | Verwendung           |
| --------------- | --------- | --------- | -------------------- |
| `border`        | `#E5E5E5` | `#333333` | Standard-Trennlinien |
| `border-strong` | `#CCCCCC` | `#444444` | Betonte Rahmen       |

#### Feedback

| Token     | Light     | Dark      |
| --------- | --------- | --------- |
| `success` | `#16A34A` | `#4ADE80` |
| `warning` | `#D97706` | `#FBBF24` |
| `error`   | `#DC2626` | `#F87171` |
| `info`    | `#2563EB` | `#60A5FA` |

Jeder Feedback-Token hat einen passenden `*-foreground`-Token für Text auf dem jeweiligen Hintergrund.

### Nutzung in Komponenten

```tsx
// Hintergründe
<div className="bg-surface border border-border rounded-lg">
<div className="bg-primary text-primary-foreground">

// Text
<p className="text-foreground">Primärtext</p>
<p className="text-muted-foreground">Sekundärtext</p>

// Feedback
<span className="bg-error text-error-foreground">Fehler</span>
<span className="bg-success text-success-foreground">Erfolg</span>

// Glow-Effekte (Primary-Farbe hardcoded für drop-shadow/text-shadow)
className="drop-shadow-[0_0_6px_rgba(194,24,91,0.4)]"         // Light
className="[text-shadow:0_0_10px_rgba(194,24,91,0.25)]"        // Light
```

> **Hinweis:** Für `drop-shadow` und `text-shadow` müssen die RGBA-Werte der Primary-Farbe hardcoded werden (`194,24,91` für Light, `240,98,146` für Dark), da Tailwind diese nicht automatisch interpoliert.

## Deployment (Coolify)

- Deployment via **Docker Compose** auf Coolify (`docker-compose.yml` im Repo-Root; **nicht Vercel**)
- Service: nur `app` (Next.js Standalone-Build) – eigener Postgres-Service entfernt; DB ist die **zentrale geteilte `coolify-postgres`-Instanz** (Coolify-Host, SOP 31.10.2026): externes `coolify-postgres-net` im Compose deklariert, Verbindung via Hostname `coolify-postgres:5432` aus `DATABASE_URL` (Coolify-App-Env, NICHT im Compose)
- Published Host-Port: `${APP_PORT:-3300}:3000` – `APP_PORT=3300` in Coolify setzen (Port-Konflikte mit anderen Stacks vermeiden)
- **Hauptdomain = `https://mostheimer.de` (seit 05.11.2026).** `docker_compose_domains` der App enthält **ausschließlich** `{"app":{"name":"app","domain":"https://mostheimer.de","redirect":"both"}}`; der Coolify-Proxy (Traefik) routet über den **published Host-Port**, nicht über das Compose-Network. Die Alt-Domains (`mosthi.de`, `www.mosthi.de`, `www.mostheimer.de`) liefern **301 auf `https://mostheimer.de` (Pfad + Query erhalten)** — siehe Abschnitt „Domain-Konsolidierung" unten. `NEXT_PUBLIC_SERVER_URL`/`SERVICE_URL_APP`/`SERVICE_FQDN_APP` zeigen auf `https://mostheimer.de` / `mostheimer.de`.
- **KEIN weiteres `networks:`-Deklarat** ergänzen: einziger externer Netz-Eintrag ist `coolify-postgres-net` (external); alles andere bleibt implizites Projekt-Default-Netz (pro Coolify-Projekt isoliert; DNS-Aliase wie `postgres` kollidieren sonst mit fremden Stacks)
- Env setzen (siehe `.env.example`): `DATABASE_URL` (Coolify-App-Env, zeigt auf coolify-postgres), `PAYLOAD_SECRET`, `APP_PORT`
- Healthcheck: Docker `HEALTHCHECK` im Image trifft `/api/health` (force-dynamic, `{status:'ok'}`)
- Media-Uploads (Payload `media`) landen in `/app/public/media` und persistieren im Named Volume `media-data` (überleben Re-Deploys)
- Compose-Header im Repo dokumentiert den genauen Coolify-Setup-Ablauf (Resource anlegen, Compose-File angeben, Env, Domain, No-Networks-Regel)
- **Fertig (Stand 31.10.2026):** zentrale `coolify-postgres` live (`DATABASE_URL` Coolify-App-Env); Migration `20261031_224616` per `prodMigrations` auf dem postgres-Adapter (Migrate-on-Connect beim ersten Request) angelaufen; Content nativ (bento/status/tech, hero CTA2, NotFound) aus dem Vercel-DB-Dump importiert; Image 363 MB; `/sitemap.xml` `force-dynamic` (Build-Container erreicht die DB nicht)
- **Build-ARG-Secret-Leak-Schutz (01.11.2026):** Coolify injiziert ALLE App-Envs als Build-ARGs (unabhängig von Compose-Refs) → Secrets lesenbar via `docker history`. Secret-Envs (`PAYLOAD_SECRET`, `DATABASE_URL`) in Coolify mit `is_buildtime: false` (REST `PATCH /applications/{uuid}/envs`) gesetzt; Compose-`${...}`-Referenzen darauf entfernt (Compose-Headerlinien 18–19). Deployment healthy. Presence-Check nach jedem Deploy: `docker history <image> | grep -i 'SECRET\|DATABASE'` — Status/Ja-Nein only, nie Werte (Details „Gelernte Fehler").
- **Migration-Schema-Snapshots:** `payload migrate:create` diffed gegen die neueste `*.json`-Datei in `src/migrations/` (Fallback: Adapter-Default-Schema) und schreibt pro Migration einen eigenen Snapshot (`<name>.ts` + `<name>.json`). Beide committen — fehlt der Snapshot, generiert `migrate:create` dieselben Diffs erneut (bekannter Fall: SiteSettings-lokalisierte Felder → `site_settings_locales`/`_site_settings_v_locales`, Migration `20261101_103630_fix_site_settings_locales`). Handgeschriebene Migrationen zusätzlich mit Guards (IF NOT EXISTS, FK-Check via pg_constraint, Daten-Kopie vor Spalten-Drop).

## Wording-Guardrail: Senior-Positionierung & Markenname (Stand 05.11.2026)

**Eine Quelle** für verbotene/pflichtige Formulierungen: `src/cms/aeo/constraints.ts`.

- `BANNED_WORDING_PATTERNS` — `staff`/`principal` als eigenständige Wörter
  (Word-Boundary, case-insensitive; fängt `Staff-Level`, `staff engineer`,
  `Principal`) plus der alte Markenname **als sichtbares Label**.
- `REQUIRED_WORDING` = `['Senior']`; `hasRequiredWording(text)` prüft ihn.
- `findWordingViolations(text): string[]` — pure, gibt nur die Treffer zurück
  (kein Satz-Kontext), nutzbar aus Hook **und** Test.

**Marken-Ausnahmen sind Absicht, nicht Schlamperei** (stehen als Lookahead/
Lookbehind im Regex und sind in `tests/int/wording.int.spec.ts` festgenagelt):

| Ausnahme                                             | Warum bleibt sie                                                                                                                                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mosthi.consent.v1`                                  | **Legacy**-Storage-Key (nur noch Cleanup): live ist `mayraostheimer.consent.v1`; der alte Key wird nie geparst, nur beim ersten Read gelöscht (`LEGACY_CONSENT_STORAGE_KEYS`) — Literal muss also bleiben |
| `mosthi:consent:open`                                | DOM-Event-Name (Footer-Trigger ↔ Banner) — Identifikator, keine Copy; Umbenennen wäre Event-Drift, kein Consent-Verlust                                                                                   |
| `https://mosthi.de`, `https://mostheimer.de`, `www.` | Domain/Infrastruktur (Canonical-Host, Purge-Origins der Content-Zone)                                                                                                                                     |
| `mail@mostheimer.de`                                 | echte Mailbox im Impressum                                                                                                                                                                                |

### `beforeValidate`-Hook (Editor-Feedback)

`src/cms/wording/beforeValidateWordingCheck.ts` → als
`hooks.beforeValidate: [wordingBeforeValidate]` in **`pages`**,
**`translations`**, **`site-settings`** und **`not-found`** registriert (die
Collections/Globals mit sichtbarem Text). Verhalten:

- läuft **vor** Paylods Feld-Validierung, wirft `APIError(msg, 400, null, true)`
  → Meldung erscheint deutsch+englisch im Admin-Toast / REST-Body.
- billig: walkt nur String-Leaves (max. Tiefe 12, Strings ≥ 5 Zeichen), **kein**
  DB-Zugriff, max. 6 Treffer in der Meldung.
- **`autosave` wird übersprungen** — Live Preview schreibt pro Tastendruck; ein
  Blocken mitten im Wort wäre unbrauchbar.
- Hook-Args sind lokal als `WordingHookArgs` deklariert (Payloads `BeforeValidateHook`-
  Default-Generic ist `any` → vermeiden).

Rein Hook-Änderung: **keine** Migration, **kein** `generate:types` nötig.

### Test

`tests/int/wording.int.spec.ts` (vitest, keine DB): matcher inkl. Ausnahmen,
Hook-Verhalten (reject/accept/autosave) und die code-seitigen Identity-Strings —
`PERSON` (`src/components/StructuredData.tsx`, exportiert),
`LLMS_TXT` (`src/cms/aeo/llmsTxt.ts`) und `layoutMetadata`
(`src/app/(frontend)/[locale]/layoutMetadata.ts`, neu ausgelagert aus
`layout.tsx`, **weil** `next/font` unter vitest nicht konstruierbar ist:
`TypeError: Space_Grotesk is not a function`). Jeder dieser Strings: keine
Banned-Wording-Treffer **und** enthält „Senior".

## Domain-Konsolidierung (Stand 05.11.2026)

**Kanonisch ist ausschließlich `https://mostheimer.de` (Apex, ohne `www`).**

| Host                | Verhalten                                      |
| ------------------- | ---------------------------------------------- |
| `mostheimer.de`     | 200 (canonical, wird von der App bedient)      |
| `www.mostheimer.de` | 301 auf `https://mostheimer.de` + Pfad + Query |
| `mosthi.de`         | 301 auf `https://mostheimer.de` + Pfad + Query |
| `www.mosthi.de`     | 301 auf `https://mostheimer.de` + Pfad + Query |

### Mechanismus: host-exakte Traefik-Custom-Datei (KEINE Cloudflare-Redirect-Rule)

Datei auf dem Coolify-Host: `/data/coolify/proxy/dynamic/legacy-host-redirects.yaml`
(Custom-File neben `placeholder-catchall.yaml`; wird von Coolify **nicht**
überschrieben und vom file-provider per `--providers.file.watch=true` sofort geladen).

- Router-Regeln nutzen **ausschließlich exakte Hosts** (`Host(...)` nur mit den
  drei Alt-Hostnamen, nie Wildcard), EntryPoints `http` + `https`, `priority: 200`
  (über den Coolify-Docker-Label-Routern, die Default-Priority 0 haben), TLS via
  `certResolver: letsencrypt`.
- Middleware `redirectRegex` (`permanent: true` = **301**) mit
  `^https?://(www\.)?mosthi\.de/(.*)` → `https://mostheimer.de/${2}` (analog
  `^https?://www\.mostheimer\.de/(.*)` → `https://mostheimer.de/${1}`) —
  **kein** `/${1}`-Verlust: $1 ist der Authority-Teil, $2 der komplette Pfad inkl. Query.
- Service `legacy-host-absorb` (`http://host.docker.internal:3500`) ist ein
  Platzhalter und wird nie angedialt (die Redirect-Middleware antwortet vorher) —
  dadurch braucht die Datei keinen Bezug zur App-Port-Variable.
- **Warum nicht Cloudflare-Redirect-Rules:** eine Zone-Regel in `mosthi.de` würde
  auch `*.mosthi.de`-Hosts treffen (`chat`, `dashboard`, `coolify`, `scobio`,
  `halloween`, `miri` …) bzw. müsste dauerhaft host-exakt gepflegt werden; die
  Traefik-Datei ist app-lokal, versionslos im Infra-Repo dokumentiert und trifft
  ausschließlich die drei exakten Alt-Hosts.

### Nicht anfassen

- `coolify.mosthi.de` (Coolify-UI, `coolify.yaml`, EntryPoint `http`), sowie alle
  anderen `*.mosthi.de`-Apps bleiben unverändert. **Vorsicht mit APEX/DNS:** die
  Zone `mosthi.de` hat weiterhin proxied CNAMEs für Apex + `*` auf den Tunnel
  (Mail: MX/SPF/DMARC bei easyname — unverändert lassen).
- Cloudflare-Zone `mosthi.de` hat `always_use_https=on` (http→https-301 am Edge);
  die Redirect-Ziele bleiben trotzdem hart `https://`, weil der Tunnel TLS terminiert
  (`is_force_https_enabled=false` bei der App).
- **Bestehende Cloudflare-Regel nicht brechen:** in Zone `mosthi.de` liegt im
  Phase `http_request_dynamic_redirect` eine Rule (`37b1fa8281cf49289d35383917b8f0be`),
  die Trailing-Slash-URLs von `mosthi.de`/`mostheimer.de`/`www.mostheimer.de` mit
  **308** auf die Variante ohne Slash leitet. Sie läuft am Edge VOR Traefik; die
  Kombination mit dem 301 ergibt `https://host/de/ → 308 → https://host/de → 301 → https://mostheimer.de/de`.

### Verifikation / Gotchas

- **Cloudflare-Edge-Cache:** Antworten der App-Seiten kommen mit
  `cache-control: public, s-maxage=86400` und werden am Edge gecacht
  (`cf-cache-status: HIT`). Nach dem Umstellen der Domain-Router liefert der Edge
  für alte URLs so lange das **200** aus dem Cache, bis gepurged wird. Fix:
  gezielter Purge der betroffenen Alt-URLs (`POST /zones/{zone}/purge_cache`
  mit `{"files": [...]}` — im MCP `body` als **JSON-String** übergeben).
- **Stale Container während eines laufenden Deploys:** Coolify lässt den alten
  App-Container bis zum Ende des Deploys aktiv; dessen Docker-Labels halten den
  alten `Host(\`mosthi.de\`)`-Router. Nach dem Domain-PATCH greift die
  Traefik-Datei auf dem Host sofort, am Edge erst nach Purge — der alte Container
  wird beim regulären Deploy automatisch ersetzt.
- **Traefik-API ist von außen nicht erreichbar** (`--api.insecure=false`, 8080 nur
  container-intern, Host-curl schlägt fehl) — Router-Debugging nur über
  `docker inspect <container>` (Labels) bzw. Verhalten.

## Frontend-Caching (cacheComponents, Stand 01.11.2026)

Erprobt nach `nextjs-payload-caching`-Skill (yogaraum26/scobio2026-Pattern),
Profil „Docker/Coolify-Build ohne DB":

- `next.config.ts`: `cacheComponents: true`. Öffentliche Routen NICHT prerenderbar
  (Build-Container erreicht die DB nicht) → dynamische Shell:
  `await connection()` (aus `next/server`, Next 16) in `LayoutShell`
  (`[locale]/layout.tsx`) + `<Suspense fallback={LayoutSkeleton}>` — Skeleton
  statisch, kein Datenbezug.
- Datenebene: `src/cms/cache/frontend/` — alle Public-Payload-Reads über
  `'use cache'`-Queries (`cacheTag(CACHE_TAGS.ALL, Domain-Tag, Punkt-Tag)` +
  `cacheLife({ stale: 2592000, revalidate: 300, expire: 2592000 })` = 30-Tage-Stale-Net).
  `draftMode()` KEINS auf Public-Routen. Public Reads: `getCachedPageBySlug`,
  `getCachedSiteSettings/Translations/Navigation/NotFound`, `getCachedAllPages`
  (Sitemap). Tag-Schema: `cms:all`, `cms:pages`, `cms:pages:<slug>`, `cms:sitemap`,
  `cms:global:<slug>`.
- **`LayoutShell` ist auth-frei (seit 05.11.2026):** kein `getPayload()` /
  `payload.auth()` mehr im Layout — der Dokumenten-Shell liest nur
  `'use cache'`-Queries. Wer wieder einen Session-abhängigen Branch dort
  einbaut, macht die Shell pro Besucher dynamisch (Cache-Bypass) und braucht
  dafür einen eigenen Suspense-Boundary + Begründung.
- **Streamed-Shell-Höhe = `min-h-page` (nicht `min-h-screen`):** Skeleton
  (`LayoutSkeleton`) und beide `LayoutShell`-Wurzeln teilen sich die Utility
  `min-h-page` aus `globals.css` (`min-height: max(100dvh, 1400px)`). Grund:
  Skeleton und echte Shell sind ZWEI getrennte Frames; reservieren sie nur
  `100vh`, steht der Footer (`mt-auto`) im Skeleton-Frame am Viewport-Boden und
  springt im nächsten Frame ans Dokumentende. Die Höhe NIE pro Seite
  hartkodieren — die Utility wächst weiter mit dem Inhalt.
- OSR/Invalidierung: Payload-Hooks flusen via `safeRevalidate(tag, 'max')`
  (try/catch-Pflicht, sonst unhandled außerhalb Request-Kontext):
  Pages afterChange/afterDelete → `revalidatePagePathCache` + Slug-Umbenennung
  → alten Pfad mitinvalidieren; Media → `revalidateAllFrontendCmsCaches`;
  Globals → je eigener Tag. `revalidateTag(tag, 'max')` — 2-Arg-Form ist in
  Next 16 verpflichtend (Single-Arg deprecated, TS-Fehler).
- Sitemap: `connection()` statt `export const dynamic = 'force-dynamic'`
  (cacheComponents) + gecachte Query; DB-Fallback bleibt (leere Sitemap statt Crash).
- Manuelles Flush OHNE Publish: Server Action `clearAllFrontendCaches`
  (`src/cms/cache/frontend/clearCaches.ts`, `'use server'`, Auth-Gate via
  `payload.auth({ headers: await headers() })`, jede Payload-Collection =
  berechtigt) + Custom-Admin-View `src/cms/admin/views/CacheClearView.tsx` +
  Nav-Link `CacheClearNavLink` — registriert in `payload.config.ts`
  `admin.components` (`views['cache-clear']`, `actions`), Route
  `/admin/cache-clear`. Server Actions vor API-Routen für Writes
  (AGENTS-GLOBAL-Regel); API-Route nur für externe Caller (Cron/curl) —
  nicht nötig, Hooks decken Publish/Unpublish ab.

### Postgres-only (01.11.2026)

- SQLite komplett entfernt: kein sqliteAdapter/Fallback mehr; `envConfig.dbUrl`
  ohne Default (`DATABASE_URL ?? ''`).
- Zentrale Instanz überall (lokale Dev → `~/workspace/coolify-postgres`, DB/User
  `mostheimer`; Passwort in gitignored `.env` +
  `~/.config/opencode/.secrets/mostheimer-local-db.password`).
- `push: false` am postgresAdapter: Dev-Schema-Push aus → Schemaänderungen
  IMMER via `npx payload migrate:create <name>` (Snapshot-Diff,
  `DATABASE_TYPE=postgresql DATABASE_URL=postgresql://x:x@localhost:5432/x npx
payload migrate:create ...`-Kommando falls generiert) + `npx payload migrate`.
- Learnings: Dev-Push auf Prod-parite-DB → migrate-Prompt-Contamination
  (Payload fragt interaktiv, Server hängt); deshalb DB-Fresh-Reset vor
  Prod-Verifikation und dauerhaft `DATABASE_TYPE` aus dem Projekt entfernt.

## 404-Handling: Proxy entscheidet den Status, Route rendert (Stand 05.11.2026)

**Verantwortlichkeiten strikt getrennt — nicht wieder vermischen:**

| Ebene                                | Aufgabe                                                                                                                                                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/proxy.ts`                       | Locale-Redirect (`/` per Edge-Redirect, Proxy-Fallback Accept-Language), `x-pathname`-Header, **HTTP-Status 404** für unbekannte Slugs via `NextResponse.next({ status: 404 })`. **Kein** Rewrite, **kein** Redirect, **kein** Rendering-Eingriff. |
| `[locale]/[[...slug]]/page.tsx`      | wirft `notFound()` bei fehlendem Slug — bleibt der Auslöser, rendert normal weiter.                                                                                                                                                                |
| `[locale]/[[...slug]]/not-found.tsx` | **fängt** das `notFound()` und rendert die lokalisierte 404-UI (CMS-Global `not-found`, de/en).                                                                                                                                                    |
| `src/proxy-slug-cache.ts`            | In-Memory-Set der published Slugs (`slug`-Spalte only), Single-Flight, TTL + Freshness-Probe, Fail-open.                                                                                                                                           |

**Warum der Status im Proxy gesetzt wird:** mit `cacheComponents` streamt die
`[locale]`-Shell; sobald ein Suspense-Fallback rendert, ist der Status auf 200
fixiert (Next-Docs `file-conventions/loading.md` § "Status codes": „For a 404,
you can check the slug in Proxy, then rewrite it to a not-found route or return
a 404 response. Keep Proxy checks fast, and avoid fetching full content
there."). `notFound()` in `generateMetadata` hilft **nicht** — die Shell streamt
vorher (live gemessen: 200).

**Warum `NextResponse.next({ status: 404 })` und nicht `rewrite`:**
`NextResponse.rewrite(url, { status: 404 })` verliert den Status auf dem
Node-Server (`resolve-routes.js` behandelt `x-middleware-rewrite` als
307-Pfad) — gemessen: Antwort kam als `307 → /en/404`. `next({ status: 404 })`
liefert `HTTP/1.1 404` **und** rendert die Route normal.

**Warum der NotFoundGate im Layout ENTFERNT bleibt:** er war ein
Blocking-Render mit `headers()` + `getCachedPageBySlug()` pro Request — teurer
als ein Set-Lookup im Proxy, und er zwang `ensureStatic` auf `'shell'`. Der
Proxy erledigt dasselbe, bevor überhaupt gerendert wird. **`grep -rn
"NotFoundGate" src/` muss leer sein.**

**Warum `[locale]/not-found.tsx` ALLEIN nicht reicht:** `notFound()` wird von
der `HTTPAccessFallbackBoundary` **seines eigenen Segments** gefangen
(`node_modules/next/dist/client/components/http-access-fallback/error-boundary.js`
rendert `props.notFound` für Fehler aus `children`). Die Page liegt in
`[locale]/[[...slug]]`, also braucht **dieses** Segment seine eigene
`not-found.tsx`; sonst rendert die globale EN-Variante (live gemessen).

## Proxy-Slug-Cache (`src/proxy-slug-cache.ts`)

Eigene Cache-Schicht, weil der Proxy **keinen** Next-Cache hat: `'use cache'`
wirft dort („static generation store missing") und `unstable_cache` ist ein
stiller No-op — jeder Request würde Postgres treffen (gemessen). Der Proxy läuft
in der **Node.js-Runtime** (`functions-config-manifest.json` →
`"runtime": "nodejs"`), Payload/Postgres sind dort direkt nutzbar.

| Parameter           | Env                            | Default   | Bedeutung                                              |
| ------------------- | ------------------------------ | --------- | ------------------------------------------------------ |
| Kill-Switch         | `PROXY_SLUG_CACHE=0`           | an        | aus = jeder Check geht direkt in die DB                |
| Hintergrund-Refresh | `PROXY_SLUG_CACHE_REFRESH`     | `300`     | s; danach Freshness-Probe (count + newest `updatedAt`) |
| Max. Lebensdauer    | `PROXY_SLUG_CACHE_MAX_AGE`     | `2592000` | s (30 d) — Ausfall-Resistenz, danach Fail-open         |
| Negativ-TTL         | `PROXY_SLUG_CACHE_MISSING_TTL` | `60`      | s; **muss kurz bleiben** (siehe unten)                 |

- **Eine** Query für die ganze Slug-Liste (`depth: 0`, `select: { slug: true }`,
  `pagination: false`), danach reine Set-Lookups; Positive **und** Negative
  werden gemerkt (Crawler auf kaputte URLs treffen die DB nicht).
- **Single-Flight:** parallele Misses teilen ein In-Flight-Promise.
- **Fail-open:** DB nicht erreichbar → `'unknown'` → Request läuft normal durch,
  **nie** 404 auf Verdacht (verifiziert mit kaputter `DATABASE_URL`: `/de`,
  `/de/leadership` bleiben 200; `/de/dehj` dann ebenfalls 200 statt 404).
- **Re-Evaluierung einer Negativ-Antwort erzwingt die Freshness-Probe**
  (`currentSlugs({ probe: true })`). Ohne das blieb eine frisch publizierte
  Seite dauerhaft 404: der Negativ-Eintrag lief ab, wurde aber gegen den noch
  < 5 min alten Snapshot erneut als „missing" bestätigt (Bug, gefunden und
  behoben 05.11.2026). Nach dem Fix: publish → spätestens nach `MISSING_TTL`
  (60 s) HTTP 200 (gemessen).
- **Gemessen** (Standalone, je 50 Requests auf `/de/leadership`): gecacht
  p50 **9,5 ms** / p95 **12,9 ms**; mit `PROXY_SLUG_CACHE=0` p50 **13,5 ms** /
  p95 **16,9 ms**.

## Cloudflare Edge-Cache (Stand 07.11.2026)

Der Edge (Cloudflare, Zone `mostheimer.de` `97b8bfd76c5ddbe777f5f185631859bc`)
cacht das öffentliche HTML; **jede** Next.js-Revalidierung purgt die exakt
betroffenen Objekte im selben Code-Pfad, und jeder Deploy purgt einmal alles.
Die Legacy-Zone `mosthi.de` (`fc81dba86a79cddf0b956eed4a25a965`) ist seit
07.11.2026 **komplett cache-bypassed** (eine `cache: false`-Regel, sonst keine
Zone-Rules); `mosthi.de`/`www.mosthi.de` liefern nur noch 301.

### Ohne Cache-Control greift keine Cloudflare-Cache (wichtig erklärt)

Streamed HTML aus Next 16 (`cacheComponents` + `connection()`) trägt immer
Nexts eigenes `Cache-Control: no-store`/`private…` — `headers()` aus
`next.config.ts` überschreibt das **nicht** (empirisch geprüft: dev wie
Production-Build). `next.config.ts` bleibt trotzdem die Origin-Quelle der
Wahrheit; die **Durchsetzung** am Edge läuft über Cache Response Rules, die
exakt dieselben Werte schreiben. Beide Stellen MÜSSEN synchron bleiben
(`PUBLIC_CACHE_CONTROL` in `next.config.ts` ↔ Rule 1 der Response-Rules).

### TTL- und Purge-Vertrag

| Pfad                                                                                                   | Cache-Control (Edge, sichtbar beim Besucher)                                                    | TTL                        | Was purgt                                                |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------- |
| `/de`, `/en`, `/de/…`, `/en/…` (public, **2xx/3xx**)                                                   | `public, max-age=0, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000`     | **1 d fresh / 30 d stale** | Hooks (Tag-Flush, synchron) + Deploy-Purge + Admin-Flush |
| `/` (Edge-Redirect per Accept-Language)                                                                | `307` am Edge, **kein Cache-Objekt**                                                            | —                          | n/a (kein Origin, kein Cache)                            |
| `/_next/static/*`                                                                                      | `public, max-age=31536000, immutable, s-maxage=31536000`                                        | **1 Jahr**                 | nie (Invariante)                                         |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`                                                             | `public, max-age=0, s-maxage=3600, stale-while-revalidate=3600, stale-if-error=3600`            | **1 h**                    | Deploy-Purge (+ `cms:sitemap` für die Sitemap)           |
| `/og`                                                                                                  | `public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000` | **1 d**                    | nie (Query-Key unbounded, Warm beim Deploy/7d)           |
| `/media/*`, `/api/media/file/*`                                                                        | `public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000` | **1 d**                    | nie (Self-Heal nach 1 d; Warm beim Deploy/7d)            |
| `/favicon.ico`, `/icon*`, `/apple-icon*`                                                               | `public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000` | **1 d**                    | nie (Warm beim Deploy/7d)                                |
| `/admin*`, `/api/*`, `/_next/*` (non-static), `*preview*`, `*settings*`, `/mcp*`, **alle 404/non-2xx** | `no-store`                                                                                      | keine                      | n/a — nie gecacht                                        |
| andere Hosts der Zone (`home.mostheimer.de`)                                                           | `no-store`, `DYNAMIC`/`BYPASS`                                                                  | keine                      | n/a — nie gecacht                                        |
| `mosthi.de` / `www.mosthi.de` (eigene Zone)                                                            | `cache: false` → `DYNAMIC`                                                                      | keine                      | n/a — nie gecacht                                        |

### Cache-Lebensdauern — eine Kette, drei Stellen (Stand 07.11.2026)

| Ebene            | Ort                                                                                | Refresh (Hintergrund)          | Max. Lebensdauer / Stale                                                                  |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| Next Data Cache  | `cacheLife` in `src/cms/cache/frontend/queries.ts`                                 | `revalidate: 300`              | `stale`/`expire: 2592000` (30 d)                                                          |
| Proxy-Slug-Cache | `src/proxy-slug-cache.ts`                                                          | `PROXY_SLUG_CACHE_REFRESH=300` | `PROXY_SLUG_CACHE_MAX_AGE=2592000`; **negativ** nur 60 s (`PROXY_SLUG_CACHE_MISSING_TTL`) |
| Cloudflare Edge  | Cache-Rule (2xx `86400`, static `31536000`, text `3600`, og `300`) + Response-Rule | —                              | **1 d fresh / 30 d stale** (Content); Assets 1 a                                          |

**Korrektheit kommt NICHT aus der TTL, sondern aus dem Purge:** jede
CMS-Änderung läuft `safeRevalidate(..., 'blocking')` → `revalidateTag({expire:0})`
**plus** `enqueueCloudflarePurge(urls)`. Die langen Fristen sind reine
**Ausfall-Resistenz** (Origin-Container weg → Edge/Proxy liefern weiter).
Konsequenz, die man kennen muss: feuert ein Hook nicht (z. B. direkter
DB-Write, Skript), bleibt altes HTML bis zu 5 min stehen bzw. im Edge bis zum
nächsten Purge.

### 404- und Fehlerantworten werden NICHT gecacht (Stand 07.11.2026)

Die frühere Fassung (404 30 Tage am Edge) war ein Poisoning-Risiko und ist
entfernt: bei einem Origin-Ausfall übernimmt der Traefik-Catch-All
(`placeholder-404`, priority -1000), liefert 404, und die Content-Response-Rule
hätte diesen 404 mit `s-maxage=2592000` 30 Tage gecacht — auch nach Recovery
(Plain-Restart purged nicht: `[cf-purge] … already purged — skipping`).
Gemessen am 07.11.2026: erstmaliger Request während eines Container-Stops →
404, danach `HIT 404` (Age 15) nach dem Restart.

Heute (verifiziert 07.11.2026):

- Content-Response-Rule matcht nur `http.response.code lt 400`; 404/5xx fallen
  in die letzte `no-store`-Regel → `BYPASS`, nie gecacht.
- Der Placeholder liefert für `mostheimer.de`/`www.mostheimer.de` **503**
  (nicht 404), sobald die App fehlt; damit greift `stale-if-error` für
  abgelaufene Content-Objekte und Crawler sehen kein „gelöscht".
- Die Cache-Rule setzt **zusätzlich** alle 4xx/5xx auf `status_code_ttl: -1`
  (no-store) — zweite Schicht, falls die Response-Rule je fehlt oder falsch
  bearbeitet wird. (Der Origin-Header aus `next.config.ts` ist statusunabhängig
  und würde sonst auch auf 404 liegen.)
- Test: erster Request während Ausfall → **503** `BYPASS`; zweiter → weiterhin
  `BYPASS`; nach Restart dieselbe URL → 200 `MISS`. Kein 503/404 bleibt hängen.
- Bereits gecachte Content-/Asset-Objekte überleben den Ausfall (`/de` 200
  `HIT`, Assets `HIT`). Der `/`-Redirect läuft **am Edge** per
  `Accept-Language` (307 → `/de`/`/en`) und braucht kein Cache-Objekt; er
  funktioniert im Ausfall unabhängig vom Origin.

**Purge-Fehlermodus:** schlägt ein Purge fehl (429/Rate-Limit, Netz, Token),
bleibt das Objekt bis zur nächsten erfolgreichen Purge bzw. höchstens
`s-maxage`/`stale-*` = 30 Tage veraltet. Der Fehler wird geloggt
`[cf-cache] Edge-Purge '…' fehlgeschlagen (<reason>)` — **Token wird nie
geloggt**. Nach einem Fehler öffnet ein Circuit Breaker für 2 min, damit ein
kaputter Token CMS-Saves nicht mit hängenden Requests ausbremst.

### Tag → Purge-Mapping (`src/cms/cache/frontend/`)

| Tag                | Gepurgte Edge-Objekte                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `cms:all`          | alle Content-URLs + `/sitemap.xml` (ein Request; **kein** `purge_everything`)                                                 |
| `cms:pages`        | alle öffentlichen Routen (`/en`, `/de` + jede Seite), via Route-Registry (`getCachedRouteRegistry`, cached unter `cms:pages`) |
| `cms:pages:<slug>` | `/en/<slug>` + `/de/<slug>` (`home` → `/en`, `/de`), auf beiden Content-Hosts                                                 |
| `cms:sitemap`      | `/sitemap.xml`                                                                                                                |
| `cms:global:*`     | alle öffentlichen Routen (Layout rendert die Globals)                                                                         |

Hosts der URL-Purges: **nur** `https://mostheimer.de` **und**
`https://www.mostheimer.de` (die Purge-API braucht den **exakten** Host; es
gibt kein Vary-artiges Purging). Die Legacy-Hosts `mosthi.de`/`www.mosthi.de`
werden **nicht** gepurgt — sie antworten nur mit 301 (siehe
„Domain-Konsolidierung"). `NEXT_PUBLIC_SERVER_URL` kann weitere,
`;`-getrennte Content-Hosts ergänzen; Legacy-Redirect-Hosts werden dabei
herausgefiltert.

**Warum URL-Purge, nicht Cache-Tags:** Tag-Purge braucht einen `Cache-Tag`-
Response-Header auf genau der gecachten Antwort; die App kann ihn nicht setzen
(HTML-Header werden von Next/Rules gesetzt). URL-Purge braucht nichts vom
Origin und ist hier exakt, weil die Routenmenge klein und bekannt ist.
**Plan-Fakt:** Zone ist **Free** → URL-Purge verfügbar, aber **5 Purge-Requests
pro Minute** (Account-weit, Token-Bucket 25, max 100 URLs/Request). Darum
sammelt jeder Flush seine Pfade und schickt **einen** Request; `cms:all`
schlägt alle URL-Purges (ein Request statt vielen).

### Phasen-Kopplung (wichtig bei Änderungen)

Ein Purge entfernt nur Objekte, die **schon** gecacht sind. Ein Purge mitten im
Request N kann also von Requests N eigenem Render überholt werden. Deshalb:
Hooks rufen `safeRevalidate` → setzt Next-Tag **und** reiht den Edge-Purge in
eine Queue (`purges.ts`); das `[locale]`-Layout leert die Queue **vor** dem
ersten Byte (`runPendingCloudflarePurges()`). Nie den Purge aus dem Render
herausnehmen oder hinter `Suspense` verschieben.

### Env & Token-Rechte

| Variable                    | Zweck                                                                                                                                       | Fehlt sie                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`      | Purge-API                                                                                                                                   | Purge = No-op (lokal/Build inert)                 |
| `CLOUDFLARE_PURGE_ZONES`    | **Kanonisch:** `zoneId:host1,host2` je Zone; Default = nur die Content-Zone `mostheimer.de`                                                 | Fallback auf `CLOUDFLARE_ZONE_ID` + Content-Hosts |
| `CLOUDFLARE_ZONE_ID`        | Content-Zone (`97b8bfd76c5ddbe777f5f185631859bc`); in Coolify Prod+Preview so gesetzt, **nur Fallback** wenn `CLOUDFLARE_PURGE_ZONES` fehlt | Default-Zone greift                               |
| `CLOUDFLARE_PURGE_ON_START` | `0` = Deploy-Purge aus                                                                                                                      | Default: an                                       |
| `CF_WARM`                   | `0` = Cache-Warming aus (Deploy **und** Wochen-Cron)                                                                                        | Default: an                                       |
| `CF_WARM_CONCURRENCY`       | Parallele Asset-Warm-Requests (Default `4`)                                                                                                 | `4`                                               |
| `CF_WARM_MAX_ASSETS`        | Obergrenze Assets pro Warm-Lauf (Default `500`)                                                                                             | `500`                                             |
| `CF_WARM_SWITCH_TIMEOUT_MS` | Max. Wartezeit, bis der Public-Host dieselbe `release` meldet (Default `120000`)                                                            | `120 s`                                           |

**Beide server-only, NIE `NEXT_PUBLIC_`.** `--warm-only` braucht **keinen**
Token (nur HTTP-GETs durch den Edge). Token-Rechte: **Zone → Cache Purge
→ Purge für die Content-Zone** (`mostheimer.de`) — nichts anderes nötig. In
Coolify als App-Env mit `is_buildtime: false` setzen (Secrets gehören nicht in
den Build-ARG-Layer).

### Eine Zone ist genug: nur `mostheimer.de` wird gepurgt (Stand 05.11.2026)

`mosthi.de` und `mostheimer.de` liegen in **getrennten Cloudflare-Zonen**, aber
nur eine davon hält Content-Cache:

| Zone                               | Hosts                                                | Wird gepurgt?                                     |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| `97b8bfd76c5ddbe777f5f185631859bc` | `https://mostheimer.de`, `https://www.mostheimer.de` | **ja** (beide Hosts)                              |
| `fc81dba86a79cddf0b956eed4a25a965` | `https://mosthi.de`, `https://www.mosthi.de`         | **nein** — Zone ist `cache:false` (301 `DYNAMIC`) |

**Warum die Legacy-Zone raus ist:** `mosthi.de`/`www.mosthi.de` beantworten jede
Anfrage mit **301** auf `https://mostheimer.de` (Traefik, siehe
„Domain-Konsolidierung"). Seit 07.11.2026 ist die Zone per **einziger**
`cache: false`-Regel komplett gebypassed (alle anderen Zone-Rules gelöscht); die
früher mitgecachten 301-Objekte (30 d) sind damit weg. Ein Purge dorthin
evictet nichts — reine Budget-Verbrennung (Free-Plan: 5 Purge-Requests/min
account-weit).

Cloudflare-Purges bleiben **zonen-scoped**; es gibt keinen host-basierten Purge.
Eine URL aus Zone B an `/zones/<A>/purge_cache` liefert weiterhin
**`success: true` und evictet nichts**. Deshalb gilt:

1. **Ein Purge-Request pro Zone**, nie einer pro Host. Eine URL geht nur an die
   Zone, die ihren Host besitzt; URLs mit fremdem Host werden **verworfen**
   (`purgeUrlsByZone` in `src/cms/cache/frontend/cloudflare.ts`, identische
   Policy in `scripts/cf-purge.mjs`). Beide fallen ohne Config auf dieselbe
   eine Content-Zone mit denselben zwei Hosts zurück.
2. **Teilerfolg = Fehler.** Scheitert eine Zone, meldet `sendPurge` `failed`
   (mit Zone-Id im Reason) und öffnet den Circuit Breaker — sonst bleibt die
   kaputte Zone unsichtbar stale.
3. **`success: true` ist kein Wirksamkeitsbeweis.** Nach jedem Purge-Umbau
   `cf-cache-status`/`Age` **am Zielhost** nachmessen (Cache-Buster gegen den
   Origin vergleichen). Die API bestätigt auch wirkungslose Requests.

Sollte eine weitere Zone je wieder Content halten (z. B. ein neuer Alias-Host
ohne Redirect), wird sie **explizit** in `CLOUDFLARE_PURGE_ZONES` eingetragen —
nie implizit über einen Host-Default.

Token-Permission-Test ohne Secret-Output (Zone-Ids sind nicht geheim, Token nie
drucken): im App-Container `node` gegen `POST /client/v4/zones/<id>/purge_cache`
mit genau einer harmlosen URL der Content-Zone; erwartet wird **200 +
`success: true`**. Ein 401/403 zeigt die fehlende Zone-Permission an.

### Deploy-Purge (eine Purge pro Release, nie pro Restart)

- `Dockerfile`: `CMD ["/app/scripts/entrypoint.sh"]`; das Image bettet die
  Build-ID in `/app/.cf-release` ein (Build-Zeit ⇒ pro Image identisch).
- `scripts/entrypoint.sh`: startet `node server.js`, **danach** im Hintergrund
  `node scripts/cf-purge.mjs --wait-for-release`.
- `scripts/cf-purge.mjs`: wartet, bis `/api/health` der **neuen** Version
  antwortet (sonst würde der Edge den alten Origin wieder cachen), purgt dann
  die Content-URLs (Sitemap-abgeleitet, `/_next/static` gefiltert) in der
  Content-Zone und schreibt `/app/.cf-state/.cf-purge-<hash>.done` (bzw.
  `CF_STATE_DIR`). Ein Restart
  desselben Images/Restarts sieht die Markierung → **skip** (kein Purge-Storm
  bei Crash-Loop/Restart-Policy). Fail-soft überall: kein Token, Netzfehler,
  non-2xx, Kill-Switch → eine Warnung, `exit 0`, App startet immer.
- Release-ID: `RELEASE_ID` → `SOURCE_COMMIT` (Coolify) → eingebettete
  Build-ID (+ `IMAGE_TAG`).
- **Alternative** (dokumentiert, nicht nötig): Coolify-Post-Deployment-Hook auf
  der App → `node /app/scripts/cf-purge.mjs --release $SOURCE_COMMIT`. Der
  Entrypoint-Weg bleibt der Standard, weil er ohne Coolify-Konfiguration und
  ohne Deploy-Loop-Risiko funktioniert.
- **Warming nach dem Purge:** `warmCache()` läuft im selben Hintergrundprozess
  (nur wenn alle Zonen gepurged wurden und `CF_WARM != 0`). Es wartet, bis
  `https://mostheimer.de/api/health` **denselben `release`** wie der lokale
  Container meldet (sonst würde es während des Traefik-Switch die alte
  Release-Version wieder einlagern), und holt dann alle Content-Routen
  (`/de`, `/en`, jede Seite, `/sitemap.xml`, `/robots.txt`, `/llms.txt`) plus
  alle referenzierten Assets: `/_next/static/**` (JS/CSS), CSS-`url(...)`-
  Fonts/Bilder, `<img src/srcset>`, `<meta og:image>` (`/og?...`) und
  `/favicon.ico`. Bounded: `CF_WARM_CONCURRENCY=4`, max.
  `CF_WARM_MAX_ASSETS=500`; fail-soft, jeder Fehler zählt nur.
- **Wöchentlicher Re-Warm:** Coolify Scheduled Task auf der App
  (`node /app/scripts/cf-purge.mjs --warm-only`, Cron `0 4 * * 1` = Montag
  04:00) hält HTML (1 d fresh), Media/OG/Favicon (1 d) und Text (1 h) warm,
  ohne zu purgen und ohne Token. `--warm-only` überspringt Purge/Marker/Token.
  Kill-Switch: `CF_WARM=0` (Deploy-Warm und Cron) bzw. `--no-warm` (Deploy).

### Zone-Regeln (Rulesets, keine Page Rules)

Page Rules API ist für Account-Tokens gesperrt (`1011 Page Rules endpoint does
not support account owned tokens`) → alles über Rulesets.

**Cache-Rules** (`http_request_cache_settings`, Entrypoint `default`; letzter
Match gewinnt, Reihenfolge ist Teil der Korrektheit). Alle Regeln sind
host-exakt (`mostheimer.de` / `www.mostheimer.de`):

1. **Site-Hosts eligible** — `cache: true`, `edge_ttl: respect_origin` +
   `status_code_ttl` **2xx = 86400, 4xx/5xx = -1 (no-store)** (1 d fresh;
   die 30 d stehen als `stale-*` im Response-Header). RSC-Header
   (`rsc: 1`) ist ausgeschlossen.
2. **`/_next/static/*`** — `override_origin`, 2xx `31536000` (1 Jahr).
3. **`/sitemap.xml`, `/robots.txt`, `/llms.txt`** — `override_origin`, 2xx `3600`.
4. **`/og`** — `override_origin`, 2xx `86400`.
5. **`/media/*`, `/api/media/file/*`** — `override_origin`, 2xx `86400`
   (replaced files self-heal; Warm beim Deploy/7d).
6. **`/favicon.ico`, `/icon*`, `/apple-icon*`** — `override_origin`, 2xx `86400`.
7. **Site-Hosts + `RSC: 1`** — `cache: false` (Vary wird von Cloudflare
   ignoriert; ohne diese Regel könnte ein RSC-Request das HTML-HIT bekommen).
8. **`not (Site-Hosts)`** — `cache: false` (deny by default, z. B.
   `home.mostheimer.de`; die Legacy-Zone `mosthi.de` hat genau diese eine
   Bypass-Regel für `mosthi.de`/`www.mosthi.de`).

**Cache-Response-Rules** (`http_response_cache_settings`) — sie **ersetzen** den
Ursprungs-Header (Cloudflare überschreibt gestreamtes HTML sonst nie). Inhaltliche
Regeln + Catch-all, **letzte Regel gewinnt** und wird mehrfach ausgewertet:

1. **Static 200** (`/_next/static/*`) → `public, max-age=31536000, immutable,
s-maxage=31536000`; `no-store`/`no-cache`/`private`/`must-revalidate`
   entfernt.
2. **Content** (`path eq /de|/en` oder `starts_with /de/|/en/`, ohne
   preview/settings, ohne RSC, `http.response.code lt 400`) →
   `public, max-age=0, s-maxage=86400, stale-while-revalidate=2592000,
stale-if-error=2592000`. **Kein Prefix-Match** (`/design` darf nicht als
   `/de…` gelten).
3. **Text** (`/sitemap.xml`, `/robots.txt`, `/llms.txt`, 200) → 1 h.
4. **OG** (`/og`, 200) → 1 d.
5. **Media** (`/media/*`, `/api/media/file/*`, 200) → 1 d.
6. **Favicon** (`/favicon.ico`, `/icon*`, `/apple-icon*`, 200) → 1 d.
7. **Catch-all** — `no-store`, entfernt `s-maxage`/`stale-*`/`public`/
   `max-age`/`immutable`. **Expression MUSS alle cachebaren Bedingungen
   negieren** (static/content/text/og/media/favicon **inkl.
   `http.response.code`**), sonst setzt der zweite Auswertungs-Pass
   `no-store` erneut auf cachebare Antworten — genau der Bug vom 05.11.2026.

`http.response.code` ist in der Response-Phase verfügbar (Cache Response Rules
laufen nach der Origin-Antwort); dadurch werden **404/5xx nie gecacht**, ohne
dass die Content-URL-Regel sie mit `s-maxage` versieht.

**Trailing-Slash-Redirect** (`http_request_dynamic_redirect`, Zone
`mostheimer.de`): `/<pfad>/` → `/<pfad>` mit **308** (methodenerhaltend,
wichtig für `_next/static` und POST-APIs), Query bleibt. Läuft **vor** der
Cache-Phase, der Origin sieht keine Trailing-Slash-Varianten mehr. Die Regel
ist host-exakt `mostheimer.de` (nicht `www`, das ohnehin 301t); die frühere
Regel in der `mosthi.de`-Zone ist **gelöscht** (Zonen-Regeln sind zone-scoped,
die dort zusätzlich gelisteten `mostheimer.de`-Hosts waren wirkungslos).

```
(http.host eq "mostheimer.de") and
http.request.uri.path ne "/" and ends_with(http.request.uri.path, "/")
→ target: concat("https://", http.host, substring(http.request.uri.path, 0, -1))
```

- `substring(path, 0, -1)` ist die **Free-Plan-Form** (schneidet genau den
  letzten Slash). `regex_replace` ist **Business+** — API lehnt sonst ab mit
  „not entitled: … Business plan or a WAF Advanced plan is required".
- `if()`/`len()`/`sub()` gibt es in `target_url` **nicht** (Parser: „unknown
  identifier"); Query-String übernimmt `preserve_query_string: true`.
- `http.request.uri.path ne "/"`-**Guard ist Pflicht**: ohne ihn würde `/`
  auf einen leeren Pfad umgeleitet und die Sprach-Route (`307 → /en`) gekillt.
- Edge-Beleg (07.11.2026): `/de/` → `308 Location: https://mostheimer.de/de`
  **ohne** `cf-cache-status` und ohne Origin-CSP; `/de/?x=1` → `/de?x=1`.
  Direkt am Origin (`127.0.0.1:3300/de/`) antwortet weiterhin Next mit 308 —
  der Origin wird für Edge-Treffer also nicht befragt.

**Fallstricke, verifiziert (nicht wieder einbauen):**

- Rules einer Phase werden **in Reihenfolge ausgewertet, letzter Match gewinnt**
  und **mehrfach** (Request-Pass + Caching-Pass) ausgewertet. Eine Catch-all-
  Regel mit `no-store`, die nach der Content-Regel läuft, killt den Cache
  wieder (2. Pass sieht `no-store` und matcht). `no-store` gehört in die
  _letzte_ Regel und darf auf Content-Pfaden nicht wieder gesetzt werden.
- `set_cache_control` **schreibt** den Header sichtbar für den Besucher
  (kein `cloudflare_only` bei `s-maxage`), darum sehen Kunden `s-maxage` +
  unsere Direktiven — das ist gewollt (und deckt sich mit `next.config.ts`).
- `layer0`/`edge_cache_ttl`-ähnliche Overrides erzeugen genau die „Edge zeigt
  andere TTL als Origin"-Falle — deshalb `respect_origin` + Response-Rule.

### Prüfen (Live)

```bash
curl -sI https://mostheimer.de/de       | grep -iE '^(cache-control|cf-cache-status|age)'   # MISS → HIT
curl -sI https://mostheimer.de/         | grep -iE '^(http|location|cache-control|cf-cache-status|age)' # 307 am Edge (/de oder /en), kein cf-cache-status/Age
curl -sI https://mostheimer.de/de/dehj  | grep -iE '^(http|cache-control|cf-cache-status|age)' # 404, BYPASS, no-store
curl -sI https://mostheimer.de/admin    | grep -iE '^(cache-control|cf-cache-status)'       # BYPASS, no-store
curl -sI https://mosthi.de/de           | grep -iE '^(http|location|cache-control|cf-cache-status|age)' # 301, DYNAMIC, kein Age
curl -sI https://scobio2026.mosthi.de/  | grep -i cf-cache-status                            # DYNAMIC (nie gecacht)
```

Statuscode-Legende: `BYPASS`/`DYNAMIC` bei Nicht-Content = korrekt (nicht
cachebar). `HIT` auf `/de` mit `Age: 0` direkt nach einer Änderung + `Age` > 0
≥ 1 s später = Purge lief. Ein Purge ist nur am **Content-Host**
(`mostheimer.de`/`www.mostheimer.de`) prüfbar — `mosthi.de` liefert einen 301
ohne Cache-Objekt (`DYNAMIC`, kein `Age`).

### INVARIANTE: statische Assets werden NIE gepurgt (Stand 05.11.2026)

**Rule:** `/_next/static/**` ist immutable und content-addressed (pro Build) —
es wird **nie** gepurgt, weder bei CMS-Änderungen noch bei Deploys.

Begründung (alle drei treffen zu):

1. **Budget:** Free-Plan = 5 Purge-Requests/min. Assets zu purgen verbrennt
   Requests für Objekte, die sich durch einen CMS-Edit gar nicht ändern können.
2. **Korrektheit:** HTML purgen ist billig und richtig; Assets purgen ist
   sinnlos. Ein CMS-Edit ändert keinen Chunk-Inhalt.
3. **Ausfall-Resistenz (der eigentliche Grund):** Beim Ausfall des **einen**
   Origin-Containers sind die warmen Edge-Kopien von CSS/JS das Einzige, was
   die Seite noch _gestylt_ ausliefert. Genau das war der User-Bug vom
   05.11.2026 (unstyled Seite), und ein Asset-Purge würde ihn bei jedem
   Deploy/Edit/Crash-Loop reproduzierbar machen.

Umsetzung (drei Schichten, damit es strukturell nicht wiederkommt):

- **`purge_everything` ist aus dem Anwendungscode entfernt** — der Typ
  `CloudflarePurgeTarget` hat nur noch `{ type: 'urls' }`. `cms:all` mappt auf
  die vollständige Content-Routen-Liste + `/sitemap.xml` (ein API-Call).
- **`isPurgeablePath`** (`src/cms/cache/frontend/routes.ts`) ist der einzige
  Choke-Point; **`toPurgeUrls`** filtert dort noch einmal, sodass kein Aufrufer
  (auch kein künftiger) eine `/_next/static`-URL an die API geben kann.
- **Tests** (`tests/int/cloudflare-purge.int.spec.ts`) halten die Invariante
  fest: Asset-Pfade werden verworfen, „asset-only" → `nothing-to-purge` ohne
  API-Call, und kein Tag mappt je auf einen Asset-Pfad.

**Deploy-Purge (URL-Liste statt `purge_everything`):** `scripts/cf-purge.mjs`
liest `/sitemap.xml` (unauth, kann nicht driften), baut daraus
`{ files: [...] }` für die Content-URLs (+ `/`, `/sitemap.xml`,
`/robots.txt`, `/llms.txt`) beider Content-Hosts und schickt **einen** Request
an die Content-Zone. `/_next/static` wird per `isPurgeable` gefiltert.
Direkt danach läuft das Warming (siehe „Deploy-Purge" oben): Routen + alle
referenzierten Assets/Bilder, durch den Edge und erst nach
Public-Release-Match.

**Tag-Purge ist hier NICHT nutzbar (gemessen, nicht vermutet):** eine
Cache-Response-Rule _kann_ `Cache-Tag: mosthi-html` setzen (Header erscheint in
der Antwort), und die API akzeptiert `{ tags: [...] }` mit `success: true` —
aber der Purge ist ein **stiller No-op**: das Objekt blieb `HIT` mit monoton
wachsendem `Age` (445 → 449 → 453 s). Der Header-Transform läuft offenbar nach
der Cache-Key-Bildung, Tags werden nicht indiziert. Die Probe-Rule wurde wieder
entfernt.

**Edge-Case „gleicher Dateiname, anderer Inhalt"** (der dokumentierte
`immutable`-Hazard aus „Gelernte Fehler"): bewusst **akzeptiert**, nicht
automatisiert. Turbopack content-hasht die Chunks pro Build; der ursprünglich
gemessene Fall stammte von älteren Builds. Der Fallback ist ein **manueller,
explizit dokumentierter Notausgang** — `cf-purge.mjs --everything`
(`purge_everything`, Operator-only, nicht aus dem Entrypoint erreichbar) bzw.
ein `purge_everything`-Call im Incident. Bewusst nicht als Deploy-Default, weil
er genau die Ausfall-Resistenz zerstört.

### Deploy-Purge-Idempotenz (Release-ID-Reihenfolge, Stand 05.11.2026)

`resolveRelease()` in `scripts/cf-purge.mjs` — Reihenfolge ist die eigentliche
Korrektheit:

1. `--release <id>` (expliziter Operator-Override)
2. `RELEASE_ID` (expliziter Operator-Override)
3. **`/app/.cf-release`** — die im Image gebackene Build-ID (primär im Container)
4. `SOURCE_COMMIT` → `COOLIFY_COMMIT` — **nur** Local-Run-Fallback

**Nie** `SOURCE_COMMIT` vor die gebackene ID ziehen: Coolify setzt
`SOURCE_COMMIT` bei einem **Restart** auf den synthetischen Commit des Restarts
→ jeder Restart purgt erneut. Bei 5 Purges/min ist nach einem Crash-Loop das
Budget leer und CMS-Edits purgen nicht mehr. `scripts/entrypoint.sh` setzt
`RELEASE_ID` deshalb **nicht** mehr aus `SOURCE_COMMIT` (das war der Bug).
Zweitsicherung: Marker `/app/.cf-state/.cf-purge-<sha16>.done` (existiert → „already
purged — skipping").

### `/_next/static` bleibt ein Restrisiko (Client-Bundle-Skew)

Static-Chunks werden 1 Jahr `immutable` gearbeitet, und **zwei Builds erzeugen
identische Chunk-Namen** (siehe Gelernte Fehler). Seit der Never-Purge-Invariante
räumt **kein** Deploy mehr die Edge-Kopie der Chunks (Edge **und** Browser behalten
sie) — dafür ist der ebenfalls gecachte Cache-Layer wertvoller im Ausfall.
Für „neuer Deploy, alter Client-Bundle":
`ReleaseGuard` (`src/components/ReleaseGuard.tsx`) holt `/api/health`
(`release` = Build-ID aus `src/build-info.ts`, beim Build generiert), vergleicht
sie mit der des Tabs und lädt einen alten Tab beim Mount/Fokus exakt einmal hart
neu. Härteste Lösung bleibt Next-Skew-Protection (`deploymentId`) — offen.

## Dependencies & Audit (Stand 05.11.2026)

- **Exakt gepinnt, keine Ranges:** `package.json` enthält 0 Verstöße gegen die
  Regel (kein `^`/`~`/`latest`/`*` in `dependencies`/`devDependencies`), Dockerfile
  nutzt durchgängig `node:26.13.0-alpine3.24` (volle Version mit Patch), die
  Compose-Datei hat **kein** `image:` (baut lokal).
- **Transitive CVE-Fixes via `overrides`:** `"dompurify": "3.4.17"` (via
  `monaco-editor`/`@payloadcms/ui`). `npm audit fix --package-lock-only` hebt
  solche von Zwischen-Deps gepinnten Ranges nicht — Override + Lockfile-Regen.
- **Audit-Stand 05.11.2026:** 24 Findings, **0 HIGH / 0 CRITICAL** (9 low,
  15 moderate). Kein Handlungsbedarf in diesem Zuge.
- **Offene Majors (bewusst NICHT angehoben):** `graphql` 16 → 17 (Payload-Peer
  prüfen), `jsdom` 30 → 31 (nur Tests), `typescript` 6 → 7 (bricht
  typescript-eslint-Peer `<6.1` und die JS-API — TS 7 läuft hier nur als
  `@typescript/native`-Advisory, siehe Tech-Stack). Minor/Patch (z. B.
  `@playwright/test` 1.65, `lucide-react` 1.69) erst mit eigener Test-Runde.

## Clipboard (E-Mail kopieren, Stand 05.11.2026)

- `src/components/ui/CopyButton.tsx` — echte `<button type="button">`, Fokusring
  via `focus-visible:*`, Ergebnis-Ansage über `role="status"` + `aria-live="polite"`
  **neben** dem Button (der sichtbare Label bleibt über alle Zustände konstant,
  damit der Accessible Name nicht springt). Schreibt `navigator.clipboard`, mit
  `execCommand`-Fallback; im Fehlerfall **kein** falsches „kopiert".
- Texte aus dem `translations`-Global, Gruppe **`clipboard`** (`copyLabel`,
  `copiedMessage`, `failedMessage`), Migration
  `20261105_210002_add_clipboard_translations` (nur additive
  `ADD COLUMN … DEFAULT … NOT NULL`, Snapshot `*.json` mitcommittet).
- Der `mailto:`-Link bleibt das sichtbare Element; der Copy-Button ist eine
  **Zusatz**-Aktion daneben und ersetzt ihn nie.
- Die Komponente liest den Context über `useTranslationsOrNull()` (wirft NICHT
  ohne Provider — der Block rendert auch auf der 404-Fallback-Chrome) und hat
  einen Per-Feld-Fallback, falls die Global-Gruppe fehlt.

## QA-Iteration 2 (06.11.2026) — deployed as `e497df4`: Card-Eyebrows, Hero-Varianten, Legal-Content im CMS

Erprobt auf Prod (`mostheimer.de`) gegen die Screenshots aus `mostheimer-screenshots-2026-11-05.zip`.

### Eyebrows sind optional, nie ein Platzhalter

- `CardHeader` (`src/components/ui/industrial.tsx`) hat **kein** Default-Meta mehr und rendert
  **nichts**, wenn weder `label` noch `meta` gesetzt sind. Vorher hängte
  `TechSectionBlock` an jede Karte `meta="tech section"` — auf `/privacy` 20×, auf
  `/contact` 4×, auf `/leadership` 6× (Sah aus wie ein Template-Rest).
- `techSection.sectionLabel` **ist** die Eyebrow. Fehlt sie, gibt es keine Zeile — nie einen
  Blocknamen als Fülltext erfinden.
- Kontextuelle Labels je Seite werden im **CMS** gepflegt (`contact` → `DIRECT CHANNELS`,
  `AVAILABILITY & SCOPE`; `privacy` → `§ 5 DDG / LEGAL NOTICE`, `HOSTING & OPERATION`, …;
  `leadership` → `ENGINEERING LEADERSHIP 01/02`, `ENABLEMENT & ADRs`).

### Hero: `home` vs. `compact` (Seitenkopf statt Boilerplate)

`HeroBlock` nimmt `variant` (`src/app/(frontend)/[locale]/[[...slug]]/page.tsx` entscheidet):

| variant   | Wo                    | Was                                                                                                         |
| --------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `home`    | nur `slug === 'home'` | volle H1-Größe, Stack-Zeile, Portrait-Box, 4-Metrik-Streifen über volle Breite                              |
| `compact` | jede andere Route     | Breadcrumb-Eyebrow (`Start // Kontakt`), kleinere H1, `line-clamp-3`-Lead, Inline-Metriken, Portrait nur lg |

- Die 4 Metriken (`~10 yrs`, `composable`, `remote (DE)`, `< 24 h`) bleiben als `METRICS`
  in `HeroBlock`, damit sie nicht driften — `compact` rendert sie aber **schmal eingebettet**
  statt als Vollbreiten-Streifen. Die Vorgabe „Metriken nur auf Home" kollidierte mit
  `HeroBlock` als Content-Baustein; wer sie komplett entfernen will, streicht sie im Hero,
  nicht pro Seite.
- `blocks.tsx` und `PreviewBlocks.tsx` reichen `locale` an die lokalisierenden Blöcke durch
  (Timeline-Chip, Case-Study-Spalten, Bento-Chips). **Beide** Dispatcher pflegen.
- `/impressum` ist eine **eigene Route** (`src/app/(frontend)/[locale]/impressum/page.tsx`),
  keine CMS-Seite — sie liefert `hreflang`, aber **keinen** englischen Text (Authoren-Todo).

### Footer-Copyright aus dem CMS

- Neuer `translations.footer`-Block (`rightsReserved`, `eyebrow`), Migration
  `20261106_095612_add_footer_translations` + Daten-UPDATE für `de` im selben Lauf.
- **Lokalisierte Globals mit `fallback: true`:** der englische `Read` liefert Werte, die
  faktisch aus dem deutschen Datensatz stammen (hier: Cookie-Copy), obwohl der lokale Dev-Datensatz
  für `en` keine eigene Zeile hat. Beim Vergleich Dev↔Prod also nie „nur weil die API etwas
  zurückgibt" auf korrekte Locale schließen.

### Proxy/Standalone: `_next` ist keine Locale

- Beim manuellen Start des Standalone-Servers (`node .next/standalone/server.js`) matcht der
  Proxy-Matcher zuerst `^/(?!(de|en))` und **nicht** wie in Produktion `_next`. Ergebnis:
  `/_next/static/...` landete in `handleLocalizedRequest` → Slug `_next` → **Postgres-Fehler
  `invalid input value for enum _locales: "_next"`** und ungestylte Seiten.
- Fix (zwei Schichten): `proxy.ts` skippt `/_next` explizit **und** `pathnameToSlug` gibt für
  Pfade mit `.` `null` zurück. Nie „wegsehen" — ohne Skip ist jeder Asset-Request eine Query.

- **`.next/static` fehlt nach `rm -rf .next/cache`:** `cp -r .next/static .next/standalone/.next/static`
  muss danach **neu** laufen; `cp -r` legt bei existierendem Ziel ein `static/static` an.
  Vor jedem Screenshot-Check: `curl -o /dev/null -w '%{content_type}' <css-url>` muss `text/css`
  liefern — sonst prüft man ungestyltes HTML.

### Impressum ist eine CMS-Seite unter alter URL

- `/impressum` bleibt Route (`STATIC_CHILD_ROUTES` im Proxy), rendert aber die **CMS-Page
  `imprint`** über `getCachedPageBySlug('imprint', locale)` — Tag `cms:pages:imprint`, also
  greifen die normalen Publish-Hooks + Edge-Purge. Der statische Hardcode (inkl. `§ 5 TMG`)
  ist weg; DE/EN-Copy wird ausschließlich im Admin gepflegt.
- `KeyFactActionButton` funktioniert dort ohne `TranslationsProvider`-Annahme (useTranslationsOrNull).

### Produktive Payload-Writes über `payload-prod` — Publish-Disziplin

- Ein MCP-`update` **ohne** `draft: false` / explizites `_status` kann das Dokument auf `draft`
  setzen und die publizierte Locale-Zeile leeren (heute: eine EN-Seite war ~1 min leer).
  Regel: Locale lesen → mergen → **komplett** mit `draft: false` + `_status: 'published'`
  zurückschreiben → re-read verifizieren.
- Nach Schema-Änderungen (`footer`, `contactActions`) lehnt das **laufende** Prod-Schema
  unbekannte Keys ab (`Unrecognized key`), bis das Deploy mit der Migration durch ist —
  Content-Writes mit neuen Feldern also **nach** dem Deploy nachziehen.

### Edge-Purge nach Deploy ist nicht garantiert

- Heute gemessen: nach dem Deploy lieferte `/de/impressum` noch `cf-cache-status: HIT` mit
  `Age` ~53 000 s (altes Objekt), Cache-Buster dagegen die neue Version. Das Deploy-Purge-Skript
  hat diese Objekte nicht evictet.
- Nach jedem Deploy deshalb **nachmessen** und bei Bedarf einen gezielten
  `{files:[…]}`-Purge auf die Content-URLs beider Hosts fahren (ein Request, Free-Plan-Budget),
  danach erneut `cf-cache-status`/Inhalt prüfen (MISS → 200 mit neuem Inhalt).
- `CardHeader` uppercased seine Labels in der UI — CMS-Labels normal schreiben
  (`Anbieterkennzeichnung`), Großschreibung ist keine Redaktionsaufgabe.

## Workflow-Regeln

1. **Nach jeder Dateiänderung** `npm run lint:fix` ausführen.

2. **Kein `any`** – immer konkrete Typen verwenden.
3. **Keine `eslint-disable`-Kommentare** – Code stattdessen korrigieren.
4. Nach Payload-Schema-Änderungen `npm run generate:types` ausführen.
5. Pfad-Aliase (`@/*`) für Imports bevorzugen.
6. **Vor jedem Commit** AGENTS.md aktualisieren (siehe [AGENTS.md-Pflege](#agentsmd-pflege)).
7. **Nach jedem Commit** einen Pull Request öffnen, sofern für den aktuellen Branch noch keiner existiert (`gh pr create`).
8. TypeScript nach Änderungen validieren: `tsc --noEmit`.
9. Nach Komponenten-Änderungen Import Map neu generieren: `payload generate:importmap`.

## AGENTS.md-Pflege

Vor jedem Commit wird diese Datei auf Aktualität geprüft und bei Bedarf ergänzt. Ziel ist kontinuierliche Verbesserung der Verhaltensregeln, damit bekannte Fehler nicht erneut auftreten.

### Was dokumentiert werden soll

- **Neu entdeckte Fehlerquellen** – Muster, die zu Bugs oder Laufzeitfehlern geführt haben
- **Projektspezifische Eigenheiten** – Abweichungen vom Standard-Verhalten von Next.js, Payload oder Tailwind
- **Bewährte Lösungen** – Konkrete Code-Patterns, die sich als korrekt erwiesen haben
- **Verworfene Ansätze** – Lösungen, die nicht funktioniert haben, mit Begründung

### Prozess

1. Vor dem Commit: Rückblick auf die gemachten Änderungen
2. Fehler oder Lernpunkte aus der Session identifizieren
3. Relevante Abschnitte in AGENTS.md ergänzen oder korrigieren
4. Veraltete oder falsche Regeln entfernen
5. AGENTS.md in denselben Commit aufnehmen (`git add AGENTS.md`)

### Gelernte Fehler (laufend ergänzt)

- **[Diagnose/Fonts] „Body-Klasse verschwindet nach Hydration" war KEIN Font-Bug — es war ein React-Tree-Totalabsturz** (05.11.2026). Live-Symptom auf **allen** Frontend-Routen (`/de`, `/en`, `/de/case-studies`, `/de/settings`, `/de/impressum`, `/de/contact`): Server-HTML korrekt (`<html lang="de" class="dark">`, `<body class="S5Rq9G_variable _5Hl15a_variable font-body antialiased">`), nach dem Laden aber `document.body.className === ''` und `getComputedStyle(h1).fontFamily` = `system-ui, "Segoe UI", Roboto, …`. Das sah nach einem `next/font`-Scoping-Problem aus und wurde als solches (falsch) dokumentiert.

  Tatsächliche Ursache: **nicht** die Font-Tokens. Next hatte den kompletten React-Tree verworfen und durch seine Error-Shell ersetzt:

  ```
  document.documentElement.id      === '__next_error__'   ← der eigentliche Beweis
  document.documentElement.class   === null               ← auch <html> verliert "dark"!
  document.body.textContent         ~ "This page couldn't load / A server error occurred"
  Konsole                          ~ "Minified React error #441"
  ```

  Weil **beide** Root-Attribute (`<html class="dark">` **und** `<body class="…">`) gleichzeitig verschwinden, kann die Ursache keine body-lokale Klassenzuweisung und keine Token-Kaskade sein — das ganze Dokument wurde ersetzt. Ein „Font-Fix" (Font-Variablen auf `<html>`, Tokens nach `:root`) hätte daran **nichts** geändert.

  **Diagnose-Regel (verbindlich):** Eine fehlende Body-Klasse ist **kein** Beweis für einen Hydration-/Font-Bug. Vor jeder Font-Diagnose zwingend prüfen: (1) `document.documentElement.id === '__next_error__'`? (2) Konsole auf `#441` / Error-Boundary-Meldungen? (3) Ist `<html class>` ebenfalls weg (dann Tree-Discard, nicht CSS)? (4) `document.querySelector('h1').textContent` — steht dort eine Fehlermeldung statt der Überschrift?

  **Behebung:** Ein **einfacher Redeploy** (Merge von PR #57 = `09667ee`, der ausschließlich Migrations-/Type-Dateien änderte, **kein** App-Code) hat den Fehler behoben. Kein Code-Fix war nötig. Korrelation mit dem Cache-Header-Problem unten (`/_next/static/*` wird `immutable` für 1 Jahr und über Cloudflare gecacht, während die Chunk-Dateinamen über Deploys **stabil** bleiben) — die genaue `#441`-Triggerkette wurde **nicht** vollständig bewiesen (vom Auftraggeber depriorisiert).

- **[Fonts] Verifizierter IST-Zustand der Font-Ebene — bitte NICHT erneut „reparieren"** (05.11.2026, live gemessen auf `/de` und `/en`, nach dem Redeploy):

  | Check                                               | Wert                                                                              |
  | --------------------------------------------------- | --------------------------------------------------------------------------------- |
  | `getComputedStyle(h1).fontFamily`                   | `"Space Grotesk", "Space Grotesk Fallback", ui-sans-serif, …`                     |
  | `getComputedStyle(document.body).fontFamily`        | derselbe Stack                                                                    |
  | `document.fonts.check('700 40px "Space Grotesk"')`  | `true`                                                                            |
  | `document.fonts.check('400 12px "JetBrains Mono"')` | `true`                                                                            |
  | `<html>` / `<body>` Attribute                       | `class="dark"` / `class="S5Rq9G_variable _5Hl15a_variable font-body antialiased"` |

  Design ist intakt: **Space Grotesk** für Headings + Body, **JetBrains Mono** für Code/Metadaten/Tags. Aufbau: `next/font` setzt die Variablen (`--font-space-grotesk`, `--font-jetbrains-mono`) als Klassen auf dem `<body>`; die Stack-Tokens (`--font-space-grotesk-stack` → `--font-heading`/`--font-body`/`--font-mono` …) liegen deshalb **bewusst im selben Scope** (`body { … }` in `globals.css`), weil ein Token in `:root`, das `var(--font-space-grotesk)` referenziert, dort _invalid at computed-value time_ wäre und leer vererbt würde. `@theme` deklariert die Font-Namespace-Tokens nicht (siehe Kommentar dort). **Verifikation immer über `document.fonts.check(...)` + `getComputedStyle(h1).fontFamily` im echten Browser**, nicht über das Vorhandensein von CSS-Regeln oder Klassen im Server-HTML.

- **[Cache/Deploy] `/_next/static/*` = über Deploys hinweg **stabile** Dateinamen, aber `immutable` für 1 Jahr und Cloudflare-Cache davor** (05.11.2026, verifiziert). Gemessen:

  ```
  curl -I https://mostheimer.de/_next/static/chunks/0fkvblgiahdcs.js
    cache-control: public, max-age=31536000, immutable
    etag: W/"7547-1a1a8e9d478"        (Edge, age ~33000s)
    last-modified: Wed, 04 Nov 2026    (Edge = alter Deploy)
    cf-cache-status: HIT
  # mit Cache-Buster (?nocache=…), am Edge vorbei:
    etag: W/"7547-1a1aae0aef0"
    last-modified: Thu, 05 Nov 2026    (Origin = aktueller Deploy)
  ```

  Zwei unabhängige Builds (verschiedene `buildId`: `R8rhf4k4hJ1NzNwQgCEsu` vs. `a0M9HE5GJnCR_Xd_1x3lO`) emittieren **identische** Chunk-Namen (`07lthtoft5uqb.js`, `0fkvblgiahdcs.js`, …) — die URL `/_next/static/chunks/0fkvblgiahdcs.js` zeigt also über Deploys hinweg auf **unterschiedliche Inhalte**, wird aber 1 Jahr `immutable`-gecacht. Die CSS-Chunk-Namen änderten sich zwischen Builds (`2dy0uvsr3271r.css` vs. `0kravsi33yf3x.css`), die JS-Namen nicht. Genau dieses Muster erzeugt „läuft im CI, beim Besucher kaputt": ein Client kann HTML des neuen Deploys mit JS/CSS eines alten Edge-Cache-Eintrags mischen — ohne Revalidierung, weil `immutable` sie verbietet.

  **Wichtig:** `Cache-Control` für diese Assets ist **nicht** über `next.config.ts` `headers()` überschreibbar (Next-Doku, `headers.md` §Cache-Control: „It cannot be overridden"; `self-hosting.md`: „It cannot be overridden"). Ein Header-Patch in `next.config.ts` ist also **kein** gangbarer Weg.

  **Empfohlene Optionen** (nicht angewendet, Entscheidung offen):
  1. **Skew Protection** via `deploymentId` (Next 16, `next.config.ts` bzw. `NEXT_DEPLOYMENT_ID`): hängt `?dpl=<deploymentId>` an alle Static-Asset-URLs, setzt `x-deployment-id` auf Navigationen und erzwingt bei Mismatch eine Hard-Navigation. Löst die Asset-Mischung an der Ursache. **Achtung:** Static Assets werden dadurch nach jedem Deploy erneut geladen (~1 MB) — der Cache-Gewinn der `immutable`-Header sinkt; `'use cache'`-Keys invalidieren bei jeder Deploy-ID (hier unkritisch, Deploys sind selten).
  2. **Cloudflare-Purge nach Deploy** (z. B. Coolify-Deploy-Hook → CF-Cache-Purge für `/_next/static/*`): behebt den Edge-Stale-Teil, lässt aber Browser-Caches (1 Jahr `immutable`) unberührt.
  3. Nichts tun + im Deploy-Runbook vermerken: Bei „Seite lädt nicht / Hydration bricht" zuerst Hard-Reload + CF-Cache prüfen.

  **Regel:** Nach jedem Deploy bei unerklärlichem Client-Crash zuerst `last-modified`/`etag` eines Chunk-Files am Edge gegen einen Cache-Buster-Request vergleichen (`cf-cache-status`). Weichen sie ab, ist es Cache-Skew, kein App-Bug.

- **[i18n] `de`-Diagramm-Copy war korrekt, `en` leakt Deutsch (offen)** (05.11.2026): Der `architectureDiagram`-Block auf `home` (id 4) rendert auf `/de` vollständig deutsch (4 Layer × 3 Prinzipien). Ein erneutes Schreiben der deutschen Texte ist **nicht** nötig und wurde bewusst unterlassen (kein Busywork, kein Überschreib-Risiko). Tatsächliches Problem an anderer Stelle: `de` und `en` sind im `translations`-Global und bei mehreren `home`-Blöcken **byte-identisch** — `en` erbt die deutschen Texte (bekannt, siehe „Still wrong" in `.visual-test/HANDOVER-UI.md`). Wer `en` „repariert", muss zuerst prüfen, ob die Quelle tatsächlich der `en`-Locale-Eintrag ist und nicht ein Fallback.

- **[Payload/Seed+Drafts]** `payload.create` bei drafts-enabled Collections defaultet `_status: 'draft'` — seeding-created Seiten waren unsichtbar für die published-only Public-Reads (Gate 404 trotz erfolgreichem Write). Merke: ein Create ohne explizites `_status: 'published'` + `draft: false` landet als Draft. **Heute gilt:** Content wird via Payload-MCP gesetzt (dort `_status`/`published` explizit mitgeben); der frühere Live-Hotfix via REST `PATCH /api/pages/<id>` ist **nicht mehr erlaubt** (siehe „Payload-MCP"). (04.11.2026, /skills-404 nach Seed; Regel verschärft 05.11.2026).

- **[Payload/Blocks]** `layout`-blocks-Field ist **NICHT jsonb**: Payload 4 + Postgres normalisiert jeden Blocktyp in eigene Tabellen (`pages_blocks_<slug>` + `pages_blocks_<slug>_items` + `_pages_v_blocks_<slug>*`-Versions-Tabellen). Neuer Blocktyp = **IMMER `npx payload migrate:create <name>`** (Snapshot-Diff, `*.json` mitcommitten) + Deploy erst danach — sonst seedet Local API gegen `relation "pages_blocks_skillset" does not exist` (500). Falsche Annahme „Block = JSON im layout-Field → keine DDL" (04.11.2026, Skillset-Feature; Seed 500, Migration nachgereicht).
- **[Payload/Blocks]** `type: 'text', hasMany: true` in einem Block (z. B. `tags` als „array of text") erzeugt KEINE block-spezifische Tabelle, sondern eine **geteilte Join-Tabelle pro Collection** (`pages_texts` + `_pages_v_texts`), diskriminiert über die `path`-Spalte — anders als `type: 'array'`-Felder, die `pages_blocks_<slug>_<field>`-Tabellen bekommen. Auch das ist echte DDL in der Migration (kein jsonb), also normal committen. (04.11.2026, spec-rebuild-Blöcke CaseStudy/Timeline/Testimonial/TechRadar).

- **[Coolify/Build] `payload build` (v4-beta.6) bricht DB-less-Build (03.11.2026, PR #28-Revert `fix/db-less-build`):** Das Aggregat-CLI (`payload build` = importmap+types+next build) lädt die Payload-Config über `createRuntime` bei Build initial und initialisiert den Postgres-Adapter → `Error: DATABASE_URL is missing` (`envConfig` hard-fail). Bricht den Coolify-Build (`is_buildtime:false` → keine DB-Env im Build-Container), während die klassischen CLI-Subkommandos (`payload generate:importmap`/`generate:types`) env-less funktionieren. Lokal grün, weil Projekt-`.env` die `DATABASE_URL` liefert — Docker-Repro bestätigt Fehler nur ohne .env. Fix: `build` bleibt `next build`; Re-Trial-Bedingung: Datenbank-tolerantes Runtime-Load in Payload (createRuntime ohne DB für generate-only) oder Coolify-Prod-abweichendes Build-Env. Besehen in `node_modules/payload/dist/cli/runtime/createRuntime.js`.

- **[Next-16/ensureStatic]** `ensureStatic` (seit 16.4.0, braucht `cacheComponents` + `partialPrefetching`): `'shell'` ist der aktuell genutzte Level für `settings` + `impressum` (App Shell des default-Link-Prefetchs muss statisch). `'navigation'` (vollstatisch, hart validiert) verlangt eine statisch prüfbare Route — mit dem dynamischen `[locale]`-Shell (Streaming) und dem Frontend-Datencache bricht der Build mit `static-route-dynamic`. **Update 05.11.2026:** der frühere Grund (NotFoundGate als bewusster Blocking-Render im Layout) ist entfallen — der Gate ist entfernt, der 404-Status entsteht im Proxy. Ein Upgrade auf `'navigation'` ist damit wieder prüfbar, aber NICHT verifiziert; nicht ohne Messung anheben.

- **[TS 6/Upgrade]** TypeScript 6.0.3 (01.11.2026, exakt gepinnt, letzte JS-Compiler-Serie vor TS 7 — TS 7 native hat keine JS-API, typescript-eslint-Peer `>=4.8.4 <6.1.0` zwingt zu <6.1): tsconfig braucht `types: ["node"]` (TS 6 defaultet `types: []` → sonst `process.env`-Typing weg) und `baseUrl` ist deprecated/entfernt — `paths` funktionieren ohne (Entries relativ zur tsconfig); Projekt nutzte baseUrl nur als paths-Präfix, kein Code-Change nötig. Verify-Kette (tsc/lint/generate:types/build/vitest) lief ohne weitere Anpassungen durch.
- **[TS/TS7-Hybrid]** Natives TS 7 (Go-Compiler, keine JS-API) parallel als Alias-DevDep `"@typescript/native": "npm:typescript@7.0.2"` (EXAKT pinnen, kein `^` — dist-tag latest wandert; `@typescript/native` existiert nicht auf npm, `npx @typescript/native` → E404). TS 6.0.3 bleibt kanonisch (typescript-eslint-Peer <6.1, Payload-CLI/tsx/next build laden `require('typescript')`). Fallstricke: (1) `.bin/tsc` bei zwei Packages mit `bin: tsc` wird von npm **lautlos last-wins** verlinkt — im Projekt resolved `npx tsc` dadurch jetzt auf TS 7.0.2 (nicht TS 6!), deshalb Skript **Direkt-Pfad-Pflicht**: `node node_modules/@typescript/native/bin/tsc --noEmit`; Kanonisch tsc-Aufrufe nur via explizitem `node node_modules/typescript/bin/tsc`. (2) Next 16 `useTypeScriptCli` resolvet das echte `typescript`-Package (unberührt → Build-Autorität bleibt TS 6). (3) TS7-Advisory `npm run typecheck`: 0 exit, ~1.0 s vs. TS6-TSC 3.1 s (ohne npm-Overhead). (4) Keine Shim-Variante (`typescript: npm:@typescript/typescript6`) — kein `bin.tsc`, bricht Next-CLI-Discovery. Upgrade-Pfad zu echtem TS 7 erst wenn typescript-eslint #10940/#12803 (TS7-API) und vercel/next.js #97334 (Shim-Aliase) released sind.

- **[Payload/Secret-Rotation] `PAYLOAD_SECRET` NIEMALS naiv per Coolify-PATCH tauschen — zerstört die API-Keys (MCP!)** (05.11.2026, verifiziert gegen die installierte Payload-Version + Docs). Das Secret ist **nicht** nur ein JWT-Signaturschlüssel: es **verschlüsselt die `api_key`-Felder at rest und bildet den `api_key_index`** (HMAC), über den API-Keys nachgeschlagen werden. Ein reiner Env-Swap macht damit **jeden** API-Key unlesbar → der Payload-MCP (`Authorization: users API-Key …`) authentifiziert nicht mehr, bis re-keyed ist. Stand der Messung: genau ein User (`agent@mosthi.de`) hat einen aktiven Key (`api_key`/`api_key_index` gesetzt), die anderen zwei nicht. Passwort-Logins bleiben unberührt (per-User-Salt, kein Secret). Korrekter Ablauf (alle Bausteine sind in `payload@4.0.0-beta.6` vorhanden, `payload/dist/auth/rotateSecret.d.ts`):
  1. Neues Secret erzeugen, als aktives `secret` setzen **und** das alte in `previousSecrets: [...]` (`buildConfig`) aufnehmen — beides als Env (`PAYLOAD_SECRET` neu, `OLD_PAYLOAD_SECRET` alt), `is_buildtime: false`.
  2. Deployen; in diesem Fenster verifizieren alte JWTs weiter, neue Daten werden unter dem neuen Secret geschrieben.
  3. `rotateSecret({ payload, oldSecret, dryRun: true })` → dann ohne `dryRun` laufen lassen: re-keyed `apiKey`/`apiKeyIndex` idempotent und fail-closed (Zeile, die zu keinem Secret passt, bricht ab, ohne zu schreiben).
  4. Erst **nach** erfolgreichem Re-Key `previousSecrets` leeren und erneut deployen.
     Merke: Die Rotation invalidert **alle** Admin-Sessions per Design (Re-Login nötig) — das ist erwartet, nicht ein Fehler. Ein Deploy ist nur nötig, weil `previousSecrets` Config ist; ohne Schritt 1+2 gibt es kein Zero-Downtime-Fenster.

- **[Payload/Upload]** `media`-Collection erlauben nur explizite image-mimeTypes (`image/png`, `image/jpeg`, `image/webp`, `image/avif`) — SVG ausgeschlossen (XSS via Upload-Storage), kein Wildcard `image/*`. User-Auth-Cookies via `cookies: { secure: true, sameSite: 'Strict' }` in der Users-Collection-Config gehärtet (Live-Preview-iframe ist same-origin → Strict ok).
- **[Sicherheit]** ~~Seed-Routen (`/api/seed-home`, `/api/seed-globals`)~~ — **entfernt am 05.11.2026.** Die Routen (samt `src/app/api/_seedGuard.ts` und `ALLOW_SEED`) sind gelöscht; **Content wird ausschließlich via Payload-MCP gesetzt** (Verbot + Ausnahmen siehe Abschnitt „Payload-MCP"). Nicht wieder einführen. Die generelle Regel bleibt: externe API-Routen nie ohne Auth-Gate + Prod-Gate, Error-Responses nie mit Stack/Debug-Details (nur serverseitiges `console.error`).
- **[Payload-Admin]** `admin.components.actions`-Einträge sind direkt `CustomComponent` (= `PayloadComponent`; String-Pfad via importMap baseDir oder `{ path }`) — kein `{ Component: '...' }`-Wrapper (TS2353). Custom-Views (`AdminViewConfig`) dagegen WOHL mit `Component`, `path`, `meta`. `@payloadcms/ui`-Button: `buttonStyle="destructive"` (kein `'error'`).
- **[Cache]** `revalidateTag` in Next 16 verlangt 2-Arg `revalidateTag(tag, 'max')` (Single-Arg deprecated → TS-Fehler); `connection()` kommt aus `next/server` (nicht `react`) und muss inside `Suspense` laufen, sonst blockierende Navigations-Shell (Next-16 cacheComponents).
- **[TS]** "Cannot find module" auf Barrel: Ursache war das falsche Pfadlevel (`../cache/frontendCache` statt `../cache/frontend/frontendCache`) — zuerst Pfadlevel/Trace-Resolution (`tsc --traceResolution`) prüfen, nicht TS-Config fixen.
- **[Deployment]** Cloudflared-Tunnel + Traefik `is_force_https_enabled=true` (default) → Redirect-Loop (Tunnel-Ingress trifft Traefik auf :80, wird zu https geforced, Cloudflare ruft wieder http auf … endloser Redirect) → Lösung: `docker_compose_domains` mit `"is_force_https_enabled": false` per PATCH setzen (Tunnel/Cloudflare übernimmt HTTPS-Terminierung).
- **[Deps/Audit]** Transitive Critical-CVEs (z. B. dompurify 3.4.15 via monaco-editor/@payloadcms/ui) werden von `npm audit fix --package-lock-only` nicht gehoben, wenn der betroffene Range von einer Zwischen-Dep gepinnt ist → Lösung: npm-`overrides`-Block in `package.json` (exakte Version, z. B. `"dompurify": "3.4.17"`) + Lockfile-Regen. Begleitender Rollback der Zwischen-Dep (monaco 0.57.0→0.56.0) ist okay, solange das Audit danach nicht schlechter ist. Lockfile-Regen mit Remote-Tarball-Deps braucht `NPM_CONFIG_ALLOW_REMOTE=all` (npm ≥ 12).
- **[Payload-V3→V4-Migration]** Deployment ohne `src/migrations` → frisches Postgres-Volume ohne Schema (App-Container bootstrapped die DB nicht). → Lösung: generierte Migrationen committen; frisches Volume über One-Shot-Tooling-Container (`npx payload migrate`) bootstrappen — das CI-Script (`payload migrate && next build`) läuft im Standalone-Image nicht.
- **[Migration-Generierung]** Vor Postgres-only diffte `payload migrate:create` mit Default-sqlite-Adapter Postgres-Snapshots (`concurrently`/`method`-Index-Keys) → Drizzle-Zod-Validation-Fehler; es brauchte `DATABASE_TYPE=postgresql DATABASE_URL=postgresql://x:x@localhost:5432/x npx payload migrate:create <name>` als Prefix. Seit Postgres-only (01.11.2026) ist der postgresAdapter der einzige/Default-Adapter — `npx payload migrate:create <name>` diffed direkt gegen den Postgres-Snapshot, Live-DB nicht nötig.
- **[Migrations-Data-Default]** Auto-generierte `migrate:create`-Migrationen übernehmen Feld-Default-Datenblind (beim Draft-Feature-Aktivieren: `pages_locales._status DEFAULT 'draft'` → Bestandsdocs wurden draft, Public-Read published-only lieferte Null → gesamt /en 404 auf Prod). → Flow: nach migrate:create immer Datenspalten-Defaults prüfen; für Bestandsdaten-Defaults direkt handgeschriebene Daten-Korrektur-Migration hinterher (Guard IS DISTINCT FROM), zusätzlich Prod-Daten-Hotfix während Deploy.
- **[Coolify/Domain-Routing]** `docker_compose_domains`-PATCH akzeptiert in der aktuellen Coolify-Version nur `name`/`domain`/`redirect` — `is_force_https_enabled` im JSON führt zu 422 („Only name, domain, and redirect fields are supported"). Force-HTTPS ist App-Setting/Default, nicht Domain-Item.
- **[Sicherheit]** Container-Env-Probe (`docker exec <app> env`) druckt `DATABASE_URL` inkl. Passwort in den Chat → Lösung: nie Env-Werte ausgeben; bei Leak `POSTGRES_PASSWORD` rotieren via Postgres-`ALTER USER` + Coolify-Env-PATCH (`PATCH /applications/{uuid}/envs`) – Volume-Reset nicht nötig; App-Env via Force-Redeploy propagieren.
- **[Next-16/Streaming] Unbekannter Slug lief HTTP-200 statt 404** (final behoben 05.11.2026): sobald die Shell streamt (Suspense-Fallback/`loading.tsx`) oder `generateMetadata` auflöst, ist der Status auf 200 fixiert (Doku: Streaming page responses begin with a `200` status code). `notFound()` aus Page UND `generateMetadata` half NICHT (live gemessen). **Lösung:** Status im **Proxy** setzen (`NextResponse.next({ status: 404 })`), Route rendert normal, `[[...slug]]/not-found.tsx` fängt das `notFound()`. `rewrite(..., { status: 404 })` funktioniert NICHT (wird zu 307). Der frühere NotFoundGate im Layout ist entfernt und bleibt entfernt (siehe Abschnitt 404-Handling). Verifikation: `/de/dehj`, `/en/nix`, `/de/foo/bar/baz` → 404 mit lokalisierter Seite inkl. Header/Footer; `/de`, `/en`, `/de/leadership` → 200.
- **[Payload-Version] Upgrade beta.6 → beta.7 (07.11.2026)** — alle `@payloadcms/*`-Pakete + `payload` exakt auf `4.0.0-beta.7`; `@payloadcms/next` peer verlangt weiterhin `next >=16.4.0 <17` (16.4.5 ok), `graphql ^16.8.1` (16.14.2 ok). Die einzige Schema-Änderung ist additiv: Migration `20261107_112826_add_session_refresh_columns` (`refresh_count`/`refreshed_at` auf `users_sessions` + `_users_v_version_sessions`, nullable) aus dem neuen Feature „refresh tokens". Upgrade-Flow: `package.json` pinnen → **`node_modules` + `package-lock.json` löschen und frisch installieren** (inkrementelles `npm install` scheitert mit `ERESOLVE` „Conflicting peer dependency: payload@4.0.0-beta.7", weil npm die alt gepinnten `@payloadcms/*`-Peers nicht auflösen kann) → `npx payload migrate` → `generate:types` + `generate:importmap` → lint/typecheck/vitest/`npm run build` → Standalone-Smoke (`/de`, `/en`, `/admin`, `/api/health`, 404-Slug). Verhaltens-Notiz: `auth.refreshTokens` ist **opt-in** (Feld bleibt aus, Login liefert weiterhin nur `token`); der `-original`-Suffix für retained upload originals entfällt — nicht relevant, weil `media` keine `retainOriginal`-Nutzung und keine solchen Dateien hat. Import-Map-Regenerierung: beta.7 schreibt **ohne** Semikolons (Prettier-konform), Diff ist rein kosmetisch.
- **[Payload-beta.6/LocalAPI]** Local-API-Default hat sich geändert — Local-Operations defaulten `overrideAccess: false`, Int-Test `tests/int/api.int.spec.ts` schlug mit „Forbidden" fehl; Fix: `overrideAccess: true` im Test (bewusster Stack-Verifikations-Bypass).
- **[Payload-LocalAPI]** `revalidateTag`-Fortschritt via tsx-Subprozess-Script (Local API) → `Invariant: static generation store missing` → `safeRevalidate` skippt. Verifizier-Tooling für OSR: Mutieren statt via Subprozess via REST `PATCH /api/pages/<id>?locale=en` (Cookie-Session) — Hooks feuern dann im Next-Server-Kontext.
- **[Feature-Rückbau] Wartungsmodus komplett entfernt (05.11.2026)** — nicht neu bauen ohne Auftrag. Entfernt: `src/components/MaintenanceScreen.tsx`, `src/cms/maintenance/*` (`state`/`snapshot`/`server`), `src/cms/globals/siteSettings/maintenance.ts`, `src/cms/globals/translations/maintenance.ts` (Gruppe `translations.maintenance`), Felder `maintenanceMode`/`maintenanceWindow`/`maintenanceMessage`, `CACHE_TAGS.maintenance` + `revalidateMaintenanceCache()`, der `maintenanceMode`-Branch **und der `payload.auth()`-Read** im `[locale]`-Layout. DB-Rückbau als **neue** Drop-Migration `20261105_140354_remove_maintenance_mode` (`DROP COLUMN IF EXISTS`), die alte `20261101_194051_maintenance_mode` bleibt unangetastet (Historie append-only). Lernpunkt: ein Session-Read (`payload.auth()` im Layout, nur für „eingeloggte Admins sehen die echte Seite") ist die teuerste Art, eine Shell zu bauen — er zwingt die komplette `LayoutShell` in den per-Visitor-Pfad und entwertet `'use cache'`. Wird so ein Feature angefragt, den Auth-Check in einen eigenen Suspense-Boundary legen statt um den ganzen Shell.
- **[Cache/OSR] „Globals revalidieren, Pages nicht" (04.11.2026, Root-Cause verifiziert):** Next 16 markiert Invalidierungen als In-Doubt-Timestamp (`revalidatedAt`); ein Cache-Entry ist nur stale, wenn `entry.timestamp <= revalidatedAt` (`node_modules/next/dist/server/lib/incremental-cache/file-system-cache.js`). `revalidateTag(tag, 'max')` (= 1-Jahr-Stale-Fenster) liefert bei Treffer weiter den ALTEN Entry und revalidiert nur im Hintergrund — im langlaufenden Container ohne neuen Route-Request kommt nie frische Daten. Zusätzlich cacht der Layout-Entry SiteSettings+Navigation zusammen (`cms:global:*`), deshalb fiel ein Globals-Flush spürbar aus dem Cache. **Fix:** `safeRevalidate(tag, label, 'blocking')` → `revalidateTag(tag, { expire: 0 })` (Read-your-own-writes); `revalidatePagePathCache` invalidiert zusätzlich das Domain-Tag `cms:pages`. Merke: für CMS-Content NIE `'max'` verwenden.
- **[Next-16/Headers]** Security-Header auf `next.config.ts` (HSTS/nosniff/Referrer/Permissions-Policy, scobio2026-Muster — non-CSP-Teil): `X-Frame-Options: DENY` NICHT nutzen bei Payload-Live-Preview (Admin embeddet `/preview` Route als iframe; gleiche Origin) → SAMEORIGIN. **SAMEORIGIN allein reicht NICHT** — siehe Live-Preview-Eintrag unten (`frame-src 'self'`).
- **[Live-Preview/CSP] Der Blocked-Frame-Placeholder im Admin kam von `frame-src` des EINBETTENDEN Dokuments, nicht von `frame-ancestors`/`X-Frame-Options`** (05.11.2026, lokal am Prod-Standalone-Build bewiesen).

  Symptom: Live Preview im Admin zeigt „Dieser Inhalt ist blockiert …" (Chrome/Android), obwohl `/de/preview` mit 200 + `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` antwortet und `payload.auth()` den User sauber liefert (Preview war NICHT auf „Kein Zugang" gefallen).

  Beweis (Konsole des **Admin**-Dokuments beim Framen der same-origin Preview):

  ```
  Framing 'http://127.0.0.1:3005/de/preview?slug=home' violates the following
  Content Security Policy directive: "frame-src https://www.googletagmanager.com".
  The request has been blocked.
  ```

  Ursache: `next.config.ts` setzte global `frame-src https://www.googletagmanager.com` (nur GTM-iframe) — **ohne `'self'`**. `frame-src` steuert, was das Dokument SELBST einbetten darf; das Admin-Panel embeddet `<iframe id="live-preview-iframe" src="<admin-origin>/<locale>/preview?slug=…">`. `X-Frame-Options`/`frame-ancestors` regeln nur die Gegenrichtung. Wirkungslos geprüfte Hypothesen: (a) Origin-Mismatch — Payload löst relative `livePreview.url`-Pfade per `formatAbsoluteURL()` gegen `window.location.origin` auf (`@payloadcms/ui/dist/utilities/formatAbsoluteURL.js`), Preview-Origin ist also deterministisch die Admin-Origin; Alt-Domains 301-en auf `mostheimer.de`; (b) `SameSite=Strict` auf `payload-token` — Cookie-Send entscheidet die Site, nicht die Origin, und `Strict` blockt nur Cross-**Site**; (c) `cacheComponents`/`connection()` — die Route rendert pro Request (`cache-control: private, no-cache, no-store`, kein `use cache` im Layout-Shell, `data-x-preview-probe` änderte sich bei zwei identischen Requests).

  Fix: `frame-src 'self' https://www.googletagmanager.com` (Enforce **und** Report-Only), `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` bleiben unverändert strikt. Verifikation lokal: Admin-Edit-View → iframe lädt Preview-Inhalt, keine CSP-Violation (`/tmp/opencode/preview-check.png`), anonymer Aufruf ohne Cookie liefert weiter „Kein Zugang". **Lehre:** Ein blockierter same-origin-iframe immer erst über die Konsole des **embedder**-Dokuments prüfen (`frame-src` / „Refused to frame"), nicht über `frame-ancestors` am eingebetteten Dokument — die beiden Direktiven sind entgegengesetzte Richtungen.

  **Erledigt 05.11.2026 — `router.refresh()`/Reload-Ansätze sind ABGELÖST durch `useLivePreview`.** Der Preview-Inhalt ist jetzt eine **Client-Komponente** (`src/components/preview/PreviewLive.tsx`, `'use client'` + `@payloadcms/live-preview-react`), die die Admin-Formularwerte clientseitig merged und aus **Daten** rendert (Preview-Block-Dispatcher: `src/components/preview/PreviewBlocks.tsx`). Die Offen-Notiz gilt nur noch historisch.

- **[Live-Preview/useLivePreview] Kein `router.refresh()`, kein Reload — der Preview rendert aus GEMERGTEN DATEN** (05.11.2026, Prod-Standalone gemessen).

  **Aufbau (Verantwortungsgrenze Server/Client, verbindlich):**

  | Ebene                                                                        | Wo                                                                                                | Bemerkung                                            |
  | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
  | Auth-Gate (`payload.auth()` + `payload-token`-Cookie)                        | `src/app/(frontend)/[locale]/preview/page.tsx` (Server)                                           | **darf nie** in den Client wandern                   |
  | Draft-Fetch (`draft: true`, `overrideAccess: false`, `depth: PREVIEW_DEPTH`) | dieselbe Page (Server) → `initialData`                                                            | Ergebnis ist der **einzige** Datenweg in den Browser |
  | Rendering + Live-Merge                                                       | `src/components/preview/PreviewLive.tsx` (`'use client'`, `useLivePreview`) + `PreviewBlocks.tsx` | Blocks sind reine Prop-Renderer → client-tauglich    |

  Warum die naheliegenden Wege alle scheiterten (jeweils gemessen, nicht vermutet):

  | Ansatz                                            | Ergebnis                                                                                                                                                                                                                    |
  | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `router.refresh()` (Payload `RefreshRouteOnSave`) | RSC-Fetch `?_rsc=…` kommt (200), aber der Baum wird **aus dem prerenderten Shell** bedient → iframe bleibt auf dem alten Stand. Next-Docs (`use-router.md`): „`refresh()` … does **not** invalidate the server-side cache." |
  | `location.reload()` bei `payload-document-event`  | Funktioniert (Draft-Fetch ist `no-store`, ~1 s), ist aber ein **Voll-Reload pro Save**: Typing erscheint nicht live, Scroll-/Formularzustand im Frame geht verloren, und der Admin muss den `ready`-Handshake neu machen.   |
  | Admin-Formular-State clientseitig mergen          | **Funktioniert und ist der jetzige Weg** — keine Navigation, Live-Typing, Save ohne Roundtrip.                                                                                                                              |

  **Warum es jetzt funktioniert:** Der Blocker war **nicht** die Message-Zustellung (die kam immer an), sondern der Versuch, einen _Server-Render_ zu erzwingen: `RefreshRouteOnSave` → `router.refresh()` reichte mit `cacheComponents` + gestreamter `[locale]`-Shell (`connection()`) keinen neuen RSC-Payload durch; `location.reload()` war der Workaround, weil der einzige Weg zu „Save sichtbar" ein frisches Servierdokument war. `useLivePreview` braucht keinen Server-Render: die Admin-`payload-live-preview`-Message enthält die **Formularwerte**, der Hook holt sie sich per `POST /api/pages/<id>` mit `X-Payload-HTTP-Method-Override: GET` (→ populated/localized wie ein Find, Auth via Cookie `credentials: 'include'`) und re-rendert React aus **Daten**. Keystroke-für-Keystroke-Merge, kein Reload, kein Cache-Tag, keine OSR-Frage.

  Verifizierte Nachrichtenlage (`@payloadcms/ui` `LivePreviewWindow`, Beta.6): `payload-live-preview` (bei **jedem** Form-Change, trägt die Formularwerte, `origin = Admin-Origin`), `payload-document-event` (nach Save/Publish). `ready` meldet der Preview an `window.opener ?? window.parent` — der Hook macht das selbst (`ready()` in `@payloadcms/live-preview`); ohne diesen Handshake bleibt `appIsReady` false und der Admin postet **gar nichts**.

  **Gemessene Belege** (Prod-Standalone, Playwright, `/de/preview?slug=home` im Admin-iframe): Tippen im Heading-Feld → Preview-H1 ändert sich **live** (`FRESH-…` → `FRESH-… LPTEST`), `framenavigated` im iframe: **0** während Tippen, **0** nach „Save Draft", **0** nach Revert+Save. Screenshots: `/tmp/opencode/lp-before.png`, `lp-typing.png`, `lp-after.png`. `/de/preview` ohne Cookie → weiter „Kein Zugang" (200), `/de/dehj` → 404 unverändert.

  **Gotchas / Regeln:**
  - `PREVIEW_DEPTH` liegt in `src/cms/preview/constants.ts` und wird von Server-Fetch **und** Hook importiert — getrennte Kopien driften und Relationships kommen als id statt Objekt zurück.
  - **`serverURL`** kommt aus den Request-Headern (`x-forwarded-proto` + `host`) als Prop; er ist gleichzeitig `postMessage`-Origin-Filter (`event.origin === serverURL`) und Basis der Merge-URL — nie aus der Message lesen.
  - Ein Merge-Dokument ist **Formulardaten**, keine gefetchte `Page`: ein gerade angelegter Block kann ohne `blockType` ankommen → `isRenderableBlock()` filtert, sonst crasht der Frame.
  - **`components/blocks.tsx` NICHT `'use client'` machen:** die Preview hat einen eigenen Dispatcher (`PreviewBlocks.tsx`), also ein **typgespiegelter** Switch (neuer Blocktyp muss in beiden stehen). Der öffentliche Pfad bleibt Server-Component-Struktur. Gemessen (Chunks nach `/_next/static/`): `/de` 531.1 KB → 533.3 KB (**+2.2 KB, +0.4 %**, 12 Chunks vorher wie nachher, kein Live-Preview-Fragment auf `/de`/`/de/leadership`); `useLivePreview` liegt nur im Preview-Pfad (`0u39oviivm7mp.js`, ~40 KB, nur `/de/preview`). Die ±2 KB sind der neu gebaute, inhaltsgleiche Shell-Chunk (Turbopack-Shuffle), nicht die Preview.
  - Der Merge-Request geht per `fetch` gegen `serverURL` → **`connect-src 'self'`** in der CSP ist Pflicht (vorhanden).
  - **Test-Falle (kostete mehrere Fehlmessungen):** Der Admin merkt sich die zuletzt benutzte Locale (`locale`-Preference). Wer `#field-layout__0__heading` füllt, während der Preview `/de/preview` zeigt, schreibt in die **en**-Locale und sieht nie eine Änderung — die Preview war korrekt, die Erwartung nicht. Vor Live-Preview-Tests `iframe.src` prüfen (`/en/` vs `/de/`) und in dieser Locale editieren.
  - Verifikations-Hinweise: Admin-Login im E2E braucht einen **frisch gesetzten** Passwort-Hash (Local-API-`update` schreibt den Hash erst beim Speichern zuverlässig — nach jedem `tsx`-Update neu einloggen); Live Preview ist ein **icon-only** Toggle (`.doc-header button[aria-label*="Live Preview" i]`, nicht visible → `state: 'attached'`); DE-Locale über `?locale=de` in der Admin-URL.

- **[CSP]** Nonce-CSP in `proxy.ts` verboten (Next-Docs: Nonce erzwingt all pages dynamic → zerstört cacheComponents/ISR). Enforce-CSP folgt Nonce-freiem Docs-Muster: `script-src 'self' 'unsafe-inline'` (`unsafe-eval` nur dev), `style-src 'self' 'unsafe-inline'`; verschärfte Report-Only-Header (script/style-src strict) für späteren unsafe-inline-Abbau. Nonce/Hash-Alternative wäre `experimental` SRI (statisch-kompatibel).
- **[Consent/CSP]** Inline-`<head>`-Bootstrap (`dangerouslySetInnerHTML`) braucht unter der Nonce-freien CSP `script-src 'self' 'unsafe-inline'` — vorhanden. Ohne `connect-src` blockiert `default-src 'self'` JEDEN GTM-Beacon (fetch/sendBeacon an `google-analytics.com`), obwohl `script-src` das Container-Script erlaubt; beides zusammen testen, nicht nur das Script-Load. (05.11.2026, GTM-Feature.)
- **[Consent/Migration]** Feldgruppe in einer localized-Global-Definition (`Translations.cookies`) ohne Migration = `translations`-Global 500 in Prod, sobald die Definition auf `main` ist (Payload selektiert alle konfigurierten Felder). Neue Globals-Felder immer im selben Merge wie die Spalten-Migration ausliefern; rein additive `ADD COLUMN IF NOT EXISTS … DEFAULT … NOT NULL` füllt Bestandszeilen ohne Backfill. (05.11.2026, PR #57.)
- **[Consent/State]** Banner blieb nach Klick auf „Nur notwendige"/„Alle akzeptieren" offen, obwohl die Entscheidung korrekt in `mosthi.consent.v1` landete: `visible = mounted && (open || initialConsent === undefined)`. Der `initialConsent`-Anteil war für Erstbesucher DAUERHAFT `true` (nie nachbelegt), damit konnte `setOpen(false)` den Banner nie schließen — und bei unveränderten Toggles bailt React sogar gänzlich ohne Re-Render aus. Fix: explizites `undecided`-Boolean als EINZIGER Auto-Open-Trigger, das `decide()` (und `closeIfDecided`) auf `false` setzt; Toggle-/Speicher-Init kommt aus EINEM `getStoredConsent()`-Read im Lazy-Initializer. Merke: „automatisch offen" nie als Ableitung aus einem State formulieren, den der Schließ-Pfad nicht selbst mutiert — es braucht ein Flag, das der Aktions-Handler explizit löscht. Repro-Beleg: genau 2 Render-States (`mounted:false/true`) vor+`open:false` nach Klick, Banner trotzdem sichtbar. (05.11.2026, Bugfix.)
- **[Dev/Client]** `next dev` (Turbopack) in diesem Setup hydratisiert KEINE Client-Komponenten (Header-Suche inert, Banner erscheint nicht, HMR-Websocket `ERR_INVALID_HTTP_RESPONSE`, keine Console-Errors). Consent-/Client-Verhalten daher IMMER gegen den Produktions-Standalone-Build prüfen: `npm run build`, `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`, dann `node .next/standalone/server.js` (nicht `next start` — warnt bei `output: 'standalone'`). Playwright-Browser: `chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })`, weil die lokal installierte Playwright-Revision nicht zur Projekt-Version passt. CLS immer als **Delta** messen (mit vs. ohne Banner via vorbelegtem `mosthi.consent.v1`): Hero-Typing-Animation trägt ~0.021 vorbestehend bei, der Consent-Banner exakt 0. (05.11.2026, GTM-Verifikation.)
- **[Cache/Statics] „Unstyled Seite" = Cloudflare-Catch-all setzte `no-store` auf `/_next/static`** (05.11.2026, Prod-Bug). Symptom: HTML kam aus dem Edge-Cache (`HIT`), CSS/JS fehlten beim Besucher → Seite mit Inhalt, aber ohne Styles. Header-Beweis: der **Origin** lieferte korrekt `public, max-age=31536000, immutable` (geprüft via `ssh coolify "curl -sI http://127.0.0.1:3300/_next/static/…"`), durch Cloudflare kam dieselbe URL als `public, max-age=31536000, immutable, no-store` mit `cf-cache-status: BYPASS`. Ursache: die Catch-all-Response-Regel `no-store` (`20ea9da823…`) hatte die Expression `not (<content paths>)` — `/_next/static` ist **kein** Content-Pfad, also **matchte** die Catch-all-Regel die Assets und hängte `no-store` an. `no-store` gewinnt gegen `immutable` → Cloudflare cacht nie. `next.config.ts` war unschuldig (`headers()` setzt nie `Cache-Control` für Assets; Next-Doku: „cannot be overridden"). Fix: eigene `_next/static`-Regel **vor** der Content-Regel **plus** `_next/static` aus der Catch-all-Expression ausnehmen (zweiter Auswertungs-Pass!). Merke: „Catch-all `not (content)`" ist **kein** Catch-all für „nicht cachebar", sondern für „alles, was ich nicht bedacht habe" — jeder neue cachebare Pfad (`/_next/static`, `/fonts`, `/media`) muss dort ausgenommen werden, sonst stiller `BYPASS`.
- **[Cloudflare/Zone-Scope] Zwei Zonen existierten, aber nur EINE hält Content-Cache — die zweite zu purgen war reine Budget-Verbrennung** (Politik-Wechsel 05.11.2026). Cloudflare-Purges sind **zonen-scoped**, es gibt keinen host-basierten Purge; eine URL aus Zone B an `/zones/<A>/purge_cache` liefert **`success: true` und evictet nichts**. Das war ursprünglich als Grund fürs Purging BEIDER Zonen dokumentiert (`mosthi.de` + `mostheimer.de`), ist aber nach der Domain-Konsolidierung falsch herum: `mosthi.de`/`www.mosthi.de` beantworten nur noch **301** auf `https://mostheimer.de` (Traefik-Custom-File), und Redirect-Antworten liegen nicht als Content-Objekte im Edge-Cache. Ein Purge dort evictet also nichts und kostet einen der 5 Free-Plan-Requests/min. **Neue Politik:** gepurgt wird ausschließlich Zone `97b8bfd76c5ddbe777f5f185631859bc` (`mostheimer.de`) mit **beiden** Hosts `https://mostheimer.de` + `https://www.mostheimer.de`; Legacy-Hosts werden aus jeder Purge-Liste gefiltert (`resolveOrigins`/`contentOrigins`, Host-Filter in `purgeUrlsByZone`). `CLOUDFLARE_PURGE_ZONES` ist optional; ohne Wert greift genau EINE Zone (Default-Id, überschreibbar via `CLOUDFLARE_ZONE_ID`) — **nie** eine zweite implizit. Die generelle Lehre bleibt: Zonen-Scope ist real, `success: true` beweist nichts, und eine Zone, die nur redirectet, gehört nicht in die Purge-Liste.

- **[Cloudflare] `purge_everything` ist für einzelne Content-Objekte ebenfalls KEIN garantierter Flush** (05.11.2026, gemessen): zwei `purge_everything` (Operator-Skript `cf-purge.mjs --everything` im Container + MCP `POST /zones/{zone}/purge_cache`) plus ein URL-Purge lieferten alle `success: true`, während `/de` und `/en` weiter `cf-cache-status: HIT` mit **monoton wachsendem `Age`** (3536 → 3643 s) und der alten `last-modified` blieben. Gegenbeweis gleicher Zeitpunkt: `/de/impressum` wurde nach dem Purge mit `Age` 374 neu gecacht, und `/de?cb=<rand>` (Cache-Buster) liefert den aktuellen Stand vom Origin. Diese beiden Edge-Objekte altern also aus, statt zu purgen. Konsequenz: „API sagt success" ist bei **jedem** Purge-Typ kein Wirksamkeitsbeweis — immer `cf-cache-status`/`Age` nachmessen; bei hartnäckig bleibenden Objekten mit Cache-Buster gegen den Origin vergleichen, um Origin- von Edge-Problemen zu trennen.

- **[Cloudflare] Purge-by-Tag ist in diesem Setup ein stiller No-op** (05.11.2026, gemessen): Header-Transform-Rule setzt `Cache-Tag: mosthi-html` (Header ist in der Antwort sichtbar), `POST /purge_cache {"tags":[…]}` ⇒ `success: true`, aber das Objekt bleibt `HIT` mit monoton steigendem `Age` (445 → 449 → 453 s). Purge-by-tag ist damit **kein** Weg zur strukturellen Asset-Ausnahme; URL-Purge + Filter (`isPurgeablePath`) ist die funktionierende Variante. „API gibt 200" ist **kein** Beweis, dass ein Purge gewirkt hat — immer `cf-cache-status`/`Age` nachmessen.
- **[Cloudflare/Redirect]** Trailing-Slash-Regel: Free-Plan kann **kein** `regex_replace` in `target_url` (Fehler „not entitled … Business plan or a WAF Advanced plan"), und `if()`/`len()`/`sub()` sind dort **nicht** im Sprachumfang (`unknown identifier`). Funktioniert: `ends_with(path,"/") and path ne "/"` + `concat("https://", http.host, substring(http.request.uri.path, 0, -1))` + `preserve_query_string: true`, Status 308. `substring(…, 0, -1)` schneidet genau ein Zeichen — kein Regex, plan-konform.
- **[Cloudflare/Cache] 404-Poisoning bei Origin-Ausfall — die Content-Regel MUSS `http.response.code` prüfen** (07.11.2026, live reproduziert). Stoppt man den App-Container, verschwinden die Coolify/Traefik-Labels; der Catch-All (priority -1000) liefert den Placeholder. Die Content-Response-Rule (Host + `/de…`) überschrieb dessen `no-store` mit `s-maxage=2592000`, die Cache-Rule hatte `404 → 2592000` → der 404 wurde **30 Tage** gecacht und blieb nach dem Restart (`HIT 404`, Age 15). Plain-Restart purged nicht (`[cf-purge] … already purged — skipping`). Fix: Content-Regel nur `http.response.code lt 400`, 404/5xx fallen in die Catch-all-`no-store`-Regel, 404-`status_code_ttl` entfernt; Placeholder liefert für die Site-Hosts **503**. Verifiziert: erster Request während Ausfall → 404 `BYPASS`, zweiter → `BYPASS`, nach Restart → 200 `MISS`. **Lehre:** ein Placeholder, der 404 statt 5xx liefert, ist Gift für `stale-if-error` und für jede 404-TTL.
- **[Cloudflare/Cache] `/` (Sprach-Redirect) darf nicht in die Content-Cache-Regel** (07.11.2026, gemessen). Der Proxy entscheidet `/` per `Accept-Language` (`de` → `/de`, sonst `/en`); Cloudflare ignoriert `Vary`. Die Content-Rule ergänzte `s-maxage=2592000` auf den 307 → der erste Besucher fror die Sprache 30 Tage ein (`en-US` bekam `location: /de`, Age 61 184). `/` ist von CMS-Hooks nicht purgbar (`edgePurgePathsForTag` kennt nur `/de`/`/en`). Fix: `/` am Edge per `Accept-Language` redirecten (zwei Dynamic-Redirect-Rules, 307, Query bleibt) — kein Origin, kein Cache-Objekt; der Proxy-Fallback negotiiert weiterhin. Kein Cloudflare-Cache-Key-Vary auf Free.
- **[Cloudflare/Cache] Prefix-Match `/de` fängt `/design` & Co.** (07.11.2026). `starts_with(path, "/de")` matcht auch `/design`, `/demo`, `/eng…`; der sprachabhängige 307 wurde 30 Tage gecacht. Fix: segment-exakt (`path eq "/de" or starts_with(path, "/de/")`, analog `/en`). Ein einzelner alter HIT bleibt bis zum Purge — nach dem Regelwechsel Prefix-Purge (`prefixes: ["mostheimer.de/de","mostheimer.de/en"]`) fahren.
- **[Cloudflare/Cache] `status_code_ttl` überschreibt `s-maxage`** (07.11.2026, Doku + Messung). Die Cache-Rule `2xx = 86400` kappt **alle** 2xx, inklusive `/_next/static` (1-Jahr-Header) und Text/OG. Deshalb eigene Cache-Rules mit `override_origin`: static `31536000`, text `3600`, og/media/favicon `86400`. Der 30-d-`stale-if-error` bleibt trotzdem als Ausfall-Puffer. `s-maxage` im Response-Header ist für Besucher sichtbar, die echte Edge-TTL kommt aus `status_code_ttl`/`override_origin`.
- **[Cloudflare/Zone] „alle Rules löschen" reicht für `mosthi.de` nicht** (07.11.2026). Zone `mosthi.de` hat jetzt **eine** Regel: `cache: false` für `mosthi.de`/`www.mosthi.de`; Response- und Dynamic-Redirect-Ruleset gelöscht. Ohne diese eine Regel cached Cloudflare per Default weiter statische Extensions und 301s (`cache_level: bypass` ist als Zone-Setting **ungültig**, API 1007). Ergebnis: `301` + `cf-cache-status: DYNAMIC`, kein `Age`. Die Trailing-Slash-Regel lebt jetzt in der `mostheimer.de`-Zone (host-exakt apex); die alte mosthi-Regel listete `mostheimer.de`-Hosts, war dort aber zone-scoped wirkungslos.
- **[Cache/Warming] Warming erst nach Public-Release-Match** (07.11.2026). Nach dem Purge wird `https://mostheimer.de/api/health` gepollt, bis sie **dieselbe `release`** wie der lokale Container meldet; sonst würde das Warming während des Traefik-Switch die **alte** Release-Version vom noch aktiven Container wieder einlagern. Erst dann Routen + Assets durch den Edge holen. Bei fehlendem Match: Skip mit Warnung (Deploy bleibt grün). `--warm-only` (Cron/Operator) überspringt Purge/Marker/Token; Deploy-Warm läuft nur bei `failed === 0`.
- **[Cache/Warming] Bild-Assets brauchen relative CSS-Auflösung** (07.11.2026). `next/font` referenziert Fonts in CSS als `url(../media/<hash>.woff2)`; ein naiver `/_next/static/`-Regex findet sie nicht. Der Warm-Extraktor löst `url(...)` gegen die **CSS-URL** auf (→ `/_next/static/media/…`) und sammelt aus HTML `src`/`href`/`poster`/`srcset`/`imagesrcset`, `<meta og:image|twitter:image>` sowie `/favicon.ico` (Content-Hash-Query). `/media/*` und `/api/media/file/*` sind jetzt 1 d cachebar (Response-Rule entfernt `no-store`), `/og` 1 d, Favicon 1 d; 7-Tage-Cron hält sie warm, 30-d-`stale-if-error` überbrückt längere Ausfälle.
- **[Coolify/Scheduled Task] Wochen-Warm** (07.11.2026): App `mostheimer` (`vcfotnzye7fklxrh10i81npl`), Task `node /app/scripts/cf-purge.mjs --warm-only`, Cron `0 4 * * 1` (Montag 04:00). Kein Token nötig, kein Purge, keine Marker-Datei; läuft im App-Container. Kill-Switch `CF_WARM=0` wirkt auch hier.
- **[Cloudflare/Response] `set_cache_control` mit `max-age: 0` überschrieb die Browser-TTL der Bilder** (07.11.2026, Review). Die Content-Vorlage setzte `max-age=0` für **alle** Regeln; damit bekamen `/og`, `/media/*`, `/api/media/file/*` und `/favicon.ico` trotz `next.config`-`max-age=86400` ein `max-age=0` (jeder Bild-Request revalidiert). Fix: eigene `assetDay`-Vorlage mit `max-age=86400` für OG/Media/Favicon; Content behält `max-age=0`. Live: Favicon/OG `max-age=86400`, `HIT`.
- **[Cloudflare/Cache] Origin-404 trug öffentliche Cache-Header** (07.11.2026, Review). `next.config.ts` `headers()` ist statusunabhängig; der 404 vom Origin hatte `public, s-maxage=86400`. Bisher schützte nur die Response-Catch-all-Regel. Fix: Cache-Rule setzt **zusätzlich** `status_code_ttl` 4xx/5xx = `-1` (no-store) — zweite Schicht. Live: 404 `no-store` `BYPASS`.
- **[Coolify/Env] `CLOUDFLARE_ZONE_ID` zeigte auf die Legacy-Zone** (07.11.2026, Review). Prod + Preview standen auf `fc81dba8…` (`mosthi.de`); solange `CLOUDFLARE_PURGE_ZONES` gesetzt ist, gewinnt die Map (Log: Zone `97b8bfd7`). Fällt die Map weg, gingen Purges still an die falsche Zone (`success:true`, evictet nichts). Fix: beide Envs auf `97b8bfd7…` gesetzt, Kommentar „fallback only".
- **[Cache/Purge] 100-URL-Cap verwarf silently** (07.11.2026, Review). `sendPurge` slice-te auf `MAX_URLS_PER_REQUEST` und zählte trotzdem alle URLs. Fix: Warnung `[cf-cache] … URL(s) not purged` + Zählung nur der gesendeten URLs. Heute 40 URLs, unkritisch; bei Wachstum sichtbar.
- **[Cache/Root] `/` wird am Edge redirected, nicht gecacht** (07.11.2026). Free kann keinen Cache-Key nach `Accept-Language` (nur Enterprise; `Vary` wird ignoriert). Ein gecachter negotiated Redirect würde die Sprache des ersten Besuchers 30 d einfrieren. Fix: zwei Dynamic-Redirect-Rules am Edge — `lower(accept-language) contains "de"` → `/de`, sonst `/en` (307, Query bleibt). **First match wins**, die deutsche Regel steht deshalb vor dem Fallback. Kein Origin, kein Cache-Objekt, im Ausfall weiter 307. Der Proxy-Fallback negotiiert weiterhin (lokal/direkt).
- **[Turbopack/Stale-Cache #2]** `npm run build` im frisch erzeugten Worktree panickte mit `invalid utf-8 sequence of 1 bytes from index …` (SourceMap-Asset), obwohl derselbe Commit auf `origin/main` sauber baute. Ursache: vererbter/inkrementeller `.next`-Zustand aus dem Worktree-Anlegen (Nutzer lesen `node_modules`/`.next` vom Haupt-Checkout). Fix: `rm -rf .next` und erneut bauen → grün. Merke (wie beim `@tailwindcss/turbopack`-Fall): bei „Build-Panic ohne Codebezug" **zuerst** `.next` löschen, bevor Deps/Code verdächtigt werden.
- **[Coolify/Build-ARGs]** Coolify injiziert ALLE App-Envs als Build-ARGs (unabhängig von Compose-Refs) → Secrets landen in `docker history`-Layer. Fix: Coolify-Env-Flag `is_buildtime: false` (REST PATCH envs) + Compose-`$SECRET`-Referenzen entfernen. Nach jedem Deploy: `docker history <image> | grep -iE 'SECRET|DATABASE'` (presence-only, nie Werte drucken).
- **[Secure-Cookie]** `cookies: { secure: true }` + Safari: Secure-Cookie wird auf `http://localhost` NICHT gesetzt → Dev-Login in Safari bricht (Chrome/FF ok, localhost gilt dort als secure context). Hinweis-Only.
- **[CORP]** Media wird auch via `/api/media/file/:file*`-Endpoint ausgeliefert → CORP-Header doppelt setzen (beide Paths in `next.config.ts` `headers()`).
- **[ESLint/FlatConfig Overrides]** Spätere Entries in `eslint.config.mjs` gewinnen per-File: `files: ['src/migrations/**']` → `unused-imports/no-unused-vars: 'off'` für Payload-Codegen-Hook-Signaturen (`payload/req/db` ungebraucht). Override VOR dem globalen Plugin-Block wird stillschweigend von dessen Regel-Definition zugeschlagen (21 Warnings blieben) — Exemption gehört ans Array-Ende.
- **[Next-16/Metadata-File-Conventions]** `opengraph-image.tsx` (und alle Metadata-Dateikonventionen) sind im optionalen Catch-All `[locale]/[[...slug]]` NICHT colocierbar — Build bricht mit `Optional catch-all must be the last part of the URL` (die interne Metadata-Route `opengraph-image-<hash>` wird als Kind-Segment hinter den optionalen Catch-All gehängt; verifiziert 16.4.5). Per-Page-OG-Images stattdessen: explizite `openGraph.images` in `generateMetadata` → dedizierte Route `/og` (src/app/og/route.tsx; Query-Params t/s/loc, searchParams = on-demand ƒ). Zwei Folge-Constraints: (a) der Proxy (src/proxy.ts) redirectet `/og` sonst ins Locale-Format (307 für OG-Crawler) — exakt `/og` in die Skip-Liste (matcher skipped nur `_next`/`admin`/`api`/dot-Paths); (b) die `/og`-Route legitimiert die API-Route-Ausnahme (PNG-Byte-Response für externe OG-Fetcher, kein Write, daher keine Server Action). Zusätzlich: `src/public` ist im Dev-Server NICHT erreichbar (Docker kopiert es erst in den Runner unter /app/public) — statische Text-Assets wie `llms.txt` gehören als Route-Handler (`src/app/llms.txt/route.ts`, default-cached ○, kein DB-Read, Konstante in `src/cms/aeo/llmsTxt.ts`).
- **[Turbopack/Stale-Cache]** `Error: Cannot find module '@tailwindcss/turbopack'` beim Build, obwohl das Package installiert ist (npm ls sauber) → Stale-Turbopack-Build-Cache aus der Phase VOR `npm ci`/Node-Modules-Wechsel (Worktree über hart kopiertes node_modules, Concurrent-Prune am Main). Fix: `rm -rf .next` vor Dep-Debugging (verifiziert 03.11.2026).
- **[AEO/SEO-Schema]** JSON-LD- und Metadata-Layer (04.11.2026, Branch `feat/seo-schema-lighthouse`): `Person` (`src/components/StructuredData.tsx`) trägt `jobTitle` (Senior Fullstack Developer), `description`, `sameAs` (GitHub + LinkedIn), `email`/`telephone` (plain — NICHT `mailto:` in `contactPoint.email`, schema.org erwartet die nackte Adresse), `address`, `worksFor` (valantic DXA), `knowsLanguage`; bewusst KEIN `image`, `seeks` oder Verfügbarkeits-Claim. Per-Page-Aufbau: home → `WebSite` + `Person`-Graph; career → `ProfilePage` mit `Person.hasOccupation` aus den Timeline-Einträgen (`parsePeriod` versteht `09/2024`, `Seit 09/2024 – Heute`, `2012 – 2014`; offene Enden liefern nur `startDate`, unklare Strings gar nichts); case-studies → `WebPage` + `ItemList` aus den `caseStudy`-Blöcken; tech-radar/leadership/contact → schlanke `WebPage` (contact zusätzlich mit `Person`-Kontaktknoten); alle übrigen (privacy/imprint) neutraler `WebPage`. Metadaten: `pages` hat KEIN description-Feld → `derivePageDescription` (`src/cms/aeo/pageMetadata.ts`) leitet pro Seite aus dem ersten Block mit ≥ 40 Zeichen ab (hero.subheading → statusBlock.description → techSection.body → caseStudy → lexical richText), kürzt auf ~155 Zeichen an einer Wortgrenze; Seiten ohne verwertbaren Text erben die Layout-Default-Description (kein leeres Tag). `title: { absolute }` verhindert doppelte Brand-Suffixe; `alternates.languages` enthält `x-default` → `/de` (Primäraudienz) — `x-default` IST in Next 16 als `UnmatchedLang` im Metadata-Typ verifiziert (`node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts`), die frühere held-back-Notiz war ein false negative. `llms.txt` listet die acht aktuellen Slugs statt der gelöschten (skills/tech-stack/engineering/ai-vibe-coding/off-screen/track-record).
- **[Perf/CLS] Hero-Typing-Animation = CLS-Treiber** (04.11.2026, Lighthouse-Snapshot: Performance 85, alle anderen Metriken 100): `TypingHeading` tippte den LCP-Text zeichenweise und ließ die `h1` zeilenweise wachsen — der komplette Content darunter wurde mitgeschoben (gemessen 0.257 Layout-Shift bei 1280×900, ~1/3 Viewport). Fix: Der Wrapper reserviert die **Endhöhe** des Textes an einer unsichtbaren Volltext-Kopie (`ResizeObserver` + `document.fonts.ready` für Resize/Font-Swap) und die Animation läuft darin als reiner Paint-Effekt ohne Reflow; bis zur Messung `min-height: 1em`. Verifiziert im Kontrollharness: 0.115 → 0.000, identische Endhöhe. Merke: Tipp-/Reveal-Animationen auf mehrzeiligen Headings immer gegen die finale Geometrie klemmen.

- **[Perf/CLS] Verbleibender CLS auf `/de` + `/en` = Font-Swap der Hero-Subheadline, NICHT die Typing-Animation** (05.11.2026, Lighthouse mobil). Die H1-Höhenreservierung funktioniert (verifiziert: H1-Höhe konstant 166 px, während der Text von 205 → 297 Zeichen wächst — **keine** Reflow-Bewegung). Der Shift kommt eine Ebene tiefer: `p.mb-8` (Hero-Subheadline, `text-base`) wird zunächst mit `"Space Grotesk Fallback"` gemessen und bricht nach dem Laden der Web-Font auf eine Zeile mehr um.

  Gemessen (Lighthouse-Mobilbreite, Zeilenumbruch-Verhalten):

  | Font                                  | Höhe Hero-`p`     |
  | ------------------------------------- | ----------------- |
  | `"Space Grotesk Fallback"` (vor Swap) | 234 px (5 Zeilen) |
  | `"Space Grotesk"` (nach Swap)         | 260 px (6 Zeilen) |

  Layout-Shift-Eintrag: `startTime ≈ 391 ms`, `value 0.0495`, Quelle `P.mb-8` + CTA-Row. Lighthouse-CLS schwankt dadurch stark (0.309 / 0.58 in zwei Runs, `/de/settings` dagegen 0.000 → seiten-spezifisch, nicht global). Warme Session (Consent gesetzt, Fonts im Cache) misst nur **0.058**, davon ~0.05 der Subheadline-Rest.

  **Bewertung:** vorbestehend (die `display: 'swap'`-Konfiguration und die Fallback-Face stammen aus dem nächsten/font-Setup, nicht aus dieser Änderung) und **nicht** behoben — ein blinder Patch hier wäre Risk ohne Messung.

  **Fix-Kandidaten (nächster Schritt, bewusst nicht angewendet):**
  1. `adjustFontFallback` (Standard bei `next/font`, hier aktiv) liefert für die Subheadline keine ausreichende Deckung, weil sich die **Zeilenanzahl** ändert (5 → 6), nicht nur die Metrik pro Zeile. Wirksam wäre `size-adjust`/`ascent-override` auf einer dedizierten Fallback-`@font-face`-Familie, die auf dieselbe Zeilenanzahl kalibriert ist.
  2. `display: 'optional'` für Space Grotesk: Web-Font wird nur im ersten ~100-ms-Fenster verwendet, sonst bleibt der Fallback für diesen Load → kein Swap-Shift. Trade-off: Erstbesuch sieht ggf. den Fallback (zwei Besuchertypen, unterschiedliche Typo).
  3. Höhen-Reservierung des `p.mb-8` analog zur H1 (feste `min-height` in `em` auf Basis der erwarteten Zeilenanzahl je Breakpoint).
     Merke: CLS-Diagnose auf dieser Site **immer** pro Element via `PerformanceObserver` (`type: 'layout-shift'`, `entry.sources[].node`) machen — Lighthouse-Gesamtwerte schwanken hier zwischen 0.3 und 0.58, ohne dass sich die Substanz ändert.

- **[Perf/CLS] Ursache war die H1 (Typing-Animation ohne SSR-Text), NICHT die Subheadline — behoben 05.11.2026** (`fix/hero-cls`, Branch-PR). Die obige Bewertung „Subheadline-Font-Swap" war **falsch**; per `PerformanceObserver` über 5 Viewports × 2 Locales gemessen:

  | Was                         | Vorher                                                | Nachher                  |
  | --------------------------- | ----------------------------------------------------- | ------------------------ |
  | Quell-Knoten des Shifts     | `p.mb-8`, `dl`-Metrikzeile, CTA-Row, `mt-8`-Stack-Row | —                        |
  | Shift-Zeitpunkt             | 156–277 ms                                            | —                        |
  | CLS `/de` 768 / 1280 / 1920 | 0.0313 / 0.0236 / 0.0107                              | 0.0013 / 0.0032 / 0.0012 |
  | CLS `/de` + `/en` 375 / 390 | **0.000** (schon vorher, Umlaufdominanz)              | 0.0012–0.0029            |
  | Hero-`p`-Höhe vor/nach Swap | **konstant 104 px / 88 px** (kein Muster!)            | unverändert              |

  Widerlegung der Font-These: die Subheadline-Höhe ändert sich über den Font-Swap **nie** (Live-Sampling jedes Frame: 88 px bleibt 88 px). `next/font`s `Space Grotesk Fallback` ist zwar ~20 % schmaler (1180 vs. 1418 px), `system-ui` dagegen ~5 % breiter (1459 px) — beide ergeben bei 672 px Box 3 Zeilen. Erst bei 375–390 px kippt `system-ui` auf 4 (balancierte Wrapper-Box), deshalb dort 0 Shift.

  Echte Ursache: das `<h1>` war im **Server-HTML LEER** (`min-height: 1em`), die Typing-Animation tippte es erst nach Hydration — live getraced: `h1` 69 px (1 Zeile) bei 128 px, dann 138 px (2 Zeilen) bei ~199 ms. Genau dieser Sprung schob Metrik-/CTA-/Stack-Row.

  Fix (`src/components/TypingHeading.tsx`): der **Server rendert den Text jetzt sichtbar** (erste Paint = finale Geometrie). Nach dem Mount übernimmt ein Overlay, dessen Box-Höhe auf die SSR-Höhe gelockt ist (`overflow: hidden`); die Animation startet erst, wenn die **700-Face** geladen ist (`document.fonts.check('<weight> 1em "Space Grotesk")`, 1.5 s Safety-Timeout) — dadurch kein Swap mitten in der Animation. `useSyncExternalStore` (Server-Snapshot `false`) markiert „client-only" ohne `setState` im Effect (ESLint `react-hooks/set-state-in-effect`).

  Verworfen mit Messung: (a) kalibrierte Fallback-Faces (`size-adjust`-Sweep 104–112 %, Arial/system-ui/Palatino) — kein einziger Treffer möglich, weil **kein** Fallback den Vorteil konsistent hält und halb getippte Wörter (`Mayra Osthei|mer`) an willkürlichen Stellen brechen; (b) `display: 'optional'` — hätte den echten (H1-)Shift gar nicht adressiert.

  **Rest-CLS (Footer):** bei schnellem Laden schob `footer.mt-auto` einmal von `y=749` auf `y≈2004` (konstante Höhe 151 px, ~1 von 5 Laden). Ursache war NICHT der Hero, sondern der `Suspense`-Skeleton-Frame — der bringt eigenen Header/Footer mit, die Shell ist während des Streams exakt `100vh` hoch, `mt-auto` legt den Footer an den Viewport-Boden, im nächsten Frame springt er ans Dokumentende (CLS bis 0.4042 bei 375×667). Fix: `@utility min-h-page { min-height: max(100dvh, 1400px) }` in `globals.css`, gesetzt auf Skeleton UND beide Shell-Wurzeln statt `min-h-screen`. Verifiziert 375/390/768/1280 ohne Sprung; 1920×1080 bleibt bei ~50 px, weil der Inhalt (~2000 px) das 1400-px-Reservat übersteigt — neue Inhalte, die darunter bleiben, bringen den Sprung zurück, dann **das eine Reservat** anheben statt pro Seite zu patchen. Messfallen: der Sprung ist nur im Live-DOM-Zustand oder per Screencast sichtbar (nicht in `rAF`) — Details im Git-Verlauf von PR mit `min-h-page`.

  **Zweiter Mess-Fallstrick (wichtig für Nachmessen):** der Rest-CLS nach dem Fix ist **100 % der Typing-Caret** (`span.ml-1.inline-block`, fixe 22×53 px, wandert zeilenweise mit). Gemessen bei 1280: Gesamt 0.0074, davon **non-caret 0.0000**. Ohne Aufteilung nach `entry.sources[].node` sieht das aus wie ein Rest-Shift der Subheadline, ist aber reine Cursor-Position. Für die Akzeptanz zählt der Non-Caret-Anteil.

  **Kaum-Fehler beim Einbau (06.11.2026, live aufgefallen):** die Box-Höhe per `setState` + `useLayoutEffect` zu setzen ist EINEN Frame zu spät — React painted das Overlay erst ungeklemmt (`h1` 485 px) und schrumpfte dann auf 346 px (CLS 0.048 live, obwohl lokal 0.000). Bei kurzem lokalem Copy fiel das nicht auf, weil beide Höhen zufällig gleich waren. Richtig: Clamp **synchron im Ref-Callback** (`node.style.height = staticRef.height`) — der läuft beim DOM-Attach, vor dem Paint. Merke: Geometrie-Reservierung nie über State, wenn das Element im selben Commit schon sichtbar ist.

- **[Perf/CLS] `h1` darf KEIN `display:flex` sein, wenn ein `absolute`-Kind darin liegt** (06.11.2026, der eigentliche Live-Rest). Das Hero-`<h1>` hatte `flex justify-start`. Ein `absolute`-Kind ist im Flex-Kontext **trotzdem ein Flex-Item** und bekommt einen eigenen Platz im Row-Layout — die unsichtbare Mess-Kopie „fraß" Breite, das sichtbare Overlay wurde auf 485 px / **7 Zeilen** gequetscht statt 354 px / 4 Zeilen (in der Live-Messung als `span.block.w-full 184->181` + `p.mb-8 708->567` sichtbar). Fix: `flex justify-start` entfernt (war ohnehin wirkungslos, ein einziges Kind). Merke: Layout-Shift-Untersuchungen immer **auch** die eigenen Container-Displays prüfen — `absolute` heißt nicht „raus aus dem Layout", wenn der Parent Flex/Grid ist.

  Nach dem Fix (Live-Copy, lokal, Production-Standalone): 375 = 0.0033, 768 = 0.0030, 1280 = 0.0067, 1920 = 0.0032 — **non-caret überall exakt 0.0000**, H1-Endhöhen 166/125/346/354 px (= echte Space-Grotesk-Geometrie).

  **Mess-Fallstrick Nummer 2:** bei JS-off/SSR-Messung des Hero-`h1` die **sichtbare** Span nehmen (letztes Kind des `span.relative`-Wrappers). Die unsichtbare Mess-Kopie und der `sr-only`-Span liefern sonst falsche Zeilenzahlen (5 statt 3), was jede Fallback-Kalibrierung unbrauchbar macht.

- **[A11y/Command-Palette] Keycap im Trigger landete IM Accessible Name** (05.11.2026, live gemessen auf `/de`). Der Header-Suchbutton hatte `aria-label={`${t.triggerText}K — ${t.triggerLabel}`}` — also wurde das „K" der `<kbd>` doppelt in den Namen gebaut („SearchK — Search — open command palette"). Ein `aria-label` auf einem `<button>` **überschreibt** zwar den Inhalt als Namen, aber der falsch zusammengesetzte String war die Ursache, nicht das `<kbd>`. Fix: `aria-label={t.triggerLabel}` (identisch zum Mobile-Trigger) **und** `<kbd aria-hidden="true">` — Deko bleibt dekorativ, der Name ist genau ein Label. Verifikation im Accessibility-Tree (Playwright-Snapshot): `button "Search — open command palette"` mit Kind `generic [aria-hidden]: K`. Merke: „Keycap/Hint" gehört **nie** in den `aria-label`-String — bei Buttons mit sichtbarem Text reicht der Text selbst, bei Icon-only der Label; Zusatzinfos wie „⌘K" sind reine Deko.

- **[A11y/Copy-Button] `CopyButton` liest seine Texte aus dem `TranslationsProvider`, nicht als Props** (05.11.2026). `TechSectionBlock` ist eine **Server**-Component; `useTranslations()` gibt es dort nicht, und ein `await getCachedTranslations()` hätte den Block (und damit `BlockRenderer`) **async** gemacht — Kaskade durch den halben Seitenbaum. Stattdessen holt sich `CopyButton` (`'use client'`) die `clipboard`-Gruppe selbst aus dem Context. Fallstrick dabei: `TechSectionBlock` rendert **auch** auf der 404-Fallback-Chrome, wo der Provider fehlt (`SiteChrome showConsent=false`) → `useTranslations()` würde werfen. Dafür gibt es jetzt `useTranslationsOrNull()` (nicht-werfende Variante, neuer Export in `TranslationsProvider.tsx`) plus Per-Feld-Fallback in der Komponente. Annotation: `role="status"` + `aria-live="polite"` **neben** dem Button (nicht im Button) — der sichtbare Label-Text bleibt über Zustände stabil, damit der Accessible Name nicht springt. Fokus-Ring kommt explizit über `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`; kein CLS, weil nur ein `sr-only`-Span seinen Textinhalt wechselt.

- **[Payload/Migration-Drift] `migrate:create` nimmt fremde Default-Diffs mit** (05.11.2026). Die erzeugte `add_clipboard_translations`-Migration enthielt zusätzlich `ALTER COLUMN "site_name" SET DEFAULT 'Mayra Ostheimer'` — kein Clipboard-Schema, sondern der nachgezogene Default-Drift aus `SiteSettings.ts` (Snapshot trug noch `'Mostheimer'`). Regel: **die generierte Migration vor dem Commit lesen** und fachfremde Statements in ein eigenes Commit/Migration ziehen (oder bewusst lassen, wenn der Default-Drift ohnehin gewollt ist) — sonst koppelt man zwei unabhängige Schema-Themen in einem Rollback. Der Snapshot (`*.json`) bleibt dabei der Wahrheit für den **nächsten** Diff und muss mit dem TS übereinstimmen.

- **[Dev-Server] Stale `next-server` überlebt `rm -rf .next` als Deleted-CWD** (05.11.2026, kostete eine Fehlmessung). Nach `pkill -f "next dev"` lief ein `next-server`-Kindprozess weiter, dessen CWD auf ein **gelöschtes** `.next/standalone` zeigte (`/proc/<pid>/cwd -> … (deleted)`). Der Server antwortete weiter mit **altem** HTML, während die Quelle schon geändert war — es sah aus wie „mein Fix wird nicht übernommen". Diagnose: `lsof -i :3000 -sTCP:LISTEN` → PID → `readlink /proc/<pid>/cwd`. Behebung: `pkill -9 -f next-server` **plus** `pkill -9 -f "next dev"`, warten bis der Port frei ist (`ss -ltnp | grep :3000`), dann neu starten. Merke: „Server liefert alten Stand" niemals am Code debuggen, bevor die **PID und ihr CWD** geprüft sind.

- **[Beiwerk statt Verifikation] `ReleaseGuard` + `sessionStorage` erzeugte beim Messen eine Navigationsschleife** (05.11.2026). Nach mehreren Server-Neustarts mit unterschiedlichen Build-IDs hielt der Tab eine alte Release-ID; der Guard lädt bei Mismatch hart neu, was in der Messsitzung wie ein Endlos-Redirect aussah (`Execution context was destroyed` / „interrupted by another navigation"). Vor Browser-Verifikation daher `sessionStorage.clear()` + `localStorage.clear()` im Tab (oder frischer Context). Kein Produktbug — aber es kostet Messzeit, wenn man ihn nicht kennt.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## QA Iteration 3 — Anchor-IDs, Wording, Security (07.11.2026)

- **Anchor-IDs sind locale-abhängig:** die Architektur-Sektion (`BentoGridBlock`) rendert
  `id="architektur"` (de) bzw. `id="architecture"` (en). Der Hero-CTA muss dazu passen —
  im CMS ist `en/home → hero.ctaLink = "#architecture"`, `de/home = "#architektur"`. Die
  Command-Palette zieht per `EN_LABELS[...].href` nach. **Nie einen deutschen Anchor in
  EN-Content schreiben**: erloescht still (kein Scroll, kein Fehler).
- **„Schön Klinik" ist vorerst aus allen Inhalten entfernt** (Case Study + Career-Timeline,
  beide Locales). BORA, Allianz und hoerzu.de bleiben. Bei Textänderungen an den
  caseStudy-/Timeline-Einträgen also weiterhin ohne Schön-Klinik-Erwähnung.
- **Anrede DE:** Content-/UI-Seiten duzen, nur `impressum` und `privacy` siezen. Neue
  UI-Texte im `translations`-Global entsprechend duzen.
- **Keine hartkodierten deutschen UI-Labels in React-Komponenten:** `BentoCard` bekommt
  `locale` als Prop — der
  Card-Header (`Säule 0X` / `Pillar 0X`) wurde vorher hart deutsch gerendert.
