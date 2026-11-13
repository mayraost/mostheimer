import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ErrorScreen } from './ErrorScreen';
import { errorScreenCopyDe, errorScreenCopyEn } from '@/stories/fixtures/chrome';

/**
 * Error-Boundary mit App-Design (Client Component).
 *
 * Die Copy kommt als fertiges Bündel (`routes.error.*`) herein: eine
 * Client-Komponente kann den `'use cache'`-Read nicht awaiten, und der
 * CMS-Read ist häufig genau die Fehlerursache — fehlt der Wert, rendert die
 * Karte ihre Struktur ohne Worte statt erneut zu werfen.
 *
 * Hinweis zur Konsole: die Komponente loggt den Fehler absichtlich
 * (`[error-boundary] …`), nie im UI. Diese Zeile erscheint auch in Storybook —
 * sie ist Teil des Verhaltens, kein Story-Fehler.
 */
const meta = {
  title: 'Layout/ErrorScreen',
  component: ErrorScreen,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '3xl' },
    docs: {
      description: {
        component:
          'Fehlerkarte für `[locale]/error.tsx` und `(frontend)/error.tsx`. Ein Klick auf „Erneut versuchen" ruft das `reset` der Boundary und deaktiviert den Button, bis der Baum neu gerendert ist.',
      },
    },
  },
  args: {
    error: new Error('Beispiel: Upstream-Timeout beim Laden der Seite.'),
    reset: fn(),
    copy: errorScreenCopyDe,
  },
  argTypes: {
    error: { control: false },
    reset: { control: false },
    copy: { control: 'object' },
  },
} satisfies Meta<typeof ErrorScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Deutsch, kein Retry ausgelöst. */
export const Default: Story = {};

/** Englische Copy (die Route-Group-Variante oberhalb des Locale-Layouts ist EN-only). */
export const En: Story = {
  args: { copy: errorScreenCopyEn },
};

/**
 * `reset` wurde geklickt: der Button ist deaktiviert (`disabled:opacity-60`),
 * damit ein zweiter Klick keine parallele Recovery startet.
 */
export const Retrying: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole<HTMLButtonElement>('button', { name: args.copy.retry });

    await userEvent.click(button);

    await expect(button.disabled).toBe(true);
  },
};

/** Fehler ohne `message` (Produktions-Error mit Digest): nur der Digest ist gesetzt. */
export const ProductionDigest: Story = {
  args: {
    error: Object.assign(new Error(''), { digest: '3847291057' }),
  },
};
