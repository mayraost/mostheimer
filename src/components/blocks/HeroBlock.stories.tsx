import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeroBlock } from './HeroBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  heroHome,
  heroLongHeading,
  heroWithBackgroundImage,
  heroWithoutCta,
} from '@/stories/fixtures/blocksA';

/**
 * Der Hero ist ein reiner Renderer: `block` kommt aus dem CMS, `copy` aus dem
 * `translations`-Global, `variant` entscheidet zwischen Startseite und
 * Unterseiten-Kopf. Keine Server-Reads, kein `await`.
 *
 * Die beiden Varianten sind bewusst zwei Layouts, nicht zwei Größen:
 * `home` trägt die volle Metrik-Leiste über die Seitenbreite und die
 * Stack-Zeile, `compact` schiebt dieselben Zahlen inline unter die CTA-Zeile
 * und blendet das Portrait erst ab `lg` ein.
 */
const meta = {
  title: 'Blocks/Hero',
  component: HeroBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Hero mit Typing-Heading, Rollen-Chips, CTA-Paar, Portrait-Slot und Metrik-Streifen. `home` = Startseite (volle Leiste), `compact` = Unterseiten-Kopf mit Breadcrumb-Eyebrow und Inline-Metriken.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['home', 'compact'] },
    eyebrow: { control: 'text' },
  },
} satisfies Meta<typeof HeroBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Startseiten-Variante mit beiden CTAs und Stack-Zeile. */
export const Home: Story = {
  args: {
    block: heroHome,
    copy: mockCopy.hero,
    variant: 'home',
  },
};

/** Unterseiten-Kopf: Breadcrumb-Eyebrow, kleinere H1, Metriken inline. */
export const Compact: Story = {
  args: {
    block: heroHome,
    copy: mockCopy.hero,
    variant: 'compact',
    eyebrow: 'Start // Kontakt',
  },
};

/** `compact` ohne Eyebrow — die Statuspunkt-Zeile entfällt dann vollständig. */
export const CompactWithoutEyebrow: Story = {
  name: 'Compact — ohne Eyebrow',
  args: {
    block: heroHome,
    copy: mockCopy.hero,
    variant: 'compact',
  },
};

/** Ohne `ctaLabel`/`ctaLink` rendert die Pille nicht — keine leere Fläche. */
export const WithoutCta: Story = {
  name: 'Ohne CTA',
  args: {
    block: heroWithoutCta,
    copy: mockCopy.hero,
    variant: 'home',
  },
};

/** Sehr lange H1: bricht um, statt abgeschnitten zu werden. */
export const LongHeading: Story = {
  name: 'Lange Überschrift',
  args: {
    block: heroLongHeading,
    copy: mockCopy.hero,
    variant: 'home',
  },
};

/** Hintergrundbild (15 % Deckkraft) liegt unter Raster und Radialverlauf. */
export const WithBackgroundImage: Story = {
  name: 'Mit Hintergrundbild',
  args: {
    block: heroWithBackgroundImage,
    copy: mockCopy.hero,
    variant: 'home',
  },
};

/** `showStackBadge: false` blendet die Stack-Zeile ab (Chips bleiben). */
export const WithoutStackBadge: Story = {
  name: 'Ohne Stack-Badge',
  args: {
    block: { ...heroHome, showStackBadge: false },
    copy: mockCopy.hero,
    variant: 'home',
  },
};

/** Beide Varianten direkt untereinander — der Höhenunterschied ist der Punkt. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: heroHome,
    copy: mockCopy.hero,
  },
  render: ({ block, copy }) => (
    <div className="flex flex-col gap-16">
      <div>
        <p className="mono-label mb-3 text-muted-foreground">variant = home</p>
        <HeroBlock block={block} copy={copy} variant="home" />
      </div>
      <div>
        <p className="mono-label mb-3 text-muted-foreground">variant = compact</p>
        <HeroBlock block={block} copy={copy} variant="compact" eyebrow="Start // Kontakt" />
      </div>
    </div>
  ),
};
