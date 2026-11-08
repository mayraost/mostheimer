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
/**
 * Copy for the error card. Resolved by the CALLER (a server boundary awaits the
 * translations global, `routes.error.*`) and passed in — this component is a
 * client component and may not await the translations cache. There is no local
 * copy table any more: a missing value renders an empty line, never a
 * hardcoded sentence.
 */
export type ErrorScreenCopy = {
  code: string;
  title: string;
  message: string;
  home: string;
  retry: string;
};

export function ErrorScreen({
  error,
  reset,
  copy,
}: {
  error: unknown;
  reset: () => void;
  copy: ErrorScreenCopy;
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Server errors arrive with a generic message + digest in production.
    console.error('[error-boundary]', error);
  }, [error]);

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
