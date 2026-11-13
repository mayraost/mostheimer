import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArchitectureDiagramBlock } from './ArchitectureDiagramBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  architectureDefault,
  architectureEmpty,
  architectureMinimal,
  architectureSingleLayer,
  architectureWithoutPrinciples,
} from '@/stories/fixtures/blocksB';

/**
 * Interaktives Architektur-Schaubild (Edge → App/BFF → Core/CMS → Data/State).
 *
 * Links die Layer-Stationen als echte `tablist` (Pfeiltasten, Home/End,
 * Enter/Space), rechts das `tabpanel` des aktiven Layers. Der Verbindungsstrang
 * zwischen den Stationen füllt sich beim Scrollen über eine CSS-Variable; die
 * Stories stehen im Ruhezustand (erster Layer aktiv).
 */
const meta = {
  title: 'Blocks/Architecture Diagram',
  component: ArchitectureDiagramBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Zwei Spalten: vertikale Layer-Tabs mit Nummer, Titel, Subtitle und Metrik; daneben das Detail-Panel mit Summary, Prinzipien-Liste und Stack-Zeile. A11y: `role="tablist"` mit `aria-orientation="vertical"`, Roving-Tabindex, `aria-selected`/`aria-controls`, Panel mit `tabIndex={0}`. Bei `layers: []` rendert die Komponente `null`.',
      },
    },
  },
  args: { block: architectureDefault, copy: mockCopy.architecture },
  argTypes: {
    block: { control: false },
    copy: { control: false },
  },
} satisfies Meta<typeof ArchitectureDiagramBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vier Layer mit Prinzipien, Stack-Zeile und Metriken. */
export const Default: Story = {};

/** Ein Layer: der Zähler zeigt den Singular („Layer 01 / 01"). */
export const SingleLayer: Story = {
  args: { block: architectureSingleLayer },
};

/** Ohne Beschreibung, Subtitle, Metriken und Stack — nur Titel und Kurzfassung. */
export const Minimal: Story = {
  args: { block: architectureMinimal },
};

/** Layer ohne `principles`: das Panel besteht nur aus Summary und Stack. */
export const WithoutPrinciples: Story = {
  args: { block: architectureWithoutPrinciples },
};

/** `layers: []` → die Komponente rendert nichts (kein leerer Rahmen, keine Überschrift). */
export const Empty: Story = {
  args: { block: architectureEmpty },
  parameters: {
    docs: {
      description: {
        story:
          'Leerer Canvas ist hier das erwartete Ergebnis: der Block bricht vor dem ersten Markup ab, statt eine Überschrift ohne Inhalt zu zeigen.',
      },
    },
  },
};
