import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Mostheimer',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};
