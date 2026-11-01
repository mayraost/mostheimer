# AGENTS.md

## Projekt-Übersicht

**mostheimer** – Next.js 16 + Payload CMS v4 Anwendung mit Mehrsprachigkeit (EN/DE), Tailwind CSS v4 und TypeScript.

## Tech Stack

| Kategorie    | Technologie                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16.4.3 (stable) – App Router, Turbopack                                                                                                                                                                |
| Sprache      | TypeScript 5 (strict mode)                                                                                                                                                                                     |
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
npm run generate:types # Payload CMS TypeScript-Typen generieren
```

## Umgebungsvariablen

| Variable         | Beschreibung                                                                                                       | Standard |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `PAYLOAD_SECRET` | Geheimschlüssel für Payload CMS (Fallback 'ABC' nur lokal – in Coolify zwingend setzen)                            | `''`     |
| `APP_PORT`       | Published Host-Port (Compose)                                                                                      | `3300`   |
| `DATABASE_URL`   | Zentrale geteilte Postgres-Instanz (kein Default mehr – Projekte ohne `DATABASE_URL` scheitern bewusst am Connect) | –        |

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
5. **Local API** – Bypasses Zugriffskontrollen standardmäßig; `overrideAccess: false` setzen wenn nötig
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

## Theming & UI

### Theme-System

- Light / Dark / System-Theme via CSS Custom Properties (`globals.css`)
- Font-Size-Einstellung (normal/large) via `html.large-font`
- Animations-Toggle (on/off/system) via `body.no-animations`
- User-Einstellungen werden in `localStorage` gespeichert
- Theme-Klassen `.dark` / `.light` werden auf `<html>` gesetzt

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

- **[Payload/Upload]** `media`-Collection erlauben nur explizite image-mimeTypes (`image/png`, `image/jpeg`, `image/webp`, `image/avif`) — SVG ausgeschlossen (XSS via Upload-Storage), kein Wildcard `image/*`. User-Auth-Cookies via `cookies: { secure: true, sameSite: 'Strict' }` in der Users-Collection-Config gehärtet (Live-Preview-iframe ist same-origin → Strict ok).
- **[Sicherheit]** Seed-Routen (`/api/seed-home`, `/api/seed-globals`): nur `POST` (GET → 405, kein unauth-Flood-Vektor), Auth-Gate via `payload.auth({ headers })` aus gemeinsamem `src/app/api/_seedGuard.ts`, Prod-Gate als Konserve (`NODE_ENV === 'production' && ALLOW_SEED !== 'true'` → 403, vor `getPayload()`); Error-Responses nie Stack/Debug-Details (nur serverseitiges `console.error`).
- **[Payload-Admin]** `admin.components.actions`-Einträge sind direkt `CustomComponent` (= `PayloadComponent`; String-Pfad via importMap baseDir oder `{ path }`) — kein `{ Component: '...' }`-Wrapper (TS2353). Custom-Views (`AdminViewConfig`) dagegen WOHL mit `Component`, `path`, `meta`. `@payloadcms/ui`-Button: `buttonStyle="destructive"` (kein `'error'`).
- **[Cache]** `revalidateTag` in Next 16 verlangt 2-Arg `revalidateTag(tag, 'max')` (Single-Arg deprecated → TS-Fehler); `connection()` kommt aus `next/server` (nicht `react`) und muss inside `Suspense` laufen, sonst blockierende Navigations-Shell (Next-16 cacheComponents).
- **[TS]** "Cannot find module" auf Barrel: Ursache war das falsche Pfadlevel (`../cache/frontendCache` statt `../cache/frontend/frontendCache`) — zuerst Pfadlevel/Trace-Resolution (`tsc --traceResolution`) prüfen, nicht TS-Config fixen.
- **[Deployment]** Cloudflared-Tunnel + Traefik `is_force_https_enabled=true` (default) → Redirect-Loop (Tunnel-Ingress trifft Traefik auf :80, wird zu https geforced, Cloudflare ruft wieder http auf … endloser Redirect) → Lösung: `docker_compose_domains` mit `"is_force_https_enabled": false` per PATCH setzen (Tunnel/Cloudflare übernimmt HTTPS-Terminierung).
- **[Deps/Audit]** Transitive Critical-CVEs (z. B. dompurify 3.4.15 via monaco-editor/@payloadcms/ui) werden von `npm audit fix --package-lock-only` nicht gehoben, wenn der betroffene Range von einer Zwischen-Dep gepinnt ist → Lösung: npm-`overrides`-Block in `package.json` (exakte Version, z. B. `"dompurify": "3.4.17"`) + Lockfile-Regen. Begleitender Rollback der Zwischen-Dep (monaco 0.57.0→0.56.0) ist okay, solange das Audit danach nicht schlechter ist. Lockfile-Regen mit Remote-Tarball-Deps braucht `NPM_CONFIG_ALLOW_REMOTE=all` (npm ≥ 12).
- **[Payload-V3→V4-Migration]** Deployment ohne `src/migrations` → frisches Postgres-Volume ohne Schema (App-Container bootstrapped die DB nicht). → Lösung: generierte Migrationen committen; frisches Volume über One-Shot-Tooling-Container (`npx payload migrate`) bootstrappen — das CI-Script (`payload migrate && next build`) läuft im Standalone-Image nicht.
- **[Migration-Generierung]** Vor Postgres-only diffte `payload migrate:create` mit Default-sqlite-Adapter Postgres-Snapshots (`concurrently`/`method`-Index-Keys) → Drizzle-Zod-Validation-Fehler; es brauchte `DATABASE_TYPE=postgresql DATABASE_URL=postgresql://x:x@localhost:5432/x npx payload migrate:create <name>` als Prefix. Seit Postgres-only (01.11.2026) ist der postgresAdapter der einzige/Default-Adapter — `npx payload migrate:create <name>` diffed direkt gegen den Postgres-Snapshot, Live-DB nicht nötig.
- **[Coolify/Domain-Routing]** `docker_compose_domains`-PATCH akzeptiert in der aktuellen Coolify-Version nur `name`/`domain`/`redirect` — `is_force_https_enabled` im JSON führt zu 422 („Only name, domain, and redirect fields are supported"). Force-HTTPS ist App-Setting/Default, nicht Domain-Item.
- **[Sicherheit]** Container-Env-Probe (`docker exec <app> env`) druckt `DATABASE_URL` inkl. Passwort in den Chat → Lösung: nie Env-Werte ausgeben; bei Leak `POSTGRES_PASSWORD` rotieren via Postgres-`ALTER USER` + Coolify-Env-PATCH (`PATCH /applications/{uuid}/envs`) – Volume-Reset nicht nötig; App-Env via Force-Redeploy propagieren.
- **[Next-16/Streaming]** Unbekannter Slug lief HTTP-200 statt 404: Layout-Skeleton-Suspense flushet Header (Status 200 fixiert), bevor das dynamische Page-`notFound()` wirft (Doku: „Before streaming starts, a 404 status can be returned; after streaming, 200 remains"). `notFound()` allein in `generateMetadata` half NICHT (Streaming-Metadata-Metadatentag flusht Head früher) → Lösung: „NotFoundGate" im `[locale]`-Layout VOR der Suspense-Boundary (liest `x-pathname` Request-Header aus `src/proxy.ts`, gecacheter `getCachedPageBySlug`-Check → `notFound()` PRE-FLUSH) + Group-`src/app/(frontend)/not-found.tsx` als Catch mit Custom-UI (Inline-Styles, Error-Recovery-Shell hat kein CSS) + `htmlLimitedBots: /.*/` in next.config (deaktiviert präemptives Streaming-Metadata-Head-Flush). Nested unbekannte Pfade abgedeckt; statische Geschwister-Routen (`preview|settings|impressum`) via STATIC_CHILD_ROUTES vom Gate ausgenommen. Trade-off: `instant = false` am Layout verschiebt preview/settings/impressum im Build `◐ → ƒ` (Runtime-Rendered); `[[...slug]]` bleibt `◐`.
- **[Payload-LocalAPI]** `revalidateTag`-Fortschritt via tsx-Subprozess-Script (Local API) → `Invariant: static generation store missing` → `safeRevalidate` skippt. Verifizier-Tooling für OSR: Mutieren statt via Subprozess via REST `PATCH /api/pages/<id>?locale=en` (Cookie-Session) — Hooks feuern dann im Next-Server-Kontext.
- **[Next-16/Headers]** Security-Header auf `next.config.ts` (HSTS/nosniff/Referrer/Permissions-Policy, scobio2026-Muster — non-CSP-Teil): `X-Frame-Options: DENY` NICHT nutzen bei Payload-Live-Preview (Admin embeddet `/preview` Route als iframe; gleiche Origin) → SAMEORIGIN.
- **[CSP]** Nonce-CSP in `proxy.ts` verboten (Next-Docs: Nonce erzwingt all pages dynamic → zerstört cacheComponents/ISR). Enforce-CSP folgt Nonce-freiem Docs-Muster: `script-src 'self' 'unsafe-inline'` (`unsafe-eval` nur dev), `style-src 'self' 'unsafe-inline'`; verschärfte Report-Only-Header (script/style-src strict) für späteren unsafe-inline-Abbau. Nonce/Hash-Alternative wäre `experimental` SRI (statisch-kompatibel).
- **[Coolify/Build-ARGs]** Coolify injiziert ALLE App-Envs als Build-ARGs (unabhängig von Compose-Refs) → Secrets landen in `docker history`-Layer. Fix: Coolify-Env-Flag `is_buildtime: false` (REST PATCH envs) + Compose-`$SECRET`-Referenzen entfernen. Nach jedem Deploy: `docker history <image> | grep -iE 'SECRET|DATABASE'` (presence-only, nie Werte drucken).
- **[Secure-Cookie]** `cookies: { secure: true }` + Safari: Secure-Cookie wird auf `http://localhost` NICHT gesetzt → Dev-Login in Safari bricht (Chrome/FF ok, localhost gilt dort als secure context). Hinweis-Only.
- **[CORP]** Media wird auch via `/api/media/file/:file*`-Endpoint ausgeliefert → CORP-Header doppelt setzen (beide Paths in `next.config.ts` `headers()`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
