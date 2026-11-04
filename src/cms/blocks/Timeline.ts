import type { Block } from 'payload';

export const Timeline: Block = {
  slug: 'timeline',
  labels: {
    singular: 'Timeline',
    plural: 'Timelines',
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
      name: 'entries',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'period',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. "Seit 09/2024 – Heute"',
          },
        },
        {
          name: 'company',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'highlights',
          type: 'textarea',
        },
      ],
    },
  ],
};
