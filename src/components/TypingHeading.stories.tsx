import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TypingHeading } from './TypingHeading';

/**
 * Tipp-Animation der Hero-Headline — eine Client-Insel mit CLS-Vertrag.
 *
 * Der Server rendert den Text SICHTBAR (erste Paint = Endgeometrie), nach dem
 * Mount übernimmt ein Overlay in einer auf die SSR-Höhe geklemmten Box und
 * tippt. Deshalb ist die Höhe der Story hier konstant: die Animation ist ein
 * reiner Paint-Effekt, kein Reflow.
 *
 * Die Storys wrappen die Komponente in ein `<h1>` mit den Hero-Klassen — die
 * Komponente selbst bringt nur einen `span` mit und wird in `HeroBlock`
 * eingebettet.
 *
 * Motion-Guardrail: bei `prefers-reduced-motion: reduce` (oder
 * `animations: 'off'` in den Einstellungen) setzt der `SettingsProvider`
 * `currentAnimations: 'off'`; die Komponente zeigt dann sofort den statischen
 * Text, ohne Caret-Animation. Das ist Verhalten der Umgebung, kein Story-Arg —
 * der Schalter sitzt in der Toolbar des Browsers, nicht in den Controls.
 */
const meta = {
  title: 'Chrome/TypingHeading',
  component: TypingHeading,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Hero-Headline mit Tipp-Effekt. Der vollständige Text ist der Accessible Name (`aria-label` + `sr-only`-Kopie), die Animation ist `aria-hidden`. Die Boxhöhe wird vor dem ersten Animationsframe auf die SSR-Höhe geklemmt (gemessen, nicht geschätzt) — dadurch entsteht kein Layout-Shift.',
      },
    },
  },
  args: {
    text: 'Komplexe Systeme, klar gebaut.',
  },
  argTypes: {
    text: { control: 'text' },
  },
  render: (args) => (
    <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
      <TypingHeading text={args.text} />
    </h1>
  ),
} satisfies Meta<typeof TypingHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Eine Zeile — der häufigste Fall im Compact-Hero. */
export const ShortText: Story = {};

/** Mehrzeilig: hier zählt die Höhenklemmung, sonst schiebt jeder Buchstabe den Rest. */
export const LongText: Story = {
  args: {
    text: 'Architektur, Delivery und Betrieb — aus einer Hand, mit messbaren Gates vor jedem Merge.',
  },
};

/** Mobile-Breite: derselbe Text bricht auf vier Zeilen; die Box bleibt konstant. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2' } },
  args: {
    text: 'Architektur, Delivery und Betrieb — aus einer Hand, mit messbaren Gates vor jedem Merge.',
  },
};

/** Einzelnes Wort: kürzeste Animationsdauer (18 ms pro Zeichen). */
export const SingleWord: Story = {
  args: { text: 'Architektur' },
};
