import type { GlobalConfig } from 'payload';
import { revalidateNavigationCache } from '../cache/frontend/frontendCache';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidateNavigationCache()],
  },
  fields: [
    {
      name: 'headerLinks',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
