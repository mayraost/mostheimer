import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function NotFound() {
  const payload = await getPayload({ config: configPromise });
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const referer = headersList.get('referer');
  const pathname = headersList.get('x-invoke-path') || '';

  const isDe =
    pathname.startsWith('/de') ||
    (referer && referer.includes('/de/')) ||
    (acceptLanguage && acceptLanguage.startsWith('de'));

  const locale = isDe ? 'de' : 'en';

  const notFoundData = await payload.findGlobal({
    slug: 'not-found',
    locale,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full px-4">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{notFoundData.title}</h1>
      <p className="text-lg md:text-xl opacity-80 mb-8 max-w-xl mx-auto font-mono">
        {notFoundData.message}
      </p>
      <Link
        href={notFoundData.buttonLink || `/${locale}`}
        className="px-6 py-3 bg-foreground text-background rounded-full font-medium transition-transform hover:scale-105"
      >
        {notFoundData.buttonLabel}
      </Link>
    </div>
  );
}
