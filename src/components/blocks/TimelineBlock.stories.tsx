import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimelineBlock } from './TimelineBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  timelineDefault,
  timelineEmptyPeriod,
  timelineMany,
  timelineSingle,
  timelineWithoutHeading,
} from '@/stories/fixtures/blocksB';

/**
 * Werdegang als vertikale Rail: Mono-Zeitraum in eigener Spalte, pro Station
 * eine eigene Karte.
 *
 * Die Rail selbst (Basislinie + Fortschrittsbalken) kommt aus dem Client-Island
 * `TimelineRail`; der Block liefert nur die `<li>`-Stationen. Der Zähler-Chip
 * hängt am `heading` — ohne Heading gibt es keinen Chip.
 */
const meta = {
  title: 'Blocks/Timeline',
  component: TimelineBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Vertikale Timeline mit Emerald-Rail. Jede Station ist eine eigene Karte (`BentoTile`), damit zwei benachbarte Einträge nicht als ein Absatz lesen. Der Fortschrittsbalken läuft über `transform: scaleY()` und wird beim Scrollen gesetzt — in der Story steht er auf dem Startwert.',
      },
    },
  },
  args: { block: timelineDefault, copy: mockCopy.timeline },
  argTypes: {
    block: { control: false },
    copy: { control: false },
  },
} satisfies Meta<typeof TimelineBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Fünf Stationen mit Rolle und mehrzeiligen Highlights. */
export const Default: Story = {};

/** Eine Station: Chip zeigt den Singular („1 Station"). */
export const SingleStation: Story = {
  args: { block: timelineSingle },
};

/** `maxRows` der Collection: zwölf Stationen, jede Karte mit eigenem Rahmen. */
export const ManyEntries: Story = {
  args: { block: timelineMany },
};

/** Ohne `heading` fehlt der Zähler-Chip — der Block beginnt direkt mit der Rail. */
export const WithoutHeading: Story = {
  args: { block: timelineWithoutHeading },
};

/** Leerer Zeitraum fällt auf `copy.emptyPeriod` zurück („Zeitraum folgt"). */
export const EmptyPeriod: Story = {
  args: { block: timelineEmptyPeriod },
};
