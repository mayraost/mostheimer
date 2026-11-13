import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ImageTextBlock } from './ImageTextBlock';
import { mockTranslations } from '@/stories/mockTranslations';
import { getTranslation } from '@/lib/translations';
import {
  imageTextLeft,
  imageTextRight,
  imageTextWithoutImage,
  imageTextWithoutText,
} from '@/stories/fixtures/blocksA';

/**
 * Bild-Text-Paar (2 Spalten ab `md`), Rich-Text über den echten
 * Lexical-Renderer — nie `dangerouslySetInnerHTML`.
 *
 * `mockCopy` führt keine `imageText`-Gruppe; Eyebrow und Platzhalter-Marker
 * kommen über den typisierten Reader aus der `COPY_KEYS`-Registry (identisch
 * zum CMS-Seed), damit in der Story kein String hartkodiert ist.
 */
const imageTextCopy = {
  eyebrow: getTranslation(mockTranslations, 'blocks.imageText.eyebrow'),
  imagePlaceholder: getTranslation(mockTranslations, 'blocks.imageText.imagePlaceholder'),
};

const meta = {
  title: 'Blocks/ImageText',
  component: ImageTextBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Bildfläche mit Platzhalter-Fallback plus Rich-Text-Panel. `imagePosition` tauscht die Reihenfolge per `order`, nicht per DOM-Umsortierung — die Lesereihenfolge bleibt im Markup stabil.',
      },
    },
  },
} satisfies Meta<typeof ImageTextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Bild rechts, Text links. */
export const ImageRight: Story = {
  name: 'Bild rechts',
  args: {
    block: imageTextRight,
    copy: imageTextCopy,
  },
};

/** Bild links, Text rechts — mit Überschrift und Liste im Rich-Text. */
export const ImageLeft: Story = {
  name: 'Bild links',
  args: {
    block: imageTextLeft,
    copy: imageTextCopy,
  },
};

/**
 * Relation nicht aufgelöst (depth 0): `image` ist eine ID, kein Media-Objekt —
 * der Block fällt auf den Platzhalter zurück, statt zu crashen.
 */
export const WithoutImage: Story = {
  name: 'Ohne aufgelöstes Bild',
  args: {
    block: imageTextWithoutImage,
    copy: imageTextCopy,
  },
};

/** Ohne Rich-Text: nur Bild und Überschrift. */
export const WithoutText: Story = {
  name: 'Ohne Text',
  args: {
    block: imageTextWithoutText,
    copy: imageTextCopy,
  },
};

/** Beide Bildpositionen und der Platzhalter-Fallback untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: imageTextRight,
    copy: imageTextCopy,
  },
  render: ({ copy }) => (
    <div className="flex flex-col gap-2">
      <ImageTextBlock block={imageTextRight} copy={copy} />
      <ImageTextBlock block={imageTextLeft} copy={copy} />
      <ImageTextBlock block={imageTextWithoutImage} copy={copy} />
    </div>
  ),
};
