/**
 * Public API of the consent layer. Client components import from
 * `@/lib/consent` — never from the individual files (single entry point).
 */
export {
  CONSENT_DEFAULT_PAYLOAD,
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  buildConsentUpdate,
  getStoredConsent,
  openConsentSettings,
  parseStoredConsent,
  saveConsent,
  type ConsentChoice,
  type ConsentPayload,
  type ConsentSignal,
  type StoredConsent,
} from './consent';

export {
  applyConsent,
  getConsentState,
  initGtm,
  trackEvent,
  trackPageView,
  type TrackParams,
} from './gtm';
