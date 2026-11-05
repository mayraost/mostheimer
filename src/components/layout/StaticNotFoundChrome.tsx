import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Constant English navigation/footer for the GLOBAL 404 (always English, no
 * data access): the real Header/Footer read the navigation + translations
 * globals and would make that boundary dynamic and DB-dependent — while the
 * global 404 has to survive exactly those failures.
 *
 * Only the public EN routes that the sitemap lists, plus the two legal pages.
 * Styling uses the same Tailwind classes/design tokens as the real chrome, so
 * the critical subset generated from globals.css covers it.
 *
 * Links are <Link> only to satisfy the ESLint rule; the markup stays plain
 * anchors (`<a href>`), so they also work without client JS.
 */
const EN_NAV = [
  { label: 'Home', href: '/en' },
  { label: 'Career', href: '/en/career' },
  { label: 'Case Studies', href: '/en/case-studies' },
  { label: 'Tech Radar', href: '/en/tech-radar' },
  { label: 'Leadership', href: '/en/leadership' },
  { label: 'Contact', href: '/en/contact' },
] as const;

const EN_LEGAL = [
  { label: 'Imprint', href: '/en/impressum' },
  { label: 'Privacy', href: '/en/privacy' },
] as const;

/** Static EN header: brand mark, site links, language switch to the DE home. */
export function StaticHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/en" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-raised text-primary">
            <span aria-hidden="true" className="mono-label">
              MO
            </span>
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">mostheimer</span>
          <span className="mono-label text-primary">{'//'} dev</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {EN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mono-label text-muted-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/de"
                hrefLang="de"
                className="mono-label text-muted-foreground hover:text-primary"
              >
                DE
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

/** Static EN footer: claim line, legal links, copyright. */
export function StaticFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-surface/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="mono-label text-muted-foreground">
          Mostheimer <span className="text-primary">/</span> Web &amp; Application Architect
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {EN_LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mono-label text-muted-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        {' '}
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="mono-label text-muted-foreground">© Mostheimer · All rights reserved</p>
          <p className="mono-label text-muted-foreground">
            Next.js 16 <span className="text-primary">/</span> Payload 4{' '}
            <span className="text-primary">/</span> Postgres
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Page column around the global 404 content (same structure as SiteChrome). */
export function StaticNotFoundChrome({ children }: { children: ReactNode }) {
  return (
    // `critical-fonts` carries the font tokens as a body-decoration class on the
    // column: the error document has no <body> class of its own, and the
    // next/font hashes are build-generated (see scripts/generate-404-critical-css.ts).
    <div className="critical-fonts flex min-h-screen flex-col">
      <StaticHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8">
        {children}
      </main>
      <StaticFooter />
    </div>
  );
}
