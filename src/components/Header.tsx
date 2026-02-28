'use client';

import Link from 'next/link';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings } from 'lucide-react';
import { Logo } from './Logo';

export function Header({ locale }: { locale: string }) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();

  const handleThemeToggle = () => {
    if (currentTheme === 'dark') return setTheme('light');
    return setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center py-3 px-5 sm:px-10 border-b border-border/30 bg-background/80 backdrop-blur-2xl transition-all duration-300">
      <Link href="/" className="flex items-center gap-3 group" aria-label="Mostheimer">
        <Logo className="h-14 w-14 text-primary transition-all duration-300 drop-shadow-[0_0_6px_rgba(194,24,91,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(194,24,91,0.75)] group-hover:scale-110" />
        <span className="hidden sm:inline font-averia text-2xl font-bold tracking-wide text-text group-hover:text-primary transition-all duration-300 [text-shadow:0_0_10px_rgba(194,24,91,0.25)] group-hover:[text-shadow:0_0_20px_rgba(194,24,91,0.65)]">
          MOstheimer
        </span>
      </Link>

      <nav className="flex items-center gap-2">
        {/* Language Toggle */}
        <Link
          href={locale === 'de' ? '/en' : '/de'}
          className="h-9 px-3 rounded-lg border border-border/40 bg-transparent hover:bg-border/30 hover:border-border/70 transition-all duration-200 active:scale-95 font-geist-mono font-semibold text-xs flex items-center justify-center uppercase text-muted-foreground hover:text-text tracking-widest"
          aria-label={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
          title={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
        >
          {locale === 'de' ? 'en' : 'de'}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="h-9 w-9 rounded-lg border border-border/40 bg-transparent hover:bg-border/30 hover:border-border/70 flex items-center justify-center transition-all duration-200 hover:rotate-12 active:scale-95"
          title={`${translations.common?.theme || 'Theme'}: ${theme}`}
          aria-label="Toggle theme"
        >
          {theme === 'system' && <SunMoon className="w-4 h-4 text-muted-foreground" />}
          {theme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Settings */}
        <Link
          href={`/${locale}/settings`}
          className="h-9 w-9 rounded-lg border border-border/40 bg-transparent hover:bg-border/30 hover:border-border/70 flex items-center justify-center transition-all duration-200 hover:rotate-12 active:scale-95"
          aria-label={translations.settings?.title || 'Settings'}
          title={translations.common?.settingsButtonAria || 'Personalize your experience'}
        >
          <Settings className="w-4 h-4 text-muted-foreground hover:text-text" />
        </Link>
      </nav>
    </header>
  );
}
