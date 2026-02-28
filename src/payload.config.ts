import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './cms/collections/Users';
import { Media } from './cms/collections/Media';
import { Pages } from './cms/collections/Pages';
import { Navigation } from './cms/globals/Navigation';
import { SiteSettings } from './cms/globals/SiteSettings';
import { Translations } from './cms/globals/Translations';
import { NotFound } from './cms/globals/NotFound';
import { envConfig } from '@/envConfig';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

console.log("CONFIG:", JSON.stringify(envConfig, null, 4));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  globals: [Navigation, SiteSettings, Translations, NotFound],
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
    envConfig.dbType === 'sqllite'
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
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: process.env.NODE_ENV === 'production',
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
