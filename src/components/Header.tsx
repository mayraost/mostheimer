'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

type NavLink = {
  label: string;
  link: string;
  newTab?: boolean | null;
  id?: string | null;
};

export function Header({ locale, navLinks }: { locale: string; navLinks?: NavLink[] }) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  // Escape schließt den Drawer (Tastatur-A11y)
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSidebarOpen]);

  const handleThemeToggle = () => {
    if (currentTheme === 'dark') return setTheme('light');
    return setTheme('dark');
  };

  const targetLocale = locale === 'de' ? 'en' : 'de';
  const languageSwitchHref = pathname
    ? pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${targetLocale}`)
    : `/${targetLocale}`;

  // A11y: sichtbares Label ist in den Accessible Name eingebettet
  // (axe label-content-name-mismatch vermeiden). Zwei Buchstaben (EN/DE)
  // bleiben das sichtbare Label, der volle Name steht im aria-label.
  const targetLanguageName = targetLocale === 'de' ? 'Deutsch' : 'English (EN)';
  const languageSwitchLabel = `Sprache wechseln zu ${targetLanguageName}`;

  const iconButtonClass =
    'flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-3"
          aria-label="mostheimer — Startseite"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised text-primary transition-colors group-hover:border-primary/60 group-hover:text-primary-hover">
            <Logo className="h-5 w-5" />
          </span>
          <span className="hidden font-heading text-lg font-bold tracking-tight text-foreground sm:inline">
            mostheimer
          </span>
          <span className="mono-label hidden text-primary lg:inline">{'//'} dev</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Link
            href={languageSwitchHref}
            className="mono-label flex h-9 min-w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 px-2 text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
            aria-label={languageSwitchLabel}
            title={languageSwitchLabel}
          >
            {targetLocale}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className={iconButtonClass}
            title={`${translations.common.theme}: ${theme}`}
            aria-label={`${translations.common.theme}: ${theme}`}
            type="button"
          >
            {theme === 'system' && <SunMoon className="h-4 w-4" />}
            {theme === 'light' && <Sun className="h-4 w-4 text-warning" />}
            {theme === 'dark' && <Moon className="h-4 w-4 text-primary" />}
          </button>

          {/* Settings */}
          <Link
            href={`/${locale}/settings`}
            className={iconButtonClass}
            aria-label={translations.common.settingsButtonAria}
            title={translations.common.settingsButtonAria}
          >
            <Settings className="h-4 w-4" />
          </Link>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-primary/60 bg-primary-muted text-primary transition-colors hover:border-primary hover:text-primary-hover"
            aria-label={translations.common.menu}
            aria-expanded={isSidebarOpen}
            aria-controls="site-menu-drawer"
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overlay-Container: position:fixed + zero-size. Die eigentlichen
          Overlay-Kinder (Backdrop, Drawer) leben chirurgisch hier drin —
          ein translate-x-full-Drawer direkt unter body würde trotz
          overflow:clip die Layout-Overflow-Breite von <html> aufblähen
          (Chrome zählt transformierte Positions-Boxen in scrollWidth). */}
      <div
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-0 z-[60] ${isSidebarOpen ? '' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 h-dvh bg-background/70 backdrop-blur-sm transition-opacity duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Drawer */}
        <div
          id="site-menu-drawer"
          className={`absolute top-0 right-0 flex h-[100dvh] w-[85%] max-w-sm flex-col border-l border-border bg-surface transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'invisible translate-x-full opacity-0'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="mono-label text-primary">&gt;_ {translations.common.menu}</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={iconButtonClass}
              aria-label="Close Menu"
              type="button"
              tabIndex={isSidebarOpen ? undefined : -1}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4" aria-label={translations.common.menu}>
            <ul className="flex flex-col gap-2">
              {navLinks?.map((item, index) => (
                <li key={item.id || index}>
                  <Link
                    href={item.link}
                    className="group flex items-center justify-between rounded-[6px] border border-transparent px-3 py-3 text-base font-medium text-foreground transition-colors hover:border-border hover:bg-surface-raised"
                    onClick={() => setIsSidebarOpen(false)}
                    target={item.newTab ? '_blank' : undefined}
                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                    tabIndex={isSidebarOpen ? undefined : -1}
                  >
                    <span>{item.label}</span>
                    <span className="mono-label text-muted-foreground transition-colors group-hover:text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            <p className="mono-label text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              Status · Available
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
