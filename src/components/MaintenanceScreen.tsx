const MESSAGES = {
  en: {
    title: 'Under maintenance',
    body: 'The site is currently being maintained. Check back soon.',
  },
  de: {
    title: 'In Wartung',
    body: 'Die Seite befindet sich gerade in der Wartung. Probiere es bald erneut.',
  },
} as const;

export function MaintenanceScreen({ locale }: { locale: 'en' | 'de' }) {
  const t = MESSAGES[locale] ?? MESSAGES.en;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-averia text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t.body}</p>
    </div>
  );
}
