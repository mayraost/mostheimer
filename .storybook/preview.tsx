import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import './preview.css';
import { withAppShell, withTheme, withTranslations } from './decorators';

/**
 * Globale Preview-Konfiguration — Konvention für ALLE Stories im Repo.
 *
 * `tags: ['autodocs']` global: jede Story-Datei bekommt automatisch eine
 * Docs-Seite (in Storybook 10 ist Autodocs ein Tag, kein `docs.autodocs`-Flag
 * in `main.ts` mehr). Wer sie nicht will, setzt `tags: ['!autodocs']`.
 */
const preview: Preview = {
  tags: ['autodocs'],

  // Theme außen (Tokens + SettingsProvider), Layout innen.
  decorators: [withTheme, withTranslations, withAppShell],

  initialGlobals: { theme: 'dark' },

  globalTypes: {
    theme: {
      description: 'Design-Tokens: .dark (Default) oder .light auf <html>',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    // Der Decorator padded selbst — Storybook soll keinen zweiten Rahmen legen.
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      options: {
        dark: { name: 'Dark (App-Default)', value: '#121212' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },
    controls: { expanded: true },
  },
};

export default preview;
