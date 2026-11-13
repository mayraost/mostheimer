import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TechRadarBlock } from './TechRadarBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  techRadarDefault,
  techRadarEmpty,
  techRadarSingleQuadrant,
  techRadarWithoutHeading,
  type TechRadarBlockData,
} from '@/stories/fixtures/blocksB';

/**
 * Tech Radar: Quadranten-Karten mit Tier-Chips.
 *
 * Die Tier-WÖRTER kommen aus `blocks.techRadar` (Copy), die Tier-STUFEN aus dem
 * Block (`core` / `proven` / `focus`). Das Styling der Stufen ist Design und
 * liegt im Code: `core` = gefüllte Emerald-Pille, `proven` = Emerald-Outline,
 * `focus` = Cyan-Outline.
 */
const meta = {
  title: 'Blocks/Tech Radar',
  component: TechRadarBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Zwei Quadranten pro Zeile, jeder mit Kopfzeile (Quadrant-Nummer + Eintragszähler), Titel und einer Liste aus Name, Tier-Pille und optionaler Beschreibung. Die Legende oben rechts zeigt immer alle drei Tier-Wörter — auch wenn ein Tier im Datensatz nicht vorkommt.',
      },
    },
  },
  args: { block: techRadarDefault, copy: mockCopy.techRadar },
  argTypes: {
    block: { control: false },
    copy: { control: false },
  },
} satisfies Meta<typeof TechRadarBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vier Quadranten, alle drei Tiers vertreten. */
export const Default: Story = {};

/** Ein Quadrant: das Raster bleibt einspaltig, die Nummerierung startet bei 1. */
export const SingleQuadrant: Story = {
  args: { block: techRadarSingleQuadrant },
};

/** Ohne `heading` bleibt nur die Tier-Legende in der Kopfzeile. */
export const WithoutHeading: Story = {
  args: { block: techRadarWithoutHeading },
};

/** Keine Quadranten: Kopfzeile und Legende stehen, das Raster ist leer. */
export const Empty: Story = {
  args: { block: techRadarEmpty },
};

/**
 * Filtert die Einträge auf ein Tier — zeigt die drei Pillen-Varianten isoliert.
 * Quadranten ohne Treffer fallen weg, damit keine leeren Karten entstehen.
 */
export const SingleTier: StoryObj<{ tier: 'core' | 'proven' | 'focus' }> = {
  name: 'Tier (gefiltert)',
  args: { tier: 'core' },
  argTypes: {
    tier: { control: 'select', options: ['core', 'proven', 'focus'] },
  },
  render: ({ tier }) => {
    const quadrants = (techRadarDefault.quadrants ?? [])
      .map((quadrant) => ({
        ...quadrant,
        items: (quadrant.items ?? []).filter((item) => item.tier === tier),
      }))
      .filter((quadrant) => (quadrant.items ?? []).length > 0);
    const block: TechRadarBlockData = {
      blockType: 'techRadar',
      heading: techRadarDefault.heading,
      quadrants,
    };
    return <TechRadarBlock block={block} copy={mockCopy.techRadar} />;
  },
};
