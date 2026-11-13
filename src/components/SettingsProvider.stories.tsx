'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { buttonClass } from '@/components/ui/industrial';
import { useSettings } from './SettingsProvider';

/**
 * `SettingsProvider` ist die App-Wahrheit für Theme, Schriftgröße und
 * Animationen. Er hält den Zustand, schreibt die resultierenden Klassen auf
 * `<html>`/`<body>` (`light`/`dark`, `large-font`, `no-animations`,
 * `motion-assets`) und persistiert jede Wahl in `localStorage`.
 *
 * Die Story dokumentiert den Provider deshalb über einen **Consumer**: ein
 * `useSettings()`-Aufruf, der alle Felder sichtbar macht und über die Setter
 * interaktiv prüfbar ist. Ein `SettingsProvider` wird hier NICHT selbst
 * gerendert — den stellt der globale Decorator (`.storybook/decorators.tsx`),
 * inklusive `localStorage`-Priming und Remount bei Theme-Wechsel.
 *
 * `useSettings()` wirft ohne Provider (`useSettings must be used within
 * SettingsProvider`) — das ist Absicht und kein Fallback-Zustand: eine
 * Komponente ohne Provider ist ein Programmierfehler, keine Datenlage.
 */

const THEMES = ['dark', 'light', 'system'] as const;
const FONT_SIZES = ['normal', 'large'] as const;
const ANIMATIONS = ['system', 'on', 'off'] as const;

/** Eine Umschalt-Gruppe — generisch über die Options-Union, damit `setTheme`
 *  und `setFontSize` ohne Cast an denselben Baustein gehen. */
function OptionRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mono-label w-32 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected === option}
            onClick={() => onSelect(option)}
            className={buttonClass(selected === option ? 'primary' : 'subtle')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Zeigt genau das, was der Provider liefert — und lässt es sich ändern. */
function SettingsPanel({ showValues }: { showValues: boolean }) {
  const {
    theme,
    currentTheme,
    setTheme,
    fontSize,
    setFontSize,
    animations,
    setAnimations,
    currentAnimations,
  } = useSettings();

  const rows = [
    { label: 'theme', value: theme, hint: 'Wahl aus localStorage' },
    { label: 'currentTheme', value: currentTheme, hint: 'aufgelöst → Klasse auf <html>' },
    { label: 'fontSize', value: fontSize, hint: 'large → html.large-font' },
    { label: 'animations', value: animations, hint: 'Wahl aus localStorage' },
    {
      label: 'currentAnimations',
      value: currentAnimations,
      hint: 'aufgelöst → no-animations / motion-assets',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {showValues ? (
        <dl className="border-border divide-border divide-y border-y">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
              <dt className="w-44 shrink-0 font-mono text-xs text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
              <dd className="text-xs text-muted-foreground">{row.hint}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="flex flex-col gap-4">
        <OptionRow label="Theme" options={THEMES} selected={theme} onSelect={setTheme} />
        <OptionRow
          label="Schriftgröße"
          options={FONT_SIZES}
          selected={fontSize}
          onSelect={setFontSize}
        />
        <OptionRow
          label="Animationen"
          options={ANIMATIONS}
          selected={animations}
          onSelect={setAnimations}
        />
      </div>

      {/* Sichtbarer Beweis: die Fläche nimmt die Token des aufgelösten Themes an,
          und der Puls steht still, sobald `animations: off` greift. */}
      <div className={`${currentTheme} bg-surface border-border rounded-card border p-4`}>
        <div className="flex items-center gap-3">
          <span className="bg-primary animate-status-pulse inline-block h-2.5 w-2.5 rounded-full" />
          <span className="mono-label text-foreground">currentTheme: {currentTheme}</span>
          <span className="mono-label text-muted-foreground">Animationen: {currentAnimations}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Fläche folgt <code className="text-primary">.{currentTheme}</code>; die Status-Pille
          pulsiert nur bei <code className="text-primary">currentAnimations: on</code>.
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: 'UI/SettingsProvider',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Provider für Theme, Schriftgröße und Animationspräferenz. Die Story ist eine Consumer-Demo: `useSettings()` liefert Zustand + Setter, die Klassen auf `<html>`/`<body>` setzt der Provider selbst.',
      },
    },
  },
} satisfies Meta;

export default meta;

/** Vollständige Consumer-Demo: alle Felder plus die drei Umschalter. */
export const SettingsConsumer: StoryObj<{ showValues: boolean }> = {
  args: { showValues: true },
  argTypes: { showValues: { control: 'boolean', description: 'Zustandstabelle ein-/ausblenden' } },
  render: ({ showValues }) => <SettingsPanel showValues={showValues} />,
};

/** Nur die Setter — zeigt, dass die Umschalter den echten Provider-Zustand bewegen. */
export const SettingsControls: StoryObj<{ showValues: boolean }> = {
  name: 'Settings — nur Umschalter',
  args: { showValues: false },
  argTypes: { showValues: { control: 'boolean' } },
  render: ({ showValues }) => <SettingsPanel showValues={showValues} />,
};
