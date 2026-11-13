import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { OG_SIZE, OgCard, OgMark, ogImageUrl, sanitizeOgTitle, splitWordmark } from './ogCard';

/**
 * Bausteine der OG-Card (`next/og` ImageResponse).
 *
 * Satori-Einschränkungen, die man in den Stories sofort sieht: jeder Container
 * braucht `display: flex` und explizite Größen, es gibt keine CSS-Variablen und
 * kein automatisches Wrapping (deshalb kommt die Wordmark bereits gesplittet
 * an). Die Karte ist IMMER dunkel und malt die Mark mit der flachen Palette —
 * ein Favicon/OG-Bild kennt kein Theme.
 *
 * Die Vorschau skaliert die echte 1200×630-Fläche über `aspect-ratio` herunter;
 * im Betrieb rendert `next/og` sie in Originalgröße.
 */
const CARD_STYLE = { width: '100%', aspectRatio: `${OG_SIZE.width} / ${OG_SIZE.height}` };

const meta = {
  title: 'Layout/OgCard',
  component: OgCard,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'OG-Karte und ihre Helfer: `OgCard` (Mark + Wordmark + Tagline oben, Titel unten), `OgMark` (statisches SVG in der Dark-Palette), `ogImageUrl` (relative URL für `openGraph.images`), `sanitizeOgTitle` (Steuerzeichen + Längen-Cap) und `splitWordmark` (Zeilen für Satori).',
      },
    },
  },
  args: {
    title: 'Systeme, die tragen',
    subtitle: 'Mayra Ostheimer',
    wordmark: ['MAYRA', 'OSTHEIMER'],
    tagline: 'Web & Application Architect',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    wordmark: { control: 'object', description: 'Bereits gesplittete Zeilen (max. zwei).' },
    tagline: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={CARD_STYLE} className="overflow-hidden rounded-[6px] border border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OgCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Deutsche Karte: Titel, Untertitel, zweizeilige Wordmark, Tagline. */
export const De: Story = {
  name: 'Deutsch',
  args: {
    title: 'Systeme, die tragen: Architektur für Web und Produkt',
    subtitle: 'Mayra Ostheimer',
    wordmark: ['MAYRA', 'OSTHEIMER'],
    tagline: 'Web & Application Architect',
  },
};

/** Englische Karte: gleiche Struktur, englische Copy. */
export const En: Story = {
  name: 'Englisch',
  args: {
    title: 'Systems that carry: architecture for web and product',
    subtitle: 'Mayra Ostheimer',
    wordmark: ['MAYRA', 'OSTHEIMER'],
    tagline: 'Web & Application Architect',
  },
};

/** Sehr langer Titel (bis 200 Zeichen): Satori bricht nicht automatisch. */
export const LongTitle: Story = {
  name: 'Langer Titel',
  args: {
    title:
      'Wenn die Anforderung größer ist als die Seite: komponierbare Architektur, gemessene Performance und ein Betrieb, der auch ohne den einen Container weiterläuft',
    subtitle: 'Projekte',
    wordmark: ['MAYRA', 'OSTHEIMER'],
    tagline: 'Web & Application Architect',
  },
};

/** Ohne Untertitel: die zweite Textzeile entfällt vollständig. */
export const WithoutSubtitle: Story = {
  name: 'Ohne Untertitel',
  args: { subtitle: undefined, title: 'Kontakt' },
};

/** Ohne Tagline: die Cyan-Zeile unter der Wordmark bleibt leer. */
export const WithoutTagline: Story = {
  name: 'Ohne Tagline',
  args: { tagline: undefined, title: 'Impressum' },
};

/** Einwort-Wordmark: eine Zeile statt zwei. */
export const WordmarkSingleLine: Story = {
  name: 'Einzeilige Wordmark',
  args: { wordmark: ['MAYRA'], title: 'Mayra Ostheimer', subtitle: undefined },
};

/** Die Mark in mehreren Größen auf der Brand-Fläche. */
export const Marks: StoryObj = {
  name: 'OgMark — Größen',
  render: () => (
    <div className="flex flex-wrap items-end gap-8 rounded-[6px] bg-[#090A0D] p-8">
      {[48, 72, 96, 160, 240].map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <OgMark size={size} />
          <span className="mono-label text-[#94A3B8]">{size} px</span>
        </div>
      ))}
    </div>
  ),
};

/** Helfer-Ausgaben als Text: URL-Bau, Sanitizing, Wordmark-Split. */
export const Helpers: StoryObj<{ rawTitle: string; siteName: string }> = {
  name: 'Helfer (ogImageUrl / sanitize / split)',
  args: {
    rawTitle: 'Kontakt\nmit Steuerzeichen\u0007',
    siteName: 'Mayra Ostheimer',
  },
  argTypes: {
    rawTitle: { control: 'text' },
    siteName: { control: 'text' },
  },
  render: ({ rawTitle, siteName }) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="mono-label text-primary">ogImageUrl(title, locale, subtitle)</p>
        {(
          [
            ['de', 'Systeme, die tragen', 'Mayra Ostheimer'],
            ['en', 'Systems that carry', 'Mayra Ostheimer'],
            ['de', 'Kontakt', ''],
          ] as const
        ).map(([locale, title, subtitle]) => (
          <code
            key={`${locale}-${title}`}
            className="block break-all font-mono text-xs text-muted-foreground"
          >
            {ogImageUrl(title, locale, subtitle)}
          </code>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="mono-label text-primary">sanitizeOgTitle(raw)</p>
        <code className="block break-all font-mono text-xs text-muted-foreground">
          {JSON.stringify(rawTitle)} → {JSON.stringify(sanitizeOgTitle(rawTitle))}
        </code>
        <code className="block break-all font-mono text-xs text-muted-foreground">
          Länge: {rawTitle.length} → {sanitizeOgTitle(rawTitle).length} (Cap 200)
        </code>
      </div>

      <div className="flex flex-col gap-1">
        <p className="mono-label text-primary">splitWordmark(siteName)</p>
        {[siteName, 'Mayra', 'Mayra Ostheimer', '  '].map((input) => (
          <code key={input} className="block break-all font-mono text-xs text-muted-foreground">
            {JSON.stringify(input)} → {JSON.stringify(splitWordmark(input))}
          </code>
        ))}
      </div>

      <p className="mono-label text-muted-foreground">
        OG_SIZE = {OG_SIZE.width} × {OG_SIZE.height}
      </p>
    </div>
  ),
};
