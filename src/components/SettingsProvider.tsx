'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
type FontSize = 'normal' | 'large';
type Animations = 'system' | 'on' | 'off';

interface SettingsContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  animations: Animations;
  currentAnimations: 'on' | 'off';
  setAnimations: (a: Animations) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Dark is the app default even on light-preferring OS; the pre-hydration
 * THEME_BOOTSTRAP in the layout applies the same baseline, so there is no
 * flash. The manual 'light'/'system' toggle still works.
 */
const DEFAULT_THEME: Theme = 'dark';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [currentTheme, setCurrentTheme] = useState<SettingsContextType['currentTheme']>('dark');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [animations, setAnimations] = useState<Animations>('system');
  const [currentAnimations, setCurrentAnimations] =
    useState<SettingsContextType['currentAnimations']>('on');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((localStorage.getItem('theme') as Theme) || DEFAULT_THEME);

    setFontSize((localStorage.getItem('fontSize') as FontSize) || 'normal');

    setAnimations((localStorage.getItem('animations') as Animations) || 'system');

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply the theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setCurrentTheme(theme);
    }

    localStorage.setItem('theme', theme);

    // Apply the font size
    root.classList.toggle('large-font', fontSize === 'large');
    localStorage.setItem('fontSize', fontSize);

    // Apply the animation preference
    let disableAnimations = false;
    if (animations === 'system') {
      disableAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } else {
      disableAnimations = animations === 'off';
    }

    setCurrentAnimations(disableAnimations ? 'off' : 'on');
    root.classList.toggle('no-animations', disableAnimations);
    localStorage.setItem('animations', animations);
  }, [theme, fontSize, animations, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme,
        fontSize,
        setFontSize,
        animations,
        currentAnimations,
        setAnimations,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
