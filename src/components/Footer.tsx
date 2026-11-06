import Link from 'next/link';
import { ConsentSettingsLink } from '@/components/consent/ConsentSettingsLink';
import type { Translation } from '@/payload-types';

export function Footer({
  locale,
  navLinks,
  cookieSettingsLabel,
  rightsReserved,
}: {
  locale: string;
  navLinks?: {
    label: string;
    link: string;
    id?: string | null;
  }[];
  /** Footer-Link-Label aus dem Translations-Global (DE/EN, CMS-editierbar). */
  cookieSettingsLabel?: Translation['cookies'];
  /** Copyright-Zeile aus dem Translations-Global (DE/EN, CMS-editierbar). */
  rightsReserved?: Translation['footer'];
}) {
  // Fallback nur fuer Instanzen, deren Translations-Global noch keinen
  // `cookies`-Block hat (z. B. ungeseedete Dev-DB) — nie hart im Markup.
  const settingsLabel =
    cookieSettingsLabel?.settingsLink ??
    (locale === 'de' ? 'Cookie-Einstellungen' : 'Cookie settings');
  const rightsLabel =
    rightsReserved?.rightsReserved ??
    (locale === 'de' ? 'Alle Rechte vorbehalten' : 'All rights reserved');

  return (
    <footer className="mt-auto w-full border-t border-border bg-surface/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <span className="mono-label flex h-8 w-8 items-center justify-center rounded-[6px] border border-primary/40 bg-primary-muted text-primary">
            MO
          </span>
          <div>
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              Mayra Ostheimer
            </p>
            <p className="mono-label text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              Web &amp; Application Architect
            </p>
          </div>
        </div>

        {navLinks && navLinks.length > 0 && (
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {navLinks.map((item, index) => (
                <li key={item.id || index}>
                  <Link
                    href={item.link}
                    className="mono-label text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                {/* Client-Komponente (der Footer ist eine Server-Komponente):
                    oeffnet den Consent-Dialog ueber `CONSENT_OPEN_EVENT`. */}
                <ConsentSettingsLink label={settingsLabel} />
              </li>
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="mono-label text-muted-foreground">
            © {new Date().getFullYear()} Mayra Ostheimer · {rightsLabel}
          </p>
          <p className="mono-label text-muted-foreground">
            Next.js 16 <span className="text-primary">/</span> Payload 4{' '}
            <span className="text-primary">/</span> Postgres
          </p>
        </div>
      </div>
    </footer>
  );
}
