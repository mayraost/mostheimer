import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, type ReactNode } from 'react';
import { SettingsPageClient } from './SettingsPageClient';

/**
 * Echte Settings-Seite (Theme, Schriftgröße, Animationen).
 *
 * Die Seite liest und schreibt den Zustand des globalen `SettingsProvider`
 * (`.dark`/`.light` + `large-font` + `no-animations` auf `<html>`). Die Stories
 * setzen deshalb die Ausgangswerte, statt die Komponente zu mocken:
 *
 * - `Default`: App-Default (dark, normale Schrift, Animationen an).
 * - `LargeFont`: `large-font` auf `<html>` — dieselbe Klasse, die der Provider
 *   beim gespeicherten Wert `large` setzt.
 * - `Light`: Theme-Toolbar auf `light` (`globals.theme`), die Theme-Zeile zeigt
 *   „Hell" als aktive Option.
 */

function FontFrame({ size, children }: { size: 'normal' | 'large'; children: ReactNode }) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fontSize', size);
  }

  useEffect(() => {
    const root = document.documentElement;
    const previous = window.localStorage.getItem('fontSize');
    root.classList.toggle('large-font', size === 'large');
    return () => {
      root.classList.remove('large-font');
      if (previous === null) window.localStorage.removeItem('fontSize');
      else window.localStorage.setItem('fontSize', previous);
    };
  }, [size]);

  return <>{children}</>;
}

const withFontSize = (size: 'normal' | 'large'): Decorator =>
  function WithFontSizeDecorator(Story) {
    return (
      <FontFrame size={size}>
        <Story />
      </FontFrame>
    );
  };

const meta = {
  title: 'Features/SettingsPage',
  component: SettingsPageClient,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Client-Insel der Settings-Route (unter `cacheComponents` kann eine Route nicht gleichzeitig `use client` und `generateStaticParams` exportieren). Drei Gruppen mit `aria-pressed`-Buttons; jede Änderung schreibt in `localStorage` und setzt die Klasse auf `<html>`.',
      },
    },
  },
} satisfies Meta<typeof SettingsPageClient>;

export default meta;

type Story = StoryObj<typeof meta>;

/** App-Default: dark, normale Schrift, Animationen an. */
export const Default: Story = {
  decorators: [withFontSize('normal')],
};

/** Große Schrift (`large-font` auf `<html>`). */
export const LargeFont: Story = {
  name: 'Große Schrift',
  decorators: [withFontSize('large')],
};

/** Helles Theme über die Toolbar — die Theme-Zeile steht auf „Hell". */
export const Light: Story = {
  name: 'Helles Theme',
  globals: { theme: 'light' },
  decorators: [withFontSize('normal')],
};
