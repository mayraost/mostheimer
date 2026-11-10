import type { GlobalConfig } from 'payload';
import { protectedAuthorshipFields } from '../security/authorship';
import { revalidateNavigationCache } from '../cache/frontend/frontendCache';
import { validateHref } from '../../lib/safeHref';

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
          validate: validateHref,
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
          validate: validateHref,
        },
      ],
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
