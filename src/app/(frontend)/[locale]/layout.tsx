import type { Metadata } from 'next';
import { Averia_Serif_Libre, Geist_Mono } from 'next/font/google';
import '../../globals.css';
import { SettingsProvider } from '@/components/SettingsProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

const averia = Averia_Serif_Libre({
  weight: ['300', '400', '700'],
  variable: '--font-averia',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mostheimer',
  description: 'Personal Website',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as 'en' | 'de') || 'en';

  const payload = await getPayload({ config: configPromise });
  const translations = await payload.findGlobal({
    slug: 'translations',
    locale,
  });

  const navigation = await payload.findGlobal({
    slug: 'navigation',
    locale,
  });

  return (
    <html lang={locale}>
      <body className={`${averia.variable} ${geistMono.variable} antialiased`}>
        <TranslationsProvider translations={translations}>
          <SettingsProvider>
            <div className="flex flex-col min-h-screen">
              <Header locale={locale} navLinks={navigation.headerLinks ?? []} />
              <main className="flex-1 py-10 px-4 md:px-8">{children}</main>
              <Footer locale={locale} navLinks={navigation.footerLinks ?? []} />
            </div>
          </SettingsProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
