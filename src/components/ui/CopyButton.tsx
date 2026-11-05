'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Copy-to-clipboard button.
 *
 * - Uses `navigator.clipboard` when available (secure context), otherwise the
 *   `document.execCommand('copy')` fallback with a temporary textarea.
 * - Where both fail (insecure context) the button is a silent no-op: no throw
 *   and no false "copied" state.
 * - Confirmation is announced through a separate `aria-live="polite"` region so
 *   the button keeps its own accessible name (label-content-name stays valid).
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
      // Graceful no-op: no false confirmation, no crash.
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
