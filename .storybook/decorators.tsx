'use client';

import type { Decorator } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { SettingsProvider } from '@/components/SettingsProvider';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import { mockTranslations } from '@/stories/mockTranslations';

/**
 * Globale Decorators — die EINE Stelle, an der Stories ihre Umgebung bekommen.
 * Jede Story läuft in diesem Stack; Story-Autoren wrappen NICHT selbst.
 *
 * Reihenfolge in `.storybook/preview.tsx`: [withTheme, withTranslations,
 * withAppShell] — Theme außen, Layout innen.
 */

export type StoryTheme = 'dark' | 'light';

/**
 * Theme-Scope.
 *
 * `SettingsProvider` ist die App-Wahrheit für Theme/Schriftgröße/Animationen
 * und setzt die Klasse auf `<html>`. Er liest die Wahl beim Mount aus
 * `localStorage` — deshalb primen wir den Wert hier (idempotent, in der
 * Render-Phase) und remounten den Provider über `key`, statt danach gegen ihn
 * anzukämpfen. Zusätzlich trägt der Wrapper die Klasse selbst: `.dark`/`.light`
 * sind normale Klassen-Selektoren, die Tokens gelten also schon beim ersten
 * Paint für den gesamten Story-Teilbaum.
 */
function ThemeFrame({ theme, children }: { theme: StoryTheme; children: React.ReactNode }) {
  if (typeof window !== 'undefined' && window.localStorage.getItem('theme') !== theme) {
    window.localStorage.setItem('theme', theme);
  }

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <SettingsProvider key={theme}>
      <div className={`${theme} bg-background text-foreground font-body min-h-screen`}>
        {children}
      </div>
    </SettingsProvider>
  );
}

/** Toolbar-Umschalter (`globals.theme`) → Design-Tokens. Default: dark. */
export const withTheme: Decorator = (Story, context) => {
  const globals = context.globals as { theme?: string };
  const theme: StoryTheme = globals.theme === 'light' ? 'light' : 'dark';

  return (
    <ThemeFrame theme={theme}>
      <Story />
    </ThemeFrame>
  );
};

/**
 * `TranslationsProvider` mit Fixture.
 *
 * Pflicht für jede Komponente, die `useTranslations()`/`useTranslationsOrNull()`
 * nutzt (CopyButton, CookieConsent, Header, KeyFactActionButton, Settings-Seite
 * …). `useTranslations()` wirft ohne Provider — eine Story ohne diesen
 * Decorator crasht also sofort und sichtbar.
 */
export const withTranslations: Decorator = (Story) => (
  <TranslationsProvider translations={mockTranslations}>
    <Story />
  </TranslationsProvider>
);

/**
 * Erlaubte `max-w-*`-Klassen als Literale: Tailwind v4 scannt Quelltext nach
 * vollständigen Klassennamen, ein interpoliertes `max-w-${x}` erzeugt KEIN CSS.
 */
const MAX_WIDTH: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

/**
 * Layout-Rahmen. `parameters: { layout: 'fullscreen' }` global, damit dieser
 * Wrapper der einzige ist, der einrückt.
 *
 * Breite pro Story steuerbar: `parameters: { appShell: { maxWidth: '4xl' } }`
 * (Schlüssel aus {@link MAX_WIDTH}). Ohne Angabe: volle Breite.
 */
export const withAppShell: Decorator = (Story, context) => {
  const shell = context.parameters.appShell as { maxWidth?: string } | undefined;
  const widthClass = shell?.maxWidth
    ? `mx-auto w-full ${MAX_WIDTH[shell.maxWidth] ?? ''}`
    : 'w-full';

  return (
    <div className={`bg-background p-6 text-foreground ${widthClass}`}>
      <Story />
    </div>
  );
};
