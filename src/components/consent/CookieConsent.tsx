'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import type { Translation } from '@/payload-types';
import { useTranslations } from '@/components/TranslationsProvider';
import { getLegacyCopy } from '@/lib/translations';
import { safeHrefOrNull } from '@/lib/safeHref';
import {
  CONSENT_OPEN_EVENT,
  applyConsent,
  getStoredConsent,
  initGtm,
  trackPageView,
  type ConsentChoice,
} from '@/lib/consent';

/**
 * Cookie consent banner (Consent Mode v2).
 *
 * GDPR requirements baked into the implementation:
 * - "Accept all" and "Only necessary" are styled identically and have the
 *   same size (no dark pattern, rejecting is equally easy).
 * - Opting out needs no extra click in a submenu: both buttons sit right next
 *   to the toggles.
 * - Esc does not weaken anything: a decision is mandatory, so Esc moves focus
 *   to "Only necessary" and closes NOTHING.
 * - Every choice can be changed at any time (footer link, which dispatches
 *   `CONSENT_OPEN_EVENT`).
 * - No layout shift: the banner is `position: fixed` at the bottom and only
 *   renders after mount, so first-paint placement is unaffected.
 *
 * Copy comes from the translations global (DE/EN, editable in the CMS); no
 * hard-coded sentence lives here.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared classes of all three actions: identical size, identical weight —
 * rejecting must not be harder to reach or look less attractive than
 * accepting (GDPR/EDPB: no dark patterns).
 */
const ACTION_CLASS =
  'mono-label inline-flex min-h-11 flex-1 items-center justify-center rounded-[6px] border border-border-strong bg-surface-raised px-5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Hydration probe: constant snapshot, no external subscription needed. */
const subscribeNoop = () => () => {};

/** Banner text fields — shape of the translations global (`cookies`). */
type CookieConsentCopy = Omit<NonNullable<Translation['cookies']>, 'id'>;

interface CookieConsentProps {
  /** GTM container ID (`NEXT_PUBLIC_GTM_ID`); empty = no GTM, banner remains. */
  gtmId?: string;
}

/** Toggle switch — real checkbox input, visible label text stays clickable. */
function Toggle({
  id,
  checked,
  disabled,
  title,
  description,
  onChange,
  badge,
}: {
  id: string;
  checked: boolean;
  disabled: boolean;
  title: string;
  description: string;
  onChange?: (next: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[6px] border border-border bg-surface-raised/50 p-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={`${id}-description`}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
      />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer select-none">
        <span className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge ? <span className="mono-label text-primary">{badge}</span> : null}
        </span>
        <span
          id={`${id}-description`}
          className="block text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </span>
      </label>
    </div>
  );
}

