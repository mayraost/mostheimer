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

// Upload size cap (hardening): 10 MB. Applies to multipart and URL uploads
// alike (both read upload.limits.fileSize).
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // GraphQL is disabled: Payload is consumed only via the Local API
  // ('use cache' queries) plus the REST preview. Payload 4 expects an object
  // (`{ disable: true }`), not the `graphQL: false` of Payload 3.
  graphQL: { disable: true },
  telemetry: false,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        'cache-clear': {
          // Manual cache-flush panel (Server Action clearAllFrontendCaches).
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
    // No dev schema push: schema changes always go through payload
    // migrate / migrate:create so the migration history and the prod DB never
    // diverge.
    push: false,
    pool: {
      connectionString: envConfig.dbUrl,
    },
  }),
  upload: {
    // Whole-request limit (default 50 MB). A little headroom over the fileSize
    // limit below so fields and headers do not abort the upload.
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
    // MCP plugin. The published docs still describe the 3.x API; the installed
    // 4.0.0-beta.6 behaves differently:
    //   - the tools map opts out with `false` (built-ins are ON by default),
    //   - auth uses Payload-native API keys (Header
    //     `Authorization: users API-Key <value>`; Bearer means JWT),
    //   - there are no per-key toggles: permissions come from the key owner.
    // Scope: every built-in on except delete@media; users is read-only, with
    // hash/salt redacted from text blocks and structuredContent.
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
                // Security: auth fields hash/salt never leave MCP.
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
