import type { GlobalConfig } from 'payload';
import { revalidateSiteSettingsCache } from '../cache/frontend/frontendCache';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  hooks: {
    // Maintenance mode and branding affect every page, but the cache entry point
    // is the site-settings global tag, which is broad enough (layout-level).
    afterChange: [() => revalidateSiteSettingsCache()],
  },
  fields: [
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      label: 'Wartungsmodus aktiv',
      defaultValue: false,
    },
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Mostheimer',
      required: true,
      localized: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};
