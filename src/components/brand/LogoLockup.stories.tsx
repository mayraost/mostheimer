import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LogoLockup } from './LogoLockup';

/**
 * Der volle Marken-Lockup für große Flächen: Monogramm, Wortmarke und die
 * Subline `// WEB & APPLICATION ARCHITECT` in einer Box.
 *
 * Anders als `LogoLockupMark` (Header, zwei Kompositionen für zwei
 * Breakpoints) ist das hier **eine** SVG mit dem `display`-ViewBox — gedacht für
 * 404-Chrome, OG-Karte, Print und alles, wo alle drei Zeilen lesbar bleiben.
 *
 * Größe ist Sache des Aufrufers (`className`), Farbe kommt aus
 * `var(--mark-*)` (Marke) und `currentColor` (Wortmarke) — der Lockup erbt also
 * die Textfarbe seiner Umgebung.
 */

const meta = {
  title: 'Brand/LogoLockup',
  component: LogoLockup,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Vollständiger Lockup in einer SVG (Monogramm + Wortmarke + Subline). Theme-aware über `var(--mark-*)` und `currentColor`; Gradient-IDs sind per `useId()` genamespaced, damit zwei Lockups auf einer Seite koexistieren.',
      },
    },
  },
  argTypes: {
    className: { control: 'text', description: 'Größe/Farbe der SVG — der Aufrufer besitzt sie.' },
    title: { control: 'text', description: 'Accessible Name (`aria-label` + `<title>`).' },
    hideSubline: {
      control: 'boolean',
      description: 'Subline ausblenden, Boxhöhe bleibt — für enge Flächen.',
    },
  },
} satisfies Meta<typeof LogoLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Standardgröße für Karten und 404-Chrome. */
export const Default: Story = {
  args: { className: 'text-foreground h-auto w-[420px]' },
};

/**
 * Drei Breiten aus dem echten Einsatz: 180 px (Karte), 280 px (Panel),
 * 420 px (404-Chrome / Hero-Fläche).
 *
 * Der Lockup skaliert als Ganzes — Subline und Wortmarke bleiben im gleichen
 * Verhältnis, deshalb ist die kleinste Stufe die Grenze der Lesbarkeit.
 */
export const Sizes: Story = {
  name: 'Größen',
  render: () => (
    <div className="flex flex-col gap-8">
      {[180, 280, 420].map((width) => (
        <div key={width} className="flex flex-col gap-2">
          <span className="mono-label text-muted-foreground">{width} px</span>
          <div className="text-foreground" style={{ width }}>
            <LogoLockup className="h-auto w-full" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Ohne Subline — die Boxhöhe bleibt, damit die Marke nicht wandert. */
export const NoSubline: Story = {
  name: 'Ohne Subline',
  args: { className: 'text-foreground h-auto w-[420px]', hideSubline: true },
};

/** Light-Theme (fest gesetzt, unabhängig von der Toolbar). */
export const Light: Story = {
  globals: { theme: 'light' },
  render: () => (
    <div className="bg-surface inline-flex flex-col gap-4 p-6">
      <LogoLockup className="text-foreground h-auto w-[360px]" />
      <span className="mono-label text-muted-foreground">.light · Light-Palette</span>
    </div>
  ),
};

/** Dark-Theme (App-Default, fest gesetzt). */
export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="bg-surface inline-flex flex-col gap-4 p-6">
      <LogoLockup className="text-foreground h-auto w-[360px]" />
      <span className="mono-label text-muted-foreground">.dark · Dark-Palette</span>
    </div>
  ),
};
