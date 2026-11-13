import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectChip, ProjectExternalLink } from './chips';

/**
 * Präsentations-Helfer, die Listing-Block und Detail-Route teilen: der
 * „öffnet in neuem Tab"-Link und der Chip für Stack/Tags.
 *
 * Beide sind reine Renderer ohne State (Server Components). Der Link gibt bei
 * fehlender URL `null` zurück — ein leerer Pill darf nie entstehen (private
 * Repos haben legitim kein `githubUrl`). Der Hinweis „öffnet in einem neuen
 * Tab" liegt `sr-only` IM Link, damit Screenreader ihn als Teil des Linknamens
 * hören.
 */

type ExternalLinkArgs = {
  href: string;
  label: string;
  newTabHint: string;
  tone: 'primary' | 'secondary';
};

type ChipArgs = {
  variant: 'outline' | 'solid';
  children: string;
};

const meta = {
  title: 'Projects/ProjectChips',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Gemeinsame Chrome der Projekte-Oberflächen: `ProjectExternalLink` (externer Link mit sr-only-Hinweis, `rel="noopener noreferrer"`, 44-px-Target) und `ProjectChip` (Stack-/Tag-Wert als `<span>`, damit er auch in einem Link liegen darf).',
      },
    },
  },
} satisfies Meta;

export default meta;

/* ── ProjectExternalLink ───────────────────────────────────────────────── */

export const ExternalLink: StoryObj<ExternalLinkArgs> = {
  name: 'ExternalLink',
  args: {
    href: 'https://dashboard.mosthi.de',
    label: 'Live ansehen',
    newTabHint: 'öffnet in neuem Tab',
    tone: 'primary',
  },
  argTypes: {
    href: { control: 'text' },
    label: { control: 'text' },
    newTabHint: { control: 'text' },
    tone: { control: 'select', options: ['primary', 'secondary'] },
  },
  render: ({ href, label, newTabHint, tone }) => (
    <ProjectExternalLink href={href} label={label} newTabHint={newTabHint} tone={tone} />
  ),
};

/** Beide Töne: Primary für „Live", Secondary für „Code"/„Komponenten-Doku". */
export const ExternalLinkTones: StoryObj<ExternalLinkArgs> = {
  name: 'ExternalLink — Töne',
  args: {
    href: 'https://mostheimer.de/storybook',
    label: 'Komponenten-Doku',
    newTabHint: 'öffnet in neuem Tab',
    tone: 'secondary',
  },
  argTypes: { tone: { control: 'select', options: ['primary', 'secondary'] } },
  render: ({ href, label, newTabHint }) => (
    <div className="flex flex-wrap items-center gap-2">
      <ProjectExternalLink href={href} label={label} newTabHint={newTabHint} tone="primary" />
      <ProjectExternalLink href={href} label={label} newTabHint={newTabHint} tone="secondary" />
    </div>
  ),
};

/** Ohne URL rendert der Link NICHTS — kein leerer Rahmen, kein toter Klick. */
export const ExternalLinkWithoutHref: StoryObj<ExternalLinkArgs> = {
  name: 'ExternalLink — ohne URL',
  args: {
    href: '',
    label: 'Code ansehen',
    newTabHint: 'öffnet in neuem Tab',
    tone: 'secondary',
  },
  argTypes: { href: { control: 'text' } },
  render: ({ href, label, newTabHint, tone }) => (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-11 items-center rounded-[6px] border border-dashed border-border px-4">
        <span className="mono-label text-muted-foreground">
          {'href="" → ProjektExternalLink gibt null zurück'}
        </span>
      </div>
      <ProjectExternalLink href={href} label={label} newTabHint={newTabHint} tone={tone} />
    </div>
  ),
};

/* ── ProjectChip ───────────────────────────────────────────────────────── */

export const Chip: StoryObj<ChipArgs> = {
  name: 'Chip',
  args: { variant: 'outline', children: 'Next.js 16' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'solid'] },
    children: { control: 'text' },
  },
  render: ({ variant, children }) => <ProjectChip variant={variant}>{children}</ProjectChip>,
};

/** Beide Varianten: Outline für Stack, Solid für Tags. */
export const ChipVariants: StoryObj<ChipArgs> = {
  name: 'Chip — Varianten',
  args: { variant: 'outline', children: 'Postgres 17' },
  render: ({ children }) => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        <ProjectChip variant="outline">{children}</ProjectChip>
        <ProjectChip variant="outline">TypeScript</ProjectChip>
        <ProjectChip variant="outline">Cloudflare</ProjectChip>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ProjectChip variant="solid">Developer Tooling</ProjectChip>
        <ProjectChip variant="solid">Observability</ProjectChip>
      </div>
    </div>
  ),
};

/** Realistische Zeile: Stack- und Tag-Chips gemischt, mit Umbruch. */
export const ChipRow: StoryObj = {
  name: 'Chip-Zeile',
  render: () => (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {['TypeScript', 'Next.js 16', 'Payload 4', 'Postgres 17'].map((tech) => (
        <ProjectChip key={tech}>{tech}</ProjectChip>
      ))}
      <ProjectChip variant="solid">Developer Tooling</ProjectChip>
    </div>
  ),
};
