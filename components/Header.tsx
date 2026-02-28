'use client';

import Link from 'next/link';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings } from 'lucide-react';

export function Header({ locale }: { locale: string }) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();

  const handleThemeToggle = () => {
    if (currentTheme === 'dark') return setTheme('light');
    return setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center py-4 px-4 sm:px-8 border-b border-border/40 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <Link href="/" className="font-averia text-2xl font-bold flex items-center gap-2 group">
        <span className="text-primary drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(194,24,91,0.6)] transition-all duration-300 transform group-hover:scale-105">
          MO
        </span>
        <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-text to-gray-500 group-hover:to-primary transition-all duration-500 delay-75">
          Mostheimer
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <Link
          href={locale === 'de' ? '/en' : '/de'}
          className="p-2.5 rounded-full bg-border/30 hover:bg-border/80 hover:shadow-inner transition-all duration-300 active:scale-95 font-geist-mono font-medium text-sm w-10 h-10 flex items-center justify-center uppercase"
          aria-label={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
          title={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
        >
          {locale === 'de' ? 'en' : 'de'}
        </Link>

        {/* Direct Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2.5 rounded-full bg-border/30 hover:bg-border/80 hover:shadow-inner transition-all duration-300 hover:rotate-12 active:scale-95"
          title={`${translations.common?.theme || 'Theme'}: ${theme}`}
          aria-label="Toggle theme"
        >
          {theme === 'system' && <SunMoon className="w-5 h-5 text-gray-500 drop-shadow-sm" />}
          {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500 drop-shadow-sm" />}
          {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400 drop-shadow-sm" />}
        </button>

        {/* Settings View */}
        <Link
          href={`/${locale}/settings`}
          className="p-2.5 rounded-full bg-border/30 hover:bg-border/80 hover:shadow-inner transition-all duration-300 hover:rotate-12 active:scale-95"
          aria-label={translations.settings?.title || 'Settings'}
          title={translations.common?.settingsButtonAria || 'Personalize your experience'}
        >
          <Settings className="w-5 h-5 text-text drop-shadow-sm" />
        </Link>
      </div>
    </header>
  );
}
