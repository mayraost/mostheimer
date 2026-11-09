import type { CollectionConfig, FieldHook } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

import { protectedAuthorshipFields } from '../security/authorship';
import {
  revalidatePreviousProjectCache,
  revalidateProjectCache,
} from '../cache/frontend/frontendCache';
import { toUrlSlug } from '../slugField';

/**
 * Project-Showcase projects — one document per detail route
 * `/[locale]/projects/<slug>` (design doc § 2).
 *
 * Why a collection instead of a block/array on the listing page: drafts and
 * versions belong to a PROJECT (a block shares the page's draft), the proxy 404
 * check, the sitemap and the edge-purge registry assume "one document = one
 * route", and `?page=N` needs a countable set outside `pages.layout`.
 *
 * Security: `access.read` is published-only for anonymous requests; the
 * authorship fields (`createdBy`/`updatedBy`) are declared read-protected LAST
 * so no public read can populate a users document (AGENTS.md § Security).
 */

/**
 * Derives the URL slug from the field value or, when empty, from `source`
 * (title/label). One normaliser for both URL-bearing collections, so the stored
 * slug is always the lowercase `[a-z0-9-]` form the routes expect.
 */
function makeSlugHook(source: (data: Record<string, unknown>) => unknown): FieldHook {
  return ({ value, data }) => toUrlSlug(value ?? source(data ?? {}));
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project-Projekt', plural: 'Project-Projekte' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'kind', 'order', 'featured', 'updatedAt'],
    group: 'Content',
    livePreview: {
      // Relative URL on purpose: Payload injects the admin origin itself, which
      // keeps the preview working behind the tunnel. locale.code is the locale
      // currently being edited.
      url: ({ data, locale }) =>
        `/${locale?.code ?? 'en'}/preview/project?slug=${toUrlSlug(data?.slug ?? '')}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 720 },
      ],
    },
  },
  access: {
    // Anonymous readers only see published projects; authenticated users (live
    // preview with `draft: true`) also see drafts.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    // The version history holds unpublished draft states.
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  // Drafts so live preview can render unpublished work; the public fetch path
  // still passes `draft: false` and stays published-only.
  versions: { drafts: true },
  hooks: {
    // OSR: a publish/update invalidates the project's detail tag, the collection
    // domain tag, the sitemap AND the listing (a publish moves the project
    // between pages). A slug rename additionally flushes the OLD detail URL so
    // it 404s from then on. All three live in the cache layer — this hook only
    // forwards the documents.
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateProjectCache(doc.slug);
        revalidatePreviousProjectCache(previousDoc?.slug, doc.slug);
      },
    ],
    // A delete empties a listing slot and removes a detail route.
    afterDelete: [({ doc }) => revalidateProjectCache(doc.slug)],
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
        description: 'URL-Segment /de/projects/<slug> (nicht übersetzen)',
      },
      hooks: {
        beforeValidate: [makeSlugHook((data) => data.title)],
      },
    },
    {
      name: 'teaser',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 220,
      admin: { description: 'Tile-Teaser + Fallback für die Meta-Description' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'experiment',
      options: [
        { label: 'Experiment', value: 'experiment' },
        { label: 'Tool', value: 'tool' },
        { label: 'Produkt', value: 'product' },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Tile-Preview (16:9 — Varianten tile / tileWide / hero); Alt-Text ist im Media-Dokument Pflicht',
      },
    },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'stack',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Chips, z. B. "Next.js 16" (Reihenfolge = Anzeige)' },
    },
    { name: 'liveUrl', type: 'text', admin: { description: 'Externe Demo (https://…)' } },
    { name: 'githubUrl', type: 'text', admin: { description: 'Repo (https://github.com/…)' } },
    // Filter tags — CMS-managed collection (design doc § 10), never a select
    // enum: an enum would mean a migration + deploy per tag.
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'projectTags',
      hasMany: true,
      index: true,
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      index: true,
      admin: { position: 'sidebar', description: 'Aufsteigend; Gleichstand → neueste zuerst' },
    },
    // -- Case study (localized) -------------------------------------------------
    {
      name: 'context',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Ausgangslage (Leerzeile = Absatz)' },
    },
    {
      name: 'approach',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({}),
      admin: { description: 'Wie gebaut / AI-assisted: Schleifen, Prompts, Werkzeuge' },
    },
    {
      name: 'learnings',
      type: 'textarea',
      localized: true,
      admin: { description: 'Was lief schief, was würde ich anders machen' },
    },
    {
      name: 'outcome',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ergebnis & Wirkung' },
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
