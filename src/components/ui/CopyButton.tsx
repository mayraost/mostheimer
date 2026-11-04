'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Copy-to-Clipboard-Button (Spec §2.3).
 *
 * - `navigator.clipboard` wenn verfuegbar (secure context), sonst
 *   `document.execCommand('copy')`-Fallback mit temporaerem textarea.
 * - In insecure contexts, wo BEIDE Wege scheitern, bleibt der Button ein
 *   stiller No-op (kein Fehler-Throw, kein falsches "Kopiert").
 * - Rueckmeldung ueber eine separate `aria-live="polite"`-Region, damit
 *   Screenreader die Bestaetigung hoeren (label-content-name bleibt
 *   konsistent: der Button selbst behaelt seinen Namen).
 */
export function CopyButton({
  value,
  label = 'Kopieren',
  copiedLabel = 'Kopiert',
  className = '',
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copyLegacy = (text: string): boolean => {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-9999px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    setFailed(false);
    let ok = false;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        ok = copyLegacy(value);
      }
    } catch {
      ok = copyLegacy(value);
    }

    if (!ok) {
      // Graceful no-op: keine falsche Bestaetigung, kein Crash.
      setFailed(true);
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className={[
          'mono-label inline-flex min-h-9 items-center gap-2 rounded-[6px] border border-border bg-surface-raised px-3 text-foreground transition-colors hover:border-primary hover:text-primary',
          className,
        ].join(' ')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {copied ? copiedLabel : label}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : failed ? 'Kopieren nicht möglich' : ''}
      </span>
    </span>
  );
}
