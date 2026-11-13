import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CallToActionBlock } from './CallToActionBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  callToActionLongHeading,
  callToActionPrimary,
  callToActionSecondary,
  callToActionWithoutButton,
  callToActionWithoutText,
} from '@/stories/fixtures/blocksA';

/**
 * Abschluss-Karte mit zwei Stilen. Der Eyebrow hängt am Stil
 * (`primary` → `eyebrowPrimary`, sonst `eyebrowSecondary`), die Worte kommen
 * aus dem `translations`-Global.
 *
 * Die Button-Pille rendert nur, wenn Label UND Link gesetzt sind — ein Label
 * ohne Ziel ergibt keinen klickbaren Button und wird deshalb weggelassen.
 */
const meta = {
  title: 'Blocks/CallToAction',
  component: CallToActionBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '5xl' },
    docs: {
      description: {
        component:
          'CTA-Karte (max-w-4xl) mit Raster-Overlay, Emerald-/Cyan-Kante je nach `style`, optionalem Button und Response-Zeile. Ohne Button bleibt die Karte ein Textblock.',
      },
    },
  },
} satisfies Meta<typeof CallToActionBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Primärer Stil: Emerald-Kante, gefüllter Button. */
export const Primary: Story = {
  args: {
    block: callToActionPrimary,
    copy: mockCopy.callToAction,
  },
};

/** Sekundärer Stil: Cyan-Kante, Outline-Button. */
export const Secondary: Story = {
  args: {
    block: callToActionSecondary,
    copy: mockCopy.callToAction,
  },
};

/** Ohne Label und Link: keine Pille, keine leere Fläche. */
export const WithoutButton: Story = {
  name: 'Ohne Button',
  args: {
    block: callToActionWithoutButton,
    copy: mockCopy.callToAction,
  },
};

/** Label gesetzt, Link leer: der Button fällt weg (kein toter Link). */
export const WithoutButtonLink: Story = {
  name: 'Ohne Button-Link',
  args: {
    block: { ...callToActionPrimary, buttonLink: null },
    copy: mockCopy.callToAction,
  },
};

/** Ohne Fließtext: Überschrift und Button bleiben. */
export const WithoutText: Story = {
  name: 'Ohne Text',
  args: {
    block: callToActionWithoutText,
    copy: mockCopy.callToAction,
  },
};

/** Lange Überschrift: stapelt sich, ab `md` steht der Button rechts. */
export const LongHeading: Story = {
  name: 'Lange Überschrift',
  args: {
    block: callToActionLongHeading,
    copy: mockCopy.callToAction,
  },
};

/** Beide Stile direkt untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: callToActionPrimary,
    copy: mockCopy.callToAction,
  },
  render: ({ copy }) => (
    <div className="flex flex-col gap-2">
      <CallToActionBlock block={callToActionPrimary} copy={copy} />
      <CallToActionBlock block={callToActionSecondary} copy={copy} />
      <CallToActionBlock block={callToActionWithoutButton} copy={copy} />
    </div>
  ),
};
