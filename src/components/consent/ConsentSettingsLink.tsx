'use client';

import { CONSENT_OPEN_EVENT } from '@/lib/consent/consent';

/**
 * Footer-Link „Cookie-Einstellungen".
 *
 * Separate client component because `Footer` is a server component: an
 * `onClick` handler cannot be passed there. The link is a real `<button>` —
 * it opens a dialog and navigates nowhere, so `href="#"` would be a lie in
 * the markup (and must not jump without JS
 * ausloesen).
 *
 * Without JS the button is inert instead of crashing; the banner itself
 * is JS-bound anyway, so no `<noscript>` fallback is needed.
 */
export function ConsentSettingsLink({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className={
        className ??
        'mono-label cursor-pointer text-muted-foreground transition-colors hover:text-primary'
      }
    >
      {label}
    </button>
  );
}
