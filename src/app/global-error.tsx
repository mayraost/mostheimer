'use client';

import Link from 'next/link';

/**
 * LAST-RESORT error page: rendered when the root layout itself fails.
 *
 * This is the ONE documented place where inline CSS is correct (AGENTS.md →
 * „404-/Error-Rendering"):
 * - Next replaces the whole document, so no `globals.css` link, no next/font,
 *   no Tailwind and no CMS/token module can be guaranteed.
 * - Therefore: one self-contained <style> block, system-font stack with
 *   Space Grotesk first (cached webfont wins when present), dark onyx surface,
 *   emerald accent, dot-grid — the same card/label/button family as the
 *   404/error screens, styled like the standalone placeholder-404 page.
 * - Zero data access, zero external requests, English only.
 *
 * Keep the values in sync with `globals.css` when the tokens change.
 */
const CSS = `
:root{color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(#f8fafc24 1px,transparent 1px) 0 0/24px 24px,#0b0f0e;color:#e8f0ec;font-family:"Space Grotesk","SF Pro Display",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;text-align:center;padding:24px}
main{width:100%;max-width:32rem}
.label{display:inline-flex;align-items:center;gap:8px;margin:0 0 16px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f87171}
.label::before{content:"";width:6px;height:6px;border-radius:9999px;background:#f87171}
.card{background:#111816;border:1px solid #23302b;border-radius:8px;padding:32px;box-shadow:0 24px 60px -24px rgba(16,185,129,.25)}
h1{margin:0 0 12px;font-size:clamp(1.75rem,4vw,2.25rem);line-height:1.15;font-weight:700;letter-spacing:-.025em;color:#e8f0ec}
p{margin:0 0 24px;font-size:1rem;line-height:1.6;color:#9fb3aa}
.actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
a,button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 24px;border-radius:6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;cursor:pointer;text-decoration:none}
.primary{background:#10b981;color:#04120b;border:1px solid #10b981}
.primary:hover{background:#34d399;border-color:#34d399}
.ghost{background:#16201c;color:#e8f0ec;border:1px solid #33443d}
.ghost:hover{border-color:#10b981}
footer{margin-top:32px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5f7269}
`;

/**
 * Props per docs: `error` + `reset()` (`retry()` is the newer alias — accept
 * both so a minor version change cannot break the last-resort page).
 */
export default function GlobalError({
  retry,
  reset,
}: {
  error: unknown;
  retry?: () => void;
  reset?: () => void;
}) {
  const onRetry = retry ?? reset;

  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <main>
          <div className="card">
            <p className="label">HTTP 500 · Critical error</p>
            <h1>The site could not be loaded</h1>
            <p>
              A fatal error occurred while rendering this page. Please try again or return to the
              home page.
            </p>
            <div className="actions">
              {/* Link renders a plain <a href="/"> too — works without client JS. */}
              <Link className="primary" href="/">
                Back to home
              </Link>
              {onRetry ? (
                <button type="button" className="ghost" onClick={() => onRetry()}>
                  Try again
                </button>
              ) : null}
            </div>
          </div>
          <footer>Mostheimer · Web &amp; Application Architect</footer>
        </main>
      </body>
    </html>
  );
}
