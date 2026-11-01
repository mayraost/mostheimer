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
