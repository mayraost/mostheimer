import type { Block } from 'payload';
import { icons } from 'lucide-react';

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
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
          name: 'iconName',
          type: 'select',
          options: Object.keys(icons).map((name) => ({
            label: name,
            value: name,
          })),
          admin: {
            description: 'Lucide icon name (e.g. Star, Heart, CheckCircle)',
          },
        },
      ],
    },
  ],
};
