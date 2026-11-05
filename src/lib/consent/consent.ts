/**
 * Consent store + Google Consent Mode v2 bridge (client-only).
 *
 * Separation of concerns:
 * - `consent.ts` (this module): persist/read the decision, TCF-free
 *   categories (necessary/analytics/marketing), dataLayer pushes.
 * - `gtm.ts`: container lifecycle + event helpers (trackEvent/trackPageView).
 * - `bootstrap.ts`: serialised inline script for the <head> (the default
 *   MUST be pushed before the GTM container — Consent Mode is order-critical:
 *   tags that fire before the default are evaluated as "granted").
 *
 * Categories:
 * - `necessary`  — always granted, cannot be opted out (§ 25(2) no. 2 TDDDG).
 * - `analytics`  — GTM/Analytics (`analytics_storage`).
 * - `marketing`  — ads/remarketing (`ad_storage`, `ad_user_data`,
 *                  `ad_personalization`). Unused today, but the
 *                  container may get tags later — consent is already
 *                  modelled correctly.
 */

export const CONSENT_STORAGE_KEY = 'mosthi.consent.v1';
export const CONSENT_OPEN_EVENT = 'mosthi:consent:open';

/** Fixed signal values of the Google Consent Mode signals. */
export type ConsentSignal = 'granted' | 'denied';

/** Selectable categories (without `necessary` — that one is always granted). */
export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

/** Value persisted in localStorage. `version` allows later migration. */
export interface StoredConsent extends ConsentChoice {
  decidedAt: string;
  version: 1;
}

/** Payload of the `gtag('consent', …)` call for Consent Mode v2. */
export interface ConsentPayload {
  ad_storage: ConsentSignal;
  ad_user_data: ConsentSignal;
  ad_personalization: ConsentSignal;
  analytics_storage: ConsentSignal;
  functionality_storage: ConsentSignal;
  security_storage: ConsentSignal;
}

export type ConsentDefaults = Omit<ConsentPayload, 'wait_for_update'> & {
  wait_for_update: number;
};

/**
 * Default state BEFORE any decision: everything advertising and analytics
 * denied, purely functional storage (theme, the consent choice itself) granted.
 * `wait_for_update: 500` gives GTM 500 ms to process an already stored
 * decision before tags are evaluated.
 */
export const CONSENT_DEFAULT_PAYLOAD: ConsentDefaults = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500,
};

/** Consent Mode update built from a stored/user-selected choice. */
export function buildConsentUpdate(choice: ConsentChoice): ConsentPayload {
  const marketingSignal: ConsentSignal = choice.marketing ? 'granted' : 'denied';
  return {
    ad_storage: marketingSignal,
    ad_user_data: marketingSignal,
    ad_personalization: marketingSignal,
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    // Functional/security stay technically necessary and therefore always granted.
    functionality_storage: 'granted',
    security_storage: 'granted',
  };
}

/**
 * Defensive parsing: anything that does not exactly match the expected shape
 * counts as "no decision" → the banner shows again (no silently reusing broken
 * data, e.g. after a schema change).
 */
export function parseStoredConsent(raw: string | null): StoredConsent | null {
  if (raw == null || raw === '') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed == null) return null;
  const candidate = parsed as Partial<Record<keyof StoredConsent, unknown>>;
  if (candidate.version !== 1) return null;
  if (typeof candidate.analytics !== 'boolean') return null;
  if (typeof candidate.marketing !== 'boolean') return null;
  if (typeof candidate.decidedAt !== 'string' || Number.isNaN(Date.parse(candidate.decidedAt))) {
    return null;
  }
  return {
    analytics: candidate.analytics,
    marketing: candidate.marketing,
    decidedAt: candidate.decidedAt,
    version: 1,
  };
}

/** Stored decision from localStorage (null = not decided yet). */
export function getStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    // Private mode / blocked storage → treat as "not decided".
    return null;
  }
}

/** Persist the decision (browser-local only, no server round-trip). */
export function saveConsent(choice: ConsentChoice): StoredConsent {
  const value: StoredConsent = {
    analytics: choice.analytics,
    marketing: choice.marketing,
    decidedAt: new Date().toISOString(),
    version: 1,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage full/blocked: the decision applies for this session.
    }
  }
  return value;
}

/** Modal trigger for cookie settings (footer link, privacy page). */
export function openConsentSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
