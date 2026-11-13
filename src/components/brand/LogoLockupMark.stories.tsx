import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LogoLockupMark } from './LogoLockupMark';

/**
 * Header-Lockup: MO-Monogramm + MAYRA / OSTHEIMER, Subline ab `lg`.
 *
 * Das Bauteil rendert **beide** Kompositionen (compact = Marke + Wortmarke,
 * full = zusätzlich `// WEB & APPLICATION ARCHITECT`) und überlässt `lg` die
 * Entscheidung, welche im Layout steht. Grund: die Subline ist eine dritte
 * Zeile und braucht eine höhere Box — ein `viewBox` ist ein Attribut, keine
 * Style-Eigenschaft, also kann keine Media-Query es tauschen. Genau eine
 * Komposition ist sichtbar, deshalb gibt es keinen doppelten Tab-Stop und
 * keinen doppelten Accessible Name.
 *
 * Höhe kommt von außen (`h-8`, `lg:h-[72px]` im Header) — die Marke ist in
 * beiden Boxen 300 Einheiten hoch und rendert dadurch auf jedem Breakpoint
 * gleich groß.
 *
 * Die Storys `Compact`/`Full` erzwingen die jeweilige Komposition per
 * `!important`-Utilities, weil der Umschalter eine Viewport-Media-Query ist und
 * Storybook hier keinen Viewport-Addon hat. `Light`/`Dark` setzen `globals.theme`
 * fest, damit die Aufnahme unabhängig von der Toolbar-Wahl reproduzierbar ist.
 */

const meta = {
  title: 'Brand/LogoLockupMark',
  component: LogoLockupMark,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Zweiteiliges Header-Lockup (Marke + Wortmarke, ab `lg` mit Subline). Farben folgen `var(--mark-*)` und `currentColor`, alle Gradient-IDs sind per `useId()` genamespaced.',
      },
    },
  },
  argTypes: {
    className: { control: 'text', description: 'Klassen der Wurzel — die Höhe kommt von hier.' },
    title: { control: 'text', description: "Accessible Name; `''` blendet ihn aus." },
  },
} satisfies Meta<typeof LogoLockupMark>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Echtes Header-Verhalten: unter `lg` compact, ab `lg` full. */
export const Default: Story = {
  args: { className: 'h-8 text-foreground' },
};

/** Erzwungene compact-Komposition (Marke + Wortmarke) — der Stand unter `lg`. */
export const Compact: Story = {
  name: 'Compact — Marke + Wortmarke',
  args: {
    className: 'h-10 text-foreground [&>svg:first-of-type]:block! [&>svg:last-of-type]:hidden!',
  },
};

/** Erzwungene full-Komposition (mit Subline) — der Stand ab `lg`. */
export const Full: Story = {
  name: 'Full — mit Subline',
  args: {
    className: 'h-10 text-foreground [&>svg:first-of-type]:hidden! [&>svg:last-of-type]:block!',
  },
};

/**
 * Höhen aus dem echten Einsatz: 24 px (Drawer/klein), 32 px (`h-8`, unter `lg`),
 * 48 px (mittlere Fläche), 72 px (`lg`-Header).
 *
 * Die Subline bleibt bei kleiner Höhe zuerst unlesbar — genau deshalb ist sie
 * unter `lg` nicht Teil der Komposition.
 */
export const Sizes: Story = {
  name: 'Größen',
  render: () => (
    <div className="flex flex-col gap-6">
      {[24, 32, 48, 72].map((height) => (
        <div key={height} className="flex items-center gap-6">
          <span className="mono-label w-16 shrink-0 text-muted-foreground">{height} px</span>
          <div className="text-foreground flex items-center" style={{ height }}>
            {/* `title=""`: die vier Kopien sind ein Größenvergleich, keine vier Logos. */}
            <LogoLockupMark className="h-full" title="" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Ohne `title`: kein `sr-only`-Name — für den Fall, dass der umgebende Link ihn trägt. */
export const NoTitle: Story = {
  name: 'Ohne Accessible Name',
  args: { className: 'h-10 text-foreground', title: '' },
};

/** Light-Theme (fest gesetzt, unabhängig von der Toolbar). */
export const Light: Story = {
  globals: { theme: 'light' },
  render: () => (
    <div className="bg-surface inline-flex items-center gap-6 p-6">
      <LogoLockupMark className="h-10" />
      <span className="mono-label text-muted-foreground">.light · --mark-* Light-Palette</span>
    </div>
  ),
};

/** Dark-Theme (App-Default, fest gesetzt). */
export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="bg-surface inline-flex items-center gap-6 p-6">
      <LogoLockupMark className="h-10" />
      <span className="mono-label text-muted-foreground">.dark · --mark-* Dark-Palette</span>
    </div>
  ),
};
