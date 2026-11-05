import type { CollectionConfig } from 'payload';
import { allBlocks } from '../blocks';
import { normalizeSlug } from '../cache/frontend/utils';
import {
  revalidatePagePathCache,
  revalidatePreviousPagePathCache,
} from '../cache/frontend/frontendCache';
import { wordingBeforeValidate } from '../wording/beforeValidateWordingCheck';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      // Relative URL on purpose: Payload injects the admin origin itself, which
      // keeps the preview working behind the tunnel. locale.code is the locale
      // currently being edited.
      url: ({ data, locale }) =>
        `/${locale?.code ?? 'en'}/preview?slug=${normalizeSlug(data?.slug ?? 'home')}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 720 },
      ],
    },
  },
  access: {
    // Public reads are published-only; authenticated users (incl. live preview
    // with `draft: true`) also see drafts.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    // The version history contains unpublished draft states and must never be
    // readable without authentication.
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  // Drafts exist so live preview can render unpublished drafts; the public fetch
  // path still passes draft:false and stays published-only.
  versions: { drafts: true },
  hooks: {
    // Wording guardrail: banned hierarchy/brand terms fail the save with a
    // readable message instead of shipping (see cms/aeo/constraints.ts).
    beforeValidate: [wordingBeforeValidate],
    // OSR: publish/update/delete flush the route cache precisely and blocking
    // (see cache/frontend/revalidate.ts — the 'max' SWR window left pages stale
    // on prod). A slug rename also flushes the old path, which must serve 404
    // from then on instead of the stale content.
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
