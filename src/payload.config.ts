import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { sharpTransformer } from '@payloadcms/transformer-sharp';
import { mcpPlugin } from '@payloadcms/plugin-mcp';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Users } from './cms/collections/Users';
import { Media } from './cms/collections/Media';
import { Pages } from './cms/collections/Pages';
import { Navigation } from './cms/globals/Navigation';
import { NotFound } from './cms/globals/NotFound';
import { SiteSettings } from './cms/globals/SiteSettings';
import { Translations } from './cms/globals/Translations';
import { envConfig } from '@/envConfig';
import { migrations } from './migrations';

// Upload-Groessengrenze (Hardening): 10 MB in bytes — busboy-limits-Key
// `upload.limits.fileSize` verifiziert in node_modules/payload/dist/config/
// types.d.ts (GlobalUploadConfig) + dist/uploads/resolveURLUploadInput.js
// (URL-Uploads lesen denselben Key).
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // GraphQL-Endpoint deaktiviert: dieses Projekt konsumiert Payload
  // ausschliesslich via Local API ('use cache'-Queries) + REST-Preview.
  // Payload-4-Shape verifiziert: RootGraphQLConfig { disable?: boolean }
  // (node_modules/payload/dist/config/types.d.ts) — `graphQL: false` wie in
  // Payload-3 ist hier NICHT die Typsignatur.
  graphQL: { disable: true },
  // Anonyme Nutzungsstatistik aus.
  telemetry: false,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        'cache-clear': {
          // Manuelles Cache-Flush-Panel (Server Action clearAllFrontendCaches)
          Component: { path: '/cms/admin/views/CacheClearView' },
          path: '/cache-clear',
          meta: {
            title: 'Cache leeren',
            description: 'Alle Frontend-CMS-Caches manuell invalidieren',
          },
        },
      },
      actions: ['/cms/admin/components/CacheClearNavLink'],
    },
  },
  collections: [Users, Media, Pages],
  globals: [Navigation, NotFound, SiteSettings, Translations],
  localization: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: envConfig.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    prodMigrations: migrations,
    // Dev-Schema-Push deaktiviert: Schemaaenderungen laufen IMMER ueber
    // payload migrate / migrate:create (Worktree-Snapshot-Diff), damit
    // Migration-Verlauf + Prod-DB nicht divergieren (vgl. AGENTS.md).
    push: false,
    pool: {
      connectionString: envConfig.dbUrl,
    },
  }),
  upload: {
    // Multipart-Request-Gesamtlimit (Busboy/performant upload pipeline —
    // Key verifiziert: FetchAPIFileUploadOptions in config/types.d.ts,
    // Default 50 MB). Etwas Headroom über dem fileSize-Limit unten,
    // damit Fields/Headers nicht zum Abbruch führen.
    requestSizeLimit: 11 * 1024 * 1024,
    limits: { fileSize: MAX_UPLOAD_BYTES },
    transformers: [
      sharpTransformer({
        collections: {
          media: {
            formatOptions: { format: 'webp' },
            variants: [
              {
                name: 'thumbnail',
                width: 400,
                height: 300,
                position: 'centre',
              },
              {
                name: 'card',
                width: 768,
                height: 1024,
                position: 'centre',
              },
            ],
          },
        },
      }),
    ],
  },
  plugins: [
    // MCP-Plugin (@payloadcms/plugin-mcp, exakt 4.0.0-beta.6).
    // Die Docs-Seite (payloadcms.com/docs/plugins/mcp) beschreibt die 3.x-API
    // (API-Key-Collection, `enabled: true`, per-Key-Toggles); die installierte
    // 4.0.0-beta.6 verifiziert in node_modules/@payloadcms/plugin-mcp/dist:
    //   - tools-Map mit Opt-out (`false` disables den Built-in; default ON)
    //   - Auth ueber Payload-native API-Keys (Users.useAPIKey; Header
    //     `Authorization: users API-Key <value>`; Bearer = JWT)
    //   - keine per-Key-Toggles: Access Control kommt aus den Permissions des
    //     Key-Owner-Users ("Step 2"-Modell im Docs-Beta entfaellt)
    // Scope (User-Decision 04.11.): alle Built-ins ON bis auf delete@media;
    // users read-only via find-only (Auth-Felder hash/salt werden im
    // overrideResponse redigiert, Text-Blocks + structuredContent).
    mcpPlugin({
      collections: {
        pages: {
          description:
            'CMS-Seiten mit block-basiertem Layout (Hero, RichText, BentoGrid, Skillset u. a.), Slug-Routing fuer /{locale}/[...slug].',
        },
        users: {
          tools: {
            count: false,
            create: false,
            delete: false,
            findDistinct: false,
            getCollectionSchema: false,
            update: false,
            find: {
              overrideResponse: (response) => {
                // Security: Auth-Felder hash/salt verlassen MCP nie.
                const redact = (text: string) =>
                  text.replace(/"(hash|salt)":\s*"(?:[^"\\]|\\.)*"/g, '"$1": "[redacted]"');
                response.content = response.content.map((c) =>
                  c.type === 'text' ? { ...c, text: redact(c.text) } : c,
                );
                if (response.structuredContent) {
                  response.structuredContent = JSON.parse(
                    redact(JSON.stringify(response.structuredContent)),
                  );
                }
                return response;
              },
            },
          },
        },
        media: {
          description:
            'Mediathek (Bilder/Uploads, WebP-Transformationen). CRUD ohne delete — Loeschung nur via Admin/REST.',
          tools: { delete: false },
        },
      },
      globals: {
        navigation: {
          description: 'Site-Navigationstruktur (Header-Links).',
        },
        'site-settings': {
          description: 'Globale Site-Einstellungen (Theme/SEO/Meta).',
        },
        translations: {
          description: 'i18n-Strings (lokalisiert en/de) fuer Frontend-UI-Texte.',
        },
        'not-found': {
          description: '404-Seiteninhalt (title/message/button, lokalisiert).',
        },
      },
    }),
  ],
});
