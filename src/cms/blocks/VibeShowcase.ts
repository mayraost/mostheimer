import type { Block } from 'payload';

/**
 * Vibe-coding showcase (design doc § 3).
 *
 * A BLOCK, not a route component: the listing page (`pages.slug =
 * 'vibe-coding'`) keeps its editorial frame, and the block is the data
 * projection of `vibeProjects` onto exactly that one URL. The renderer stays a
 * pure prop renderer — `page` / `tag` come from the page's `searchParams`, the
 * documents from the `'use cache'` listing query.
 *
 * Deliberately NO `select` field: the tag filter is a `vibeTags` relationship on
 * the projects (§ 10), never an enum in this block — an enum would need a
 * migration + deploy per tag and hits the prod enum-churn trap.
 */
export const VibeShowcase: Block = {
  slug: 'vibeShowcase',
  labels: { singular: 'Vibe-Showcase', plural: 'Vibe-Showcases' },
  interfaceName: 'VibeShowcaseBlock',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Mono-Zeile über der Überschrift. Leer = Copy-Fallback (`blocks.vibeShowcase.eyebrow`)',
      },
    },
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: { description: 'Optionaler Lead-Absatz unter der Überschrift' },
    },
    {
      name: 'emptyState',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Text, wenn kein Projekt veröffentlicht ist. Leer = Copy-Fallback (`blocks.vibeShowcase.emptyLabel`)',
      },
    },
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 6,
      min: 3,
      max: 12,
      admin: {
        description:
          'Tiles pro Seite (3–12). Teil der Edge-Purge-URL-Liste — Änderung ändert die Seitenanzahl',
      },
    },
    {
      name: 'showFilter',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Tag-Filterleiste über dem Raster anzeigen' },
    },
    {
      name: 'featureFirst',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Featured-Projekt zuerst. Reihenfolge kommt aus dem Sort der Query (`-featured`, `order`, `-publishedAt`) — kein Client-Umsortieren',
      },
    },
  ],
};
