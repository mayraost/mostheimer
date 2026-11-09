import type { GlobalConfig } from 'payload';
import { protectedAuthorshipFields } from '../security/authorship';
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
      defaultValue: 'Mayra Ostheimer',
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
    /**
     * Identity facts for the JSON-LD `Person` node, the OG card and the
     * imprint. They live HERE and not in `translations`: an address or a phone
     * number is DATA about the person, not a UI label, and duplicating it per
     * locale invites drift with the imprint.
     */
    {
      name: 'identity',
      type: 'group',
      admin: {
        description:
          'Stammdaten für JSON-LD, OG-Karte und Impressum. Nur Fakten eintragen, die auch auf der Seite bzw. im Impressum stehen.',
      },
      fields: [
        { name: 'personName', type: 'text', localized: true },
        { name: 'email', type: 'email' },
        { name: 'telephone', type: 'text' },
        { name: 'streetAddress', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressLocality', type: 'text', localized: true },
        { name: 'addressCountry', type: 'text' },
        {
          name: 'sameAs',
          type: 'array',
          admin: { description: 'Öffentliche Profile (GitHub, LinkedIn …), vollständige URLs' },
          fields: [{ name: 'url', type: 'text', required: true }],
        },
        {
          name: 'knowsLanguage',
          type: 'array',
          admin: { description: 'BCP-47-Sprachcodes, z. B. de, en' },
          fields: [{ name: 'code', type: 'text', required: true }],
        },
      ],
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
