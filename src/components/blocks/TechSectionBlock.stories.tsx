import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TechSectionBlock } from './TechSectionBlock';
import {
  techSectionDefault,
  techSectionLong,
  techSectionMinimal,
  techSectionPlainFacts,
} from '@/stories/fixtures/blocksB';

/**
 * Text-Sektion mit optionaler Kennzahlen-Zeile.
 *
 * Der Block hat keine Copy-Props: Eyebrow (`sectionLabel`), Heading und Body
 * kommen ausschließlich aus dem CMS. Absätze werden am Leerzeilen-Trennzeichen
 * gesplittet; `keyFacts`-Werte mit mehreren Zielen (`… · …`) werden aufgeteilt
 * und bekommen je einen eigenen Aktions-Button.
 */
const meta = {
  title: 'Blocks/Tech Section',
  component: TechSectionBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Karte mit Eyebrow (nur wenn gesetzt), `h2`, Fließtext und einer `<dl>`-Faktenzeile. Die Eyebrow ist die einzige Meta-Zeile — fehlt `sectionLabel`, rendert der Kopf bewusst nichts (kein Blockname als Platzhalter). Fakten mit E-Mail/Telefon/Profil-Host bekommen eine Aktion (`CopyButton`, `tel:` bzw. externer Link), reine Werte bleiben Text.',
      },
    },
  },
  args: { block: techSectionDefault },
  argTypes: { block: { control: false } },
} satisfies Meta<typeof TechSectionBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Zwei Absätze plus vier Fakten mit gemischten Aktionen (Mail, Telefon, Profile, Text). */
export const Default: Story = {};

/** Nur Heading + Body: keine Eyebrow, keine Faktenzeile. */
export const Minimal: Story = {
  args: { block: techSectionMinimal },
};

/** Vier lange Absätze — die Karte wächst mit dem Text, die Spalte bleibt lesbar. */
export const LongText: Story = {
  args: { block: techSectionLong },
};

/** Sechs reine Kennzahlen ohne Aktion (kein Mail-/Telefon-/Profilwert). */
export const PlainFacts: Story = {
  args: { block: techSectionPlainFacts },
  parameters: {
    docs: {
      description: {
        story:
          '`keyFacts` ist auf sechs Zeilen begrenzt. Ohne erkennbaren Zieltyp rendert `KeyFactActionButton` nichts — die Werte bleiben reiner Text.',
      },
    },
  },
};
