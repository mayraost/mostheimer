import { GlobalConfig } from 'payload';
import { revalidateTranslationsCache } from '../cache/frontend/frontendCache';
import { wordingBeforeValidate } from '../wording/beforeValidateWordingCheck';

export const Translations: GlobalConfig = {
  slug: 'translations',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [wordingBeforeValidate],
    afterChange: [() => revalidateTranslationsCache()],
  },
  fields: [
    {
      name: 'settings',
      type: 'group',
      localized: true,
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
    {
      // Command-Palette (⌘K) — alle sichtbaren UND Screenreader-Strings,
      // damit /en nicht deutsche Labels zeigt (Fix 04.11.2026).
      name: 'commandPalette',
      type: 'group',
      localized: true,
      fields: [
        {
          name: 'triggerLabel',
          type: 'text',
          defaultValue: 'Search — open command palette',
          required: true,
          admin: { description: 'Accessible name of the header search button' },
        },
        { name: 'triggerText', type: 'text', defaultValue: 'Search', required: true },
        { name: 'title', type: 'text', defaultValue: 'Command palette', required: true },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Search pages, sections or technologies …',
          required: true,
        },
        { name: 'searchLabel', type: 'text', defaultValue: 'Search', required: true },
        { name: 'resultsLabel', type: 'text', defaultValue: 'Results', required: true },
        { name: 'emptyLabel', type: 'text', defaultValue: 'no matches', required: true },
        { name: 'hintNavigate', type: 'text', defaultValue: '↑↓ navigate', required: true },
        { name: 'hintOpen', type: 'text', defaultValue: '↵ open', required: true },
        {
          name: 'resultCount',
          type: 'text',
          defaultValue: 'result',
          required: true,
          admin: { description: 'Singular; the plural appends the `resultCountPlural` value' },
        },
        { name: 'resultCountPlural', type: 'text', defaultValue: 's', required: true },
        { name: 'groupPages', type: 'text', defaultValue: 'Pages', required: true },
        { name: 'groupSections', type: 'text', defaultValue: 'Sections', required: true },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      localized: true,
      admin: {
        description:
          'Footer-Copyright und der Seitenkopf-Eyebrow ("// site"). Der Footer ist sonst CMS-frei (Navigation kommt aus dem navigation-Global).',
      },
      fields: [
        {
          name: 'rightsReserved',
          type: 'text',
          defaultValue: 'All rights reserved',
          required: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'site',
          required: true,
        },
      ],
    },
    {
      name: 'cookies',
      type: 'group',
      localized: true,
      admin: {
        description:
          'Cookie-Consent-Banner (Consent Mode v2) und der Footer-Link "Cookie-Einstellungen".',
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Consent',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Cookie settings',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'This site uses technically necessary storage only. Analytics and marketing are optional and stay disabled until you allow them.',
          required: true,
        },
        {
          name: 'privacyLabel',
          type: 'text',
          defaultValue: 'Privacy policy',
          required: true,
        },
        {
          name: 'privacyLink',
          type: 'text',
          defaultValue: '/en/privacy',
          required: true,
        },
        {
          name: 'necessaryLabel',
          type: 'text',
          defaultValue: 'Necessary',
          required: true,
        },
        {
          name: 'necessaryDescription',
          type: 'textarea',
          defaultValue:
            'Theme, font size and your consent decision. Required for the site to work; cannot be disabled.',
          required: true,
        },
        {
          name: 'necessaryBadge',
          type: 'text',
          defaultValue: 'Always on',
          required: true,
        },
        {
          name: 'analyticsLabel',
          type: 'text',
          defaultValue: 'Analytics',
          required: true,
        },
        {
          name: 'analyticsDescription',
          type: 'textarea',
          defaultValue:
            'Google Tag Manager and Analytics: anonymous usage statistics that help improve the site.',
          required: true,
        },
        {
          name: 'marketingLabel',
          type: 'text',
          defaultValue: 'Marketing',
          required: true,
        },
        {
          name: 'marketingDescription',
          type: 'textarea',
          defaultValue:
            'Advertising and remarketing tags. Currently unused, but reserved for future campaigns.',
          required: true,
        },
        {
          name: 'rejectAll',
          type: 'text',
          defaultValue: 'Only necessary',
          required: true,
        },
        {
          name: 'saveSelection',
          type: 'text',
          defaultValue: 'Save selection',
          required: true,
        },
        {
          name: 'acceptAll',
          type: 'text',
          defaultValue: 'Accept all',
          required: true,
        },
        {
          name: 'settingsLink',
          type: 'text',
          defaultValue: 'Cookie settings',
          required: true,
        },
      ],
    },
    {
      // Copy-to-clipboard affordance (contact e-mail). Visible label AND the
      // screen-reader announcement live here so /en never speaks German.
      name: 'clipboard',
      type: 'group',
      localized: true,
      admin: {
        description: 'Copy-to-clipboard buttons (contact e-mail) and their screen-reader feedback.',
      },
      fields: [
        {
          name: 'copyLabel',
          type: 'text',
          defaultValue: 'Copy e-mail',
          required: true,
        },
        {
          name: 'copiedMessage',
          type: 'text',
          defaultValue: 'E-mail address copied to the clipboard',
          required: true,
        },
        {
          name: 'failedMessage',
          type: 'text',
          defaultValue: 'Copying failed — please select the address manually',
          required: true,
        },
      ],
    },
    {
      // Action labels of the contact key-fact cards (call, social profiles) and
      // the hint for links that open in a new tab. Localized like `clipboard`
      // so a `/en` visitor never reads German.
      name: 'contactActions',
      type: 'group',
      localized: true,
      admin: {
        description:
          'Action buttons on contact cards (call, GitHub, LinkedIn) and the new-tab hint.',
      },
      fields: [
        {
          name: 'callLabel',
          type: 'text',
          defaultValue: 'Call',
          required: true,
        },
        {
          name: 'githubLabel',
          type: 'text',
          defaultValue: 'GitHub',
          required: true,
        },
        {
          name: 'linkedinLabel',
          type: 'text',
          defaultValue: 'LinkedIn',
          required: true,
        },
        {
          name: 'newTabHint',
          type: 'text',
          defaultValue: '(opens in a new tab)',
          required: true,
        },
      ],
    },
  ],
};
