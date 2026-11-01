import type { Metadata } from 'next';
import { envConfig } from '@/envConfig';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = envConfig.serverUrl;
  return {
    title: 'Impressum - Mostheimer',
    alternates: {
      canonical: `${baseUrl}/de/impressum`,
      languages: {
        en: `${baseUrl}/en/impressum`,
        de: `${baseUrl}/de/impressum`,
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
