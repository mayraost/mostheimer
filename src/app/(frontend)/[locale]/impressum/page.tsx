import type { Metadata } from 'next';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { ogImageUrl } from '@/components/og/ogCard';
import { BentoTile, CardHeader, splitParagraphs } from '@/components/ui/industrial';
import { KeyFactActionButton } from '@/components/ui/KeyFactActionButton';
import { getCachedPageBySlug } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';

// Requires a root param at build time; locales are build-static, no DB lookup.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

/*
 * The imprint is a CMS page (`slug: 'imprint'`) that stays reachable under the
 * historical `/impressum` URL. This route is NOT part of the `[[...slug]]`
 * catch-all: the Proxy lists `impressum` in STATIC_CHILD_ROUTES, so requests
 * always land here, and the content is read through the same `'use cache'`
 * layer as every content page (tag `cms:pages:imprint`, payload hooks flush it).
 *
 * Same rendering vocabulary as `TechSectionBlock` (mono eyebrow, heading,
 * paragraphs, key facts) so the legal page looks like the rest of the site
 * instead of a forgotten HTML template.
 */

const IMPRINT_SLUG = 'imprint';

/** Only the frame is code; every word of the legal copy lives in the CMS. */
const FRAME = {
  de: {
    eyebrow: 'Start // Impressum',
    title: 'Impressum',
    empty:
      'Der Impressumstext wird gerade gepflegt. Anfragen richten Sie bitte direkt an mail@mostheimer.de.',
  },
  en: {
    eyebrow: 'Home // Imprint',
    title: 'Imprint',
    empty: 'The imprint content is being updated. Please direct any enquiry to mail@mostheimer.de.',
  },
} as const;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/impressum'>): Promise<Metadata> {
  const baseUrl = envConfig.serverUrl;
  const { locale: rawLocale } = await params;
  const locale: FrontendLocale = rawLocale === 'en' ? 'en' : 'de';
  const title = FRAME[locale].title;
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

export default async function ImpressumPage({ params }: PageProps<'/[locale]/impressum'>) {
  // Aborts the build-time prerender attempt (the build container has no DB).
  await connection();

  const { locale: rawLocale } = await params;
  const locale: FrontendLocale = rawLocale === 'en' ? 'en' : 'de';
  const frame = FRAME[locale];
  const page = await getCachedPageBySlug(IMPRINT_SLUG, locale);
  const sections = (page?.layout ?? []).filter((block) => block.blockType === 'techSection');

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="mb-8 border-b border-border pb-6 pt-2">
        <p className="mono-label flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {frame.eyebrow}
        </p>
        <h1 className="mb-0 mt-3 font-heading text-3xl font-bold tracking-[-0.02em] text-foreground">
          {page?.title || frame.title}
        </h1>
      </header>

      {sections.length === 0 ? (
        <BentoTile className="p-5 lg:p-8">
          <p className="text-base leading-relaxed text-foreground">{frame.empty}</p>
        </BentoTile>
      ) : (
        <div className="flex flex-col gap-2">
          {sections.map((section, index) => (
            <BentoTile key={section.id ?? index} as="section" className="p-5 lg:p-8">
              <CardHeader label={section.sectionLabel} />

              <h2 className="mb-4 font-heading text-xl font-bold leading-tight tracking-[-0.02em] text-foreground lg:text-2xl">
                {section.heading}
              </h2>

              <div className="space-y-3">
                {splitParagraphs(section.body).map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line break-words text-base leading-relaxed text-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {section.keyFacts && section.keyFacts.length > 0 && (
                <dl className="mt-6 grid grid-cols-1 gap-2 border-t border-border pt-5 sm:grid-cols-2">
                  {section.keyFacts.map((fact) => (
                    <div
                      key={fact.id ?? fact.label}
                      className="flex flex-col justify-between gap-2 rounded-[6px] border border-border bg-surface-raised/50 p-3"
                    >
                      <div>
                        <dt className="mono-label mb-1 text-muted-foreground">{fact.label}</dt>
                        <dd className="break-words font-mono text-sm font-semibold text-primary">
                          {fact.value}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-2 empty:hidden">
                        <KeyFactActionButton value={fact.value} className="w-full justify-center" />
                      </div>
                    </div>
                  ))}
                </dl>
              )}
            </BentoTile>
          ))}
        </div>
      )}
    </article>
  );
}
