import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
  db:
    envConfig.dbType === 'sqlite'
      ? sqliteAdapter({
          client: {
            url: envConfig.dbUrl,
          },
        })
      : postgresAdapter({
          pool: {
            connectionString: envConfig.dbUrl,
          },
        }),
  upload: {
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
