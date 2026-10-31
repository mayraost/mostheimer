import type { Block } from 'payload';
import { icons } from 'lucide-react';

export const BentoGrid: Block = {
  slug: 'bentoGrid',
  labels: {
    singular: 'Bento Grid',
    plural: 'Bento Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional section heading above the grid',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'highlight',
          type: 'text',
          admin: {
            description: 'Bold highlighted teaser text (e.g. "Millionen-Traffic")',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'ctaLabel',
          type: 'text',
        },
        {
          name: 'ctaLink',
          type: 'text',
        },
        {
          name: 'iconName',
          type: 'select',
          options: Object.keys(icons).map((name) => ({
            label: name,
            value: name,
          })),
          admin: {
            description: 'Lucide icon name',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Featured cards span more columns on larger screens',
          },
        },
      ],
    },
  ],
};
