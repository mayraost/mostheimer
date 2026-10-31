import { GlobalConfig } from 'payload';

export const Translations: GlobalConfig = {
  slug: 'translations',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'settings',
      type: 'group',
      localized: true,
      required: true,
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Settings', required: true },
        { name: 'themeHeading', type: 'text', defaultValue: 'Theme', required: true },
        {
          name: 'themeDescription',
          type: 'text',
          defaultValue: 'Choose your preferred color scheme.',
          required: true,
        },
        { name: 'fontSizeHeading', type: 'text', defaultValue: 'Font Size', required: true },
        {
          name: 'fontSizeDescription',
          type: 'text',
          defaultValue: 'Adjust the base text size.',
          required: true,
        },
        { name: 'animationsHeading', type: 'text', defaultValue: 'Animations', required: true },
        {
          name: 'animationsDescription',
          type: 'text',
          defaultValue: 'Enable or disable smooth transitions.',
          required: true,
        },
      ],
    },
    {
      name: 'common',
      type: 'group',
      localized: true,
      required: true,
      fields: [
        { name: 'system', type: 'text', defaultValue: 'System', required: true },
        { name: 'light', type: 'text', defaultValue: 'Light', required: true },
        { name: 'dark', type: 'text', defaultValue: 'Dark', required: true },
        { name: 'normal', type: 'text', defaultValue: 'Normal', required: true },
        { name: 'large', type: 'text', defaultValue: 'Large', required: true },
        { name: 'on', type: 'text', defaultValue: 'Enabled', required: true },
        { name: 'off', type: 'text', defaultValue: 'Disabled', required: true },
        { name: 'theme', type: 'text', defaultValue: 'Theme', required: true },
        {
          name: 'settingsButtonAria',
          type: 'text',
          defaultValue: 'Personalize your experience',
          required: true,
        },
        { name: 'menu', type: 'text', defaultValue: 'Menu', required: true },
      ],
    },
  ],
};
