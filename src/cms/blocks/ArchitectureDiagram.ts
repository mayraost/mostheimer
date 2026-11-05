import type { Block } from 'payload';

/**
 * Interactive system architecture diagram (Edge → App/BFF → Core/CMS →
 * Data/State). The layer definitions are CMS content; the interaction (tablist,
 * keyboard, focus, prefers-reduced-motion) lives client-side in
 * `src/components/blocks/ArchitectureDiagramBlock.tsx`.
 *
 * Only the text fields are localized (layer titles/descriptions per locale);
 * the block structure itself is shared.
 */
export const ArchitectureDiagram: Block = {
  slug: 'architectureDiagram',
  labels: {
    singular: 'Architecture Diagram',
    plural: 'Architecture Diagrams',
  },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
      defaultValue: 'Architektur',
      admin: { description: 'Mono-Eyebrow über dem Heading' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Einleitender Absatz unter dem Heading' },
    },
    {
      name: 'layers',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      // Short physical table prefix: Payload's generated names here exceed
      // Postgres' 63-character identifier limit once index/FK constants are
      // appended, and get silently truncated. `lay`/`pri` keep table, index and
      // constraint names short and unambiguous.
      dbName: 'arch_lay',
      labels: { singular: 'Layer', plural: 'Layer' },
      admin: {
        description:
          'Genau vier Layer von außen nach innen: Edge → App/BFF → Core/CMS → Data/State',
      },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'subtitle', type: 'text', localized: true },
        {
          name: 'summary',
          type: 'textarea',
          localized: true,
          admin: { description: 'Kurzfassung im Layer-Knoten des Schaubilds' },
        },
        {
          name: 'principles',
          type: 'array',
          minRows: 1,
          maxRows: 6,
          dbName: 'arch_pri',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'text', type: 'textarea', localized: true },
          ],
        },
        {
          name: 'stack',
          type: 'textarea',
          localized: true,
          admin: { description: 'Mono-Tech-Zeile, z. B. "Varnish · Cloudflare · mTLS"' },
        },
        {
          name: 'metricLabel',
          type: 'text',
          localized: true,
          admin: { description: 'z. B. "TTFB p95"' },
        },
        {
          name: 'metricValue',
          type: 'text',
          localized: true,
          admin: { description: 'z. B. "< 120 ms"' },
        },
      ],
    },
  ],
};
