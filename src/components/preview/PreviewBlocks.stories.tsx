import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PreviewBlockRenderer } from './PreviewBlocks';
import { mockCopy } from '@/stories/mockTranslations';
import {
  bentoGridFull,
  callToActionPrimary,
  heroHome,
  richTextBlockStructured,
  skillsetDefault,
  statusBlockDefault,
} from '@/stories/fixtures/blocksA';
import {
  previewCopy,
  previewProjectListing,
  projectShowcaseBlock,
} from '@/stories/fixtures/features';

/**
 * Client-Variante des Block-Dispatchers für die Live-Preview.
 *
 * Warum ein eigener Dispatcher: `components/blocks.tsx` bleibt eine
 * Server-Component-Struktur (die öffentlichen Seiten zahlen sonst die
 * Client-Grenze). Dieser Switch ist ein TYP-SPIEGEL — ein neuer Blocktyp muss in
 * beiden Dispatchern ergänzt werden.
 *
 * `copy` ist vollständig (`PreviewCopy`) und kommt in der App aus demselben
 * gecachten Translations-Global wie die veröffentlichte Seite; hier liefert
 * `mockCopy` + Registry-Seeds dieselben Labels. `locale` entscheidet nur
 * Varianten (Hero `home`/`compact`, Bento-Pillar-Sprache).
 */
const meta = {
  title: 'Features/PreviewBlocks',
  component: PreviewBlockRenderer,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de/preview' } },
    docs: {
      description: {
        component:
          'Rendert genau einen Block aus dem Preview-Dokument. Die Block-Komponenten sind reine Prop-Renderer — deshalb kann dieselbe Darstellung ohne Server-Render live aus den Admin-Formularwerten gemerged werden.',
      },
    },
  },
} satisfies Meta<typeof PreviewBlockRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Hero in der Home-Variante (volle H1, Stack-Zeile, Metriken). */
export const HeroHome: Story = {
  name: 'Hero (home)',
  args: { block: heroHome, locale: 'home', copy: previewCopy },
};

/** Derselbe Hero als Seitenkopf (`compact`): kleinere H1, Breadcrumb-Eyebrow. */
export const HeroCompact: Story = {
  name: 'Hero (compact)',
  args: { block: heroHome, locale: 'compact', copy: previewCopy },
};

/** Status-Leiste mit Gauge-Ring und Themenliste. */
export const Status: Story = {
  args: { block: statusBlockDefault, locale: 'de', copy: previewCopy },
};

/** Bento-Raster — `locale` steuert „Säule"/„Pillar". */
export const BentoGrid: Story = {
  name: 'Bento-Grid',
  args: { block: bentoGridFull, locale: 'de', copy: previewCopy },
};

/** Dieselben Karten auf `en`: der Zähler heißt „Pillar" statt „Säule". */
export const BentoGridEn: Story = {
  name: 'Bento-Grid (en)',
  args: { block: bentoGridFull, locale: 'en', copy: previewCopy },
};

/** Skillset-Karten mit Highlight-Karte. */
export const Skillset: Story = {
  args: { block: skillsetDefault, locale: 'de', copy: previewCopy },
};

/** Call-to-Action mit Button-Pille. */
export const CallToAction: Story = {
  name: 'Call-to-Action',
  args: { block: callToActionPrimary, locale: 'de', copy: previewCopy },
};

/** Lexical-Rich-Text über den echten Payload-Renderer. */
export const RichText: Story = {
  name: 'Rich-Text',
  args: { block: richTextBlockStructured, locale: 'de', copy: previewCopy },
};

/** Listing-Block — nur mit `projectListing`-Daten, sonst rendert er nichts. */
export const ProjectShowcase: Story = {
  name: 'Projekt-Listing',
  args: {
    block: projectShowcaseBlock,
    locale: 'de',
    copy: previewCopy,
    projectListing: previewProjectListing,
  },
};

/**
 * Ohne Listing-Daten rendert der Block bewusst NICHTS: die Preview zeigt nie
 * eine erfundene Seite, und `?page=`/`?tag=` sind URL-State der veröffentlichten
 * Route, nicht des Admin-iframes.
 */
export const ProjectShowcaseWithoutData: Story = {
  name: 'Projekt-Listing ohne Daten',
  args: { block: projectShowcaseBlock, locale: 'de', copy: previewCopy },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="min-h-11 rounded-[6px] border border-dashed border-border px-4 py-3">
        <span className="mono-label text-muted-foreground">
          ohne projectListing → Rückgabe ist null
        </span>
      </div>
      <PreviewBlockRenderer {...args} />
    </div>
  ),
};

/** Copy-Referenz: dieselben Gruppen, die die öffentliche Seite benutzt. */
export const CopyBundles: StoryObj = {
  name: 'Copy-Bundles',
  render: () => (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.entries(previewCopy).map(([key, value]) => (
        <div key={key} className="rounded-[6px] border border-border bg-surface p-4">
          <p className="mono-label mb-2 text-primary">{key}</p>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  ),
};

/** Referenz der Copy-Gruppen, die `mockCopy` nicht als Bundle führt. */
export const RegistryCopy: StoryObj = {
  name: 'Registry-Copy',
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="mono-label text-muted-foreground">
        status.gaugeLabel = {previewCopy.status.gaugeLabel}
      </p>
      <p className="mono-label text-muted-foreground">
        imageText.eyebrow = {previewCopy.imageText.eyebrow}
      </p>
      <p className="mono-label text-muted-foreground">
        imageText.imagePlaceholder = {previewCopy.imageText.imagePlaceholder}
      </p>
      <p className="mono-label text-muted-foreground">
        projectDetail.eyebrow = {mockCopy.projectDetail.eyebrow}
      </p>
    </div>
  ),
};
