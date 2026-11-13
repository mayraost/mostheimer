import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  BentoTile,
  CardHeader,
  Chip,
  CornerTicks,
  Eyebrow,
  GaugeRing,
  RuleAccent,
  StatusDot,
  buttonClass,
  splitParagraphs,
} from './industrial';

/**
 * Referenz-Story für das Design-Vokabular (`src/components/ui/industrial.tsx`).
 *
 * Sie ist gleichzeitig die KONVENTION für alle weiteren Stories im Repo:
 *
 * - Meta ohne `component`, wenn eine Datei mehrere Primitiven exportiert
 *   (sonst müsste man eine davon willkürlich zur „Komponente" erklären).
 * - Pro Story ein eigener `Args`-Typ + `argTypes`, damit die Controls echt
 *   typisiert sind — kein `any`.
 * - Zustände/Varianten als EIGENE Story-Exports (`StatusDotAllTones`), nicht
 *   als ein Sammel-Canvas: nur so tauchen sie in der Docs-Seite einzeln auf
 *   und der a11y-Addon prüft sie getrennt.
 * - `render` für Varianten-Gruppen, `args` für echte Controls.
 */

type Tone = 'primary' | 'secondary' | 'warning' | 'error' | 'muted';
type ChipVariant = 'fill' | 'outline' | 'cyan' | 'solid';
type HeaderTone = 'primary' | 'secondary' | 'muted';

const meta = {
  title: 'UI/Industrial',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Design-Vokabular des Dark-Industrial-Systems: 8px-Bento-Raster, Hairline-Rahmen, Emerald/Cyan-Akzente, Mono-Labels. Rein präsentational, ohne State — funktioniert in Server- und Client-Komponenten gleich.',
      },
    },
  },
} satisfies Meta;

export default meta;

/* ── BentoTile ─────────────────────────────────────────────────────────── */

export const BentoTileBasic: StoryObj<{ as: 'div' | 'article' | 'section' | 'li' | 'figure' }> = {
  name: 'BentoTile',
  args: { as: 'div' },
  argTypes: {
    as: { control: 'select', options: ['div', 'article', 'section', 'li', 'figure'] },
  },
  render: ({ as }) => (
    <BentoTile as={as} className="gap-2 p-5">
      <CardHeader label="Säule 01" meta="core" />
      <p className="text-sm text-muted-foreground">
        Karten sind die kleinste Einheit des Rasters: Rahmen, Fläche, 6px Radius.
      </p>
    </BentoTile>
  ),
};

/* ── StatusDot ─────────────────────────────────────────────────────────── */

export const StatusDotAllTones: StoryObj<{ tone: Tone }> = {
  name: 'StatusDot — alle Töne',
  args: { tone: 'primary' },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'secondary', 'warning', 'error', 'muted'] },
  },
  render: ({ tone }) => (
    <div className="flex flex-col gap-3">
      <p className="mono-label flex items-center gap-2 text-foreground">
        <StatusDot tone={tone} /> gewählter Ton ({tone})
      </p>
      <div className="flex flex-wrap gap-4">
        {(['primary', 'secondary', 'warning', 'error', 'muted'] as const).map((t) => (
          <span key={t} className="mono-label flex items-center gap-2 text-muted-foreground">
            <StatusDot tone={t} /> {t}
          </span>
        ))}
      </div>
    </div>
  ),
};

/* ── Chip ──────────────────────────────────────────────────────────────── */

export const ChipVariants: StoryObj<{ variant: ChipVariant; interactive: boolean }> = {
  name: 'Chip — Varianten',
  args: { variant: 'outline', interactive: false },
  argTypes: {
    variant: { control: 'select', options: ['fill', 'outline', 'cyan', 'solid'] },
    interactive: { control: 'boolean' },
  },
  render: ({ variant, interactive }) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip variant={variant} interactive={interactive}>
          {variant}
        </Chip>
        <Chip variant={variant}>TypeScript</Chip>
        <Chip variant={variant}>Postgres</Chip>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['fill', 'outline', 'cyan', 'solid'] as const).map((v) => (
          <Chip key={v} variant={v} interactive={interactive}>
            {v}
          </Chip>
        ))}
      </div>
    </div>
  ),
};

/* ── RuleAccent / Eyebrow ──────────────────────────────────────────────── */

