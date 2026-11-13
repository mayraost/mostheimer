import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SkillsetBlock } from './SkillsetBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  skillsetDefault,
  skillsetEmpty,
  skillsetWithoutCta,
  skillsetWithoutIcons,
} from '@/stories/fixtures/blocksA';

/**
 * Skill-Karten mit Freitext-Badge statt Skill-Balken: „Experte" ist eine
 * Aussage, 87 % ist eine Erfindung.
 *
 * `highlight` ist der einzige Styling-Trigger (Emerald-Kante + gefülltes Badge).
 * `iconName` leer → kein Rahmen; ein leerer Kreis liest sich als Ladefehler.
 */
const meta = {
  title: 'Blocks/Skillset',
  component: SkillsetBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Karten-Raster (max. 3 Spalten) mit `CardHeader` (Eyebrow + Anzahl), Icon-Fassung, Freitext-Level und optionalem Block-CTA. Der CTA rendert nur mit Label UND Link.',
      },
    },
  },
} satisfies Meta<typeof SkillsetBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Sechs Skills, einer hervorgehoben, mit Block-CTA. */
export const Default: Story = {
  args: {
    block: skillsetDefault,
    copy: mockCopy.skillset,
  },
};

/** Kein `highlight`: alle Karten neutral. */
export const WithoutHighlight: Story = {
  name: 'Ohne Highlight',
  args: {
    block: {
      ...skillsetDefault,
      items: skillsetDefault.items.map((item) => ({ ...item, highlight: false })),
    },
    copy: mockCopy.skillset,
  },
};

/** Leerer `iconName`: die Icon-Fassung entfällt vollständig. */
export const WithoutIcons: Story = {
  name: 'Ohne Icons',
  args: {
    block: skillsetWithoutIcons,
    copy: mockCopy.skillset,
  },
};

/** Label ohne Link: der Block-CTA wird nicht gerendert. */
export const WithoutCta: Story = {
  name: 'Ohne CTA',
  args: {
    block: skillsetWithoutCta,
    copy: mockCopy.skillset,
  },
};

/** `items: []` — Kopfbereich bleibt, das Raster ist leer. */
export const Empty: Story = {
  name: 'Leer',
  args: {
    block: skillsetEmpty,
    copy: mockCopy.skillset,
  },
};

/** Alle Zustände untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: skillsetDefault,
    copy: mockCopy.skillset,
  },
  render: ({ copy }) => (
    <div className="flex flex-col gap-2">
      <SkillsetBlock block={skillsetDefault} copy={copy} />
      <SkillsetBlock block={skillsetWithoutIcons} copy={copy} />
      <SkillsetBlock block={skillsetWithoutCta} copy={copy} />
      <SkillsetBlock block={skillsetEmpty} copy={copy} />
    </div>
  ),
};
