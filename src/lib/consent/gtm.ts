'use client';

/**
 * Google Tag Manager — container lifecycle + event helpers.
 *
 * Design decision: the container ALWAYS loads (after `load` or the first
 * interaction), but only behind the consent default from `bootstrap.ts`.
 * That is exactly the model Consent Mode v2 is designed for:
 * Google may model at the configuration level while all storage and ad
 * signals stay `denied` — tags then write no cookies.
 *
 * Important: this is NOT an exception to "data-processing services only after
 * consent". The container itself is pure configuration; it is the tags inside
 * that process data, and those are blocked by the default signal.
 * The rule "no analytics requests without consent" therefore stays intact —
 * verified in the live check (no request to
 * google-analytics.com without `analytics_storage: granted`).
 */

import { getStoredConsent, saveConsent, type ConsentChoice } from './consent';

/** dataLayer entry: command array (gtag) or event object (GTM). */
export type DataLayerEntry = unknown[] | Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: GtagCommand;
  }
}

/** Signature of the official gtag() stub (variadic). */
export type GtagCommand = (command: string, ...args: unknown[]) => void;

export type TrackParams = Record<string, string | number | boolean | undefined>;

const GTM_SRC = 'https://www.googletagmanager.com/gtm.js';

let containerId = '';
let containerLoaded = false;
let consentState: ConsentChoice = { analytics: false, marketing: false };
let containerScheduled = false;

function ensureDataLayer(): DataLayerEntry[] {
  const layer = (window.dataLayer = window.dataLayer ?? []);
  return layer;
}

function push(entry: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  ensureDataLayer().push(entry);
}

/** gtag command form: `[command, action, payload]` as a dataLayer array. */
function gtag(command: string, action: string, payload: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  ensureDataLayer().push([command, action, payload]);
}

/** Inject the container only once; without an ID the helpers stay no-ops. */
function loadContainer(): void {
  if (typeof document === 'undefined' || containerLoaded || !containerId) return;
  containerLoaded = true;
  push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `${GTM_SRC}?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
}

/**
 * Load after `load` OR the first interaction, whichever happens first —
 * spares the LCP (no GTM in the critical path), but starts at the latest on
 * the first user interaction. Matches `wait_for_update: 500` from the default.
 */
function scheduleContainerLoad(): void {
  if (typeof window === 'undefined' || !containerId || containerScheduled) return;
  containerScheduled = true;

  let fired = false;
  const load = () => {
    if (fired) return;
    fired = true;
    window.removeEventListener('load', load);
    window.removeEventListener('pointerdown', load);
    window.removeEventListener('keydown', load);
    window.removeEventListener('touchstart', load);
    loadContainer();
  };

  if (document.readyState === 'complete') {
    load();
    return;
  }
  window.addEventListener('load', load, { once: true });
  window.addEventListener('pointerdown', load, { once: true, passive: true });
  window.addEventListener('keydown', load, { once: true, passive: true });
  window.addEventListener('touchstart', load, { once: true, passive: true });
}

/** Idempotent start: adopt the stored state + schedule the container. */
export function initGtm(gtmId: string): void {
  if (!gtmId) return;
  containerId = gtmId;
  const stored = getStoredConsent();
  if (stored) {
    consentState = { analytics: stored.analytics, marketing: stored.marketing };
  }
  scheduleContainerLoad();
}

/**
 * Apply a decision: persist it (optional — on rehydration it is already in
 * storage) and push it to the dataLayer as `consent`/`update`.
 */
export function applyConsent(choice: ConsentChoice, persist = true): void {
  consentState = { analytics: choice.analytics, marketing: choice.marketing };
  if (persist) saveConsent(consentState);
  if (typeof window === 'undefined') return;

  const signal = (granted: boolean): 'granted' | 'denied' => (granted ? 'granted' : 'denied');
  gtag('consent', 'update', {
    ad_storage: signal(choice.marketing),
    ad_user_data: signal(choice.marketing),
    ad_personalization: signal(choice.marketing),
    analytics_storage: signal(choice.analytics),
    functionality_storage: 'granted',
    security_storage: 'granted',
  });

  // Load the container now in case the decision came before the load trigger.
  loadContainer();
}

export function getConsentState(): ConsentChoice {
  return { ...consentState };
}

/** Only send an event when at least one optional category has been granted. */
export function trackEvent(name: string, params: TrackParams = {}): void {
  if (typeof window === 'undefined') return;
  if (!consentState.analytics && !consentState.marketing) return;
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) cleaned[key] = value;
  }
  push({ event: name, ...cleaned });
}

let lastPageViewPath: string | null = null;

/**
 * SPA pageview: the App Router navigates client-side and GTM does not see
 * the change by itself. The container must therefore run without a
 * history-change trigger and with `send_page_view: false` in the GA4 tag —
 * otherwise the property double-counts. This guard additionally catches
 * re-renders and double effects.
 */
export function trackPageView(path: string): void {
  if (path === lastPageViewPath) return;
  lastPageViewPath = path;
  trackEvent('page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}
