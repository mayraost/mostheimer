'use client';

import React, { createContext, useContext } from 'react';
import type { Translation } from '@/payload-types';
import type { ErrorScreenCopy } from '@/components/layout/ErrorScreen';

/**
 * Client-side access to the resolved translations global.
 *
 * The provider receives the SAME global the server reads (cached, translations
 * tag), so client components resolve copy with the pure readers from
 * `src/lib/translations.ts` — no `'use cache'` import crosses the boundary.
 *
 * `errorCopy` is a separate, pre-resolved bundle: the error boundaries are
 * client components rendered OUTSIDE the page tree and cannot await the cache,
 * while their copy must still be available when the CMS read itself failed
 * (that is frequently the cause of the error). The layout resolves it once and
 * passes it down; a missing value yields `null` and the boundary renders the
 * card structure without words instead of throwing again.
 */
const TranslationsContext = createContext<Translation | null>(null);
const ErrorCopyContext = createContext<ErrorScreenCopy | null>(null);

export function TranslationsProvider({
  translations,
  errorCopy,
  children,
}: {
  translations: Translation;
  /** Resolved `routes.error.*` bundle for the error boundaries. */
  errorCopy?: ErrorScreenCopy | null;
  children: React.ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={translations}>
      <ErrorCopyContext.Provider value={errorCopy ?? null}>{children}</ErrorCopyContext.Provider>
    </TranslationsContext.Provider>
  );
}

export function useTranslations(): Translation {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
}

/**
 * Non-throwing variant for components that also render on paths without CMS
 * reachability (e.g. the 404 fallback chrome). Callers MUST handle a missing
 * context; it is a data condition, not a programming error.
 */
export function useTranslationsOrNull(): Translation | null {
  return useContext(TranslationsContext);
}

/** Error-card copy resolved by the layout (see the provider docs above). */
export function useErrorCopy(): ErrorScreenCopy | null {
  return useContext(ErrorCopyContext);
}
