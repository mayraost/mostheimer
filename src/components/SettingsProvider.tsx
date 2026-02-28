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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [animations, setAnimations] = useState<Animations>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTheme((localStorage.getItem('theme') as Theme) || 'system');
      setFontSize((localStorage.getItem('fontSize') as FontSize) || 'normal');
      setAnimations((localStorage.getItem('animations') as Animations) || 'system');
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);

    // Apply font size
    root.classList.toggle('large-font', fontSize === 'large');
    localStorage.setItem('fontSize', fontSize);

    // Apply animations
    let disableAnimations = false;
    if (animations === 'system') {
      disableAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } else {
      disableAnimations = animations === 'off';
    }
    root.classList.toggle('no-animations', disableAnimations);
    localStorage.setItem('animations', animations);
  }, [theme, fontSize, animations, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        currentTheme: mounted
          ? theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : theme
          : 'dark', // Default to dark for SSR
        setTheme,
        fontSize,
        setFontSize,
        animations,
        currentAnimations: mounted
          ? animations === 'system'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'off'
              : 'on'
            : animations
          : 'on', // Default to on for SSR
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
