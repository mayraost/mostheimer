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
   * Dialog-Lebenszyklus (Fokus-Rückgabe) lebt im Portal
   * (`MobileNavPortal`); der Header hält nur den Trigger und gibt den Fokus
   * nach dem Schließen zurück — auch wenn der Dialog per Backdrop/Esc/Link
   * geschlossen wurde.
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
        {/*
         * A11y (label-content-name-mismatch): Der sichtbare Text
         * ("mostheimer" + "// dev") MUSS im Accessible Name enthalten sein.
         * Auf Mobile ist der Text ausgeblendet — dann trägt der sr-only-Text
         * den Namen, statt ein widersprechendes aria-label zu setzen.
         */}
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised text-primary transition-colors group-hover:border-primary/60 group-hover:text-primary-hover">
            <Logo className="h-5 w-5" />
          </span>
          <span className="hidden font-heading text-lg font-bold tracking-tight text-foreground sm:inline">
            mostheimer
          </span>
          <span className="mono-label hidden text-primary lg:inline">{'//'} dev</span>
          <span className="sr-only">mostheimer — {locale === 'de' ? 'Startseite' : 'home'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Command Palette (⌘K / Ctrl+K) */}
          <CommandPalette locale={locale} items={commandItems} />

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
       * Overlay lebt AUSSERHALB des <header>: `position: sticky` erzeugt
       * Containing Block + Stacking Context, ein `fixed`-Nachfahre würde
       * `inset-0` gegen die 64px-Header-Box auflösen (geclippter Drawer,
       * hinter dem Content). Das Portal hängt den Dialog an <body>.
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
