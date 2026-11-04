'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { CommandPalette } from './ui/CommandPalette';
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
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Scroll-Lock + Dialog-Verhalten (Bugfix 04.11.2026).
   *
   * Der Effekt läuft IMMER (kein Early-Return vor dem Cleanup): im
   * geschlossenen Zustand ist er ein No-op. Ein Early-Return-Lock ist
   * gefährlich, weil der Closed-Drawer seine Tab-Kinder per `invisible`
   * aus dem Fokusbaum nimmt — beim Schließen unmountet der fokussierte
   * Knoten, React entfernt dann ggf. den Effect-Cleanup-Kontext, und der
   * `overflowY`-Lock bliebe für immer stehen (Live-Test: Seite war nach
   * einem Öffnen/Schließen nicht mehr scrollbar).
   *
   * Warum NUR `overflow-y` und Restore des VORHERIGEN Inline-Werts:
   * der alte Code schrieb das `overflow`-Shorthand und restaurierte es mit
   * 'unset' — der Inline-Wert überschreibt dann das CSS `overflow-x: clip`
   * und bringt den horizontalen Scroll zurück.
   */
  useEffect(() => {
    const body = document.body;

    if (!isSidebarOpen) {
      // Sicherheitsnetz: nach dem Schließen nie einen hängenden Lock lassen.
      if (body.style.overflowY === 'hidden') body.style.overflowY = '';
      return;
    }

    const drawer = drawerRef.current;
    const menuButton = menuButtonRef.current;
    const previousOverflowY = body.style.overflowY;
    body.style.overflowY = 'hidden';

    // Fokus in den Drawer (Schließen-Button ist das stabilste Ziel)
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsSidebarOpen(false);
        menuButton?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = drawer?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    // Overscroll-Chaining stoppen: weitere Geraete-Fälle (Trackpad-Scroll
    // ueber dem Backdrop) dürfen die Seite hinter dem Drawer nicht bewegen.
    const lockWheel = (event: WheelEvent) => event.preventDefault();
    document.addEventListener('wheel', lockWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', lockWheel);
      body.style.overflowY = previousOverflowY;
      // Beim Schließen Fokus restaurieren, wenn er noch im Drawer steckt
      if (drawer?.contains(document.activeElement)) {
        menuButton?.focus();
      }
    };
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

  // Lokalisierung des Schließen-Buttons ohne Schema-Änderung am
  // Translations-Global: der Accessible Name folgt der aktiven Locale.
  const closeLabel = locale === 'de' ? 'Menü schließen' : 'Close menu';

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

      {/* Overlay-Container: position:fixed + zero-size. Die eigentlichen
          Overlay-Kinder (Backdrop, Drawer) leben chirurgisch hier drin —
          ein translate-x-full-Drawer direkt unter body würde trotz
          overflow:clip die Layout-Overflow-Breite von <html> aufblähen
          (Chrome zählt transformierte Positions-Boxen in scrollWidth). */}
      <div
        aria-hidden={!isSidebarOpen}
        /*
         * overflow-hidden ist PFLICHT (Bugfix 04.11.2026): der geschlossene
         * Drawer sitzt auf `translate-x-full`; `invisible` blendet ihn aus,
         * entzieht seine Layout-Box aber NICHT der Overflow-Berechnung.
         * Ohne Clip auf dem Wrapper wächst scrollWidth des Dokuments um die
         * Drawer-Breite (375px-Viewport → 694px) und die Seite scrollt
         * horizontal. Der Clip hier ist unabhängig von html/body-Reihenfolge.
         */
        className={`fixed inset-0 z-[60] overflow-hidden ${isSidebarOpen ? '' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 h-dvh bg-background/70 backdrop-blur-sm transition-opacity duration-200 ${
            isSidebarOpen ? 'touch-none opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Drawer */}
        <div
          ref={drawerRef}
          id="site-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-menu-title"
          className={`absolute top-0 right-0 flex h-[100dvh] w-[85%] max-w-sm flex-col border-l border-border bg-surface transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'invisible translate-x-full opacity-0'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span id="site-menu-title" className="mono-label text-primary">
              &gt;_ {translations.common.menu}
            </span>
            <button
              ref={closeButtonRef}
              onClick={() => setIsSidebarOpen(false)}
              className={iconButtonClass}
              aria-label={closeLabel}
              type="button"
              tabIndex={isSidebarOpen ? undefined : -1}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto overscroll-contain p-4"
            aria-label={translations.common.menu}
          >
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
