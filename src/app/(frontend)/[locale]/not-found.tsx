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
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full px-4">
      <h1 className="text-4xl md:text-5xl font-averia font-bold text-primary mb-4">
        {notFoundData.title}
      </h1>
      <p className="text-lg md:text-xl opacity-80 mb-8 max-w-xl mx-auto font-geist-mono">
        {notFoundData.message}
      </p>
      <Link
        href={notFoundData.buttonLink || `/${locale}`}
        className="px-6 py-3 bg-primary text-white border-2 border-primary rounded-full font-medium transition-transform hover:scale-105"
      >
        {notFoundData.buttonLabel}
      </Link>
    </div>
  );
}
