import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TestimonialBlock } from './TestimonialBlock';
import {
  testimonialDefault,
  testimonialEmpty,
  testimonialLongQuote,
  testimonialSingle,
  testimonialWithoutHeading,
} from '@/stories/fixtures/blocksB';

/**
 * Zitat-Karten mit großem Anführungszeichen, Emerald-Kante links und Mono-
 * Attribution.
 *
 * Der Block hat KEINE Copy-Props: alles Sichtbare steht im Block (`quote`,
 * `author`, `role`, optionales `heading`). Die Initialen im Kreis werden aus dem
 * Autorennamen abgeleitet, nicht gepflegt.
 */
const meta = {
  title: 'Blocks/Testimonial',
  component: TestimonialBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Zitat-Raster (1 Spalte mobil, 2 ab `md`). Jede Karte ist ein `<figure>` mit `<blockquote>` und `<figcaption>`; die Initialen im Kreis sind aus dem Namen abgeleitet und `aria-hidden`. Bewusst eine andere Kantensprache als die Case Study (Balken + große Type statt Metaspalte).',
      },
    },
  },
  args: { block: testimonialDefault },
  argTypes: { block: { control: false } },
} satisfies Meta<typeof TestimonialBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vier Zitate, eines davon ohne Rolle (nur Name in der Attribution). */
export const Default: Story = {};

/** Eine Karte: das Raster bleibt einspaltig. */
export const Single: Story = {
  args: { block: testimonialSingle },
};

/** Ohne `heading` beginnt der Block direkt mit dem Raster. */
export const WithoutHeading: Story = {
  args: { block: testimonialWithoutHeading },
};

/** Sehr langes Zitat: prüft Zeilenlänge und die Position des Anführungszeichens. */
export const LongQuote: Story = {
  args: { block: testimonialLongQuote },
};

/** Leeres `items`-Array: nur die Überschrift bleibt stehen. */
export const Empty: Story = {
  args: { block: testimonialEmpty },
  parameters: {
    docs: {
      description: {
        story:
          'Ein Block ohne Einträge rendert kein Raster. Der CMS-Zustand ist zulässig (`minRows` greift erst beim Speichern im Admin).',
      },
    },
  },
};
