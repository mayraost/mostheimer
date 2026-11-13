import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CaseStudyBlock } from './CaseStudyBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  caseStudyFull,
  caseStudyLong,
  caseStudyMinimal,
  caseStudyUnsafeLink,
  caseStudyWithLink,
} from '@/stories/fixtures/blocksB';

/**
 * Case Study als Split-Karte: Mono-Metaspalte (Zeitraum/Rolle/Tags) links,
 * drei narrative Spalten rechts.
 *
 * Die Labels kommen aus `blocks.caseStudy` (Copy), der Inhalt aus dem Block —
 * beide Wege sind hier getrennt sichtbar: `copy` ist ein Control, `block` eine
 * Fixture. Die Spalte „Wirkung" ist die einzige mit Primary-Akzent; sie wird
 * nur gerendert, wenn `contribution` Text enthält.
 */
const meta = {
  title: 'Blocks/Case Study',
  component: CaseStudyBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Zweispaltige Case-Study-Karte: links eine `<dl>`-Metaspalte (Zeitraum, Rolle, Tag-Chips, optionaler Link), rechts Kontext/Lösung nebeneinander und darunter die hervorgehobene Wirkung. Heading ist `h2` (folgt direkt auf die Seiten-`h1`), `<dt>`/`<dd>` sind direkte `<dl>`-Kinder.',
      },
    },
  },
  args: { block: caseStudyFull, copy: mockCopy.caseStudy },
  argTypes: {
    block: { control: false },
    copy: { control: false },
  },
} satisfies Meta<typeof CaseStudyBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vollständiger Datensatz: Zeitraum, Rolle, drei Tags, Link mit eigenem Label. */
export const Default: Story = {};

/** Nur `client` (Pflichtfeld): Metaspalte schrumpft auf den Clientnamen. */
export const Minimal: Story = {
  args: { block: caseStudyMinimal },
};

/** Lange Absätze in allen drei Spalten — prüft Umbruch und Spaltenhöhe. */
export const LongText: Story = {
  args: { block: caseStudyLong },
};

/** `linkLabel` gesetzt: der Linktext kommt aus dem Block, nicht aus dem Fallback. */
export const WithLink: Story = {
  args: { block: caseStudyWithLink },
};

/**
 * `javascript:`-Link: `safeHrefOrNull` verwirft das Schema, der Link wird gar
 * nicht gerendert (kein `href`, kein Fallback-Text).
 */
export const UnsafeLinkRejected: Story = {
  args: { block: caseStudyUnsafeLink },
  parameters: {
    docs: {
      description: {
        story:
          'Der Block rendert den Link nur bei einem erlaubten Schema. Altbestand kann dadurch nie zu einem klickbaren Skript werden.',
      },
    },
  },
};
