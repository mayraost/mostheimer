import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimelineRail } from './TimelineRail';

/**
 * Client-Island der Timeline-Rail.
 *
 * Die Komponente besitzt nur das `<ol>` und die beiden dekorativen Overlays
 * (Basislinie + Emerald→Cyan-Beam); die Stationen kommen als `children` aus dem
 * Server-Renderer. Der Beam wächst über `transform: scaleY(var(--rail-progress))`
 * — kein `height`, also kein Layout beim Scrollen.
 *
 * Die Stories zeigen die Rail mit neutralen Stationen, damit der Rahmen ohne die
 * Timeline-Copy beurteilbar ist.
 */

function Station({ period, title }: { period: string; title: string }) {
  return (
    <li data-station data-reveal="" className="relative pb-4 pl-7 last:pb-0 md:pl-0">
      <span
        aria-hidden="true"
        className="absolute left-0 top-5 flex h-3.5 w-3.5 items-center justify-center md:left-[140px]"
      >
        <span className="h-3.5 w-3.5 rounded-full border border-primary/60 bg-background" />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      </span>
      <div className="hidden shrink-0 pt-4 pr-4 md:block md:w-[148px] md:text-right">
        <p className="mono-label leading-relaxed text-muted-foreground">{period}</p>
      </div>
      <div className="rounded-[6px] border border-border bg-surface p-4 md:ml-4">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
    </li>
  );
}

const meta = {
  title: 'Blocks/Timeline Rail',
  component: TimelineRail,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Island um die Stationsliste: `<ol>` plus Basislinie und Fortschritts-Beam. Der Hook schreibt `--rail-progress` (0 → 1) und `data-active` an die Station in der oberen Lesedrittel-Linie. Unter `prefers-reduced-motion` / `no-animations` bleibt alles im Ruhezustand — der Beam steht dann auf 0.',
      },
    },
  },
  argTypes: {
    children: { control: false },
    className: { control: 'text' },
  },
} satisfies Meta<typeof TimelineRail>;

export default meta;

/**
 * `children` ist eine Render-Prop, kein Control: die Stories typisieren nur den
 * gesteuerten `className` und bauen die Stationsliste im `render`.
 */
type Story = StoryObj<{ className?: string }>;

/** Vier Stationen im Ruhezustand. */
export const Default: Story = {
  render: ({ className }) => (
    <TimelineRail className={className}>
      <Station period="Seit 09/2024" title="valantic DXA" />
      <Station period="2021 – 2024" title="hoerzu.de" />
      <Station period="2019 – 2021" title="BORA" />
      <Station period="2017 – 2019" title="Agentur Nordlicht" />
    </TimelineRail>
  ),
};

/** Ohne Stationen bleiben nur die beiden Overlays übrig — das `<ol>` hat keine Höhe. */
export const Empty: Story = {
  render: ({ className }) => (
    <div className="flex flex-col gap-3">
      <TimelineRail className={className}>{null}</TimelineRail>
      <p className="mono-label text-muted-foreground">
        Keine Stationen: Basislinie und Beam haben keine Höhe, es bleibt eine leere Fläche.
      </p>
    </div>
  ),
};

/**
 * Zehn Stationen: der Beam deckt eine längere Strecke ab, die Rail bleibt aber
 * ein einziges Element (keine Wiederholung pro Station).
 */
export const LongList: Story = {
  render: ({ className }) => (
    <TimelineRail className={className}>
      {Array.from({ length: 10 }, (_, index) => (
        <Station
          key={index}
          period={`${2015 + index} – ${2016 + index}`}
          title={`Station ${String(index + 1).padStart(2, '0')}`}
        />
      ))}
    </TimelineRail>
  ),
};

/** `className` wird an das `<ol>` gehängt — hier mit zusätzlichem Innenabstand. */
export const WithClassName: Story = {
  args: { className: 'pl-2' },
  render: ({ className }) => (
    <TimelineRail className={className}>
      <Station period="Seit 09/2024" title="valantic DXA" />
      <Station period="2021 – 2024" title="hoerzu.de" />
    </TimelineRail>
  ),
};
