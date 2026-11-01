import type { GlobalConfig } from 'payload';
import { revalidateSiteSettingsCache } from '../cache/frontend/frontendCache';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  hooks: {
    // Wartungsmodus & Branding wirken auf ALLE Seiten, aber der Cache-
    // Einstieg ist der SiteSettings-Global-Tag (breit genug, da Layout).
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
