import type { Block } from 'payload';

export const StatusBlock: Block = {
  slug: 'statusBlock',
  labels: {
    singular: 'Status Block',
    plural: 'Status Blocks',
  },
  fields: [
    {
      name: 'badgeLabel',
      type: 'text',
      defaultValue: 'Status',
      admin: {
        description: 'Short badge text shown above the title (e.g. "Aktuell" / "Current")',
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
      required: true,
    },
    {
      name: 'networkTopics',
      type: 'array',
      admin: {
        description: 'Topics displayed as tags (e.g. "Modern JS-Architekturen")',
      },
      fields: [
        {
          name: 'topic',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
