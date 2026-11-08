import Link from 'next/link';
import { ConsentSettingsLink } from '@/components/consent/ConsentSettingsLink';
import { isActiveNavLink } from '@/components/navLinkState';
import { getPathname } from '@/components/serverPathname';
import type { Translation } from '@/payload-types';

export async function Footer({
  navLinks,
  cookieSettingsLabel,
  rightsReserved,
  brandName,
  brandClaim,
  navAria,
  credits,
}: {
  /** Brand from the site-settings global (never a literal). */
  brandName: string;
  navLinks?: {
    label: string;
    link: string;
    id?: string | null;
  }[];
  /** Footer-Link-Label aus dem Translations-Global (DE/EN, CMS-editierbar). */
  cookieSettingsLabel?: Translation['cookies'];
  /** Copyright-Zeile aus dem Translations-Global (DE/EN, CMS-editierbar). */
  rightsReserved?: Translation['footer'];
  /** Subline under the name (`chrome.brandClaim`), CMS copy. */
  brandClaim?: string;
  /** Accessible name of the footer nav (`chrome.footerNavAria`). */
  navAria?: string;
  /** Tech line (`chrome.footerCredits`); segments are split on `/`. */
  credits?: string;
}) {
  /*
   * No locale-derived fallback strings any more (rule since 08.11.2026): every
   * visible word comes from the translations global. A missing value renders
   * nothing instead of an invented sentence — `rightsLabel` in particular only
   * affects the copyright tail, so an empty global degrades to
   * "© <year> <brand>" rather than to English copy on a German page.
   */
  const settingsLabel = cookieSettingsLabel?.settingsLink?.trim() ?? '';
  const rightsLabel = rightsReserved?.rightsReserved?.trim() ?? '';
  const pathname = await getPathname();

  return (
    <footer className="mt-auto w-full border-t border-border bg-surface/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <span className="mono-label flex h-8 w-8 items-center justify-center rounded-[6px] border border-primary/40 bg-primary-muted text-primary">
            MO
          </span>
          <div>
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              {brandName}
            </p>
            {brandClaim ? (
              <p className="mono-label text-muted-foreground">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                {brandClaim}
              </p>
            ) : null}
          </div>
        </div>

        {navLinks && navLinks.length > 0 && (
          <nav aria-label={navAria}>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {navLinks.map((item, index) => {
                const active = isActiveNavLink(item.link, pathname);
                return (
                  <li key={item.id || index}>
                    <Link
                      href={item.link}
                      /*
                       * Same active rule as the drawer (one source:
                       * `isActiveNavLink`). The footer is a quiet surface, so the
                       * signal is emerald text + a leading dot instead of a rail.
                       */
                      className={[
                        'mono-label inline-flex items-center gap-1.5 transition-colors',
                        active ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {active && (
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
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
            {/* "© <year> <brand> · <rights>": the brand is data (site-settings),
                the rights sentence is CMS copy. Empty parts are skipped. */}
            {['© ' + new Date().getFullYear(), brandName, rightsLabel].filter(Boolean).join(' · ')}
          </p>
          {credits ? (
            <p className="mono-label text-muted-foreground">
              {credits.split('/').map((segment, index, all) => (
                <span key={`${segment}-${index}`}>
                  {segment.trim()}
                  {index < all.length - 1 && <span className="text-primary">{' / '}</span>}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
