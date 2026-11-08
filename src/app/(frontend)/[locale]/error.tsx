'use client';

import { ErrorScreen } from '@/components/layout/ErrorScreen';
import { useErrorCopy } from '@/components/TranslationsProvider';

/**
 * Error boundary of the [locale] segment (DE/EN).
 *
 * The boundary lives BELOW `[locale]/layout.tsx`, so header, footer, fonts and
 * theme stay rendered (they are CMS-driven and simply keep working) — this
 * component only replaces the page content. It must stay a client component,
 * and it needs no route param: the copy already arrives localized through the
 * provider context (the global is read with the page's locale).
 *
 * Copy comes from the `TranslationsProvider` context, which the layout fills
 * from the cached global (`routes.error.*`). Next does not pass custom props to
 * `error.tsx`, so the context is the only channel that is guaranteed to exist
 * here — the provider mounts ABOVE the boundary. If the global itself is
 * unreachable (frequently the cause of the error), the screen renders without
 * copy rather than throwing a second time.
 */
/** Structural fallback: the card renders, only the words are missing. */
const EMPTY_COPY = { code: '', title: '', message: '', home: '', retry: '' };

export default function LocaleError({ error, reset }: { error: unknown; reset: () => void }) {
  const errorCopy = useErrorCopy();

  return (
    <ErrorScreen
      error={error}
      reset={reset}
      // The provider carries the resolved error copy (see TranslationsProvider):
      // this boundary is a client component and cannot await the cache, and it
      // must work even when the CMS read is what failed.
      copy={errorCopy ?? EMPTY_COPY}
    />
  );
}
