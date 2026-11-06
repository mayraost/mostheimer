'use client';

import { usePathname } from 'next/navigation';
import { ExternalLink, Phone } from 'lucide-react';
import type { Translation } from '@/payload-types';
import { useTranslationsOrNull } from '@/components/TranslationsProvider';
import { keyFactAction } from '@/lib/contactActions';
import { ActionLinkButton } from './ActionLinkButton';
import { CopyButton } from './CopyButton';

/**
 * The action row under a contact key-fact value. Which action applies is
 * derived from the DISPLAYED value (`keyFactAction`) — the CMS text stays the
 * single source of truth, so an editor never has to keep a second `tel:` or
 * profile URL in sync with the visible string.
 *
 * Localization: labels come from `translations.contactActions` (plus
 * `copyLabel` from `translations.clipboard`), read through
 * `TranslationsProvider` so the strings stay server-rendered. Per-field
 * fallbacks keep the buttons usable on the 404 fallback chrome, where the
 * provider may be absent (same contract as `CopyButton`).
 *
 * Renders `null` when the value is not a phone number, e-mail address or
 * profile host — a plain fact stays a plain fact.
 */

type ContactCopy = Translation['contactActions'];
type ClipboardCopy = Translation['clipboard'];
type Locale = 'en' | 'de';

/** Per-locale mirror of the CMS defaults (only for a missing group). */
const FALLBACK: Record<Locale, Required<Omit<ContactCopy, 'id'>>> = {
  en: {
    callLabel: 'Call',
    githubLabel: 'GitHub',
    linkedinLabel: 'LinkedIn',
    newTabHint: '(opens in a new tab)',
  },
  de: {
    callLabel: 'Anrufen',
    githubLabel: 'GitHub',
    linkedinLabel: 'LinkedIn',
    newTabHint: '(öffnet in einem neuen Tab)',
  },
};

const COPY_FALLBACK: Record<Locale, string> = {
  en: 'Copy e-mail',
  de: 'E-Mail kopieren',
};

const pick = (value: string | null | undefined, fallback: string): string =>
  value?.trim() || fallback;

const ICON = 'h-3.5 w-3.5 shrink-0';

export function KeyFactActionButton({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  const pathname = usePathname();
  const translations = useTranslationsOrNull();
  const locale: Locale = pathname.split('/')[1] === 'de' ? 'de' : 'en';
  const fallback = FALLBACK[locale];
  const source: ContactCopy | undefined = translations?.contactActions;
  const clipboard: ClipboardCopy | undefined = translations?.clipboard;

  const action = keyFactAction(value);
  if (!action) return null;

  switch (action.kind) {
    case 'copy':
      return (
        <CopyButton
          value={action.value}
          label={pick(clipboard?.copyLabel, COPY_FALLBACK[locale])}
          className={className}
        />
      );
    case 'call':
      return (
        <ActionLinkButton
          href={action.href}
          className={className}
          icon={<Phone className={ICON} aria-hidden="true" />}
        >
          {pick(source?.callLabel, fallback.callLabel)}
        </ActionLinkButton>
      );
    case 'external': {
      const label: string =
        action.labelKey === null
          ? action.host
          : pick(source?.[action.labelKey], fallback[action.labelKey]);
      return (
        <ActionLinkButton
          href={action.href}
          className={className}
          target="_blank"
          rel="noopener noreferrer nofollow"
          icon={<ExternalLink className={ICON} aria-hidden="true" />}
        >
          {label}
          <span className="sr-only"> {pick(source?.newTabHint, fallback.newTabHint)}</span>
        </ActionLinkButton>
      );
    }
    default:
      return null;
  }
}
