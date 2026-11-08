'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsProvider';
import { useTranslations } from './TranslationsProvider';
import { Moon, Sun, SunMoon, Settings, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LogoLockupMark } from './brand/LogoLockupMark';
import { CommandPalette } from './ui/CommandPalette';
import { ScrollProgressBar } from './ui/ScrollProgressBar';
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
  copy,
  brandName,
}: {
  locale: string;
  navLinks?: NavLink[];
  commandItems?: CommandItem[];
  /** Brand from the site-settings global (accessible name of the logo link). */
  brandName: string;
  /**
   * Shell copy from the translations global (server-read, passed down as
   * props). A client component cannot await the translations cache, and the
   * provider context does not carry the `chrome` group per header instance —
   * props keep the resolution explicit and typed.
   */
  copy: {
    homeAria: string;
    languageName: string;
    languageSwitchAria: string;
    closeMenu: string;
    drawerStatus: string;
    currentPage: string;
  };
}) {
  const { theme, currentTheme, setTheme } = useSettings();
  const translations = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Header compression (§2.2): past 24px the bar switches to the denser
   * backdrop. Only a boolean flips (twice per page visit at most) — the height
   * reduction is a CSS class on the inner row, and the row height is reserved
   * by the sticky layout, so nothing below the header shifts. The listener is
   * passive and rAF-coalesced.
   */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact(window.scrollY > 24);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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
  // aria-label alongside it. Both the name and the sentence come from the CMS;
  // `{language}` is substituted here because the target depends on the route.
  const languageSwitchLabel = copy.languageSwitchAria.replaceAll('{language}', copy.languageName);

  const iconButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground lg:h-9 lg:w-9';

  return (
    <header
      data-header-compact={compact ? 'true' : 'false'}
      className="header-rule sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl transition-[background-color,border-color] duration-260 ease-out-quart"
    >
      <ScrollProgressBar />
      <div
        className={[
          'mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8',
          // Height is a real layout property, so it may NOT animate: the row
          // snaps between its states. The page content is laid out below the
          // sticky header in normal flow, so a shorter bar never moves it
          // (CLS stays 0) — only the header's own density changes.
          //
          // `lg` is taller (80px) because that is where the lockup grows its
          // third line (`// WEB & APPLICATION ARCHITECT`). A 64px bar leaves
          // that subline at ~5px; the extra 16px buys the whole type block.
          compact ? 'h-14' : 'h-16 lg:h-20',
        ].join(' ')}
      >
        {/*
         * A11y: the lockup renders the wordmark as SVG <text>, which is NOT
         * reliably exposed as text by every screen reader. The sr-only span
         * therefore carries the full accessible name (brand + destination),
         * and the SVG itself is decorative (`aria-hidden`) so the name is not
         * announced twice.
         */}
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          {/*
           * The lockup carries its own breakpoint: mark + wordmark below `lg`,
           * plus the `// WEB & APPLICATION ARCHITECT` subline from `lg` up.
           * At header height the subline only becomes legible once there is
           * room for it, so `LogoLockupMark` swaps composition at `lg` instead
           * of shrinking all three lines into 6px type.
           */}
          <LogoLockupMark
            title=""
            className="h-8 w-auto shrink-0 text-foreground transition-opacity group-hover:opacity-80 lg:h-[72px]"
          />
          <span className="mono-label hidden text-primary lg:inline">{'//'} dev</span>
          <span className="sr-only">
            {brandName} — {copy.homeAria}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Command palette (⌘K / Ctrl+K) */}
          <CommandPalette locale={locale} items={commandItems} />

          {/* Language toggle */}
          <Link
            href={languageSwitchHref}
            className="mono-label flex h-11 min-w-11 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 px-2 text-muted-foreground transition-colors hover:border-secondary hover:text-secondary lg:h-9 lg:min-w-9"
            aria-label={languageSwitchLabel}
            title={languageSwitchLabel}
          >
            {targetLocale}
          </Link>

          {/*
           * Theme + settings live in the mobile drawer below `lg` (see
           * MobileNavPortal) to keep the header row from overflowing on small
           * screens; desktop keeps them inline. Hidden with `hidden`/`lg:flex`,
           * not CSS order, so only one of the two is ever focusable.
           */}
          <div className="hidden items-center gap-2 lg:flex">
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

            <Link
              href={`/${locale}/settings`}
              className={iconButtonClass}
              aria-label={translations.common.settingsButtonAria}
              title={translations.common.settingsButtonAria}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>

          {/* Sidebar toggle */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-primary/60 bg-primary-muted text-primary transition-colors hover:border-primary hover:text-primary-hover lg:h-9 lg:w-9"
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
        closeLabel={copy.closeMenu}
        currentPageLabel={copy.currentPage}
        statusLabel={copy.drawerStatus}
        settingsHref={`/${locale}/settings`}
        settingsLabel={translations.common.settingsButtonAria}
        themeLabel={`${translations.common.theme}: ${theme}`}
        themeIcon={
          theme === 'system' ? (
            <SunMoon className="h-4 w-4" />
          ) : theme === 'light' ? (
            <Sun className="h-4 w-4 text-warning" />
          ) : (
            <Moon className="h-4 w-4 text-primary" />
          )
        }
        onThemeToggle={handleThemeToggle}
      />
    </header>
  );
}
