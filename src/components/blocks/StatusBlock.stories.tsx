import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusBlock } from './StatusBlock';
import { mockTranslations } from '@/stories/mockTranslations';
import { getTranslation } from '@/lib/translations';
import {
  statusBlockDefault,
  statusBlockLong,
  statusBlockMinimal,
} from '@/stories/fixtures/blocksA';

/**
 * Flache Status-Leiste (bewusst KEIN Karten-Panel wie die übrigen Blöcke):
 * Gauge-Ring links, Beschreibung und Themenliste rechts.
 *
 * `mockCopy` führt keine `status`-Gruppe — der Gauge-Label kommt deshalb über
 * den typisierten Reader aus der `COPY_KEYS`-Registry (derselbe Seed, den die
 * CMS-Migration schreibt). Kein hartkodierter String in der Story.
 */
const gaugeCopy = { gaugeLabel: getTranslation(mockTranslations, 'blocks.status.gaugeLabel') };

const meta = {
  title: 'Blocks/StatusBlock',
  component: StatusBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Status-Streifen mit Emerald-Punkten, Gauge-Ring und Themenliste. Der Gauge-Wert ist aus dem Titel abgeleitet (stabil, kein Zufall) — die Zahl ist Dekoration, keine Metrik.',
      },
    },
  },
} satisfies Meta<typeof StatusBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Badge, Titel, Beschreibung und vier Themen. */
export const Default: Story = {
  args: {
    block: statusBlockDefault,
    copy: gaugeCopy,
  },
};

/** Ohne `badgeLabel`: die Zeile mit Puls-Punkt entfällt. */
export const WithoutBadge: Story = {
  name: 'Ohne Badge',
  args: {
    block: { ...statusBlockDefault, badgeLabel: null },
    copy: gaugeCopy,
  },
};

/** Ohne Themen: die Leiste bleibt einzeilig. */
export const WithoutTopics: Story = {
  name: 'Ohne Themen',
  args: {
    block: { ...statusBlockDefault, networkTopics: [] },
    copy: gaugeCopy,
  },
};

/** Leerzustand: kein Badge, keine Themen. */
export const Empty: Story = {
  name: 'Leer',
  args: {
    block: statusBlockMinimal,
    copy: gaugeCopy,
  },
};

/** Lange Beschreibung und sechs Themen — Umbruch im zweispaltigen Raster. */
export const LongContent: Story = {
  name: 'Lange Inhalte',
  args: {
    block: statusBlockLong,
    copy: gaugeCopy,
  },
};

/** Ohne Gauge-Label (leerer CMS-Wert): der Ring bleibt, das Label entfällt. */
export const WithoutGaugeLabel: Story = {
  name: 'Ohne Gauge-Label',
  args: {
    block: statusBlockDefault,
    copy: { gaugeLabel: '' },
  },
};

/** Alle Zustände untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: statusBlockDefault,
    copy: gaugeCopy,
  },
  render: ({ copy }) => (
    <div className="flex flex-col gap-6">
      <StatusBlock block={statusBlockDefault} copy={copy} />
      <StatusBlock block={statusBlockMinimal} copy={copy} />
      <StatusBlock block={statusBlockLong} copy={copy} />
    </div>
  ),
};
