'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useId } from 'react';

import { MARK_CSS_VARS, MarkDefs, MarkPaths } from './MarkArtwork';
import { MARK } from './markGeometry';

/**
 * Bausteine des MO-Monogramms: `MarkDefs` (vier Gradients), `MarkPaths`
 * (Reticle, M, `</>`-Akzent, O, M↔O-Brücke) und `MARK_CSS_VARS` (beide
 * Paletten als Literale).
 *
 * Die Bausteine sind reine SVG-Fragmente: sie brauchen ein umgebendes `<svg>`
 * mit `viewBox` und eine `id`-Fabrik, die pro Instanz eindeutig ist — sonst
 * stehlen sich zwei Marken auf einer Seite gegenseitig die Gradient-Defs.
 * `MarkPreview` ist genau diese minimale Einbettung und damit gleichzeitig die
 * Vorlage für neue Konsumenten.
 *
 * Zwei Farbwege: `{ type: 'css-vars' }` folgt dem Theme (`--mark-*` aus
 * `globals.css`), `{ type: 'palette', palette }` brennt die Werte ein (statische
 * Icons, OG-Karte — dort gibt es kein Theme).
 */

/** `MarkPaint` ist in `MarkArtwork` nicht exportiert — hier aus der Signatur abgeleitet. */
type MarkMode = Parameters<typeof MarkDefs>[0]['mode'];

function MarkPreview({ size, mode, label }: { size: number; mode: MarkMode; label: string }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (slot: string) => `smark-${raw}-${slot}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${MARK.width} ${MARK.height}`}
      style={{ width: size, height: 'auto' }}
      role="img"
      aria-label={label}
    >
      <MarkDefs id={id} mode={mode} />
      <MarkPaths id={id} mode={mode} />
    </svg>
  );
}

const meta = {
  title: 'Brand/MarkArtwork',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Die eine Geometrie des Monogramms (`markGeometry.ts`): Header, 404-Chrome, OG-Karte und alle Icon-Dateien leiten daraus ab. Hier sind nur die SVG-Bausteine selbst dokumentiert — Größe, Reticle-Luft und Farbweg bestimmt der Konsument.',
      },
    },
  },
} satisfies Meta;

export default meta;

/** Theme-getrieben (`var(--mark-*)`): folgt dem Theme-Toolbar oben rechts. */
export const Default: StoryObj<{ size: number }> = {
  args: { size: 180 },
  argTypes: { size: { control: { type: 'range', min: 32, max: 400, step: 8 } } },
  render: ({ size }) => (
    <MarkPreview size={size} mode={{ type: 'css-vars' }} label="MO-Monogramm" />
  ),
};

/** Dieselbe Geometrie in 48 / 96 / 180 / 320 px — das Emblem bleibt lesbar. */
export const Sizes: StoryObj = {
  name: 'Größen',
  render: () => (
    <div className="flex flex-wrap items-end gap-8">
      {[48, 96, 180, 320].map((size) => (
        <div key={size} className="flex flex-col items-start gap-2">
          <MarkPreview size={size} mode={{ type: 'css-vars' }} label={`MO-Monogramm ${size}px`} />
          <span className="mono-label text-muted-foreground">{size} px</span>
        </div>
      ))}
    </div>
  ),
};

/** Eingebrannte Dark-Palette (`MARK_CSS_VARS.dark`) — der Neon-Satz der `.dark`-Tokens. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="bg-background flex items-center gap-6 p-6">
      <MarkPreview
        size={200}
        mode={{ type: 'palette', palette: MARK_CSS_VARS.dark }}
        label="MO-Monogramm (Dark-Palette)"
      />
      <span className="mono-label text-muted-foreground">
        palette: MARK_CSS_VARS.dark · bridgeGap #090A0D
      </span>
    </div>
  ),
};

/**
 * Eingebrannte Light-Palette (`MARK_CSS_VARS.light`).
 *
 * Die Neon-Werte der Dark-Palette messen auf `#f8fafc` nur ~2.4:1 und wirken
 * wie ein Schmier; der Light-Satz liegt bei ~3.4:1 und hält die Ribbon-Naht.
 */
export const Light: StoryObj = {
  globals: { theme: 'light' },
  render: () => (
    <div className="bg-background flex items-center gap-6 p-6">
      <MarkPreview
        size={200}
        mode={{ type: 'palette', palette: MARK_CSS_VARS.light }}
        label="MO-Monogramm (Light-Palette)"
      />
      <span className="mono-label text-muted-foreground">
        palette: MARK_CSS_VARS.light · bridgeGap #F8FAFC
      </span>
    </div>
  ),
};

/**
 * Drei Farbwege. Jede eingebrannte Palette steht auf ihrer eigenen Fläche:
 * `bridgeGap` ist die Naht zwischen M und O und muss die Farbe des Hintergrunds
 * haben, sonst reißt die Brücke sichtbar auf.
 */
const COLOR_MODES: ReadonlyArray<{ label: string; mode: MarkMode; surface: string }> = [
  { label: 'css-vars (Theme)', mode: { type: 'css-vars' }, surface: '' },
  {
    label: 'Palette dark',
    mode: { type: 'palette', palette: MARK_CSS_VARS.dark },
    surface: 'dark bg-background',
  },
  {
    label: 'Palette light',
    mode: { type: 'palette', palette: MARK_CSS_VARS.light },
    surface: 'light bg-background',
  },
];

/** Alle drei Farbwege nebeneinander — Theme, Dark-Literal, Light-Literal. */
export const ColorModes: StoryObj = {
  name: 'Farbwege im Vergleich',
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {COLOR_MODES.map(({ label, mode, surface }) => (
        <div key={label} className={`${surface} flex flex-col items-start gap-2 p-4`}>
          <MarkPreview size={160} mode={mode} label={`MO-Monogramm (${label})`} />
          <span className="mono-label text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  ),
};
