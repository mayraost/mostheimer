'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Check, Copy } from 'lucide-react';
import type { Translation } from '@/payload-types';
import { useTranslationsOrNull } from '@/components/TranslationsProvider';
import { actionButtonClass } from './ActionLinkButton';

/**
 * Copy-to-clipboard button.
 *
 * - Uses `navigator.clipboard` when available (secure context), otherwise the
 *   `document.execCommand('copy')` fallback with a temporary textarea.
 * - Where both fail (insecure context) the button is a silent no-op: no throw
 *   and no false "copied" state — only the localized failure message is shown.
 * - Confirmation: the visible label swaps INLINE to the terminal line
 *   (`[ COPIED // 200 OK ]`, spec §3.4) for 2s while the button turns emerald.
 *   The accessible name is pinned via `aria-label` to the stable copy label, so
 *   it does not change under the user's focus; the full sentence is announced
 *   through a separate `role="status"` + `aria-live="polite"` region.
 * - This is an ADDITION next to a real link (e.g. a visible `mailto:` anchor);
 *   it never replaces it.
 *
 * Copy strings come from the translations global (`clipboard` group, DE/EN),
 * read through `TranslationsProvider` — so the copy stays server-rendered: the
 * button adds no extra bundle to pages that do not render an e-mail address.
 */

type ClipboardCopy = Translation['clipboard'];

/** Per-locale fallback copy (only for an instance without the CMS group). */
const FALLBACK: Record<'en' | 'de', Required<Omit<ClipboardCopy, 'id'>>> = {
  en: {
    copyLabel: 'Copy e-mail',
    copiedMessage: 'E-mail address copied to the clipboard',
    failedMessage: 'Copying failed — please select the address manually',
    copiedInline: '[ COPIED // 200 OK ]',
  },
  de: {
    copyLabel: 'E-Mail kopieren',
    copiedMessage: 'E-Mail-Adresse in die Zwischenablage kopiert',
    failedMessage: 'Kopieren nicht möglich — bitte Adresse manuell markieren',
    copiedInline: '[ KOPIERT // 200 OK ]',
  },
};

export function CopyButton({
  value,
  label,
  className = '',
}: {
  value: string;
  /** Optional explicit label — omit to use the `clipboard.copyLabel` group. */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const pathname = usePathname();
  // Nullable read: the block also renders on the 404 fallback chrome, where the
  // translations global may be unreachable (see SiteChrome `showConsent`).
  const translations = useTranslationsOrNull();

  // Per-field fallback: an instance whose global predates the group (or where
  // an editor cleared a field) still renders a complete button.
  const fallback = FALLBACK[pathname.split('/')[1] === 'de' ? 'de' : 'en'];
  const source = translations?.clipboard;
  const text = {
    copyLabel: label?.trim() || source?.copyLabel?.trim() || fallback.copyLabel,
    copiedMessage: source?.copiedMessage?.trim() || fallback.copiedMessage,
    failedMessage: source?.failedMessage?.trim() || fallback.failedMessage,
    copiedInline: source?.copiedInline?.trim() || fallback.copiedInline,
  };

  const copyLegacy = (input: string): boolean => {
    try {
      const area = document.createElement('textarea');
      area.value = input;
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
      setCopied(false);
      setFailed(true);
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={['flex items-center gap-2', className ? 'w-full' : ''].join(' ')}>
      <button
        type="button"
        onClick={handleCopy}
        // The visible label swaps to the terminal confirmation (spec §3.4),
        // so the accessible name is pinned to the stable copy label — it must
        // not change under the user's focus while the confirmation runs.
        aria-label={text.copyLabel}
        className={[
          actionButtonClass,
          className,
          // Emerald confirmation state: border, text and fill (no layout).
          copied ? 'border-primary bg-primary/10 text-primary' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        <span aria-hidden={copied ? 'true' : undefined}>
          {copied ? text.copiedInline : text.copyLabel}
        </span>
      </button>
      {/* Result announcement only — the visible label changes, so the stable
          spoken confirmation stays available to screen readers here. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? text.copiedMessage : failed ? text.failedMessage : ''}
      </span>
    </span>
  );
}
