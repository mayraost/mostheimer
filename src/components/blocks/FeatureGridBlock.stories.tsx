import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeatureGridBlock } from './FeatureGridBlock';
import {
  featureGridDefault,
  featureGridEmpty,
  featureGridWithoutHeading,
} from '@/stories/fixtures/blocksA';

/**
 * Feature-Raster: 1/2/3 Spalten, Karten mit Nummer, Icon, Titel und Text.
 *
 * Der Block hat KEINE Copy-Prop — Nummer (`01`), Meta-Zeile (`feature`) und
 * Tonwechsel sind strukturell im Renderer verankert.
 */
const meta = {
  title: 'Blocks/FeatureGrid',
  component: FeatureGridBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Karten-Raster (max. 3 Spalten) mit `CornerTicks`, runder Icon-Fassung und alternierendem Header-Ton. Ohne Icon-Name bleibt die Fassung leer — der Katalog ist bewusst klein.',
      },
    },
  },
} satisfies Meta<typeof FeatureGridBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Drei Features mit Abschnittsüberschrift. */
export const Default: Story = {
  args: {
    block: featureGridDefault,
  },
};

/** Ohne `heading` entfällt der Kopfbereich samt Trennlinie. */
export const WithoutHeading: Story = {
  name: 'Ohne Überschrift',
  args: {
    block: featureGridWithoutHeading,
  },
};

/** `features: []` — Kopfbereich bleibt, das Raster ist leer. */
export const Empty: Story = {
  name: 'Leer',
  args: {
    block: featureGridEmpty,
  },
};

/** Ein einzelnes Feature: die Karte füllt nur eine Spalte. */
export const SingleFeature: Story = {
  name: 'Ein Feature',
  args: {
    block: {
      ...featureGridDefault,
      features: featureGridDefault.features.slice(0, 1),
    },
  },
};

/** Alle Zustände untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: featureGridDefault,
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <FeatureGridBlock block={featureGridDefault} />
      <FeatureGridBlock block={featureGridWithoutHeading} />
      <FeatureGridBlock block={featureGridEmpty} />
    </div>
  ),
};
