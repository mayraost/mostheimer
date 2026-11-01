# mostheimer

**mostheimer** – Website mit [Next.js 16](https://nextjs.org) (App Router, Turbopack) und [Payload CMS 4](https://payloadcms.com) (Beta), mehrsprachig (EN/DE), Tailwind CSS v4 und TypeScript (strict).

## Tech Stack

| Kategorie | Technologie                                     |
| --------- | ----------------------------------------------- |
| Framework | Next.js 16.4.3 (stable) – App Router, Turbopack |
| CMS       | Payload CMS 4.0.0-beta.6, Lexical Rich Text     |
| Datenbank | SQLite (Entwicklung), PostgreSQL (Produktion)   |
| Styling   | Tailwind CSS v4, lucide-react                   |
| Sprache   | TypeScript 5 (strict), React 19.3               |
| Runtime   | Node >= 26 (engine in package.json), npm ^11    |

## Quickstart

```bash
npm install
cp .env.example .env   # Variablen anpassen: PAYLOAD_SECRET, DATABASE_URL, DATABASE_TYPE
npm run dev            # Entwicklungsserver: http://localhost:3000 (Admin: /admin)
```

`.env.example` als Ausgangspunkt verwenden: `PAYLOAD_SECRET`, `DATABASE_URL` (Entwicklung: sqlite `file:./payload.db`), `DATABASE_TYPE`.

Nach Änderungen am Payload-Schema (`src/cms/`) die Typescript-Typen neu generieren:

```bash
npm run generate:types   # erzeugt src/payload-types.ts (nicht manuell bearbeiten)
```

## Tests

```bash
npm run lint           # ESLint prüfen (lint:fix: automatisch beheben)
```

Test-Suiten liegen in `tests/` (Playwright E2E in `tests/e2e`, Integrationstests in `tests/int`, Hilfsfunktionen in `tests/helpers`); Konfiguration via `playwright.config.ts` bzw. `vitest.config.mts`.

## Deployment (Coolify)

Deployment erfolgt via **Docker Compose** auf [Coolify](https://coolify.io) – **nicht Vercel**. Die `docker-compose.yml` im Repo-Root definiert zwei Services:

- `app` – Next.js Standalone-Produktionsbuild (Docker `HEALTHCHECK` trifft `/api/health`)
- `postgres` – PostgreSQL 17 (`postgres:17-alpine`) mit persistentem Volume

Ablauf (Details im Header der `docker-compose.yml`):

1. In Coolify: New Resource → Docker Compose (Empty), dieses Repo verbinden
2. Diese Datei als Compose-File angeben
3. Environment setzen (siehe `.env.example`): `APP_PORT=3300` muss auf dem Coolify-Host frei sein
4. Domain `https://mosthi.de` in Coolify dem Service `app` zuweisen (`docker_compose_domains`) – der Coolify-Proxy (Traefik) routet über den **published Host-Port**, nicht über das Compose-Network
5. **Keinen `networks:`-Block ergänzen** – alle Services hängen am impliziten Projekt-Default-Netz (DNS-Aliase wie `postgres` kollidieren sonst mit fremden Stacks)

Weitere Details und Projekt-Konventionen siehe [AGENTS.md](AGENTS.md).
