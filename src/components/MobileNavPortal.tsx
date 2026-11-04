'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';

type NavLink = {
  label: string;
  link: string;
  newTab?: boolean | null;
  id?: string | null;
};

/**
 * Mobile-Navigation als Portal-Dialog (Bugfix 04.11.2026).
 *
 * Warum Portal: der Trigger sitzt im `<header>`, das `position: sticky` ist.
 * Sticky (wie jedes transform/filter/contain) erzeugt einen Containing Block
 * UND einen Stacking Context — ein `fixed`-Nachfahre löst `inset-0` dann
 * gegen die HEADER-Box auf (64px hoch) statt gegen den Viewport. Ergebnis
 * war ein auf 64px geclippter Drawer, der hinter dem Content verschwand.
 * `createPortal(... , document.body)` löst den Dialog aus diesem Kontext.
 *
 * SSR-Guard: der Portal-Inhalt rendert erst nach dem Mount
 * (`useState(false)` → `useEffect`) — kein `document`-Zugriff beim SSR.
 *
 * Scroll-Lock (Issue 2): `position: fixed` am body mit negativem `top`
 * hält die Scroll-Position und überlebt mobile Browser-Chrome-Resizes
 * (dvh-Wechsel), anders als ein reiner `overflow: hidden`. Beim Schließen
 * werden ALLE Inline-Properties einzeln entfernt (`removeProperty`) und
 * die Scroll-Position wiederhergestellt — niemals `overflow: 'unset'`
 * schreiben, das würde das CSS `overflow-x: clip` überschreiben.
 */
export function MobileNavPortal({
  open,
  onClose,
  navLinks,
  title,
  closeLabel,
  statusLabel,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  title: string;
  closeLabel: string;
  statusLabel: string;
}) {
  // SSR-Guard ohne setState-im-Effect: erst nach der Hydration portalen.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll-Lock + Dialog-Verhalten in EINEM Effekt mit vollständigem Cleanup.
  useEffect(() => {
    if (!open || !mounted) return;

    const body = document.body;
    const scrollY = window.scrollY;

    // Werte VOR dem Lock sichern — wir stellen sie einzeln wieder her.
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

    // Fokus in den Dialog (Schließen-Button als stabilstes Ziel)
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

      // Inline-Properties einzeln zurücksetzen bzw. entfernen (nie 'unset').
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
      {/* Backdrop über den gesamten Viewport */}
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
            className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
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
            {navLinks.map((item, index) => (
              <li key={item.id || index}>
                <Link
                  href={item.link}
                  className="group flex items-center justify-between rounded-[6px] border border-transparent px-3 py-3 text-base font-medium text-foreground transition-colors hover:border-border hover:bg-surface-raised"
                  onClick={onClose}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                  tabIndex={open ? undefined : -1}
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
