'use client';

import { ErrorScreen } from '@/components/layout/ErrorScreen';

/**
 * Error boundary at route-group level (above the [locale] layout) — the safety
 * net for errors that escape the locale tree, therefore ALWAYS ENGLISH.
 *
 * The layout markup can be gone here (Next renders the error document), so only
 * the error card is rendered; the document shell is never duplicated
 * (see src/app/(frontend)/not-found.tsx for the same rule).
 */
export default function GlobalError({ error, reset }: { error: unknown; reset: () => void }) {
  return <ErrorScreen error={error} reset={reset} locale="en" />;
}
