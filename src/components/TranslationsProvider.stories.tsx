'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { getLegacyCopy, getTranslation } from '@/lib/translations';
import type { Translation } from '@/payload-types';
import { useErrorCopy, useTranslations, useTranslationsOrNull } from './TranslationsProvider';

/**
 * `TranslationsProvider` reicht das aufgelöste `translations`-Global in den
 * Client. Er hält **keine** eigene Copy-Tabelle: Client-Komponenten lesen mit
 * den reinen Readern aus `src/lib/translations.ts` (`getTranslation`,
 * `getLegacyCopy`), die dieselbe Auflösungskette benutzen wie der Server
 * (CMS-Zeile → Legacy-Spalte → Registry-Seed).
 *
 * Drei Contexts, drei Verträge:
 *
 * - `useTranslations()` — wirft ohne Provider. Fehlender Provider ist ein
 *   Programmierfehler, kein Datenzustand.
 * - `useTranslationsOrNull()` — gibt `null` zurück. Für Pfade, die auch ohne
 *   CMS laufen müssen (404-Fallback-Chrome); der Aufrufer behandelt das.
 * - `useErrorCopy()` — separat voraufgelöstes `routes.error.*`-Bundle für die
 *   Error-Boundaries, die nicht `await`en können. `null` ist hier **normal**
 *   (der Decorator setzt kein `errorCopy`) und bedeutet: die Karte rendert
 *   ihre Struktur ohne Worte, statt erneut zu werfen.
 *
 * Die Story ist eine Consumer-Demo — den Provider stellt der globale Decorator
 * mit `mockTranslations` aus `src/stories/mockTranslations.ts`.
 */

const hasCopyRow = (translations: Translation, key: string): boolean =>
  (translations.copy ?? []).some((row) => row.key === key);

const EMPTY = '(leer)';

/** Auflösungskette an drei echten Adressen: CMS-Zeile, Legacy-Spalte, Seed. */
function CopyResolutionTable() {
  const translations = useTranslations();

  const copyRows = (['chrome.brandClaim', 'routes.project.storybookCta'] as const).map((key) => ({
    address: key,
    value: getTranslation(translations, key),
    source: hasCopyRow(translations, key) ? 'CMS-Zeile (copy[])' : 'Registry-Seed (COPY_KEYS)',
  }));

  const legacyRows = (
    [
      { address: 'cookies.title', key: 'cookies.title' },
      { address: 'footer.rightsReserved', key: 'footer.rightsReserved' },
    ] as const
  ).map(({ address, key }) => ({
    address,
    value: getLegacyCopy(translations, key),
    source: 'Legacy-Spalte (Gruppe)',
  }));

  return (
    <dl className="border-border divide-border divide-y border-y">
      {[...copyRows, ...legacyRows].map((row) => (
        <div key={row.address} className="flex flex-col gap-1 py-2">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <dt className="font-mono text-xs text-muted-foreground">{row.address}</dt>
            <dd className="text-sm text-foreground">{row.value || EMPTY}</dd>
          </div>
          <dd className="mono-label text-[10px] text-muted-foreground">{row.source}</dd>
        </div>
      ))}
    </dl>
  );
}

/** `useErrorCopy()` — in der Fixture absichtlich `null`. */
function ErrorCopyCard() {
  const errorCopy = useErrorCopy();

  return (
    <div className="border-border rounded-card border border-dashed p-4">
      <p className="font-mono text-xs text-muted-foreground">useErrorCopy()</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {errorCopy ? errorCopy.title : 'null — kein Fehler-Copy-Bundle im Context'}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Legitimer Zustand: die Error-Boundary rendert die Kartenstruktur ohne Worte. Sie darf hier
        nicht werfen — der fehlgeschlagene CMS-Read ist häufig die Ursache des Fehlers.
      </p>
    </div>
  );
}

/** Context-Verträge: vorhanden, optional vorhanden, absichtlich leer. */
function ContextTable() {
  const translations = useTranslations();
  const maybeTranslations = useTranslationsOrNull();
  const errorCopy = useErrorCopy();

  const rows = [
    {
      hook: 'useTranslations()',
      value: translations.cookies.title,
      hint: 'wirft ohne Provider — hier liefert die Fixture',
    },
    {
      hook: 'useTranslationsOrNull()',
      value: maybeTranslations ? 'Translation-Objekt' : 'null',
      hint: 'nicht-werfende Variante für 404-Fallback-Chrome',
    },
    {
      hook: 'useErrorCopy()',
      value: errorCopy ? errorCopy.code : 'null',
      hint: 'routes.error.*-Bundle; null ist erlaubt',
    },
  ];

  return (
    <dl className="border-border divide-border divide-y border-y">
      {rows.map((row) => (
        <div key={row.hook} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
          <dt className="w-56 shrink-0 font-mono text-xs text-muted-foreground">{row.hook}</dt>
          <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
          <dd className="text-xs text-muted-foreground">{row.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

const meta = {
  title: 'UI/TranslationsProvider',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Copy-Context für Client-Komponenten: `useTranslations()`, `useTranslationsOrNull()` und das separat voraufgelöste `useErrorCopy()`-Bundle. Die Story zeigt die Auflösungskette (CMS-Zeile → Legacy-Spalte → Seed) an echten Adressen.',
      },
    },
  },
} satisfies Meta;

export default meta;

/** Vollständige Consumer-Demo: Context-Verträge, Auflösungskette, Fehler-Copy. */
export const TranslationsConsumer: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8">
      <ContextTable />
      <CopyResolutionTable />
      <ErrorCopyCard />
    </div>
  ),
};

/** Nur die Auflösungskette — zeigt, woher ein Wert kommt und wo der Seed greift. */
export const CopyResolution: StoryObj = {
  name: 'Copy — Auflösungskette',
  render: () => (
    <div className="flex flex-col gap-4">
      <CopyResolutionTable />
      <p className="text-xs text-muted-foreground">
        <code className="text-primary">chrome.brandClaim</code> steht als Zeile in der Fixture,{' '}
        <code className="text-primary">routes.project.storybookCta</code> nicht — beide liefern
        Text, aber aus unterschiedlicher Quelle. Ein leerer Editor-Wert fällt ebenfalls auf den Seed
        zurück, damit die UI nie versehentlich blank wird.
      </p>
    </div>
  ),
};

/** Der `null`-Fall von `useErrorCopy()` als eigener Zustand. */
export const ErrorCopyMissing: StoryObj = {
  name: 'Error-Copy — kein Bundle',
  render: () => <ErrorCopyCard />,
};
