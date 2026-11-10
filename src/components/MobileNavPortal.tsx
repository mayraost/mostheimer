'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { safeHrefOrNull } from '@/lib/safeHref';
import type { UrlObject } from 'node:url';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, X } from 'lucide-react';
import { isActiveNavLink } from './navLinkState';

type NavLink = {
  label: string;
  link: string;
  newTab?: boolean | null;
  id?: string | null;
};

/**
 * Mobile navigation as a portal dialog.
 *
 * Why a portal: the trigger lives in the sticky `<header>`, and sticky (like
 * transform/filter/contain) creates a containing block AND a stacking context —
 * a `fixed` descendant would resolve `inset-0` against the 64px header box
 * instead of the viewport, clipping the drawer behind the content. Rendering
 * into document.body takes the dialog out of that context.
 *
 * SSR guard: content renders only after mount, so nothing touches `document`
 * during SSR.
 *
 * Scroll lock: `position: fixed` on the body with a negative `top` keeps the
 * scroll position and survives mobile browser-chrome resizes, unlike plain
 * `overflow: hidden`. On close, every inline property is removed individually
 * and the scroll position restored — never write `overflow: 'unset'`, which
 * would override the CSS `overflow-x: clip`.
 *
 * The drawer owns the theme toggle and the settings link below `lg`. They are
 * passed in as props (`themeIcon`/`onThemeToggle`/`settingsHref`) because the
 * theme state lives in `SettingsProvider` and the links need the locale.
 * Desktop keeps both in the header; the drawer is simply never opened there.
 */
export function MobileNavPortal({
  open,
  onClose,
  navLinks,
  title,
  closeLabel,
  currentPageLabel,
  statusLabel,
  settingsHref,
  settingsLabel,
  themeLabel,
  themeIcon,
  onThemeToggle,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  title: string;
  closeLabel: string;
  /** Marker text of the active entry (translations `chrome.currentPage`). */
  currentPageLabel: string;
  statusLabel: string;
  settingsHref: string;
  settingsLabel: string;
  themeLabel: string;
  themeIcon: ReactNode;
  onThemeToggle: () => void;
}) {
  // SSR guard without setState in an effect: portal only after hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Scroll lock and dialog behaviour in one effect with complete cleanup.
  useEffect(() => {
    if (!open || !mounted) return;

    const body = document.body;
    const scrollY = window.scrollY;

    // Capture values before locking; they are restored individually.
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    // Move focus into the dialog, to the close button (the most stable target).
    closeButtonRef.current?.focus();

    const drawer = drawerRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
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

    return () => {
      document.removeEventListener('keydown', onKeyDown);

      // Reset inline properties individually — never 'unset' (see above).
      const restore = (prop: keyof CSSStyleDeclaration & string, value: string) => {
        if (value)
          body.style.setProperty(
            prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
            value,
          );
        else body.style.removeProperty(prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));
      };
      restore('position', previous.position);
      restore('top', previous.top);
      restore('left', previous.left);
      restore('right', previous.right);
      restore('width', previous.width);
      restore('overflow', previous.overflow);

      window.scrollTo(0, scrollY);
    };
  }, [open, mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-[visibility] ${
        open ? 'visible' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop across the whole viewport */}
      <div
        className={`absolute inset-0 bg-background/75 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'touch-none opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="site-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-menu-title"
        className={`absolute top-0 right-0 flex h-[100dvh] max-h-[100dvh] w-[85%] max-w-sm flex-col border-l border-border bg-surface transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <span id="site-menu-title" className="mono-label text-primary">
            &gt;_ {title}
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label={closeLabel}
            type="button"
            tabIndex={open ? undefined : -1}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto overscroll-contain p-4"
          aria-label={title}
          style={{ touchAction: 'pan-y' }}
        >
          <ul className="flex flex-col gap-2">
            {navLinks
              .map((item, index) => ({
                item,
                index,
                href: safeHrefOrNull(item.link),
              }))
              .filter(({ href }) => href)
              .map(({ item, index, href }) => {
                const active = isActiveNavLink(item.link, pathname);
                return (
                  <li key={item.id || index}>
                    <Link
                      href={href as string | UrlObject}
                      /*
                       * Active state is a real signal, not a hover tint: emerald
                       * rail on the left, filled surface, full-contrast label and
                       * an emerald index chip. `aria-current="page"` is the only
                       * thing assistive tech reads — the colour is decoration.
                       */
                      className={[
                        'group relative flex items-center justify-between rounded-[6px] border px-3 py-3 text-base font-medium transition-colors',
                        active
                          ? 'border-primary/50 bg-primary-muted text-foreground'
                          : 'border-transparent text-foreground hover:border-border hover:bg-surface-raised',
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                      target={item.newTab ? '_blank' : undefined}
                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                      tabIndex={open ? undefined : -1}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-primary"
                        />
                      )}
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{item.label}</span>
                        {active && (
                          <span
                            className="mono-label shrink-0 text-primary"
                            aria-hidden="true"
                            title={currentPageLabel}
                          >
                            {'//'} now
                          </span>
                        )}
                      </span>
                      <span
                        className={[
                          'mono-label shrink-0 transition-colors',
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-primary',
                        ].join(' ')}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>

          {/*
           * Theme + settings moved out of the mobile header row to keep it
           * from wrapping: plain list rows (same rhythm as the nav items) so
           * the 44px touch targets hold and a text label stays visible — the
           * icon-only buttons in the header are desktop-only.
           */}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
            <button
              onClick={onThemeToggle}
              className="mono-label flex min-h-11 items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-3 text-left text-muted-foreground transition-colors hover:border-border hover:bg-surface-raised hover:text-foreground"
              aria-label={themeLabel}
              title={themeLabel}
              type="button"
              tabIndex={open ? undefined : -1}
            >
              <span>{themeLabel}</span>
              {themeIcon}
            </button>
            <Link
              href={settingsHref}
              className="mono-label flex min-h-11 items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-3 text-muted-foreground transition-colors hover:border-border hover:bg-surface-raised hover:text-foreground"
              aria-label={settingsLabel}
              title={settingsLabel}
              onClick={onClose}
              tabIndex={open ? undefined : -1}
            >
              <span>{settingsLabel}</span>
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <p className="mono-label text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            {statusLabel}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
