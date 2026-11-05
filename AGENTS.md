# AGENTS.md

## Projekt-Übersicht

**mostheimer** – Next.js 16 + Payload CMS v4 Anwendung mit Mehrsprachigkeit (EN/DE), Tailwind CSS v4 und TypeScript.

## Tech Stack

| Kategorie    | Technologie                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16.4.5 (stable) – App Router, Turbopack                                                                                                                                                                |
| Sprache      | TypeScript 6.0.3 (exakt gepinnt, strict mode) – kanonisch/Build-Autorität; natives TS 7.0.2 als `@typescript/native`-Alias-DevDep für `npm run typecheck` (Go-Compiler, 8–12× schnellerer Advisory-Typecheck)  |
| CMS          | Payload CMS 4.0.0-beta.6 mit Lexical Rich Text                                                                                                                                                                 |
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
- **Storage-Key:** `mosthi.consent.v1` (`{ analytics, marketing, decidedAt, version: 1 }`),
  ausschließlich browser-lokal, kein Server-Roundtrip. Parsing ist defensiv:
  kaputtes/fremdes Shape = „nicht entschieden" → Banner erscheint wieder.
  Inline-Bootstrap und Client nutzen dieselbe Funktion (`parseStoredConsent.toString()`),
  damit kein Drift entsteht.
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
      seed-home/      # Seed-Route für Startseite
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
- `SkillsetBlock` – Skill-Karten (Items: name, level als **Freitext-Badge** — bewusst kein Skill-Balken, description, iconName-Select mit leerer „Kein Icon"-Option, highlight); Block-CTA nur Label+Link; Featured-Sektion auf Home + Wiederverwendung je Kategorie auf `/skills` (Seed `seed-home`). Lucide-Gotcha: `Figma` (Trademark-Removal) und `FileCode2` existieren 2026 nicht mehr → `PenTool`/`FileCode`; iconName leer → gar kein Icon, kein CircleHelp-Fallback im SkillsetBlock.
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

## Payload-MCP (CMS-Zugriff, Stand 04.11.2026)

- **Verbindliche Regel:** Agents bearbeiten CMS-Daten (Pages, Globals, Media, User-Content) ab sofort **ausschließlich via den Payload-MCP-Server** (`mcp`-Server in der Projekt-`opencode.json`). Direkte Writes (Local-API-/Seed-/REST-Scripts, `payload.update`/`create`-One-Shots) nur noch ausdrücklich für **Infra-Fälle** (Migrationen, Seed-Infrastruktur, Tests) — nicht für Inhaltsänderungen.
- **Server-Bindings** (Projekt-`opencode.json`, beide `type: remote`, Header `Authorization: users API-Key {file:...}` — NICHT Bearer, Beta.6 authentifiziert Payload-native User-API-Keys):
  - `payload` (lokal): `http://localhost:3000/api/mcp`, Secret-File `~/.config/opencode/.secrets/payload-mcp-api-key`
  - `payload-prod` (Produktion): `https://mosthi.de/api/mcp`, Secret-File `~/.config/opencode/.secrets/payload-mcp-prod-api-key` (nur Pfad-Referenz — Werte nie lesen/printen)
- **Plugin:** `@payloadcms/plugin-mcp` exakt `4.0.0-beta.6` (in `src/payload.config.ts`); Scope: alle Built-in-Tools ON bis auf `delete@media`; `users` read-only (`find` via `overrideResponse` redigiert `hash`/`salt`). Machtkontrolle = Permissions des Key-Owner-Users (keine per-Key-Toggles in Beta.6).
- **Key-Erzwungene Reveal-Kette:** Key = `useAPIKey` am Owner-User (Users-Collection, `reveal: true`); Migration `20261104_165445_add_mcp_api_keys` legt `api_key`/`api_key_index`/`api_key_last4` an; Prod-Key in `~/.config/opencode/.secrets/payload-mcp-prod-api-key` (chmod 600), Secret-Files nie ins Repo.

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
- Domain `https://mosthi.de` in Coolify dem Service `app` zuweisen (`docker_compose_domains`); der Coolify-Proxy (Traefik) routet über den **published Host-Port**, nicht über das Compose-Network
- **KEIN weiteres `networks:`-Deklarat** ergänzen: einziger externer Netz-Eintrag ist `coolify-postgres-net` (external); alles andere bleibt implizites Projekt-Default-Netz (pro Coolify-Projekt isoliert; DNS-Aliase wie `postgres` kollidieren sonst mit fremden Stacks)
- Env setzen (siehe `.env.example`): `DATABASE_URL` (Coolify-App-Env, zeigt auf coolify-postgres), `PAYLOAD_SECRET`, `APP_PORT`
- Healthcheck: Docker `HEALTHCHECK` im Image trifft `/api/health` (force-dynamic, `{status:'ok'}`)
- Media-Uploads (Payload `media`) landen in `/app/public/media` und persistieren im Named Volume `media-data` (überleben Re-Deploys)
- Compose-Header im Repo dokumentiert den genauen Coolify-Setup-Ablauf (Resource anlegen, Compose-File angeben, Env, Domain, No-Networks-Regel)
- **Fertig (Stand 31.10.2026):** zentrale `coolify-postgres` live (`DATABASE_URL` Coolify-App-Env); Migration `20261031_224616` per `prodMigrations` auf dem postgres-Adapter (Migrate-on-Connect beim ersten Request) angelaufen; Content nativ (bento/status/tech, hero CTA2, NotFound) aus dem Vercel-DB-Dump importiert; Image 363 MB; `/sitemap.xml` `force-dynamic` (Build-Container erreicht die DB nicht)
- **Build-ARG-Secret-Leak-Schutz (01.11.2026):** Coolify injiziert ALLE App-Envs als Build-ARGs (unabhängig von Compose-Refs) → Secrets lesenbar via `docker history`. Secret-Envs (`PAYLOAD_SECRET`, `DATABASE_URL`) in Coolify mit `is_buildtime: false` (REST `PATCH /applications/{uuid}/envs`) gesetzt; Compose-`${...}`-Referenzen darauf entfernt (Compose-Headerlinien 18–19). Deployment healthy. Presence-Check nach jedem Deploy: `docker history <image> | grep -i 'SECRET\|DATABASE'` — Status/Ja-Nein only, nie Werte (Details „Gelernte Fehler").
- **Migration-Schema-Snapshots:** `payload migrate:create` diffed gegen die neueste `*.json`-Datei in `src/migrations/` (Fallback: Adapter-Default-Schema) und schreibt pro Migration einen eigenen Snapshot (`<name>.ts` + `<name>.json`). Beide committen — fehlt der Snapshot, generiert `migrate:create` dieselben Diffs erneut (bekannter Fall: SiteSettings-lokalisierte Felder → `site_settings_locales`/`_site_settings_v_locales`, Migration `20261101_103630_fix_site_settings_locales`). Handgeschriebene Migrationen zusätzlich mit Guards (IF NOT EXISTS, FK-Check via pg_constraint, Daten-Kopie vor Spalten-Drop).

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
  `cacheLife({ stale: 3600, revalidate: 604800 })` = 7-Tage-Safety-Net).
  `draftMode()` KEINS auf Public-Routen. Public Reads: `getCachedPageBySlug`,
  `getCachedSiteSettings/Translations/Navigation/NotFound`, `getCachedAllPages`
  (Sitemap). Tag-Schema: `cms:all`, `cms:pages`, `cms:pages:<slug>`, `cms:sitemap`,
  `cms:global:<slug>`.
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
  curl -I https://mosthi.de/_next/static/chunks/0fkvblgiahdcs.js
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

- **[Payload/Seed+Drafts]** `payload.create` bei drafts-enabled Collections defaultet `_status: 'draft'` — Seed-Seiten waren unsichtbar für die published-only Public-Reads (Gate 404 trotz Seed 200). Fix: Seed-Create/Update setzen `draft: false` + `_status: 'published'` explizit; Live-Hotfix via REST `PATCH /api/pages/<id>?locale=en { _status:'published' }` (afterChange-Flush inklusive). (04.11.2026, /skills-404 nach Seed).

- **[Payload/Blocks]** `layout`-blocks-Field ist **NICHT jsonb**: Payload 4 + Postgres normalisiert jeden Blocktyp in eigene Tabellen (`pages_blocks_<slug>` + `pages_blocks_<slug>_items` + `_pages_v_blocks_<slug>*`-Versions-Tabellen). Neuer Blocktyp = **IMMER `npx payload migrate:create <name>`** (Snapshot-Diff, `*.json` mitcommitten) + Deploy erst danach — sonst seedet Local API gegen `relation "pages_blocks_skillset" does not exist` (500). Falsche Annahme „Block = JSON im layout-Field → keine DDL" (04.11.2026, Skillset-Feature; Seed 500, Migration nachgereicht).
- **[Payload/Blocks]** `type: 'text', hasMany: true` in einem Block (z. B. `tags` als „array of text") erzeugt KEINE block-spezifische Tabelle, sondern eine **geteilte Join-Tabelle pro Collection** (`pages_texts` + `_pages_v_texts`), diskriminiert über die `path`-Spalte — anders als `type: 'array'`-Felder, die `pages_blocks_<slug>_<field>`-Tabellen bekommen. Auch das ist echte DDL in der Migration (kein jsonb), also normal committen. (04.11.2026, spec-rebuild-Blöcke CaseStudy/Timeline/Testimonial/TechRadar).

- **[Coolify/Build] `payload build` (v4-beta.6) bricht DB-less-Build (03.11.2026, PR #28-Revert `fix/db-less-build`):** Das Aggregat-CLI (`payload build` = importmap+types+next build) lädt die Payload-Config über `createRuntime` bei Build initial und initialisiert den Postgres-Adapter → `Error: DATABASE_URL is missing` (`envConfig` hard-fail). Bricht den Coolify-Build (`is_buildtime:false` → keine DB-Env im Build-Container), während die klassischen CLI-Subkommandos (`payload generate:importmap`/`generate:types`) env-less funktionieren. Lokal grün, weil Projekt-`.env` die `DATABASE_URL` liefert — Docker-Repro bestätigt Fehler nur ohne .env. Fix: `build` bleibt `next build`; Re-Trial-Bedingung: Datenbank-tolerantes Runtime-Load in Payload (createRuntime ohne DB für generate-only) oder Coolify-Prod-abweichendes Build-Env. Besehen in `node_modules/payload/dist/cli/runtime/createRuntime.js`.

- **[Next-16/ensureStatic]** `ensureStatic` (seit 16.4.0, braucht `cacheComponents` + `partialPrefetching`): `'navigation'` (vollstatisch, hart validiert) ist mit dem NotFoundGate-Muster KOMPLETT inkompatibel — das `[locale]`-Layout rendert den Gate als bewussten Blocking-Render (`connection()`/`headers()` Outside-Suspense, Pre-Flush-404) → Page-Level `'navigation'` (z. B. impressum) bricht den Build mit `static-route-dynamic` `at body` (empirisch verifiziert; `instant=false` relaxiert NUR Instant-Navigation-Validation, nicht `'navigation'`). Kompatibler engster Level = **`'shell'`** page-level (App Shell des default-Link-Prefetchs muss statisch; kein Build-Validation-Konflikt): settings + impressum. Klassifikation bleibt ƒ; Laufzeit-Verifikation: unknown-Slug-404/preview/admin unverändert. `'navigation'`-Upgrade-Pfad = zukünftige Layout-Restrukturierung (Gate hinter eine eigene Suspense-Boundary oder Route-Gruppen-Split), NICHT Gate entfernen.

- **[TS 6/Upgrade]** TypeScript 6.0.3 (01.11.2026, exakt gepinnt, letzte JS-Compiler-Serie vor TS 7 — TS 7 native hat keine JS-API, typescript-eslint-Peer `>=4.8.4 <6.1.0` zwingt zu <6.1): tsconfig braucht `types: ["node"]` (TS 6 defaultet `types: []` → sonst `process.env`-Typing weg) und `baseUrl` ist deprecated/entfernt — `paths` funktionieren ohne (Entries relativ zur tsconfig); Projekt nutzte baseUrl nur als paths-Präfix, kein Code-Change nötig. Verify-Kette (tsc/lint/generate:types/build/vitest) lief ohne weitere Anpassungen durch.
- **[TS/TS7-Hybrid]** Natives TS 7 (Go-Compiler, keine JS-API) parallel als Alias-DevDep `"@typescript/native": "npm:typescript@7.0.2"` (EXAKT pinnen, kein `^` — dist-tag latest wandert; `@typescript/native` existiert nicht auf npm, `npx @typescript/native` → E404). TS 6.0.3 bleibt kanonisch (typescript-eslint-Peer <6.1, Payload-CLI/tsx/next build laden `require('typescript')`). Fallstricke: (1) `.bin/tsc` bei zwei Packages mit `bin: tsc` wird von npm **lautlos last-wins** verlinkt — im Projekt resolved `npx tsc` dadurch jetzt auf TS 7.0.2 (nicht TS 6!), deshalb Skript **Direkt-Pfad-Pflicht**: `node node_modules/@typescript/native/bin/tsc --noEmit`; Kanonisch tsc-Aufrufe nur via explizitem `node node_modules/typescript/bin/tsc`. (2) Next 16 `useTypeScriptCli` resolvet das echte `typescript`-Package (unberührt → Build-Autorität bleibt TS 6). (3) TS7-Advisory `npm run typecheck`: 0 exit, ~1.0 s vs. TS6-TSC 3.1 s (ohne npm-Overhead). (4) Keine Shim-Variante (`typescript: npm:@typescript/typescript6`) — kein `bin.tsc`, bricht Next-CLI-Discovery. Upgrade-Pfad zu echtem TS 7 erst wenn typescript-eslint #10940/#12803 (TS7-API) und vercel/next.js #97334 (Shim-Aliase) released sind.

- **[Payload/Upload]** `media`-Collection erlauben nur explizite image-mimeTypes (`image/png`, `image/jpeg`, `image/webp`, `image/avif`) — SVG ausgeschlossen (XSS via Upload-Storage), kein Wildcard `image/*`. User-Auth-Cookies via `cookies: { secure: true, sameSite: 'Strict' }` in der Users-Collection-Config gehärtet (Live-Preview-iframe ist same-origin → Strict ok).
- **[Sicherheit]** Seed-Routen (`/api/seed-home`, `/api/seed-globals`): nur `POST` (GET → 405, kein unauth-Flood-Vektor), Auth-Gate via `payload.auth({ headers })` aus gemeinsamem `src/app/api/_seedGuard.ts`, Prod-Gate als Konserve (`NODE_ENV === 'production' && ALLOW_SEED !== 'true'` → 403, vor `getPayload()`); Error-Responses nie Stack/Debug-Details (nur serverseitiges `console.error`).
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
- **[Next-16/Streaming]** Unbekannter Slug lief HTTP-200 statt 404: Layout-Skeleton-Suspense flushet Header (Status 200 fixiert), bevor das dynamische Page-`notFound()` wirft (Doku: „Before streaming starts, a 404 status can be returned; after streaming, 200 remains"). `notFound()` allein in `generateMetadata` half NICHT (Streaming-Metadata-Metadatentag flusht Head früher) → Lösung: „NotFoundGate" im `[locale]`-Layout VOR der Suspense-Boundary (liest `x-pathname` Request-Header aus `src/proxy.ts`, gecacheter `getCachedPageBySlug`-Check → `notFound()` PRE-FLUSH) + Group-`src/app/(frontend)/not-found.tsx` als Catch mit Custom-UI (Inline-Styles, Error-Recovery-Shell hat kein CSS) + `htmlLimitedBots: /.*/` in next.config (deaktiviert präemptives Streaming-Metadata-Head-Flush). Nested unbekannte Pfade abgedeckt; statische Geschwister-Routen (`preview|settings|impressum`) via STATIC_CHILD_ROUTES vom Gate ausgenommen. Trade-off: `instant = false` am Layout verschiebt preview/settings/impressum im Build `◐ → ƒ` (Runtime-Rendered); `[[...slug]]` bleibt `◐`.
- **[Payload-beta.6/LocalAPI]** Local-API-Default hat sich geändert — Local-Operations defaulten `overrideAccess: false`, Int-Test `tests/int/api.int.spec.ts` schlug mit „Forbidden" fehl; Fix: `overrideAccess: true` im Test (bewusster Stack-Verifikations-Bypass).
- **[Payload-LocalAPI]** `revalidateTag`-Fortschritt via tsx-Subprozess-Script (Local API) → `Invariant: static generation store missing` → `safeRevalidate` skippt. Verifizier-Tooling für OSR: Mutieren statt via Subprozess via REST `PATCH /api/pages/<id>?locale=en` (Cookie-Session) — Hooks feuern dann im Next-Server-Kontext.
- **[Cache/OSR] „Globals revalidieren, Pages nicht" (04.11.2026, Root-Cause verifiziert):** Next 16 markiert Invalidierungen als In-Doubt-Timestamp (`revalidatedAt`); ein Cache-Entry ist nur stale, wenn `entry.timestamp <= revalidatedAt` (`node_modules/next/dist/server/lib/incremental-cache/file-system-cache.js`). `revalidateTag(tag, 'max')` (= 1-Jahr-Stale-Fenster) liefert bei Treffer weiter den ALTEN Entry und revalidiert nur im Hintergrund — im langlaufenden Container ohne neuen Route-Request kommt nie frische Daten. Zusätzlich cacht der Layout-Entry SiteSettings+Navigation zusammen (`cms:global:*`), deshalb fiel ein Globals-Flush spürbar aus dem Cache. **Fix:** `safeRevalidate(tag, label, 'blocking')` → `revalidateTag(tag, { expire: 0 })` (Read-your-own-writes); `revalidatePagePathCache` invalidiert zusätzlich das Domain-Tag `cms:pages`. Merke: für CMS-Content NIE `'max'` verwenden.
- **[Next-16/Headers]** Security-Header auf `next.config.ts` (HSTS/nosniff/Referrer/Permissions-Policy, scobio2026-Muster — non-CSP-Teil): `X-Frame-Options: DENY` NICHT nutzen bei Payload-Live-Preview (Admin embeddet `/preview` Route als iframe; gleiche Origin) → SAMEORIGIN.
- **[CSP]** Nonce-CSP in `proxy.ts` verboten (Next-Docs: Nonce erzwingt all pages dynamic → zerstört cacheComponents/ISR). Enforce-CSP folgt Nonce-freiem Docs-Muster: `script-src 'self' 'unsafe-inline'` (`unsafe-eval` nur dev), `style-src 'self' 'unsafe-inline'`; verschärfte Report-Only-Header (script/style-src strict) für späteren unsafe-inline-Abbau. Nonce/Hash-Alternative wäre `experimental` SRI (statisch-kompatibel).
- **[Consent/CSP]** Inline-`<head>`-Bootstrap (`dangerouslySetInnerHTML`) braucht unter der Nonce-freien CSP `script-src 'self' 'unsafe-inline'` — vorhanden. Ohne `connect-src` blockiert `default-src 'self'` JEDEN GTM-Beacon (fetch/sendBeacon an `google-analytics.com`), obwohl `script-src` das Container-Script erlaubt; beides zusammen testen, nicht nur das Script-Load. (05.11.2026, GTM-Feature.)
- **[Consent/Migration]** Feldgruppe in einer localized-Global-Definition (`Translations.cookies`) ohne Migration = `translations`-Global 500 in Prod, sobald die Definition auf `main` ist (Payload selektiert alle konfigurierten Felder). Neue Globals-Felder immer im selben Merge wie die Spalten-Migration ausliefern; rein additive `ADD COLUMN IF NOT EXISTS … DEFAULT … NOT NULL` füllt Bestandszeilen ohne Backfill. (05.11.2026, PR #57.)
- **[Coolify/Build-ARGs]** Coolify injiziert ALLE App-Envs als Build-ARGs (unabhängig von Compose-Refs) → Secrets landen in `docker history`-Layer. Fix: Coolify-Env-Flag `is_buildtime: false` (REST PATCH envs) + Compose-`$SECRET`-Referenzen entfernen. Nach jedem Deploy: `docker history <image> | grep -iE 'SECRET|DATABASE'` (presence-only, nie Werte drucken).
- **[Secure-Cookie]** `cookies: { secure: true }` + Safari: Secure-Cookie wird auf `http://localhost` NICHT gesetzt → Dev-Login in Safari bricht (Chrome/FF ok, localhost gilt dort als secure context). Hinweis-Only.
- **[CORP]** Media wird auch via `/api/media/file/:file*`-Endpoint ausgeliefert → CORP-Header doppelt setzen (beide Paths in `next.config.ts` `headers()`).
- **[ESLint/FlatConfig Overrides]** Spätere Entries in `eslint.config.mjs` gewinnen per-File: `files: ['src/migrations/**']` → `unused-imports/no-unused-vars: 'off'` für Payload-Codegen-Hook-Signaturen (`payload/req/db` ungebraucht). Override VOR dem globalen Plugin-Block wird stillschweigend von dessen Regel-Definition zugeschlagen (21 Warnings blieben) — Exemption gehört ans Array-Ende.
- **[Next-16/Metadata-File-Conventions]** `opengraph-image.tsx` (und alle Metadata-Dateikonventionen) sind im optionalen Catch-All `[locale]/[[...slug]]` NICHT colocierbar — Build bricht mit `Optional catch-all must be the last part of the URL` (die interne Metadata-Route `opengraph-image-<hash>` wird als Kind-Segment hinter den optionalen Catch-All gehängt; verifiziert 16.4.5). Per-Page-OG-Images stattdessen: explizite `openGraph.images` in `generateMetadata` → dedizierte Route `/og` (src/app/og/route.tsx; Query-Params t/s/loc, searchParams = on-demand ƒ). Zwei Folge-Constraints: (a) der Proxy (src/proxy.ts) redirectet `/og` sonst ins Locale-Format (307 für OG-Crawler) — exakt `/og` in die Skip-Liste (matcher skipped nur `_next`/`admin`/`api`/dot-Paths); (b) die `/og`-Route legitimiert die API-Route-Ausnahme (PNG-Byte-Response für externe OG-Fetcher, kein Write, daher keine Server Action). Zusätzlich: `src/public` ist im Dev-Server NICHT erreichbar (Docker kopiert es erst in den Runner unter /app/public) — statische Text-Assets wie `llms.txt` gehören als Route-Handler (`src/app/llms.txt/route.ts`, default-cached ○, kein DB-Read, Konstante in `src/cms/aeo/llmsTxt.ts`).
- **[Turbopack/Stale-Cache]** `Error: Cannot find module '@tailwindcss/turbopack'` beim Build, obwohl das Package installiert ist (npm ls sauber) → Stale-Turbopack-Build-Cache aus der Phase VOR `npm ci`/Node-Modules-Wechsel (Worktree über hart kopiertes node_modules, Concurrent-Prune am Main). Fix: `rm -rf .next` vor Dep-Debugging (verifiziert 03.11.2026).
- **[AEO/SEO-Schema]** JSON-LD- und Metadata-Layer (04.11.2026, Branch `feat/seo-schema-lighthouse`): `Person` (`src/components/StructuredData.tsx`) trägt `jobTitle` (Senior Fullstack Developer), `description`, `sameAs` (GitHub + LinkedIn), `email`/`telephone` (plain — NICHT `mailto:` in `contactPoint.email`, schema.org erwartet die nackte Adresse), `address`, `worksFor` (valantic DXA), `knowsLanguage`; bewusst KEIN `image`, `seeks` oder Verfügbarkeits-Claim. Per-Page-Aufbau: home → `WebSite` + `Person`-Graph; career → `ProfilePage` mit `Person.hasOccupation` aus den Timeline-Einträgen (`parsePeriod` versteht `09/2024`, `Seit 09/2024 – Heute`, `2012 – 2014`; offene Enden liefern nur `startDate`, unklare Strings gar nichts); case-studies → `WebPage` + `ItemList` aus den `caseStudy`-Blöcken; tech-radar/leadership/contact → schlanke `WebPage` (contact zusätzlich mit `Person`-Kontaktknoten); alle übrigen (privacy/imprint) neutraler `WebPage`. Metadaten: `pages` hat KEIN description-Feld → `derivePageDescription` (`src/cms/aeo/pageMetadata.ts`) leitet pro Seite aus dem ersten Block mit ≥ 40 Zeichen ab (hero.subheading → statusBlock.description → techSection.body → caseStudy → lexical richText), kürzt auf ~155 Zeichen an einer Wortgrenze; Seiten ohne verwertbaren Text erben die Layout-Default-Description (kein leeres Tag). `title: { absolute }` verhindert doppelte Brand-Suffixe; `alternates.languages` enthält `x-default` → `/de` (Primäraudienz) — `x-default` IST in Next 16 als `UnmatchedLang` im Metadata-Typ verifiziert (`node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts`), die frühere held-back-Notiz war ein false negative. `llms.txt` listet die acht aktuellen Slugs statt der gelöschten (skills/tech-stack/engineering/ai-vibe-coding/off-screen/track-record).
- **[Perf/CLS] Hero-Typing-Animation = CLS-Treiber** (04.11.2026, Lighthouse-Snapshot: Performance 85, alle anderen Metriken 100): `TypingHeading` tippte den LCP-Text zeichenweise und ließ die `h1` zeilenweise wachsen — der komplette Content darunter wurde mitgeschoben (gemessen 0.257 Layout-Shift bei 1280×900, ~1/3 Viewport). Fix: Der Wrapper reserviert die **Endhöhe** des Textes an einer unsichtbaren Volltext-Kopie (`ResizeObserver` + `document.fonts.ready` für Resize/Font-Swap) und die Animation läuft darin als reiner Paint-Effekt ohne Reflow; bis zur Messung `min-height: 1em`. Verifiziert im Kontrollharness: 0.115 → 0.000, identische Endhöhe. Merke: Tipp-/Reveal-Animationen auf mehrzeiligen Headings immer gegen die finale Geometrie klemmen.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
