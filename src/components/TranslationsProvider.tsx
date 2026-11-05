'use client';

import React, { createContext, useContext } from 'react';
import type { Translation } from '@/payload-types';

const TranslationsContext = createContext<Translation | null>(null);

export function TranslationsProvider({
  translations,
  children,
}: {
  translations: Translation;
  children: React.ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={translations}>{children}</TranslationsContext.Provider>
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
 * reachability (e.g. the 404 fallback chrome). Callers MUST have a fallback
 * copy; a missing context is a data condition, not a programming error.
 */
export function useTranslationsOrNull(): Translation | null {
  return useContext(TranslationsContext);
}
