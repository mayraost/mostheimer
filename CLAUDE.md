# CLAUDE.md

## Projekt-Übersicht

**mostheimer** – Next.js 16 + Payload CMS v3 Anwendung mit Mehrsprachigkeit (EN/DE), Tailwind CSS v4 und TypeScript.

## Tech Stack

| Kategorie    | Technologie                          |
| ------------ | ------------------------------------ |
| Framework    | Next.js 16 (canary) – App Router     |
| Sprache      | TypeScript 5 (strict mode)           |
| CMS          | Payload CMS v3 mit Lexical Rich Text |
| Datenbank    | SQLite (Standard), PostgreSQL optional |
| Styling      | Tailwind CSS v4                      |
| Icons        | Lucide React                         |
| Node-Version | 24 (`.nvm`)                          |

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

| Variable         | Beschreibung                  | Standard            |
| ---------------- | ----------------------------- | ------------------- |
| `PAYLOAD_SECRET` | Geheimschlüssel für Payload CMS | `''`              |
| `DATABASE_URI`   | Datenbankverbindung           | `file:./payload.db` |

## Projektstruktur

```
app/
  (frontend)/         # Frontend-Routen (locale-basiert)
  (payload)/          # Payload CMS Admin-Routen
  api/                # API-Routen
blocks/               # Payload CMS Block-Definitionen
collections/          # Payload CMS Collections (Users, Media, Pages)
globals/              # Payload CMS Globals (Navigation, SiteSettings, Translations)
components/
  blocks/             # Block-Komponenten-Implementierungen
public/               # Statische Assets
payload.config.ts     # Payload CMS Konfiguration
next.config.ts        # Next.js Konfiguration
```

## Code-Konventionen

### TypeScript

- **Strict mode** ist aktiv – keine impliziten `any`-Typen
- **`any` vermeiden**: Immer konkrete Typen oder `unknown` verwenden; niemals auf `any` ausweichen
- Type Imports explizit kennzeichnen: `import type { Foo } from '...'`
- Payload-generierte Typen aus `payload-types.ts` verwenden

### Importe & Aliase

```typescript
import { Header } from '@/components/Header';      // Root-Alias
import type { Page } from '@payload-config';        // Payload-Config-Alias
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

## Payload CMS

### Kernprinzipien

1. **TypeScript-First** – Immer korrekte Typen aus Payload verwenden
2. **Sicherheit** – Zugriffskontrollen konsequent implementieren (siehe unten)
3. **Typen generieren** – Nach Schema-Änderungen immer `generate:types` ausführen
4. **Transaction Safety** – In Hooks immer `req` an verschachtelte Operationen übergeben
5. **Local API** – Bypasses Zugriffskontrollen standardmäßig; `overrideAccess: false` setzen wenn nötig
6. **Rollen prüfen** – Sicherstellen, dass Rollen existieren, bevor Access Controls auf Collections/Globals angewendet werden

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

| Global         | Beschreibung               |
| -------------- | -------------------------- |
| `navigation`   | Seitennavigation           |
| `siteSettings` | Globale Einstellungen      |
| `translations` | Mehrsprachige Texte/Labels |

### Content Blocks

- `HeroBlock` – Hero-Bereich mit Tipp-Animation
- `RichTextBlock` – Formatierter Text
- `CtaBlock` – Call-to-Action
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
await payload.find({ collection: 'posts', user: someUser })

// ✅ SICHER: Benutzerberechtigungen werden erzwungen
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })

// ✅ Administrative Operation (bewusstes Bypass)
await payload.find({ collection: 'posts' }) // kein user, overrideAccess defaults to true
```

**Regel**: Wenn `user` an die Local API übergeben wird, IMMER `overrideAccess: false` setzen.

#### 2. Transaction Safety in Hooks

```typescript
// ❌ DATENVERLUST-RISIKO: Separate Transaktion
async ({ doc, req }) => {
  await req.payload.create({ collection: 'audit-log', data: { docId: doc.id } })
  // Fehlendes req = separate Transaktion!
}

// ✅ ATOMAR: Gleiche Transaktion
async ({ doc, req }) => {
  await req.payload.create({ collection: 'audit-log', data: { docId: doc.id }, req })
}
```

**Regel**: In Hooks immer `req` an verschachtelte Operationen übergeben.

#### 3. Infinite Hook Loops verhindern