export const SectionRules: StoryObj = {
  name: 'RuleAccent + Eyebrow',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Eyebrow>Engineering Leadership</Eyebrow>
        <RuleAccent />
      </div>
      <div className="flex flex-col gap-2">
        <Eyebrow>Ohne Akzentlinie</Eyebrow>
      </div>
    </div>
  ),
};

/* ── CornerTicks ───────────────────────────────────────────────────────── */

export const CornerTicksDetail: StoryObj<{ className: string }> = {
  name: 'CornerTicks',
  args: { className: 'text-primary' },
  argTypes: { className: { control: 'text' } },
  render: ({ className }) => (
    <BentoTile className="h-32 items-center justify-center p-5">
      <CornerTicks className={className} />
      <span className="mono-label text-muted-foreground">Corner-Ticks ({className})</span>
    </BentoTile>
  ),
};

/* ── GaugeRing ─────────────────────────────────────────────────────────── */

export const GaugeRingValues: StoryObj<{ value: number; label: string; size: number }> = {
  name: 'GaugeRing',
  args: { value: 42, label: 'Score', size: 88 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    label: { control: 'text' },
    size: { control: { type: 'range', min: 48, max: 160, step: 4 } },
  },
  render: ({ value, label, size }) => (
    <div className="flex flex-wrap items-center gap-6">
      <GaugeRing value={value} label={label || undefined} size={size} />
      <GaugeRing value={0} label="leer" />
      <GaugeRing value={42} label="Score" />
      <GaugeRing value={100} label="voll" />
    </div>
  ),
};

/* ── CardHeader ────────────────────────────────────────────────────────── */

export const CardHeaderStates: StoryObj<{ label: string; meta: string; tone: HeaderTone }> = {
  name: 'CardHeader — Zustände',
  args: { label: 'Anbieterkennzeichnung', meta: '§ 5 DDG', tone: 'primary' },
  argTypes: {
    label: { control: 'text' },
    meta: { control: 'text' },
    tone: { control: 'select', options: ['primary', 'secondary', 'muted'] },
  },
  render: ({ label, meta, tone }) => (
    <div className="flex flex-col gap-3">
      <BentoTile className="p-4">
        <CardHeader label={label || undefined} meta={meta || undefined} tone={tone} />
        <span className="text-sm text-muted-foreground">Label + Meta</span>
      </BentoTile>
      <BentoTile className="p-4">
        <CardHeader label="Nur Label" />
        <span className="text-sm text-muted-foreground">nur Label</span>
      </BentoTile>
      <BentoTile className="p-4">
        <CardHeader meta="nur Meta" />
        <span className="text-sm text-muted-foreground">nur Meta</span>
      </BentoTile>
      <BentoTile className="p-4">
        <CardHeader />
        <span className="text-sm text-muted-foreground">
          leer — rendert bewusst KEINE Zeile (kein Platzhaltertext)
        </span>
      </BentoTile>
    </div>
  ),
};

/* ── buttonClass ───────────────────────────────────────────────────────── */

export const ButtonClasses: StoryObj = {
  name: 'buttonClass — Varianten',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['primary', 'secondary', 'outline', 'subtle'] as const).map((variant) => (
        <button key={variant} type="button" className={buttonClass(variant)}>
          {variant}
        </button>
      ))}
    </div>
  ),
};

/* ── splitParagraphs ───────────────────────────────────────────────────── */

export const SplitParagraphsHelper: StoryObj<{ text: string }> = {
  name: 'splitParagraphs',
  args: {
    text: 'Erster Absatz aus dem CMS.\n\nZweiter Absatz — getrennt durch eine Leerzeile.\n\n\nDritter Absatz mit drei Zeilenumbrüchen davor.',
  },
  argTypes: { text: { control: 'text' } },
  render: ({ text }) => (
    <div className="flex flex-col gap-4">
      <p className="mono-label text-muted-foreground">
        {splitParagraphs(text).length} Absätze erkannt
      </p>
      {splitParagraphs(text).map((paragraph, index) => (
        <div key={paragraph} className="flex gap-3">
          <span className="mono-label shrink-0 text-primary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="text-sm text-foreground">{paragraph}</p>
        </div>
      ))}
    </div>
  ),
};
