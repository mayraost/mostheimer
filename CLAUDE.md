# CLAUDE.md

## Projekt-Übersicht

**mostheimer** – Next.js 16 + Payload CMS v3 Anwendung mit Mehrsprachigkeit (EN/DE), Tailwind CSS v4 und TypeScript.

## Tech Stack

| Kategorie       | Technologie                                   |
| --------------- | --------------------------------------------- |
| Framework       | Next.js 16 (canary) – App Router              |
| Sprache         | TypeScript 5 (strict mode)                    |
| CMS             | Payload CMS v3 mit Lexical Rich Text          |
| Datenbank       | SQLite (Standard), PostgreSQL optional        |
| Styling         | Tailwind CSS v4                               |
| Icons           | Lucide React                                  |
| Node-Version    | 24 (`.nvm`)                                   |

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

| Variable       | Beschreibung                                   | Standard          |
| -------------- | ---------------------------------------------- | ----------------- |
| `PAYLOAD_SECRET` | Geheimschlüssel für Payload CMS             | `''`              |
| `DATABASE_URI`  | Datenbankverbindung                           | `file:./payload.db` |

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

### Collections

| Collection | Beschreibung              |
| ---------- | ------------------------- |
| `users`    | Authentifizierung         |
| `media`    | Asset-Verwaltung          |
| `pages`    | Dynamische Seiteninhalte  |

### Globals

| Global         | Beschreibung                  |
| -------------- | ----------------------------- |
| `navigation`   | Seitennavigation              |
| `siteSettings` | Globale Einstellungen         |
| `translations` | Mehrsprachige Texte/Labels    |

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

## Theming & UI

- Light / Dark / System-Theme via CSS Custom Properties
- Font-Size-Einstellung (normal/large)
- Animations-Toggle (on/off/system)
- User-Einstellungen werden in `localStorage` gespeichert
- Primärfarbe: `#C2185B` (Light) / `#F06292` (Dark)

## Workflow-Regeln

1. **Nach jeder Dateiänderung** `npm run lint:fix` ausführen.
2. **Kein `any`** – immer konkrete Typen verwenden.
3. **Keine `eslint-disable`-Kommentare** – Code stattdessen korrigieren.
4. Nach Payload-Schema-Änderungen `npm run generate:types` ausführen.
5. Pfad-Aliase (`@/*`) für Imports bevorzugen.
