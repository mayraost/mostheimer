import type { GlobalConfig } from 'payload';
import { revalidateSiteSettingsCache } from '../cache/frontend/frontendCache';

/**
 * Global settings (branding, default OG image). The layout shell reads this via
 * the cached `cms:global:site-settings` entry, so a save revisits the shell
 * without any per-request Payload boot.
 *
 * A maintenance mode used to live here; it was removed on 05.11.2026 (the site
 * is always publicly reachable). Do not reintroduce it without revisiting the
 * proxy gate, the cache tags and the layout's auth read.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    // Public read: the frontend renders branding from this global.
    read: () => true,
  },
  hooks: {
    afterChange: [
      () => {
        // Layout-level entry (site settings + navigation share one cache
        // entry) — unchanged behaviour for branding changes.
        revalidateSiteSettingsCache();
      },
    ],
  },
  fields: [
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
