import { headers } from 'next/headers';
import Link from 'next/link';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';

export default async function NotFound() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const referer = headersList.get('referer');

  const isDe =
    (referer && referer.includes('/de/')) ||
    Boolean(acceptLanguage && acceptLanguage.startsWith('de'));

  const locale = isDe ? 'de' : 'en';

  const notFoundData = await getCachedNotFound(locale);

  return (
    <div className="dot-grid flex min-h-[50vh] w-full flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-lg rounded-[8px] border border-border bg-surface p-8">
        <p className="mono-label mb-4 text-error">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-error align-middle" />
          HTTP 404 · Not Found
        </p>
        <h1 className="mb-3 font-heading text-4xl font-bold tracking-tight text-foreground">
          {notFoundData.title}
        </h1>
        <p className="mb-8 text-base text-muted-foreground">{notFoundData.message}</p>
        <Link
          href={notFoundData.buttonLink || `/${locale}`}
          className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {notFoundData.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
