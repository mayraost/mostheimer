'use client';

import { ErrorScreen } from '@/components/layout/ErrorScreen';
import { useErrorCopy } from '@/components/TranslationsProvider';

/**
 * Error boundary at route-group level (above the [locale] layout) — the safety
 * net for errors that escape the locale tree.
 *
 * The layout markup can be gone here (Next renders the error document), so only
 * the error card is rendered; the document shell is never duplicated (see
 * src/app/(frontend)/not-found.tsx for the same rule).
 *
 * Copy: the `TranslationsProvider` is usually still above this boundary (it is
 * mounted in the locale layout, and this file catches errors from deeper
 * segments). When it is genuinely absent — the root layout failed — the card
 * renders structurally intact without text instead of throwing again, and the
 * `global-error.tsx` last-resort page takes over for document-level failures.
 * The global is read with the `en` default locale, matching the previous
 * always-English behaviour without hardcoding strings.
 */
/** Structural fallback: the card renders, only the words are missing. */
const EMPTY_COPY = { code: '', title: '', message: '', home: '', retry: '' };

export default function GlobalError({ error, reset }: { error: unknown; reset: () => void }) {
  const errorCopy = useErrorCopy();

  return <ErrorScreen error={error} reset={reset} copy={errorCopy ?? EMPTY_COPY} />;
}
