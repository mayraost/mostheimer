import type { Metadata } from 'next';
import './globals.css';
import { BODY_FONT_CLASS, THEME_BOOTSTRAP } from '@/components/layout/DocumentShell';
import { StaticNotFoundChrome } from '@/components/layout/StaticNotFoundChrome';
import { StatusScreen } from '@/components/layout/StatusScreen';

/**
 * GLOBAL 404 for URLs that match no route at all (experimental.globalNotFound,
 * see next.config.ts).
 *
 * Per Next docs (01-app/03-api-reference/03-file-conventions/not-found.md):
 * "Unlike `not-found.js`, this is used when a requested URL doesn't match any
 * route at all. Next.js skips rendering and directly returns this global
 * page." — which is the only way to get a real HTTP 404 in this app: with
 * `cacheComponents` the [locale] shell streams (layout `connection()` inside
 * <Suspense>), and a streamed response is fixed at 200 (docs:
 * file-conventions/loading.md § "Status codes"). Measured 05.11.2026:
 * notFound() in the layout, in the page and in generateMetadata all answered
 * 200.
 *
 * DOCUMENTED EXCEPTION to "DocumentShell only in the [locale] layout": this
 * file bypasses every layout, so it must render its own <html>/<body> and
 * import the global stylesheet + fonts itself (docs: "global-not-found.js
 * bypasses your app's normal rendering, which means you'll need to import any
 * global styles, fonts…"). Fonts and theme bootstrap are REUSED from
 * src/components/layout/DocumentShell.tsx, never duplicated.
 *
 * Static by construction: no headers(), no cookies(), no connection(), no
 * Payload, no CMS chrome. The real <Header>/<Footer> read the navigation and
 * translations globals (request-time 'use cache' reads); a global 404 has to
 * stay available exactly when the CMS/DB does not answer, so the chrome here is
 * the static English one (StaticNotFoundChrome). Always English, because
 * without layouts/params no locale can be resolved.
 */

export const metadata: Metadata = {
  title: 'Mostheimer 404',
  description: 'The page you are looking for does not exist or has moved.',
  // Next also injects this automatically for 404 documents; kept explicit for
  // crawlers that read the static head before any runtime decoration.
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Same pre-hydration theme bootstrap as DocumentShell: default dark,
            stored preference wins, no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className={BODY_FONT_CLASS}>
        <a
          href="#main-content"
          className="sr-only rounded-[6px] border border-primary bg-surface-raised px-4 py-2 font-mono text-sm text-primary focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-block"
        >
          Skip to content
        </a>
        <StaticNotFoundChrome>
          <StatusScreen
            code="HTTP 404 · Not Found"
            title="Page not found"
            message="The page you are looking for does not exist or has moved."
            // "/" (not "/en"): the proxy redirects to /de or /en by
            // accept-language, so the visitor lands in their own locale.
            primary={{ label: 'Back to home', href: '/' }}
          />
        </StaticNotFoundChrome>
      </body>
    </html>
  );
}
