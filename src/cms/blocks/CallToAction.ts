import type { Block } from 'payload';

export const CallToAction: Block = {
  slug: 'callToAction',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      type: 'text',
    },
    {
      name: 'buttonLink',
      type: 'text',
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ],
    },
  ],
};
