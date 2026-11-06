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
 * - Confirmation is announced through a separate `role="status"` +
 *   `aria-live="polite"` region so the button keeps its own accessible name
 *   (label-content-name stays valid).
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
  },
  de: {
    copyLabel: 'E-Mail kopieren',
    copiedMessage: 'E-Mail-Adresse in die Zwischenablage kopiert',
    failedMessage: 'Kopieren nicht möglich — bitte Adresse manuell markieren',
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
        className={[actionButtonClass, className].join(' ')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        {text.copyLabel}
      </button>
      {/* Result announcement only — the visible label never changes, so the
          button's accessible name stays stable across states. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? text.copiedMessage : failed ? text.failedMessage : ''}
      </span>
    </span>
  );
}
