import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Navigation } from './globals/Navigation';
import { SiteSettings } from './globals/SiteSettings';
import { Translations } from './globals/Translations';

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Pages],
  globals: [Navigation, SiteSettings, Translations],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  localization: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    fallback: true,
  },
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
});
