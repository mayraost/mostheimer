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
 * Exported so the bootstrap can be reused (stories, tests) without copying
 * the string; the layout is the only runtime caller.
 */
export const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark'||s==='system')?s:'dark';var c=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(c);}catch(e){document.documentElement.classList.add('dark');}})();`;

/**
 * Pre-hydration motion bootstrap (dual guardrail, spec §1.1).
 *
 * SettingsProvider applies the same decision a frame later; doing it HERE
 * keeps the first paint correct in both directions:
 * - animations ON  → `html.motion-assets`, which arms the hidden start states;
 *   without it a page would paint fully visible and then jump into the reveal.
 * - animations OFF (user setting `off` OR `prefers-reduced-motion: reduce`)
 *   → `html.motion-assets` is never set and `body.no-animations` is applied, so
 *   nothing is ever hidden. Reduced motion is checked here too because the CSS
 *   guardrail alone cannot stop the hooks from running.
 *
 * Mirrors `SettingsProvider`'s precedence exactly: an explicit `on` wins over
 * the OS preference (same as the settings page documents).
 */
export const MOTION_BOOTSTRAP = `(function(){try{var r=document.documentElement;var s=localStorage.getItem('animations');var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var off=s==='off'||(s!=='on'&&reduce);r.classList.toggle('motion-assets',!off);if(off){(function apply(){var b=document.body;if(!b){document.addEventListener('DOMContentLoaded',apply,{once:true});return;}b.classList.add('no-animations');})();}}catch(e){}})();`;

function SkipLink({ label }: { label: string }) {
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
 * Same head everywhere: theme bootstrap first, then the Consent Mode v2
 * defaults (they MUST be evaluated before any GTM script).
 *
 * `skipToContent` is a REQUIRED prop (copy from the translations global): the
 * skip link is the first focusable element on every page, so its label must
 * never silently disappear. The caller awaits `getCachedTranslation(...)`.
 */
export function DocumentShell({
  locale,
  skipToContent,
  children,
}: {
  locale: string;
  skipToContent: string;
  children: ReactNode;
}) {
  return (
    <html lang={locale} className="dark">
      {/* App-Router-Dokument: die Bootstrap-Scripts müssen vor jedem von Next
          injizierten Script im <head> stehen (Consent Mode: Reihenfolge ist
          sicherheitsrelevant). Kein next/head (Pages-Router-API). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* Motion guardrail before the first paint: a stored "animations off"
            or an OS reduce-motion preference must never flash an animation. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
        {/* Consent Mode v2: Default-Signale MÜSSEN vor jedem GTM-Script
            evaluiert werden — daher hier im Head, vor allen Container-Scripts. */}
        <ConsentBootstrapScript />
      </head>
      <body className={BODY_FONT_CLASS}>
        <SkipLink label={skipToContent} />
        {children}
      </body>
    </html>
  );
}
