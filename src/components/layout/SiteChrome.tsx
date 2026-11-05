import type { ReactNode } from 'react';
import { CookieConsent } from '@/components/consent/CookieConsent';
import { envConfig } from '@/envConfig';

/**
 * Site chrome (header + main + footer) shared by the [locale] layout and the
 * route-group 404 boundary (src/app/(frontend)/not-found.tsx).
 *
 * Server component: the Payload reads and the providers stay in the caller
 * (layout `'use cache'` query / the 404's guarded read), so this owns markup
 * only. Keeping it in one place prevents the two document paths from drifting
 * apart (skip-link target, sticky footer, consent mount point).
 */
export function SiteChrome({
  header,
  footer,
  children,
  showConsent = true,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  /**
   * CookieConsent requires the TranslationsProvider context; the 404 fallback
   * path (no CMS reachable) turns it off.
   */
  showConsent?: boolean;
}) {
  return (
    <div className="flex min-h-page flex-col">
      {header}
      <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8">
        {children}
      </main>
      {footer}
      {showConsent ? <CookieConsent gtmId={envConfig.gtmId} /> : null}
    </div>
  );
}
