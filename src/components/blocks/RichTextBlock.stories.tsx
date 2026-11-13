import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RichTextBlock } from './RichTextBlock';
import {
  richTextBlockBasic,
  richTextBlockEmpty,
  richTextBlockStructured,
} from '@/stories/fixtures/blocksA';

/**
 * Reiner Lexical-Renderer (`@payloadcms/richtext-lexical/react`) in einem
 * 3xl-Panel. Die Knoten sind minimal, aber gültig: `paragraph`, `heading` (h2),
 * `list`/`listitem` und Textknoten mit `format`/`detail`/`mode`/`style`.
 *
 * Die Darstellung kommt aus `.prose-industrial` — der Block selbst stylt nicht.
 */
const meta = {
  title: 'Blocks/RichText',
  component: RichTextBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Rich-Text-Panel (max-w-3xl) mit `prose-industrial`. Rendert ausschließlich über den Lexical-Renderer — gespeichertes HTML wird nie ausgeführt.',
      },
    },
  },
} satisfies Meta<typeof RichTextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Zwei Absätze, ein fetter Span. */
export const Default: Story = {
  args: {
    block: richTextBlockBasic,
  },
};

/** Heading, Absatz, Aufzählung, Absatz — die volle Knotenmischung. */
export const Structured: Story = {
  args: {
    block: richTextBlockStructured,
  },
};

/** Leeres Root (`children: []`): das Panel bleibt, es gibt nur keinen Text. */
export const Empty: Story = {
  name: 'Leer',
  args: {
    block: richTextBlockEmpty,
  },
};

/** Alle Zustände untereinander. */
export const AllVariants: Story = {
  name: 'Alle Varianten',
  args: {
    block: richTextBlockBasic,
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <RichTextBlock block={richTextBlockBasic} />
      <RichTextBlock block={richTextBlockStructured} />
      <RichTextBlock block={richTextBlockEmpty} />
    </div>
  ),
};