```typescript
// ❌ ENDLOSSCHLEIFE
afterChange: [async ({ doc, req }) => {
  await req.payload.update({ collection: 'posts', id: doc.id, data: { views: doc.views + 1 }, req })
  // Löst afterChange erneut aus!
}]

// ✅ SICHER: Context-Flag verwenden
afterChange: [async ({ doc, req, context }) => {
  if (context.skipHooks) return
  await req.payload.update({
    collection: 'posts', id: doc.id,
    data: { views: doc.views + 1 },
    context: { skipHooks: true }, req,
  })
}]
```

### Zugriffskontrollen

```typescript
import type { Access } from 'payload'

// Boolean-Return
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Query-Constraint (Row-Level Security)
export const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.roles?.includes('admin')) return true
  return { author: { equals: user.id } }
}
```

**Wichtig**: Field-Level Access gibt nur `boolean` zurück (keine Query-Constraints).

### Queries – Local API

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Suchen
const posts = await payload.find({
  collection: 'posts',
  where: { and: [{ status: { equals: 'published' } }] },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
})

// Erstellen / Aktualisieren / Löschen
await payload.create({ collection: 'posts', data: { title: 'Neu' } })
await payload.update({ collection: 'posts', id: '123', data: { status: 'published' } })
await payload.delete({ collection: 'posts', id: '123' })
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
8. **SQLite Transactions**: Standardmäßig deaktiviert; mit `transactionOptions: {}` aktivieren
9. **Point Fields**: Werden in SQLite nicht unterstützt

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

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `primary`                | `#C2185B`   | `#F06292`   | Brand-Farbe, CTAs, Akzente        |
| `primary-hover`          | `#AD1457`   | `#EC407A`   | Hover-Zustand auf Primary-Flächen |
| `primary-foreground`     | `#ffffff`   | `#ffffff`   | Text auf Primary-Hintergrund      |
| `primary-muted`          | `#FCE4EC`   | `#3D1A26`   | Subtile Primary-Hintergründe      |

#### Secondary (Violet)

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `secondary`              | `#6D28D9`   | `#A78BFA`   | Sekundäre Aktionen, Badges        |
| `secondary-hover`        | `#5B21B6`   | `#8B5CF6`   | Hover auf Secondary               |
| `secondary-foreground`   | `#ffffff`   | `#ffffff`   | Text auf Secondary-Hintergrund    |

#### Accent (Amber)

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `accent`                 | `#F59E0B`   | `#FBBF24`   | Highlights, Tags, Badges          |
| `accent-foreground`      | `#1A1A1A`   | `#1A1A1A`   | Text auf Accent-Hintergrund       |

#### Backgrounds & Surfaces

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `background`             | `#FFFFFF`   | `#121212`   | Seitenhintergrund                 |
| `surface`                | `#F8F8F8`   | `#1E1E1E`   | Cards, Panels                     |
| `surface-raised`         | `#F0F0F0`   | `#252525`   | Elevated Cards, Modals            |
| `header`                 | `#F8F8F8`   | `#1E1E1E`   | Header-Hintergrund (legacy alias) |

#### Text

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `foreground` / `text`    | `#1A1A1A`   | `#EDEDED`   | Primärer Fließtext                |
| `muted-foreground`       | `#6B6B6B`   | `#9E9E9E`   | Sekundärer Text, Platzhalter      |

#### Border

| Token                    | Light       | Dark        | Verwendung                        |
| ------------------------ | ----------- | ----------- | --------------------------------- |
| `border`                 | `#E5E5E5`   | `#333333`   | Standard-Trennlinien              |
| `border-strong`          | `#CCCCCC`   | `#444444`   | Betonte Rahmen                    |

#### Feedback

| Token               | Light       | Dark        |
| ------------------- | ----------- | ----------- |
| `success`           | `#16A34A`   | `#4ADE80`   |
| `warning`           | `#D97706`   | `#FBBF24`   |
| `error`             | `#DC2626`   | `#F87171`   |
| `info`              | `#2563EB`   | `#60A5FA`   |

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

## Workflow-Regeln

1. **Nach jeder Dateiänderung** `npm run lint:fix` ausführen.
2. **Kein `any`** – immer konkrete Typen verwenden.
3. **Keine `eslint-disable`-Kommentare** – Code stattdessen korrigieren.
4. Nach Payload-Schema-Änderungen `npm run generate:types` ausführen.
5. Pfad-Aliase (`@/*`) für Imports bevorzugen.
6. **Nach jedem Commit** einen Pull Request öffnen, sofern für den aktuellen Branch noch keiner existiert (`gh pr create`).
7. TypeScript nach Änderungen validieren: `tsc --noEmit`.
8. Nach Komponenten-Änderungen Import Map neu generieren: `payload generate:importmap`.
