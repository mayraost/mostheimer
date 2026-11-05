# mostheimer

Personal portfolio/website project built with [Next.js 16](https://nextjs.org) (App Router, Turbopack) and [Payload CMS 4](https://payloadcms.com), fully multilingual (EN/DE), styled with Tailwind CSS v4 and written in strict TypeScript.

<!-- Badge placeholders: add CI/build/ci badges here once available. Do not use fake badges. -->

## Features

- **Content blocks** — 8 configurable CMS blocks (Hero, Rich Text, Bento Grid, Status, Tech Section, CTA, Feature Grid, Image + Text) composed per page in the admin panel and rendered by a block dispatcher component.
- **Internationalization** — localization built in end to end: Payload field-level localization for `en`/`de` with English fallback, plus locale-aware routing (`/{locale}/[...slug]`) with `accept-language`-based automatic language detection.
- **Theming** — light/dark/system theme, optional larger font size, and an animations toggle, all driven by CSS custom properties and persisted in `localStorage`.
- **Caching layer** — `cacheComponents`-based data layer: static-friendly rendering via `'use cache'` + `cacheTag`, on-demand revalidation (OSR) from Payload hooks, and a manual cache-flush view in the admin panel.
- **Admin panel** — Payload CMS admin at `/admin` with Lexical rich text editing, live preview, image transformations (Sharp/WebP variants) and a custom "Cache Clear" view.
- **Production-ready deployment** — Docker standalone image with health check, deployed via Docker Compose on Coolify.

## Tech Stack

| Category  | Technology                                              |
| --------- | ------------------------------------------------------- |
| Framework | Next.js 16.4.3 — App Router, Turbopack, cacheComponents |
| CMS       | Payload CMS 4.0.0-beta.6 (Lexical Rich Text)            |
| Database  | PostgreSQL (shared central instance)                    |
| Styling   | Tailwind CSS 4.3.3, lucide-react                        |
| Language  | TypeScript 5.9 (strict), React 19.3                     |
| Runtime   | Node >= 26, npm ^11                                     |
| Testing   | Vitest (integration), Playwright (E2E)                  |

## Quick Start

Prerequisites:

- Node >= 26 (enforced via `engines` in `package.json`), npm ^11
- Access to a PostgreSQL database (no local fallback — the app intentionally fails to connect without `DATABASE_URL`)

```bash
npm ci
cp .env.example .env   # fill in PAYLOAD_SECRET, DATABASE_URL
npm run dev            # dev server on http://localhost:3000 (admin at /admin)
```

Environment variables (see `.env.example`):

| Variable         | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string (required, no default)                    |
| `PAYLOAD_SECRET` | Secret key for Payload CMS (required in production)                    |
| `APP_PORT`       | Published host port for the Docker Compose deployment (default `3300`) |

## Scripts

| Script                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `npm run dev`                | Start the development server                           |
| `npm run build`              | Production build (`next build`)                        |
| `npm start`                  | Start the production server                            |
| `npm run lint`               | Run ESLint (`lint:fix` to auto-fix)                    |
| `npm run generate:types`     | Generate Payload TypeScript types (`payload-types.ts`) |
| `npm run generate:importmap` | Regenerate the Payload admin import map                |
| `npm run payload`            | Payload CLI (e.g. `npm run payload migrate`)           |
| `npm test`                   | Integration + E2E tests (`test:int` + `test:e2e`)      |
| `npm run test:int`           | Vitest integration tests                               |
| `npm run test:e2e`           | Playwright E2E tests                                   |
| `npm run ci`                 | CI-style combined run: `payload migrate && next build` |

## Project Structure

```
src/
  app/
    (frontend)/
      [locale]/
        [[...slug]]/     # Dynamic public pages
        settings/        # Visitor settings page
        layout.tsx       # Locale layout (dynamic shell + skeleton)
    (payload)/
      admin/             # Payload CMS admin panel
      api/               # Payload REST API routes
    api/
      health/            # Health check endpoint ({status:'ok'})
  cms/
    blocks/              # Payload block definitions
    cache/frontend/      # 'use cache' query layer + revalidation/clearCaches
    collections/         # Collections: Users, Media, Pages
    globals/             # Globals: Navigation, SiteSettings, Translations, NotFound
    admin/               # Custom admin views/components (Cache Clear)
  components/
    blocks/              # Block renderer components + dispatcher
    Header.tsx, Logo.tsx # Site chrome
    SettingsProvider.tsx # Theme/font-size/animation settings (client)
  migrations/            # Payload database migrations (committed)
  payload.config.ts      # Payload CMS configuration
  payload-types.ts       # Generated types (do not edit manually)
tests/
  e2e/                   # Playwright E2E tests
  int/                   # Vitest integration tests
  helpers/               # Test helpers (login, seed user)
```

## Content Management

Content is managed entirely in the Payload admin panel at `/admin`:

| Collections | Purpose                                                      |
| ----------- | ------------------------------------------------------------ |
| `users`     | Authentication (admin accounts)                              |
| `media`     | Image assets (WebP transformation + size variants via Sharp) |
| `pages`     | Page content, composed of content blocks                     |

| Globals        | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `navigation`   | Site navigation                                      |
| `siteSettings` | Global site settings                                 |
| `translations` | Multilingual UI labels (`en`/`de`, localized fields) |
| `not-found`    | 404 page content (title, message, button)            |

Available content blocks:

- `HeroBlock` — hero section with typing animation, stack badge, up to two CTA pills
- `RichTextBlock` — Lexical rich text
- `BentoGridBlock` — bento-style feature grid (4 columns, featured items span 2)
- `StatusBlock` — status card with tag pills
- `TechSectionBlock` — deep-dive section with key facts list
- `CtaBlock` — call-to-action (pill only rendered when label + link are set)
- `FeatureGridBlock` — feature raster
- `ImageTextBlock` — image + text

After changing collection/global schemas, regenerate the TypeScript types (`npm run generate:types`) and, after creating or changing admin components, regenerate the import map (`npm run generate:importmap`).

## Caching Architecture

Public pages use Next.js 16 `cacheComponents` with a dedicated data layer in `src/cms/cache/frontend/`:

- All public Payload reads go through `'use cache'` queries tagged with `cacheTag` (`cms:all`, `cms:pages`, `cms:pages:<slug>`, `cms:global:<slug>`, `cms:sitemap`) plus a 7-day revalidate safety net.
- Payload hooks flush caches on demand (OSR): publishing/unpublishing a page, renaming a slug, or changing a global triggers `revalidateTag` with granular tags.
- Publishing containers have no DB access, so public routes are not prerendered at build time; a statically rendered skeleton is streamed inside a dynamic shell (`await connection()`).
- A custom admin view at `/admin/cache-clear` performs a manual full cache flush (Server Action, admin-session gated).

## Database

The project uses a shared central PostgreSQL instance (no per-project database containers — locally the same topology as in production):

```text
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
```

- Schema changes run **exclusively** through Payload migrations: `push: false` disables dev schema push, so use `npx payload migrate:create <name>` (writes a migration plus schema snapshot — commit both) and `npx payload migrate` to apply.
- Production applies migrations automatically on connect via `prodMigrations` in the Postgres adapter.
- After schema changes, regenerate `payload-types.ts` (`npm run generate:types`).

## Deployment

Deployment runs via **Docker Compose on [Coolify](https://coolify.io)** — not Vercel. The `docker-compose.yml` in the repo root defines only the `app` service (Next.js standalone production build); the database is a shared central Postgres instance reachable at `coolify-postgres:5432` through the external `coolify-postgres-net` network.

Highlights:

- Multi-stage Dockerfile based on `node:26.13.0-alpine3.24` with BuildKit npm cache mounts; the runner copies only the standalone output, static assets, and `public` (uploads persist in the `media-data` volume across re-deploys).
- Docker `HEALTHCHECK` polls `/api/health`; the container runs as a non-root user via `node server.js`.
- Host port published as `${APP_PORT:-3300}:3000`; assign the domain to the `app` service (`docker_compose_domains`) in Coolify — the Coolify proxy (Traefik) routes via the published host port, not the compose network.
- Do **not** add additional `networks:` declarations: the only external network entry is `coolify-postgres-net`; everything else stays on the implicit project default network (avoids DNS alias collisions with other stacks).
- `DATABASE_URL` and `PAYLOAD_SECRET` are set as Coolify app environment variables, **not** in the repo and **not** as compose references (Coolify injects environments as build args, which would leak secrets into `docker history`).

## Testing

```bash
npm run test:int    # Vitest integration tests (tests/int)
npm run test:e2e    # Playwright E2E tests (tests/e2e + tests/helpers)
npm test            # both suites
```

Configuration lives in `vitest.config.mts` (integration) and `playwright.config.ts` (E2E).

## Security Notes

- Local API reads pass `overrideAccess: false` whenever a user context is supplied; hooks always forward `req` to nested operations to keep transactions atomic and avoid infinite hook loops (context flags).
- Payload auth cookies are hardened (`secure: true`, `SameSite=Strict`).
- Security headers are centralized in `next.config.ts`: HSTS, nosniff, `X-Frame-Options: SAMEORIGIN` (required for admin live preview iframes), strict Referrer-Policy, restrictive Permissions-Policy, COOP, CSP (enforce + report-only rollout), and CORP on media routes.
- Media uploads are restricted to explicit image MIME types (SVG excluded) with a 10 MB file-size limit.

Further project conventions and operational learnings: see [AGENTS.md](AGENTS.md).
