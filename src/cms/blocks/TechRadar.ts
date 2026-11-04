import type { Block } from 'payload';

export const TechRadar: Block = {
  slug: 'techRadar',
  labels: {
    singular: 'Tech Radar',
    plural: 'Tech Radars',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional section heading',
      },
    },
    {
      name: 'quadrants',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          maxRows: 30,
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'tier',
              type: 'select',
              required: true,
              options: [
                { label: 'Core Mastery', value: 'core' },
                { label: 'Production Proven', value: 'proven' },
                { label: 'Strategic Focus', value: 'focus' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
};
