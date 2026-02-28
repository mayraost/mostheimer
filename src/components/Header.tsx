'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header({
  locale,
  navLinks,
}: {
  locale: string;
  navLinks?: {
    label: string;
    link: string;
    newTab?: boolean | null;
    id?: string | null;
  }[];
}) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleThemeToggle = () => {
    if (currentTheme === 'dark') return setTheme('light');
    return setTheme('dark');
  };

  const pathname = usePathname();
  const targetLocale = locale === 'de' ? 'en' : 'de';
  const languageSwitchHref = pathname
    ? pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${targetLocale}`)
    : `/${targetLocale}`;

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center h-20 px-6 sm:px-10 border-b border-white/10 dark:border-white/5 bg-background/80 backdrop-blur-2xl shadow-sm transition-all duration-500">
      <Link href={`/${locale}`} className="flex items-center gap-3 group">
        <div className="flex items-center justify-center p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(194,24,91,0.05)] border border-primary/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 400"
            aria-label="mostheimer"
            className="w-8 h-8 fill-primary dark:fill-primary-foreground drop-shadow-sm transition-all duration-300"
          >
            <path
              fillRule="evenodd"
              d="M73 142c0 38 0 40-2 41-5 2-4 14 0 16 2 0 2 5 2 39v38h29v-5l1-30c0-24 0-25 2-27q5-6 0-12c-9-8-20 3-13 12 2 3 2 4 2 28v25H81v-67l3-3a699 699 0 0 1-2-78v-8h35l29 35c35 40 33 38 35 35l28-36 26-34h35v9l1 9 7 2q32 10 43 41 3 9 1 10-7 9-1 15 3 2 1 6c-7 28-33 48-63 47h-10v17h-13v-20l-5-2q-14-6-22-16l-5-5-3 2-2 4c0 3 14 16 23 21 5 2 5 1 5 11l1 11v3h50v-19l5-1c24-10 43-29 47-50q1-5 4-9 6-7 0-13l-4-9c-5-23-23-43-44-50l-7-3-1-10v-10h-46l-16 21-36 46q-1 3-9-8l-48-56-3-3H73zm174-23-4 5q0 3-11 9-14 9-13 16l-11 15-31 35c-13-15-32-39-32-42q0-7-8-8-2 1-13-13l-11-13H94v70h3c5 1 5 1 6-32v-30h2q3 0 10 8c13 14 13 15 13 19q1 6 7 8h3l16 18c26 31 24 29 26 27l19-22c25-30 24-30 27-28q1 3 6-1c28-23 70-6 70 30 0 42-60 56-83 18-1-2-6 3-6 6 0 4 12 15 23 20 51 23 99-37 61-77-14-16-44-21-60-10q-8 6-10 2c-5-3 0-10 7-10q4 1 7-2l9-3q6 1 8-2c6-8-3-19-11-13m4 36-2 1v69h2c6 2 6 5 6-35s0-37-6-35m19 35c0 37 0 37 6 32 2-1 2-1 2-32v-32l-3-1c-5-2-5-4-5 33m-155 0c0 30 0 31-2 34l-2 5 2 6c2 1 2 3 2 17v15h-2q-4-1-3 5v4h14v-20c0-18 0-19 2-21q5-6 0-12c-2-3-2-4-2-23l1-20 14 17c31 37 30 36 30 40q1 9 10 9 8 0 9-10c-1-3 0-4 7-12l20-23 12-14v12l1 13 3 3c5 5 5 5 5-24l-1-27-27 32c-28 33-30 34-34 29l-53-63c-6-7-6-7-6 28m-36-2c3 3-1 8-4 6v-6zm252 1q-1 5-5 4-2-2 0-5t5 1m-150 45q3 3-1 5-3 2-4-1c-2-3 2-7 5-4m-26 28c-5 15-5 15-2 15s3-1 7-12c5-15 5-16 2-16-2 0-3 1-7 13m12-8q-3 2 3 6 6 3-1 6-5 7-1 7c5-2 12-8 12-10-1-3-12-11-13-9m-27 4-5 5c0 2 11 11 13 9q3-2-2-6-7-3 0-6l3-4q-1-4-9 2m130 5v4h-13v-3q-1-5 4-4c9-1 9-1 9 3"
            />
          </svg>
        </div>
        <span className="font-averia text-2xl font-bold hidden sm:inline text-foreground tracking-tight">
          mostheimer
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Toggle */}
        <Link
          href={languageSwitchHref}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary text-foreground text-sm font-semibold uppercase transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
          title={locale === 'de' ? 'Switch to English' : 'Wechseln zu Deutsch'}
        >
          {targetLocale}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-300 hover:scale-105 active:scale-95 group"
          title={`${translations.common.theme}: ${theme}`}
          aria-label="Toggle theme"
        >
          {theme === 'system' && (
            <SunMoon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
          {theme === 'light' && (
            <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
          )}
          {theme === 'dark' && (
            <Moon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          )}
        </button>

        {/* Settings */}
        <Link
          href={`/${locale}/settings`}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-300 hover:scale-105 active:scale-95 group"
          aria-label={translations.settings.title}
          title={translations.common.settingsButtonAria}
        >
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:rotate-45 transition-all duration-300" />
        </Link>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-105 active:scale-95 ml-1"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/60 dark:bg-black/60 backdrop-blur-md z-[60] transition-all duration-500 h-dvh ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 w-[85%] max-w-sm h-[100dvh] bg-background/95 backdrop-blur-2xl border-l border-white/10 dark:border-white/5 shadow-2xl z-[61] flex flex-col transform transition-transform duration-500 cubic-bezier([0.32,0.72,0,1]) ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-20 px-6 sm:px-10 border-b border-border/40">
          <span className="font-averia text-2xl font-bold text-foreground">
            {translations.common.menu}
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-300 hover:scale-105 active:scale-95 -mr-2.5"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-6">
          <ul className="flex flex-col gap-3">
            {navLinks?.map((item, index) => (
              <li
                key={item.id || index}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`transform transition-all duration-500 ${isSidebarOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <Link
                  href={item.link}
                  className="flex items-center w-full px-5 py-4 rounded-2xl bg-secondary/30 hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 text-lg font-medium group"
                  onClick={() => setIsSidebarOpen(false)}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                >
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
