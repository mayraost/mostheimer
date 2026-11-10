import type { GlobalConfig } from 'payload';
import { protectedAuthorshipFields } from '../security/authorship';
import { revalidateTranslationsCache } from '../cache/frontend/frontendCache';
import { validateHref } from '../../lib/safeHref';

export const Translations: GlobalConfig = {
  slug: 'translations',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  hooks: {
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
          validate: validateHref,
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
        {
          // Inline confirmation shown INSIDE the button for 2s after a copy
          // (spec §3.4 "terminal-style feedback"). The screen-reader variant is
          // `copiedMessage` above — this one is the visible terminal line.
          name: 'copiedInline',
          type: 'text',
          defaultValue: '[ COPIED // 200 OK ]',
          required: true,
          admin: {
            description:
              'Inline button label while the copy confirmation is shown (2s). Screen readers still hear "E-mail address copied".',
          },
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
    {
      /*
       * UI copy as KEY/VALUE ROWS — the reason this is an array and not a
       * group of columns:
       *
       * Payload's Postgres adapter aggregates a localized table with
       * `json_build_array(<one argument per column>)`. Postgres rejects any
       * function call with more than 100 arguments, so a localized table that
       * grows past ~100 columns breaks EVERY read of the global at runtime
       * (measured 08.11.2026: `translations_locales` reached 129 columns and
       * `findGlobal('translations')` failed with "cannot pass more than 100
       * arguments to a function").
       *
       * A localized `array` stores its rows in its own side table, so the
       * column count of `translations_locales` does not change at all — new
       * strings are new ROWS, which scales indefinitely.
       *
       * Consequences (deliberate):
       * - The shape is not enforced by the database; it is enforced by
       *   TypeScript in `src/lib/translations.ts`, where every key is derived
       *   from the generated `Translation` type. A typo in `key` is a compile
       *   error at the call site.
       * - Editors see one list with `Pfad` / `Text` instead of dozens of
       *   labelled inputs; the `Pfad` is the stable address (`chrome.brandClaim`).
       */
      name: 'copy',
      type: 'array',
      localized: true,
      labels: { singular: 'UI-Text', plural: 'UI-Texte' },
      admin: {
        description:
          'Alle UI-Texte als Pfad/Text-Paare (z. B. `chrome.brandClaim`). Die Pfade sind im Code typisiert — bitte nicht umbenennen.',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          index: true,
          admin: {
            description: 'Stabiler Pfad, z. B. `routes.error.title` (nicht übersetzen)',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          admin: { description: 'Leer = Element wird ausgelassen, nie ein erfundener Text' },
        },
        {
          name: 'values',
          type: 'textarea',
          admin: {
            description: 'Für Listen: Werte mit Zeilenumbruch getrennt (z. B. Stack-Chips)',
          },
        },
      ],
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
