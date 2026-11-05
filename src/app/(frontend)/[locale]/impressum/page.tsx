import type { Metadata } from 'next';
import { envConfig } from '@/envConfig';
import { ogImageUrl } from '@/components/og/ogCard';

// Requires a root param at build time; locales are build-static, no DB lookup.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// 'shell' is the narrowest level that works here: it only requires the app
// shell of the default link prefetch to be static (partial prefetching is on).
// 'navigation' additionally demands a fully static route, which the dynamic
// [locale] shell (streamed, connection()-guarded) does not provide — the build
// fails with `static-route-dynamic`. Measured 05.11.2026; don't raise this
// without re-verifying the whole tree.
export const ensureStatic = 'shell';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/impressum'>): Promise<Metadata> {
  const baseUrl = envConfig.serverUrl;
  const resolvedParams = await params;
  const locale: 'de' | 'en' = resolvedParams.locale === 'en' ? 'en' : 'de';
  const title = locale === 'de' ? 'Impressum' : 'Imprint';
  const description =
    locale === 'de'
      ? 'Impressum und rechtliche Angaben gemäß § 5 DDG: Anbieter, Kontakt, E-Mail und Telefonnummer von Mayra Ostheimer.'
      : 'Legal notice under § 5 DDG (German law): provider, contact, email and phone number of Mayra Ostheimer.';
  const canonical = `${baseUrl}/${locale}/impressum`;

  return {
    title: { absolute: `${title} - Mayra Ostheimer` },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Mayra Ostheimer',
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [ogImageUrl(title, locale)],
    },
    twitter: { card: 'summary_large_image', description },
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en/impressum`,
        de: `${baseUrl}/de/impressum`,
        // x-default → German: de is the primary audience.
        'x-default': `${baseUrl}/de/impressum`,
      },
    },
  };
}

export default async function ImpressumPage() {
  return (
    <article className="prose max-w-2xl mx-auto w-full">
      <h1 className="font-averia text-3xl font-bold">Impressum</h1>

      <h2 className="font-averia text-xl font-semibold mt-6 mb-2">Angaben gemäß § 5 DDG</h2>
      <p className="text-foreground">
        Mayra Ostheimer
        <br />
        Ringstraße 60
        <br />
        25368 Kiebitzreihe
      </p>

      <h2 className="font-averia text-xl font-semibold mt-6 mb-2">Kontakt</h2>
      <p className="text-foreground">
        E-Mail:{' '}
        <a href="mailto:mail@mostheimer.de" className="text-primary hover:underline">
          mail@mostheimer.de
        </a>
        <br />
        Telefon:{' '}
        <a href="tel:+4917663787951" className="text-primary hover:underline">
          0176 63787951
        </a>
      </p>
    </article>
  );
}
