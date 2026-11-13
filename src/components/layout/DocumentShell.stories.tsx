import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { DocumentShell, MOTION_BOOTSTRAP, THEME_BOOTSTRAP } from './DocumentShell';

/**
 * Das `<html>`/`<body>`-Dokument der App.
 *
 * WICHTIG für die Story: die Komponente emittiert ein VOLLSTÄNDIGES Dokument
 * (`<html>`, `<head>`, `<body>`) und wird in der App ausschließlich vom
 * `[locale]`-Layout gerendert. In Storybook liegt sie deshalb zwangsläufig IM
 * `<body>` des Preview-Iframes — React meldet dafür eine
 * `validateDOMNesting`-Warnung (`<html> cannot be a child of <div>`). Das ist
 * erwartet und kein Fehler der Komponente: der Canvas zeigt die App-Shell,
 * nicht ein zweites Dokument.
 *
 * Nebenwirkung, die man kennen sollte: die Bootstrap-Scripts im `<head>`
 * werden beim Einhängen ausgeführt. `THEME_BOOTSTRAP` setzt dieselbe
 * Theme-Klasse, die der Preview-Decorator bereits setzt; `MOTION_BOOTSTRAP`
 * schaltet `html.motion-assets` (bzw. `body.no-animations` bei
 * `prefers-reduced-motion`). Beides ist idempotent und gewollt.
 *
 * `BODY_FONT_CLASS` und `THEME_BOOTSTRAP` sind exportiert, damit Stories und
 * Tests dieselbe Bootstrap-Logik nutzen können, ohne den String zu kopieren.
 */
const meta = {
  title: 'Layout/DocumentShell',
  component: DocumentShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'App-Dokument: Theme-/Motion-Bootstrap und Consent-Mode-Defaults im `<head>` (Reihenfolge ist sicherheitsrelevant — ein Tag, der vor `consent default` feuert, gilt als „granted"), Skip-Link als erstes fokussierbares Element, `<body>` mit den next/font-Klassen.',
      },
    },
  },
  args: {
    locale: 'de',
    skipToContent: 'Zum Inhalt springen',
    children: (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <p className="mono-label text-primary">{'// app shell'}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
          Dokument-Rahmen
        </h1>
        <p className="mt-3 max-w-prose text-base text-muted-foreground">
          Alles innerhalb von <code className="font-mono text-sm">&lt;body&gt;</code> kommt aus dem
          Layout: Skip-Link, Chrome und Seiteninhalt.
        </p>
      </div>
    ),
  },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    skipToContent: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<typeof DocumentShell>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Die App-Shell als Ganzes (volles Dokument, deshalb `layout: 'fullscreen'`). */
export const AppShell: Story = {};

/** Englische Locale: `lang="en"` am Dokument und englischer Skip-Link. */
export const En: Story = {
  args: { locale: 'en', skipToContent: 'Skip to content' },
};

/**
 * Skip-Link im Fokuszustand: `sr-only` wird beim Fokus zu einer sichtbaren
 * Fläche oben links — der erste Tab-Stop jeder Seite.
 */
export const SkipLinkFocused: Story = {
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('a[href="#main-content"]');

    await expect(link).not.toBeNull();
    link?.focus();
  },
};

/**
 * Die beiden Bootstrap-Scripts im Klartext (werden hier NICHT ausgeführt).
 * Reihenfolge im `<head>`: Theme → Motion → Consent-Mode-Defaults.
 */
export const Bootstraps: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <p className="mono-label text-primary">{'// theme-bootstrap'}</p>
        <p className="text-sm text-muted-foreground">
          Setzt <code className="font-mono">html.dark</code>/
          <code className="font-mono">.light</code> vor dem ersten Paint — Default ist Dark, auch
          bei hellem OS.
        </p>
        <pre className="overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs text-foreground">
          {THEME_BOOTSTRAP}
        </pre>
      </section>

      <section className="flex flex-col gap-2">
        <p className="mono-label text-primary">{'// motion-bootstrap'}</p>
        <p className="text-sm text-muted-foreground">
          Doppelter Guardrail: <code className="font-mono">html.motion-assets</code> scharf nur bei
          Animationen an, sonst <code className="font-mono">body.no-animations</code> (auch bei
          <code className="font-mono">prefers-reduced-motion: reduce</code>).
        </p>
        <pre className="overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs text-foreground">
          {MOTION_BOOTSTRAP}
        </pre>
      </section>
    </div>
  ),
};
