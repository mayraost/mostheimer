import { buildConsentBootstrapScript } from './bootstrap';

/**
 * Consent Mode bootstrap for the <head>.
 *
 * Server component (no 'use client') so the script is guaranteed to appear
 * BEFORE all GTM/Next scripts in the markup: Consent Mode is order-critical —
 * a tag firing before `consent default` is evaluated as "granted" and
 * should not be.
 *
 * No `<noscript>` GTM iframe: Google recommends the JS-only path for Consent
 * Mode because the iframe fallback cannot receive consent signals without JS
 * (it loads the tags unfiltered). The container here only starts after
 * `load`/interaction anyway, so a noscript iframe would cover only the
 * scenario in which Consent Mode by definition does not apply. Deliberately
 * omitted.
 */
export function ConsentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: buildConsentBootstrapScript() }} />;
}
