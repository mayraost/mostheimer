import type { ReactNode } from 'react';
import { ConsentBootstrapScript } from '@/lib/consent/ConsentBootstrapScript';
import { BODY_FONT_CLASS } from './fonts';

export { BODY_FONT_CLASS };

/**
 * Pre-hydration theme bootstrap: sets the theme class before the first paint so
 * default-dark (also on light-preferring OS) and a stored user theme apply
 * without a flash. SettingsProvider reads the same 'theme' localStorage key on
 * mount.
 *
 * Exported (not duplicated) because `src/app/global-not-found.tsx` also needs it
 * — that document renders its own <html>, so it has no DocumentShell.
 */
export const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark'||s==='system')?s:'dark';var c=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(c);}catch(e){document.documentElement.classList.add('dark');}})();`;

function SkipLink({ locale }: { locale: string }) {
  const label = locale === 'de' ? 'Zum Inhalt springen' : 'Skip to content';
  return (
    <a
      href="#main-content"
      className="sr-only rounded-[6px] border border-primary bg-surface-raised px-4 py-2 font-mono text-sm text-primary focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-block"
    >
      {label}
    </a>
  );
}

/**
 * The <html>/<body> document shell of the APP. Rendered only by the [locale]
 * layout (src/app/(frontend)/[locale]/layout.tsx) — localized 404/error
 * boundaries never duplicate it, they only contribute body content.
 *
 * Documented exception: `src/app/global-not-found.tsx` builds its own
 * <html>/<body>, because Next renders that convention OUTSIDE every layout
 * (docs: file-conventions/not-found.md — global-not-found "bypasses your app's
 * normal rendering, which means you'll need to import any global styles,
 * fonts, or other dependencies"). It reuses BODY_FONT_CLASS and THEME_BOOTSTRAP
 * from this module, so tokens and theme behaviour cannot drift.
 *
 * Same head everywhere: theme bootstrap first, then the Consent Mode v2
 * defaults (they MUST be evaluated before any GTM script).
 */
export function DocumentShell({ locale, children }: { locale: string; children: ReactNode }) {
  return (
    <html lang={locale} className="dark">
      {/* App-Router-Dokument: die Bootstrap-Scripts müssen vor jedem von Next
          injizierten Script im <head> stehen (Consent Mode: Reihenfolge ist
          sicherheitsrelevant). Kein next/head (Pages-Router-API). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* Consent Mode v2: Default-Signale MÜSSEN vor jedem GTM-Script
            evaluiert werden — daher hier im Head, vor allen Container-Scripts. */}
        <ConsentBootstrapScript />
      </head>
      <body className={BODY_FONT_CLASS}>
        <SkipLink locale={locale} />
        {children}
      </body>
    </html>
  );
}
