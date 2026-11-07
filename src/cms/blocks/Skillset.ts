import type { Block } from 'payload';

import { ICON_NAMES } from '../../components/blocks/Icon';

export const Skillset: Block = {
  slug: 'skillset',
  labels: {
    singular: 'Skillset',
    plural: 'Skillsets',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional introductory paragraph below the heading',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: {
        description: 'Label of the block-level CTA (only rendered if ctaLink is set too)',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      admin: {
        description: 'Link target of the block-level CTA (only rendered if ctaLabel is set too)',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'level',
          type: 'text',
          admin: {
            description:
              'Free text badge, e.g. "Experte" / "Very confident" / "Solid" — deliberately no skill bars',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'iconName',
          type: 'select',
          options: [
            { label: 'Kein Icon', value: '' },
            // Same single source as the bento grid: only names the renderer
            // actually draws (see `ICON_CATALOG`).
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
          name: 'highlight',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Visually highlighted item',
          },
        },
      ],
    },
  ],
};
