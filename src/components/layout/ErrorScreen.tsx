'use client';

import { useEffect, useState } from 'react';
import { StatusScreen } from '@/components/layout/StatusScreen';

/**
 * Error boundary with the app's design — bilingual (DE/EN).
 *
 * Rendered by:
 * - `src/app/(frontend)/[locale]/error.tsx` (inside the locale layout: header
 *   and footer from the CMS stay visible, this only replaces the content)
 * - `src/app/(frontend)/error.tsx` (above the locale layout, English only)
 *
 * Error details are never shown (production-safe): the digest is only logged.
 */
export function ErrorScreen({
  error,
  reset,
  locale,
}: {
  error: unknown;
  reset: () => void;
  locale: 'de' | 'en';
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Server errors arrive with a generic message + digest in production.
    console.error('[error-boundary]', error);
  }, [error]);

  const copy =
    locale === 'de'
      ? {
          code: 'HTTP 500 · Fehler',
          title: 'Etwas ist schiefgelaufen',
          message:
            'Diese Seite konnte gerade nicht geladen werden. Bitte versuche es erneut — die Startseite ist immer erreichbar.',
          home: 'Zur Startseite',
          retry: 'Erneut versuchen',
        }
      : {
          code: 'HTTP 500 · Error',
          title: 'Something went wrong',
          message:
            'This page could not be loaded right now. Please try again — the home page is always reachable.',
          home: 'Back to home',
          retry: 'Try again',
        };

  return (
    <StatusScreen
      code={copy.code}
      title={copy.title}
      message={copy.message}
      primary={{ label: copy.home, href: '/' }}
      retry={
        <button
          type="button"
          disabled={retrying}
          onClick={() => {
            setRetrying(true);
            reset();
          }}
          className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] border border-border-strong bg-surface-raised px-6 text-foreground transition-colors hover:border-primary disabled:opacity-60"
        >
          {copy.retry}
        </button>
      }
    />
  );
}
