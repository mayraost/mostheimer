import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { sharpTransformer } from '@payloadcms/transformer-sharp';
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
  plugins: [],
});
