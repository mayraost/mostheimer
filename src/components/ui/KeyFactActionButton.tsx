'use client';

import { ExternalLink, Phone } from 'lucide-react';
import { useTranslationsOrNull } from '@/components/TranslationsProvider';
import { getLegacyCopy } from '@/lib/translations';
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

/*
 * No per-locale fallback table (rule since 08.11.2026). Labels come from the
 * `contactActions` / `clipboard` groups through `getTranslation`. The one
 * exception is a PROPER NOUN: a profile whose host is unknown still needs a
 * visible name, so the host itself is the label (data, not copy).
 */
const ICON = 'h-3.5 w-3.5 shrink-0';

export function KeyFactActionButton({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  const translations = useTranslationsOrNull();

  const action = keyFactAction(value);
  if (!action) return null;

  switch (action.kind) {
    case 'copy':
      return <CopyButton value={action.value} className={className} />;
    case 'call':
      return (
        <ActionLinkButton
          href={action.href}
          className={className}
          icon={<Phone className={ICON} aria-hidden="true" />}
        >
          {getLegacyCopy(translations, 'contactActions.callLabel')}
        </ActionLinkButton>
      );
    case 'external': {
      const label: string =
        action.labelKey === null
          ? action.host
          : getLegacyCopy(translations, `contactActions.${action.labelKey}`);
      return (
        <ActionLinkButton
          href={action.href}
          className={className}
          target="_blank"
          rel="noopener noreferrer nofollow"
          icon={<ExternalLink className={ICON} aria-hidden="true" />}
        >
          {label}
          <span className="sr-only">
            {' '}
            {getLegacyCopy(translations, 'contactActions.newTabHint')}
          </span>
        </ActionLinkButton>
      );
    }
    default:
      return null;
  }
}