export function CookieConsent({ gtmId = '' }: CookieConsentProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // One storage read for the initial toggle/decision state. `localStorage` is
  // unavailable during SSR, hence the `typeof window` guard.
  const [initialStored] = useState(() =>
    typeof window === 'undefined' ? null : getStoredConsent(),
  );
  // Toggle state mirrors the stored decision from the very first client render,
  // so a reopen (footer link) never shows stale values and "Save selection"
  // cannot silently change anything.
  const [analytics, setAnalytics] = useState(initialStored?.analytics ?? false);
  const [marketing, setMarketing] = useState(initialStored?.marketing ?? false);
  // `undecided` is the ONLY trigger for the automatic banner: true while no
  // stored decision exists, cleared by `decide()`. Previously `open` alone was
  // combined with an `initialConsent === undefined` term, which stayed true
  // forever on a first visit — so a click saved the decision but the banner
  // never closed.
  const [undecided, setUndecided] = useState(initialStored === null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const rejectRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Prepare GTM. `open` alone decides whether the banner appears after that —
  // no layout shift, the element is `fixed`.
  useEffect(() => {
    if (!gtmId) return;
    initGtm(gtmId);
  }, [gtmId]);

  // Reopen via footer link / privacy page — toggle state mirrors the current
  // decision so "Save selection" never changes anything silently.
  useEffect(() => {
    const handleOpen = () => {
      const stored = getStoredConsent();
      setAnalytics(stored?.analytics ?? false);
      setMarketing(stored?.marketing ?? false);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  // SPA pageview: every path change is a page view of its own.
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Focus the dialog (not an action — that would suggest a choice). Remember
  // the previous focus and restore it on close. Focus only on the TRANSITION
  // to open: otherwise every toggle press would pull focus out of the toggle.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else if (!open && wasOpen.current) {
      previouslyFocused.current?.focus?.();
    }
    wasOpen.current = open;
  }, [open]);

  const decide = useCallback((choice: ConsentChoice) => {
    applyConsent(choice);
    setAnalytics(choice.analytics);
    setMarketing(choice.marketing);
    // Clearing `undecided` is what actually closes the banner: `open` alone
    // cannot, because the auto-open term was still true. Both are set so a
    // later reopen (footer link) keeps working.
    setUndecided(false);
    setOpen(false);
    // Track the decision screen's page view — no tracking was allowed before,
    // in case the visitor landed directly here.
    trackPageView(`${window.location.pathname}${window.location.search}`);
  }, []);

  const closeIfDecided = useCallback(() => {
    // Same rule as `decide`: the auto-open term must be cleared, otherwise the
    // banner stays visible even though a decision exists.
    if (getStoredConsent()) {
      setUndecided(false);
      setOpen(false);
    }
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      // No silent dismissal: a decision is mandatory. Esc leads to the most
      // conservative option.
      event.preventDefault();
      event.stopPropagation();
      rejectRef.current?.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const node = dialogRef.current;
    if (!node) return;
    const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.offsetParent !== null && element.tabIndex !== -1,
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  // Visibility: open automatically after hydration while no decision exists —
  // otherwise only on explicit open (footer link). `useSyncExternalStore`
  // returns `false` during SSR and `true` after hydration (own snapshot, no
  // effect-setState → no CLS: the dialog is `position: fixed`).
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const visible = mounted && (open || undecided);
  if (!visible) return null;

  /*
   * Copy comes exclusively from the `cookies` group (rule since 08.11.2026 —
   * no hardcoded fallback table). A field an editor cleared renders empty; the
   * banner keeps its structure, and the gap is visible in review instead of
   * being masked by a stale English sentence.
   */
  const copy: CookieConsentCopy = {
    eyebrow: getLegacyCopy(t, 'cookies.eyebrow'),
    title: getLegacyCopy(t, 'cookies.title'),
    description: getLegacyCopy(t, 'cookies.description'),
    privacyLabel: getLegacyCopy(t, 'cookies.privacyLabel'),
    privacyLink: safeHrefOrNull(getLegacyCopy(t, 'cookies.privacyLink')),
    necessaryLabel: getLegacyCopy(t, 'cookies.necessaryLabel'),
    necessaryDescription: getLegacyCopy(t, 'cookies.necessaryDescription'),
    necessaryBadge: getLegacyCopy(t, 'cookies.necessaryBadge'),
    analyticsLabel: getLegacyCopy(t, 'cookies.analyticsLabel'),
    analyticsDescription: getLegacyCopy(t, 'cookies.analyticsDescription'),
    marketingLabel: getLegacyCopy(t, 'cookies.marketingLabel'),
    marketingDescription: getLegacyCopy(t, 'cookies.marketingDescription'),
    rejectAll: getLegacyCopy(t, 'cookies.rejectAll'),
    saveSelection: getLegacyCopy(t, 'cookies.saveSelection'),
    acceptAll: getLegacyCopy(t, 'cookies.acceptAll'),
    settingsLink: getLegacyCopy(t, 'cookies.settingsLink'),
  } as CookieConsentCopy;
  const titleId = 'cookie-consent-title';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="pointer-events-auto w-full max-w-2xl rounded-lg border border-border bg-surface/95 shadow-xl backdrop-blur outline-none supports-[backdrop-filter]:bg-surface/90"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <p className="mono-label flex items-center gap-2 text-primary">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              />
              {copy.eyebrow}
            </p>
            <h2
              id={titleId}
              className="font-heading text-lg font-bold tracking-tight text-foreground"
            >
              {copy.title}
            </h2>
            <p
              id={`${titleId}-description`}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {copy.description}{' '}
              {copy.privacyLink ? (
                <a
                  href={copy.privacyLink}
                  onClick={closeIfDecided}
                  className="text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  {copy.privacyLabel}
                </a>
              ) : (
                copy.privacyLabel
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Toggle
              id="consent-necessary"
              checked
              disabled
              title={copy.necessaryLabel}
              description={copy.necessaryDescription}
              badge={copy.necessaryBadge}
            />
            <Toggle
              id="consent-analytics"
              checked={analytics}
              disabled={false}
              title={copy.analyticsLabel}
              description={copy.analyticsDescription}
              onChange={setAnalytics}
            />
            <Toggle
              id="consent-marketing"
              checked={marketing}
              disabled={false}
              title={copy.marketingLabel}
              description={copy.marketingDescription}
              onChange={setMarketing}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
            <button
              ref={rejectRef}
              type="button"
              onClick={() => decide({ analytics: false, marketing: false })}
              className={`${ACTION_CLASS} text-foreground hover:border-primary`}
            >
              {copy.rejectAll}
            </button>
            <button
              type="button"
              onClick={() => decide({ analytics, marketing })}
              className={`${ACTION_CLASS} text-foreground hover:border-primary`}
            >
              {copy.saveSelection}
            </button>
            <button
              type="button"
              onClick={() => decide({ analytics: true, marketing: true })}
              className={`${ACTION_CLASS} text-foreground hover:border-primary`}
            >
              {copy.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
