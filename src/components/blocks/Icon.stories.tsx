import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ICON_CATALOG, ICON_NAMES, Icon, isKnownIcon } from './Icon';

/**
 * Icon-Renderer des CMS-Selects.
 *
 * Bewusst KEIN Lucide-Import: die Werte werden über einen kleinen, expliziten
 * Pfad-Katalog aufgelöst und als Inline-SVG gerendert (kein Client-JS, kein
 * ~1600-Icon-Bundle). Unbekannte oder leere Werte rendern **nichts** — kein
 * Fragezeichen-Fallback, damit ein leerer Icon-Ring nicht wie ein Ladefehler
 * aussieht.
 */
const meta = {
  title: 'Blocks/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Statisches Inline-SVG (`stroke: currentColor`, `strokeWidth 1.75`, `aria-hidden`). Der Name wird tolerant aufgelöst: PascalCase direkt, kebab-/lower-case über eine Normalisierung (`shield-check` → `ShieldCheck`). Der Katalog ist die eine Quelle für die CMS-Selects — was dort angeboten wird, muss hier auflösbar sein.',
      },
    },
  },
  args: { name: 'Globe', className: 'h-6 w-6 text-primary' },
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    className: { control: 'text' },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Ein Icon mit Größe/Farbe über `className` (die Pfade erben `currentColor`). */
export const Default: Story = {};

/** Alle Katalog-Einträge als Raster — die vollständige Liste des CMS-Selects. */
export const AllIcons: Story = {
  render: () => (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {ICON_NAMES.map((iconName) => (
        <li
          key={iconName}
          className="flex items-center gap-3 rounded-[6px] border border-border bg-surface p-3"
        >
          <Icon name={iconName} className="h-6 w-6 shrink-0 text-primary" />
          <span className="mono-label min-w-0 break-words text-muted-foreground">{iconName}</span>
        </li>
      ))}
    </ul>
  ),
  parameters: {
    docs: {
      description: {
        story: `${ICON_NAMES.length} Einträge in \`ICON_CATALOG\`. Ein neuer Eintrag hier erscheint automatisch in beiden CMS-Selects (Bento + Skillset).`,
      },
    },
  },
};

/** Unbekannter Name: `isKnownIcon` ist false, das SVG wird nicht gerendert. */
export const UnknownIcon: Story = {
  args: { name: 'DoesNotExist' },
  render: ({ name, className }) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-dashed border-border-strong">
        <Icon name={name} className={className} />
      </span>
      <span className="mono-label text-muted-foreground">
        {String(name)} · isKnownIcon = {String(isKnownIcon(name))} · rendert nichts
      </span>
    </div>
  ),
};

/** `null` (leeres CMS-Feld): ebenfalls kein SVG — der Aufrufer lässt den Rahmen weg. */
export const NoIcon: Story = {
  args: { name: null },
  render: ({ className }) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-dashed border-border-strong">
        <Icon name={null} className={className} />
      </span>
      <span className="mono-label text-muted-foreground">name = null · rendert nichts</span>
    </div>
  ),
};

/** Tolerante Auflösung: kebab-case und lower-case treffen denselben Katalog-Eintrag. */
export const NameNormalisation: Story = {
  render: () => (
    <ul className="flex flex-col gap-2">
      {['ShieldCheck', 'shield-check', 'shieldCheck', 'heart', 'git-branch'].map((rawName) => (
        <li
          key={rawName}
          className="flex items-center gap-3 rounded-[6px] border border-border bg-surface p-3"
        >
          <Icon name={rawName} className="h-5 w-5 shrink-0 text-secondary" />
          <span className="font-mono text-sm text-foreground">{rawName}</span>
          <span className="mono-label ml-auto text-muted-foreground">
            isKnownIcon = {String(isKnownIcon(rawName))}
          </span>
        </li>
      ))}
    </ul>
  ),
};

/** Katalog-Übersicht als Tabelle: Name → Pfad-Präfix (zum Abgleichen mit Lucide). */
export const CatalogPaths: Story = {
  render: () => (
    <dl className="grid gap-1">
      {Object.entries(ICON_CATALOG).map(([iconName, path]) => (
        <div
          key={iconName}
          className="grid grid-cols-[160px_minmax(0,1fr)] items-baseline gap-3 border-b border-border py-1.5 last:border-b-0"
        >
          <dt className="mono-label text-foreground">{iconName}</dt>
          <dd className="truncate font-mono text-xs text-muted-foreground">{path}</dd>
        </div>
      ))}
    </dl>
  ),
};
