import type { CollectionConfig } from 'payload';
import { allBlocks } from '../blocks';
import { normalizeSlug } from '../cache/frontend/utils';
import {
  revalidatePagePathCache,
  revalidatePreviousPagePathCache,
} from '../cache/frontend/frontendCache';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      // Relative URL: Payload injiziert Admin-Origin automatisch (Origin-
      // Gotcha hinter Tunnel geloest). locale.code = aktuell editierte Locale.
      // (collections-Filter nur im ROOT admin.livePreview — hier auf der
      // Collection implizit.)
      url: ({ data, locale }) =>
        `/${locale?.code ?? 'en'}/preview?slug=${normalizeSlug(data?.slug ?? 'home')}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 720 },
      ],
    },
  },
  access: {
    // Öffentliche Reads sind published-only; authentifizierte Users
    // (u.a. Live-Preview `draft: true`) sehen auch Drafts.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    // Versions-Historie enthält unveröffentlichte Draft-States — niemals
    // unauthentifiziert abgreifbar (Payload-4-Access-Key verifiziert in
    // node_modules/payload/dist/collections/config/types.d.ts).
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  // Drafts: Lebewesen-Basis fuer Live-Preview (nicht-published Entwuerfe
  // rendern). Public-Fetch-Kette bleibt draft:false → published-only.
  versions: { drafts: true },
  hooks: {
    // ISR/OSR: Publish/Update/Delete flusten den Route-Cache punktgenau.
    // Slug-Umbenennung flust zusaetzlich den alten Pfad (muss fortan 404
    // liefern statt dem alten Inhalt).
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidatePagePathCache(doc.slug);
        if (previousDoc?.slug) {
          revalidatePreviousPagePathCache(previousDoc.slug, doc.slug);
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidatePagePathCache(doc.slug);
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      localized: true,
    },
  ],
};
