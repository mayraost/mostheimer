'use client';

import React, { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationsData = any;

const TranslationsContext = createContext<TranslationsData>(null);

export function TranslationsProvider({
  translations,
  children,
}: {
  translations: TranslationsData;
  children: React.ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={translations}>{children}</TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
}
