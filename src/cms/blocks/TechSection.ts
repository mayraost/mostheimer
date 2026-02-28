import type { Block } from 'payload';

export const TechSection: Block = {
  slug: 'techSection',
  labels: {
    singular: 'Tech Section',
    plural: 'Tech Sections',
  },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
      admin: {
        description: 'Small uppercase badge above the heading (e.g. "Case Study", "Deep Dive")',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main technical content. Use blank lines for paragraph breaks.',
      },
    },
    {
      name: 'keyFacts',
      type: 'array',
      maxRows: 5,
      admin: {
        description:
          'Optional metrics/facts row displayed below the body (e.g. "Caching layer: Cloudflare")',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
