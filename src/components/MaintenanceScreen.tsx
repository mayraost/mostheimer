import Link from 'next/link';

const MESSAGES = {
  en: {
    title: 'Under maintenance',
    body: 'The site is currently being maintained. Check back soon.',
    imprintHeading: 'Imprint',
  },
  de: {
    title: 'In Wartung',
    body: 'Die Seite befindet sich gerade in der Wartung. Probiere es bald erneut.',
    imprintHeading: 'Impressum',
  },
} as const;

export function MaintenanceScreen({ locale }: { locale: 'en' | 'de' }) {
  const t = MESSAGES[locale] ?? MESSAGES.en;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-averia text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t.body}</p>

      <footer className="mt-12 text-xs text-muted-foreground">
        <h2 className="mb-1 font-semibold uppercase tracking-wide opacity-70">
          {t.imprintHeading}
        </h2>
        <p>
          Mayra Ostheimer · Ringstraße 60 · 25368 Kiebitzreihe
          <br />
          <a href="mailto:mail@mostheimer.de" className="hover:underline">
            mail@mostheimer.de
          </a>{' '}
          ·{' '}
          <a href="tel:+4917663787951" className="hover:underline">
            0176 63787951
          </a>
        </p>
      </footer>
    </div>
  );
}

/**
 * Kleines fixed Info-Badge für eingeloggte CMS-User während des
 * Wartungsmodus: sie sehen das normale Layout und müssen erkennen
 * können, dass Nicht-Eingeloggte aktuell die Wartungsseite sehen.
 */
export function MaintenanceBadge({ locale }: { locale: 'en' | 'de' }) {
  const t = MESSAGES[locale] ?? MESSAGES.en;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-64 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg"
      aria-live="polite"
    >
      <p className="text-xs font-semibold text-warning-foreground">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning align-middle" />
        {t.title}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          /admin
        </Link>
      </p>
    </div>
  );
}
