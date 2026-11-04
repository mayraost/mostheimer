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
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md rounded-[8px] border border-border bg-surface p-8">
        <p className="mono-label mb-6 text-warning">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle" />
          Systemstatus · Maintenance
        </p>
        <h1 className="mb-3 font-heading text-3xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base text-muted-foreground">{t.body}</p>

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="mono-label mb-2 text-foreground">{t.imprintHeading}</h2>
          <p className="mono-meta text-muted-foreground">
            Mayra Ostheimer · Ringstraße 60 · 25368 Kiebitzreihe
            <br />
            <a href="mailto:mail@mostheimer.de" className="text-primary hover:underline">
              mail@mostheimer.de
            </a>{' '}
            ·{' '}
            <a href="tel:+4917663787951" className="text-primary hover:underline">
              0176 63787951
            </a>
          </p>
        </div>
      </div>
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
      className="fixed bottom-4 left-4 z-50 max-w-64 rounded-[6px] border border-warning/50 bg-surface-raised px-3 py-2 shadow-lg"
      aria-live="polite"
    >
      <p className="mono-label text-warning">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle" />
        {t.title}
      </p>
      <p className="mono-meta mt-1 text-muted-foreground">
        <Link href="/admin" className="text-primary hover:underline">
          /admin
        </Link>
      </p>
    </div>
  );
}
