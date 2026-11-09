'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, CornerDownLeft } from 'lucide-react';
import { useTranslations } from '../TranslationsProvider';

export type CommandItem = {
  /** Stable id (page slug plus optional anchor). */
  id: string;
  /** Display label, e.g. "Case Studies". */
  label: string;
  /** Target path without locale, e.g. "/case-studies" or "#architektur". */
  href: string;
  /** Group in the result list. */
  group: string;
  /** Optional search terms (synonyms, German and English). */
  keywords?: string[];
};

/**
 * Command palette (⌘K / Ctrl+K).
 *
 * A11y contract:
 * - `role="dialog" aria-modal="true"` labelled by the title.
 * - Focus moves into the search field on open and returns to the trigger on
 *   close.
 * - Focus trap: Tab/Shift+Tab cycle within the dialog.
 * - ↑/↓ move the active option (`aria-activedescendant`), Enter opens, Esc
 *   closes; the result count is announced via `aria-live="polite"`.
 * - The dialog exists in the DOM only while open, so there is no offscreen
 *   focus and no layout overflow.
 */
const isSubsequence = (needle: string, haystack: string): boolean => {
  if (!needle) return true;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
    if (haystack[j] === needle[i]) i += 1;
  }
  return i === needle.length;
};

export function CommandPalette({ locale, items }: { locale: string; items: CommandItem[] }) {
  const router = useRouter();
  const t = useTranslations().commandPalette;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    const trigger = triggerRef.current as HTMLElement | null;
    trigger?.focus?.();
  }, []);

  const openPalette = useCallback(() => {
    triggerRef.current = document.activeElement;
    setOpen(true);
  }, []);

  // Global shortcuts: ⌘K / Ctrl+K toggles; "/" only opens outside input fields
  // so typing in a form never steals focus.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandK = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);
      if (isCommandK) {
        event.preventDefault();
        setOpen((prev) => {
          if (!prev) triggerRef.current = document.activeElement;
          return !prev;
        });
        return;
      }
      if (event.key === 'Escape') {
        setOpen((prev) => {
          if (prev) {
            const trigger = triggerRef.current as HTMLElement | null;
            trigger?.focus?.();
          }
          return false;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus on open plus scroll lock.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items
      .map((item) => {
        const haystack = [item.label, item.group, ...(item.keywords ?? [])].join(' ').toLowerCase();
        const label = item.label.toLowerCase();
        let score = 0;
        if (label.startsWith(q)) score = 3;
        else if (label.includes(q)) score = 2;
        else if (haystack.includes(q)) score = 1;
        else if (isSubsequence(q, haystack)) score = 0.5;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of results) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [results]);

  // Flat order for the active option (stable across groups).
  const flat = useMemo(() => grouped.flatMap(([, groupItems]) => groupItems), [grouped]);

  // Clamped index without an effect: when the result list shrinks with the
  // query, the active entry stays in range.
  const effectiveIndex = flat.length === 0 ? 0 : Math.min(activeIndex, flat.length - 1);

  const run = useCallback(
    (item: CommandItem) => {
      const isAnchor = item.href.startsWith('#');
      const target = isAnchor ? item.href : `/${locale}${item.href}`;
      close();
      if (isAnchor) {
        // Anchor on the same page: smooth-scroll and move focus (a11y).
        const el = document.querySelector(item.href);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (el as HTMLElement | null)?.focus?.({ preventScroll: true });
      } else {
        router.push(target);
      }
    },
    [close, locale, router],
  );

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (flat.length ? (prev + 1) % flat.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (flat.length ? (prev - 1 + flat.length) % flat.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flat[effectiveIndex];
      if (item) run(item);
    } else if (event.key === 'Tab') {
      // Focus trap: only elements inside the dialog.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
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
    }
  };

  // Scroll the active option into view without shifting the page layout.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [effectiveIndex, open]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="mono-label group hidden h-9 items-center gap-2 rounded-[6px] border border-border bg-surface-raised/60 px-3 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground md:inline-flex"
        aria-label={t.triggerLabel}
        aria-haspopup="dialog"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden lg:inline">{t.triggerText}</span>
        {/* The keycap is decoration: without `aria-hidden` the "K" becomes part
            of the button's accessible name ("SearchK — …"). */}
        <kbd
          aria-hidden="true"
          className="ml-1 inline-flex items-center gap-0.5 rounded-[3px] border border-border-strong px-1 py-0.5 font-mono text-[10px] text-muted-foreground"
        >
          <Command className="h-2.5 w-2.5" aria-hidden="true" />K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={openPalette}
        className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised/60 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground md:hidden"
        aria-label={t.triggerLabel}
        aria-haspopup="dialog"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-background/80 p-4 backdrop-blur-sm sm:pt-[12vh]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
            onKeyDown={onListKeyDown}
            className="w-full max-w-xl overflow-hidden rounded-[8px] border border-border-strong bg-surface shadow-[0_0_60px_-20px_rgba(16,185,129,0.5)]"
          >
            <h2 id="command-palette-title" className="sr-only">
              {t.title}
            </h2>

            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder={t.placeholder}
                aria-label={t.searchLabel}
                aria-controls="command-palette-results"
                aria-activedescendant={
                  flat[effectiveIndex] ? `command-option-${flat[effectiveIndex].id}` : undefined
                }
                role="combobox"
                aria-expanded="true"
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="mono-label shrink-0 rounded-[3px] border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                esc
              </kbd>
            </div>

            <p aria-live="polite" className="sr-only">
              {results.length} {t.resultCount}
              {results.length === 1 ? '' : t.resultCountPlural}
            </p>

            <ul
              ref={listRef}
              id="command-palette-results"
              role="listbox"
              aria-label={t.resultsLabel}
              className="max-h-[min(60vh,28rem)] overflow-y-auto p-2"
            >
              {grouped.length === 0 && (
                <li className="mono-label px-3 py-6 text-center text-muted-foreground">
                  {t.emptyLabel}
                </li>
              )}
              {grouped.map(([group, groupItems]) => (
                <li key={group}>
                  <p className="mono-label px-3 pb-1 pt-3 text-muted-foreground">
                    {group === 'pages' ? t.groupPages : t.groupSections}
                  </p>
                  <ul>
                    {groupItems.map((item) => {
                      const index = flat.indexOf(item);
                      const active = index === effectiveIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            id={`command-option-${item.id}`}
                            role="option"
                            aria-selected={active}
                            data-active={active}
                            tabIndex={-1}
                            onClick={() => run(item)}
                            onMouseMove={() => setActiveIndex(index)}
                            className={[
                              // §3.5: active entry gets a 2px emerald indicator
                              // bar on the left plus a background lift. The bar is
                              // a box-shadow inset, so toggling it never reflows.
                              'flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-left transition-colors duration-150 ease-out-quart',
                              active
                                ? 'bg-[rgba(255,255,255,0.04)] text-foreground shadow-[inset_2px_0_0_0_var(--color-primary)]'
                                : 'text-muted-foreground hover:bg-surface-raised',
                            ].join(' ')}
                          >
                            <span className="truncate text-sm">{item.label}</span>
                            {active && (
                              <CornerDownLeft
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <span className="mono-label text-[10px] text-muted-foreground">{t.hintNavigate}</span>
              <span className="mono-label text-[10px] text-muted-foreground">{t.hintOpen}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
