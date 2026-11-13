import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusScreen } from './StatusScreen';
import { notFoundScreen } from '@/stories/fixtures/chrome';

/**
 * Gemeinsame Präsentation für 404- und Fehlerseiten (Server Component):
 * Mono-Codezeile, Titel, Text, Primär-/Sekundär-Aktion.
 *
 * `global-error.tsx` nutzt diese Karte bewusst NICHT (eigenes Dokument ohne
 * Layout) — hier geht es um die Fälle innerhalb der App.
 */
const meta = {
  title: 'Layout/StatusScreen',
  component: StatusScreen,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '3xl' },
    docs: {
      description: {
        component:
          'Statuskarte für 404/Fehler. Der `primary.href` kommt aus dem `not-found`-Global und läuft durch `safeHrefOrNull()`: ein unsicherer Wert wird zur nicht-interaktiven Fläche statt zu einem klickbaren Link.',
      },
    },
  },
  args: {
    code: notFoundScreen.code,
    tone: 'error',
    title: notFoundScreen.title,
    message: notFoundScreen.message,
    primary: notFoundScreen.primary,
  },
  argTypes: {
    code: { control: 'text' },
    tone: { control: 'inline-radio', options: ['error', 'warning'] },
    title: { control: 'text' },
    message: { control: 'text' },
    primary: { control: 'object' },
    secondary: { control: 'object' },
    retry: { control: false },
  },
} satisfies Meta<typeof StatusScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 404: eine Aktion, kein Retry. */
export const NotFound: Story = {};

/** 404 mit zweiter Aktion (z. B. Kontakt) — die Karte wächst mit. */
export const WithSecondary: Story = {
  args: { secondary: notFoundScreen.secondary },
};

/** `tone="warning"`: Punkt und Codezeile wechseln auf Amber. */
export const Warning: Story = {
  args: {
    tone: 'warning',
    code: 'HTTP 410 · Gone',
    title: 'Inhalt wurde entfernt',
    message: 'Diese Seite existiert nicht mehr. Die Navigation zeigt den aktuellen Stand.',
  },
};

/**
 * Unsicheres Ziel: `javascript:` wird von `safeHrefOrNull()` verworfen, der
 * Button degradiert zu einem `<span>` (gleiche Optik, nicht fokussierbar).
 */
export const UnsafeHref: Story = {
  args: {
    primary: { label: 'Zur Startseite', href: 'javascript:alert(1)' },
  },
};

/** Retry-Knoten aus einer Error-Boundary (Client-`reset`). */
export const WithRetry: Story = {
  args: {
    code: 'HTTP 500 · Error',
    title: 'Da ist etwas schiefgelaufen',
    message: 'Der Fehler wurde protokolliert. Ein erneuter Versuch lädt die Seite neu.',
    retry: (
      <button
        type="button"
        className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] border border-border-strong bg-surface-raised px-6 text-foreground"
      >
        Erneut versuchen
      </button>
    ),
  },
};

/** Lange Copy: die Karte bleibt auf `max-w-lg`, der Text bricht um. */
export const LongContent: Story = {
  args: {
    code: 'HTTP 404 · Not Found',
    title: 'Diese Seite gibt es nicht mehr — und die Suche hat auch nichts gefunden',
    message:
      'Der Link ist veraltet, die Seite wurde umbenannt oder es hat sich ein Tippfehler eingeschlichen. Über die Navigation oder die Befehlspalette (⌘K) findest du jede veröffentlichte Seite.',
    secondary: notFoundScreen.secondary,
  },
};
