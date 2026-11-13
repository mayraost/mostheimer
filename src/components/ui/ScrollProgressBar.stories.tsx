'use client';

import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScrollProgressBar } from './ScrollProgressBar';

const meta = {
  title: 'UI/ScrollProgressBar',
  component: ScrollProgressBar,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    chromatic: { pauseAnimationAtEnd: true },
    docs: {
      description: {
        component:
          'Lese-Fortschritt als 1.5-px-Balken an der Oberkante des Headers. Skaliert nur auf der X-Achse (`transform`, nie `width`). Zwei Wege: native `animation-timeline: scroll(root)` (compositor, kein JS) und als Fallback ein einzelner passive `scroll`-Listener, der `--scroll-progress` schreibt. Bei `no-animations`/reduce-motion wird der Balken auf volle Breite eingefroren (ein stehendes Meter liest sich als Deko, nicht als hängende Seite).',
      },
    },
  },
} satisfies Meta<typeof ScrollProgressBar>;

export default meta;

/** Mock-Header: der Balken braucht einen `relative` Vorfahren (im App-Betrieb der Header). */
function MockHeader({
  progress,
  children,
}: {
  /** Nur für die Demo: ohne Wert bleibt der echte Scroll-Fortschritt aktiv. */
  progress?: number;
  children: ReactNode;
}) {
  const style =
    progress === undefined
      ? undefined
      : ({ '--scroll-progress': String(progress) } as CSSProperties);

  return (
    <div
      style={style}
      className="relative overflow-hidden rounded-[6px] border border-border bg-surface"
    >
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-border/60" aria-hidden="true" />
      <ScrollProgressBar />
      <div className="flex items-center justify-between px-4 py-5">{children}</div>
    </div>
  );
}

export const Default: StoryObj = {
  name: 'Zustand — im Header (echter Fortschritt)',
  render: () => (
    <div className="flex flex-col gap-3">
      <MockHeader>
        <span className="mono-label text-foreground">mostheimer</span>
        <span className="mono-label text-muted-foreground">{'// scroll progress'}</span>
      </MockHeader>
      <p className="text-sm text-muted-foreground">
        Der Balken folgt dem Scroll-Fortschritt des Dokuments — am Seitenanfang steht er auf 0 und
        ist damit unsichtbar. Die graue Linie ist die Spur, die er füllt.
      </p>
    </div>
  ),
};

export const ProgressValues: StoryObj = {
  name: 'Werte — 0 % / 42 % / 100 %',
  render: () => (
    <div className="flex flex-col gap-6">
      {/*
       * Demo-Override: die native Scroll-Timeline würde den Transform jeden
       * Frame überschreiben, deshalb wird sie hier (nur solange die Story
       * gemountet ist) abgeschaltet — danach greift `scaleX(var(--scroll-progress))`.
       */}
      <style>{'[data-scroll-progress] { animation: none !important; }'}</style>
      {[
        { label: '0 % — Seitenanfang', progress: 0 },
        { label: '42 % — mitten im Text', progress: 0.42 },
        { label: '100 % — Dokumentende', progress: 1 },
      ].map((entry) => (
        <div key={entry.label} className="flex flex-col gap-2">
          <span className="mono-label text-muted-foreground">{entry.label}</span>
          <MockHeader progress={entry.progress}>
            <span className="mono-label text-foreground">mostheimer</span>
            <span className="mono-label text-muted-foreground">{'// scroll progress'}</span>
          </MockHeader>
        </div>
      ))}
    </div>
  ),
};

/** Schaltet die Motion-Guardrail global ab (wie „Animationen: aus“ in den Settings). */
function NoMotionFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const apply = () => {
      html.classList.add('no-animations');
      html.classList.remove('motion-assets');
      document.body.classList.add('no-animations');
    };
    // Nach dem Mount erneut setzen: der globale SettingsProvider schreibt die
    // Klassen in seinem eigenen Effekt und liefe sonst zuletzt.
    apply();
    const frame = window.requestAnimationFrame(apply);

    return () => {
      window.cancelAnimationFrame(frame);
      html.classList.remove('no-animations');
      document.body.classList.remove('no-animations');
      html.classList.add('motion-assets');
    };
  }, []);

  return <div className="flex flex-col gap-3">{children}</div>;
}

export const NoMotion: StoryObj = {
  name: 'Ohne Motion — eingefroren',
  decorators: [
    (Story) => (
      <NoMotionFrame>
        <Story />
      </NoMotionFrame>
    ),
  ],
  render: () => (
    <>
      <MockHeader>
        <span className="mono-label text-foreground">mostheimer</span>
        <span className="mono-label text-muted-foreground">{'// scroll progress'}</span>
      </MockHeader>
      <p className="text-sm text-muted-foreground">
        <code>html.no-animations</code> friert den Balken auf <code>scaleX(1)</code>: volle Breite,
        kein Listener, keine Animation. So bleibt die Telemetrie sichtbar, ohne Bewegung zu
        behaupten.
      </p>
    </>
  ),
};
