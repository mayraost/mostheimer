import type { Block } from 'payload';
import { ICON_NAMES } from '../../components/blocks/Icon';

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
          options: [
            { label: 'Kein Icon', value: '' },
            // Single source: the frontend catalog (`ICON_CATALOG`). Offering
            // all ~1600 Lucide names let editors pick icons the renderer
            // silently drops (empty ring on the card).
            ...ICON_NAMES.map((name) => ({
              label: name,
              value: name,
            })),
          ],
          admin: {
            description: 'Lucide interchange icon name (empty = no icon)',
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
