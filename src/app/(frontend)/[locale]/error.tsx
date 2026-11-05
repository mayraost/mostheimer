'use client';

import { useParams } from 'next/navigation';
import { ErrorScreen } from '@/components/layout/ErrorScreen';

/**
 * Error boundary of the [locale] segment (DE/EN).
 *
 * The boundary lives BELOW `[locale]/layout.tsx`, so header, footer, fonts and
 * theme stay rendered (they are CMS-driven and simply keep working) — this
 * component only replaces the page content. The locale comes from the route
 * segment, so no request API is needed (it must stay a client component).
 */
export default function LocaleError({ error, reset }: { error: unknown; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === 'de' ? 'de' : 'en';
  return <ErrorScreen error={error} reset={reset} locale={locale} />;
}
