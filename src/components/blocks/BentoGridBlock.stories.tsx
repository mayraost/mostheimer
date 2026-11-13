import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BentoGridBlock } from './BentoGridBlock';
import { mockCopy } from '@/stories/mockTranslations';
import { bentoGridEmpty, bentoGridFull, bentoGridSingle } from '@/stories/fixtures/blocksA';

/**
 * Bento-Raster der Architektur-Säulen.
 *
 * Zwei Verträge, die die Stories sichtbar machen:
 * 1. Hervorhebung kommt AUSSCHLIESSLICH aus `featured` (kein `index % n`, kein
 *    `highlight` — das ist eine Teaser-ZEILE, die fast jede Karte hat).
 * 2. `iconName` außerhalb des `ICON_CATALOG` (oder leer) rendert KEINEN Rahmen.
 *    Ein leerer Emerald-Ring sieht aus wie ein Ladefehler.
 */
const meta = {
  title: 'Blocks/BentoGrid',
  component: BentoGridBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          '4-Spalten-Bento (8px-Gaps). `featured`-Karten spannen zwei Spalten und tragen die Emerald-Kante; alle anderen bleiben neutral und leuchten erst im Hover. Der Anker (`#architektur` / `#architecture`) hängt an `locale`.',
      },
    },
  },
  argTypes: {
    locale: { control: 'select', options: ['de', 'en'] },
  },
} satisfies Meta<typeof BentoGridBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Deutsche Locale: Anker `#architektur`, Chip-/Säulen-Labels aus dem CMS. */
export const De: Story = {
  args: {
    block: bentoGridFull,
    copy: mockCopy.bento,
    locale: 'de',
  },
};

/** Englische Locale: Anker `#architecture` (der Hero-CTA zeigt darauf). */
export const En: Story = {
  args: {
    block: bentoGridFull,
    copy: mockCopy.bento,
    locale: 'en',
  },
};

/** Eine Säule: Zählwerk und Singular-Chip folgen der Anzahl. */
export const SingleItem: Story = {
  name: 'Eine Säule',
  args: {
    block: bentoGridSingle,
    copy: mockCopy.bento,
    locale: 'de',
  },
};

/** `items: []` — Kopfbereich bleibt, das Raster ist leer. */
export const Empty: Story = {
  name: 'Leer',
  args: {
    block: bentoGridEmpty,
    copy: mockCopy.bento,
    locale: 'de',
  },
};

/** Ohne `featured` gibt es keine Hierarchie: alle Karten neutral. */
export const WithoutFeatured: Story = {
  name: 'Ohne Featured',
  args: {
    block: {
      ...bentoGridFull,
      items: bentoGridFull.items.map((item) => ({ ...item, featured: false })),
    },
    copy: mockCopy.bento,
    locale: 'de',
  },
};

/** Beide Locales untereinander — Anker und Labels wechseln mit `locale`. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: bentoGridFull,
    copy: mockCopy.bento,
  },
  render: ({ block, copy }) => (
    <div className="flex flex-col gap-12">
      <div>
        <p className="mono-label mb-3 text-muted-foreground">locale = de (#architektur)</p>
        <BentoGridBlock block={block} copy={copy} locale="de" />
      </div>
      <div>
        <p className="mono-label mb-3 text-muted-foreground">locale = en (#architecture)</p>
        <BentoGridBlock block={block} copy={copy} locale="en" />
      </div>
    </div>
  ),
};
