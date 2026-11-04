import type { Block } from 'payload';

/**
 * Interaktives System-Architektur-Schaubild (Edge → App/BFF → Core/CMS →
 * Data/State). Die Layer-Definitionen sind Inhalt (CMS), die Interaktion
 * (Tablist, Tastatur, Fokus, prefers-reduced-motion) lebt clientseitig in
 * `src/components/blocks/ArchitectureDiagramBlock.tsx`.
 *
 * Bewusst NICHT localized im Layout-Schema-Denken, aber die Textfelder sind
 * es: Layer-Titel/Beschreibungen pro Locale pflegbar.
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
      // Kurzer physischer Tabellen-Prefix: die generierten Payload-Namen
      // (`pages_blocks_architecture_diagram_layers_principles_*`) laufen
      // mit ihren Index-/FK-Konstanten ueber das 63-Zeichen-Limit von
      // Postgres und werden stillschweigend abgeschnitten (migrate:create-
      // Warnung). `lay`/`pri` halten Table + Index + Constraint zusammen
      // eindeutig und kurz.
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
