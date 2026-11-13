'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { RevealGrid, SpotlightGrid } from './MotionWrappers';

const meta = {
  title: 'UI/MotionWrappers',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    chromatic: { pauseAnimationAtEnd: true },
    docs: {
      description: {
        component:
          'Client-Wrapper, die SERVER-gerenderte Kinder animieren. Sie besitzen nur ein Ref und einen Observer, bekommen keine Daten und rendern ihre Kinder nicht neu — die Seiten bleiben Server Components, kein Block-Markup wandert ins Client-Bundle. Die Kacheln tragen `data-reveal` selbst, dadurch staffelt es pro Karte (Deckel bei 5 → 225 ms). `SpotlightGrid` kombiniert den Reveal mit EINEM rAF-gedrosselten `pointermove`-Listener (CSS-Variablen `--mouse-x/--mouse-y`, kein React-State).',
      },
    },
  },
} satisfies Meta;

export default meta;

function Tile({ index, children }: { index: number; children?: ReactNode }) {
  return (
    <div
      data-reveal=""
      className="bento-reveal relative overflow-hidden rounded-[6px] border border-border bg-surface p-4"
    >
      <span className="mono-label text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
      <p className="mt-2 text-sm text-foreground">{children ?? 'Server-gerenderte Kachel'}</p>
    </div>
  );
}

const TILES = ['Architektur', 'Daten', 'Betrieb', 'Interface', 'Testing', 'Delivery'];

export const RevealGridBasic: StoryObj = {
  name: 'RevealGrid',
  render: () => (
    <RevealGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((title, index) => (
        <Tile key={title} index={index}>
          {title}
        </Tile>
      ))}
    </RevealGrid>
  ),
};

export const SpotlightGridBasic: StoryObj = {
  name: 'SpotlightGrid',
  render: () => (
    <SpotlightGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((title, index) => (
        <div
          key={title}
          data-reveal=""
          className="spotlight-card bento-reveal relative overflow-hidden rounded-[6px] border border-border bg-surface p-4"
        >
          <span className="mono-label text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="mt-2 text-sm text-foreground">{title}</p>
        </div>
      ))}
    </SpotlightGrid>
  ),
};

export const SemanticDefinitionList: StoryObj = {
  name: 'RevealGrid als `dl`',
  render: () => (
    <RevealGrid as="dl" className="grid gap-3 sm:grid-cols-2">
      {[
        ['Erfahrung', '~10 yrs'],
        ['Architektur', 'composable'],
        ['Standort', 'remote (DE)'],
        ['Antwort', '< 24 h'],
      ].map(([label, value], index) => (
        <div
          key={label}
          data-reveal=""
          className="rounded-[6px] border border-border bg-surface p-4"
        >
          <dt className="mono-label text-muted-foreground">{label}</dt>
          <dd className="mt-1 font-mono text-lg text-foreground">
            {value}
            <span className="sr-only"> ({index + 1})</span>
          </dd>
        </div>
      ))}
    </RevealGrid>
  ),
};

export const CustomSelector: StoryObj<{ itemSelector: string }> = {
  name: 'Eigener `itemSelector`',
  args: { itemSelector: '[data-reveal]' },
  argTypes: { itemSelector: { control: 'text' } },
  render: ({ itemSelector }) => (
    <div className="flex flex-col gap-3">
      <RevealGrid itemSelector={itemSelector} className="grid gap-3 sm:grid-cols-3">
        {['eins', 'zwei', 'drei'].map((title, index) => (
          <Tile key={title} index={index}>
            {title}
          </Tile>
        ))}
      </RevealGrid>
      <p className="text-sm text-muted-foreground">
        Der Selektor entscheidet, welche Kinder den Observer passieren — hier sind es die Kacheln
        mit <code>data-reveal</code>.
      </p>
    </div>
  ),
};

export const ManyItems: StoryObj = {
  name: 'Viele Kacheln (Stagger-Deckel)',
  render: () => (
    <RevealGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, index) => (
        <Tile key={index} index={index}>
          Kachel {index + 1}
        </Tile>
      ))}
    </RevealGrid>
  ),
};

/**
 * `no-animations` ist ein globaler Zustand (`<html>`/`<body>`), den die Hooks in
 * ihrem Effekt lesen. Der Frame setzt ihn deshalb schon in der Render-Phase und
 * stellt ihn beim Unmount wieder her.
 */
function NoMotionFrame({ children }: { children: ReactNode }) {
  const root = typeof document === 'undefined' ? null : document.documentElement;
  if (root) {
    root.classList.add('no-animations');
    root.classList.remove('motion-assets');
  }

  useEffect(() => {
    const html = document.documentElement;
    const apply = () => {
      html.classList.add('no-animations');
      html.classList.remove('motion-assets');
      document.body.classList.add('no-animations');
    };
    // Der globale SettingsProvider schreibt die Klassen in seinem eigenen
    // Effekt; ein Frame später setzen wir sie erneut.
    apply();
    const frame = window.requestAnimationFrame(apply);

    return () => {
      window.cancelAnimationFrame(frame);
      html.classList.remove('no-animations');
      document.body.classList.remove('no-animations');
      html.classList.add('motion-assets');
    };
  }, []);

  return <>{children}</>;
}

const withNoMotion: Decorator = (Story) => (
  <NoMotionFrame>
    <Story />
  </NoMotionFrame>
);

export const NoMotion: StoryObj = {
  name: 'Ohne Motion — alles sofort sichtbar',
  decorators: [withNoMotion],
  render: () => (
    <div className="flex flex-col gap-3">
      <RevealGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((title, index) => (
          <Tile key={title} index={index}>
            {title}
          </Tile>
        ))}
      </RevealGrid>
      <p className="text-sm text-muted-foreground">
        Bei <code>no-animations</code>/reduce-motion setzt der Hook jede Kachel sofort auf sichtbar
        und legt keinen versteckten Startzustand an — ohne JS, mit kaputtem Bundle oder für Crawler
        ist ohnehin alles sichtbar.
      </p>
    </div>
  ),
};
