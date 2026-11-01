import type { CollectionConfig } from 'payload';
import { allBlocks } from '../blocks';
import {
  revalidatePagePathCache,
  revalidatePreviousPagePathCache,
} from '../cache/frontend/frontendCache';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
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
