import type { Block } from 'payload';

export const Hero: Block = {
  slug: 'hero',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'showStackBadge',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Display the live tech-stack badge (Node 24 | Next.js 16 | Tailwind 4 | PayloadCMS 3)',
      },
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
      name: 'ctaLabel2',
      type: 'text',
      admin: {
        description: 'Optional second CTA button (ghost style)',
      },
    },
    {
      name: 'ctaLink2',
      type: 'text',
    },
  ],
};
