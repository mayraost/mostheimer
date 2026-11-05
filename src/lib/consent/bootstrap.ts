import { CONSENT_DEFAULT_PAYLOAD, CONSENT_STORAGE_KEY, parseStoredConsent } from './consent';

/**
 * Inline bootstrap for the <head> — MUST come before any GTM script.
 *
 * Chain (deliberately as short as possible, it runs render-blocking):
 * 1. Initialise `window.dataLayer` + define the `gtag()` stub.
 * 2. Push the Consent Mode v2 default (everything optional denied).
 * 3. Read the stored decision (try/catch — private mode throws) and push it
 *    right away as `consent`/`update`. That way GTM sees returning visitors'
 *    consent before the container evaluates (Consent Mode is order-critical).
 *
 * The push uses an `arguments` object like Google's official gtag() stub.
 * Opt-in/opt-out signals are held as two-element constants and indexed at
 * runtime — no dynamic code, no user input (CSP-safe under
 * `script-src 'self' 'unsafe-inline'`, nonce-free, see next.config.ts).
 *
 * Only `parseStoredConsent.toString()` is embedded — a function without
 * closure references — so the client uses exactly the same parsing logic and
 * a drift bug cannot occur.
 */
export function buildConsentBootstrapScript(): string {
  return [
    '(function(){try{',
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){window.dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    `gtag('consent','default',${JSON.stringify(CONSENT_DEFAULT_PAYLOAD)});`,
    `var raw=null;try{raw=window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});}catch(e){}`,
    `var parsed=null;try{parsed=${parseStoredConsent.toString()}(raw);}catch(e){parsed=null;}`,
    'if(parsed){',
    'var c={analytics:parsed.analytics===true,marketing:parsed.marketing===true};',
    'var S=["denied","granted"];',
    'var u={"ad_storage":S[+c.marketing],"ad_user_data":S[+c.marketing],',
    '"ad_personalization":S[+c.marketing],"analytics_storage":S[+c.analytics],',
    '"functionality_storage":"granted","security_storage":"granted"};',
    'gtag("consent","update",u);',
    '}',
    '}catch(e){}})();',
  ].join('');
}
