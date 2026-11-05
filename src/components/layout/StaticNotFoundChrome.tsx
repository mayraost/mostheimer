import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Constant navigation/footer for the 404 document — the real Header/Footer read
 * the navigation + translations globals, which would make the boundary
 * DB-dependent, and a 404 has to survive exactly those failures.
 *
 * Copy exists in EN and DE; the route slugs are the same in both locales, so one
 * table serves both. Styling uses the same Tailwind classes/design tokens as the
 * real chrome, so the critical subset generated from globals.css covers it.
 *
 * Links are <Link> only to satisfy the ESLint rule; the markup stays plain
 * anchors (`<a href>`), so they also work without client JS.
 */
const NAV = [
  { key: 'home', href: '' },
  { key: 'career', href: '/career' },
  { key: 'caseStudies', href: '/case-studies' },
  { key: 'techRadar', href: '/tech-radar' },
  { key: 'leadership', href: '/leadership' },
  { key: 'contact', href: '/contact' },
] as const;

const LEGAL = [
  { key: 'imprint', href: '/impressum' },
  { key: 'privacy', href: '/privacy' },
] as const;

const COPY = {
  en: {
    nav: {
      home: 'Home',
      career: 'Career',
      caseStudies: 'Case Studies',
      techRadar: 'Tech Radar',
      leadership: 'Leadership',
      contact: 'Contact',
    },
    legal: { imprint: 'Imprint', privacy: 'Privacy' },
    navLabel: 'Main',
    legalLabel: 'Legal',
    switchTo: 'DE',
    switchHref: '/de',
    switchLang: 'de',
    claim: 'Web & Application Architect',
    rights: '© Mostheimer · All rights reserved',
  },
  de: {
    nav: {
      home: 'Start',
      career: 'Werdegang',
      caseStudies: 'Case Studies',
      techRadar: 'Tech Radar',
      leadership: 'Leadership',
      contact: 'Kontakt',
    },
    legal: { imprint: 'Impressum', privacy: 'Datenschutz' },
    navLabel: 'Hauptnavigation',
    legalLabel: 'Rechtliches',
    switchTo: 'EN',
    switchHref: '/en',
    switchLang: 'en',
    claim: 'Web & Application Architect',
    rights: '© Mostheimer · Alle Rechte vorbehalten',
  },
} as const;

type ChromeLocale = keyof typeof COPY;

/** Static header: brand mark, site links, language switch. */
export function StaticHeader({ locale = 'en' }: { locale?: ChromeLocale }) {
  const copy = COPY[locale];
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised text-primary">
            <span aria-hidden="true" className="mono-label">
              MO
            </span>
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">mostheimer</span>
          <span className="mono-label text-primary">{'//'} dev</span>
        </Link>
        <nav aria-label={copy.navLabel}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  className="mono-label text-muted-foreground hover:text-primary"
                >
                  {copy.nav[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={copy.switchHref}
                hrefLang={copy.switchLang}
                className="mono-label text-muted-foreground hover:text-primary"
              >
                {copy.switchTo}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

/** Static footer: claim line, legal links, copyright. */
export function StaticFooter({ locale = 'en' }: { locale?: ChromeLocale }) {
  const copy = COPY[locale];

  return (
    <footer className="mt-auto w-full border-t border-border bg-surface/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="mono-label text-muted-foreground">
          Mostheimer <span className="text-primary">/</span> {copy.claim}
        </p>
        <nav aria-label={copy.legalLabel}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  className="mono-label text-muted-foreground hover:text-primary"
                >
                  {copy.legal[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="mono-label text-muted-foreground">{copy.rights}</p>
          <p className="mono-label text-muted-foreground">
            Next.js 16 <span className="text-primary">/</span> Payload 4{' '}
            <span className="text-primary">/</span> Postgres
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Page column around the global 404 content (same structure as SiteChrome).
 *
 * `locale` switches the language of the static nav/footer copy; the links stay
 * on the EN routes on purpose (`/de` for the language switch), because this
 * chrome is constant and must not read the navigation global.
 */
export function StaticNotFoundChrome({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: 'de' | 'en';
}) {
  return (
    // `critical-fonts` carries the font tokens as a body-decoration class on the
    // column: the error document has no <body> class of its own, and the
    // next/font hashes are build-generated (see scripts/generate-404-critical-css.ts).
    <div className="critical-fonts flex min-h-page flex-col">
      <StaticHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8">
        {children}
      </main>
      <StaticFooter locale={locale} />
    </div>
  );
}
