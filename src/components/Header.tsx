'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings, Menu } from 'lucide-react';
import { useRef, useState } from 'react';
import { Logo } from './Logo';
import { CommandPalette } from './ui/CommandPalette';
import { MobileNavPortal } from './MobileNavPortal';
import type { CommandItem } from './ui/CommandPalette';

type NavLink = {
  label: string;
  link: string;
  newTab?: boolean | null;
  id?: string | null;
};

export function Header({
  locale,
  navLinks,
  commandItems = [],
}: {
  locale: string;
  navLinks?: NavLink[];
  commandItems?: CommandItem[];
}) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * The dialog lifecycle lives in the portal (`MobileNavPortal`); the header
   * only owns the trigger and restores focus after closing, whichever way the
   * dialog was closed (backdrop, Esc, link).
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const handleThemeToggle = () => {
    if (currentTheme === 'dark') return setTheme('light');
    return setTheme('dark');
  };

  const targetLocale = locale === 'de' ? 'en' : 'de';
  const languageSwitchHref = pathname
    ? pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${targetLocale}`)
    : `/${targetLocale}`;

  // A11y: the visible two-letter label must be contained in the accessible name
  // (axe `label-content-name-mismatch`), so the full language name goes into
  // aria-label alongside it.
  const targetLanguageName = targetLocale === 'de' ? 'Deutsch' : 'English (EN)';
  const languageSwitchLabel = `Sprache wechseln zu ${targetLanguageName}`;

  const iconButtonClass =
    'flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        {/*
         * A11y: the visible text ("mayra ostheimer" + "// dev") must be part of
         * the accessible name. On mobile that text is hidden, so an sr-only
         * text supplies the name instead of a contradictory aria-label.
         */}
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised text-primary transition-colors group-hover:border-primary/60 group-hover:text-primary-hover">
            <Logo className="h-5 w-5" />
          </span>
          <span className="hidden font-heading text-lg font-bold tracking-tight text-foreground sm:inline">
            mayra ostheimer
          </span>
          <span className="mono-label hidden text-primary lg:inline">{'//'} dev</span>
          <span className="sr-only">
            mayra ostheimer — {locale === 'de' ? 'Startseite' : 'home'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Command palette (⌘K / Ctrl+K) */}
          <CommandPalette locale={locale} items={commandItems} />

          {/* Language toggle */}
          <Link
            href={languageSwitchHref}
            className="mono-label flex h-9 min-w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 px-2 text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
            aria-label={languageSwitchLabel}
            title={languageSwitchLabel}
          >
            {targetLocale}
          </Link>

          {/* Theme toggle */}
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

          {/* Sidebar toggle */}
          <button
            ref={menuButtonRef}
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

      {/*
       * The overlay lives OUTSIDE the <header>: `position: sticky` creates a
       * containing block and stacking context, so a `fixed` descendant would
       * resolve `inset-0` against the 64px header box (drawer clipped behind
       * the content). The portal attaches the dialog to <body> instead.
       */}
      <MobileNavPortal
        open={isSidebarOpen}
        onClose={closeSidebar}
        navLinks={navLinks ?? []}
        title={translations.common.menu}
        closeLabel={locale === 'de' ? 'Menü schließen' : 'Close menu'}
        statusLabel={`Kiebitzreihe · ${locale.toUpperCase()}`}
      />
    </header>
  );
}
