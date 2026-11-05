import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { compile, type CompileOptions } from '@tailwindcss/node';

/**
 * Generator for the pre-hydration 404 stylesheet — ONE source of truth is
 * `src/app/globals.css`; nothing here is hand-written in TSX.
 *
 * Why a generated subset at all (measured 05.11.2026, production standalone):
 * the global 404 boundary renders in Next's error document, which links no
 * stylesheet of the app. Injecting the app stylesheet later (runtime <link>,
 * client-side) makes React re-render the boundary and fall back to Next's
 * default 404 page. So the subset is loaded EAGERLY from inside the boundary
 * (`/404-critical.css`, see src/app/404-critical.css/route.ts).
 *
 * How: Tailwind itself compiles it (same engine/version as the app stylesheet)
 * for a small source that lists exactly the utility classes the static 404
 * chrome uses — tokens, base layer, `@utility` rules, color-mix fallbacks and
 * cascade layers therefore behave exactly as in the app.
 */

/**
 * Classes used by the static 404 chrome + status card. Listed as class names in
 * a string so Tailwind's scanner picks them up (this is the candidate source).
 */
const CRITICAL_404_SOURCE = [
  'flex inline-flex hidden block inline-block flex-col flex-wrap items-center justify-between',
  'justify-center gap-1 gap-3 gap-6 gap-x-5 gap-y-2 flex-1 min-w-0 w-full',
  'h-16 h-9 w-9 max-w-6xl max-w-lg min-h-page min-h-11 min-h-[50vh] mx-auto',
  'px-4 px-6 py-4 py-8 p-8 pt-4 mb-3 mb-4 mb-8 mr-2 mt-auto mt-1 sticky top-0 z-50',
  'border border-b border-t border-l border-border border-border-strong border-primary',
  'rounded-[6px] rounded-[8px] rounded-lg rounded-full',
  'bg-background/85 bg-surface bg-surface/40 bg-surface-raised bg-primary bg-primary-muted bg-error',
  'text-base text-lg text-sm text-xs text-4xl font-bold font-semibold tracking-tight text-center',
  'leading-relaxed text-foreground text-muted-foreground text-primary text-primary-foreground',
  'text-error text-warning align-middle',
  'h-1.5 w-1.5 h-4 w-4 h-5 w-5 backdrop-blur-xl transition-colors cursor-pointer',
  'mono-label dot-grid sr-only',
  'hover:text-primary hover:bg-primary-hover hover:border-primary',
  'md:px-8 md:flex-row md:items-center md:justify-between',
  'cursor-not-allowed pointer-events-none',
].join(' ');

/**
 * next/font emits ONE hashed class per font family on <body>
 * (`._variable { --font-space-grotesk: ... }`). The names are BUILD-GENERATED,
 * so they cannot be listed as Tailwind candidates (measured: `_variable` is
 * never emitted by `@source inline`, whatever the notation).
 *
 * Two problems follow:
 *  1. The global 404 keeps the real document shell (`<body class="<hash>_variable">`),
 *     so those declarations must be part of the critical stylesheet — otherwise
 *     the font tokens stay undefined and the page falls back to system fonts
 *     (measured: "Space Grotesk" missing, `document.fonts.check` false).
 *  2. `prebuild` runs BEFORE the build that creates the hashes, so the emitted
 *     CSS is not available yet (fresh checkout / `rm -rf .next`).
 *
 * Hence a stable, hand-declared stand-in: the critical sheet defines a BODY
 * font-decoration class itself (`critical-fonts`, used only by the 404 chrome
 * when the next/font hash is unknown). When a previous build IS available, the
 * real hashed rules are appended as well, so the document shell's own classes
 * resolve too.
 */
export const CRITICAL_FONT_CLASS = 'critical-fonts';
/**
 * Declares the font tokens AND the derived stacks on the element itself. The
 * globals.css body rule sets `--font-heading/--font-body/--font-mono` from
 * `--font-space-grotesk-stack`; in the error document there is no matching
 * <body> class, so the stacks have to be repeated here — otherwise `font-heading`
 * resolves to the empty fallback (measured: h1 fell back to ui-sans-serif while
 * the raw next/font token was present).
 */
const CRITICAL_FONT_RULES =
  '.critical-fonts{' +
  '--font-space-grotesk:"Space Grotesk","Space Grotesk Fallback",ui-sans-serif;' +
  '--font-jetbrains-mono:"JetBrains Mono","JetBrains Mono Fallback",ui-monospace;' +
  '--font-space-grotesk-stack:var(--font-space-grotesk),ui-sans-serif,system-ui,sans-serif;' +
  '--font-jetbrains-mono-stack:var(--font-jetbrains-mono),ui-monospace,SFMono-Regular,Menlo,monospace;' +
  '--font-sans:var(--font-space-grotesk-stack);' +
  '--font-heading:var(--font-space-grotesk-stack);' +
  '--font-body:var(--font-space-grotesk-stack);' +
  '--font-mono:var(--font-jetbrains-mono-stack);' +
  '--default-font-family:var(--font-body);' +
  '--default-mono-font-family:var(--font-mono);' +
  'font-family:var(--font-body);' +
  '}';

function extractFontVariableRules(projectRoot: string): string {
  const cssDir = path.join(projectRoot, '.next', 'static');
  const rules = new Map<string, string>();
  const walk = (dir: string): void => {
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith('.css')) continue;
      const content = readFileSync(full, 'utf8');
      for (const match of content.matchAll(
        /(\.[A-Za-z0-9_-]+_variable\{[^}]*--font-(?:space-grotesk|jetbrains-mono)[^}]*\})/g,
      )) {
        rules.set(match[1], match[1]);
      }
    }
  };
  walk(cssDir);
  return [...rules.values()].join('\n');
}

/** Same loader setup the Turbopack Tailwind loader uses. */
export async function buildCritical404Css(
  globalsCss: string,
  globalsPath: string,
  onDependency: (dependency: string) => void,
): Promise<string> {
  const options: CompileOptions = {
    from: globalsPath,
    base: path.dirname(globalsPath),
    shouldRewriteUrls: false,
    onDependency,
  };
  // Tailwind scans `base` for candidates; the class list above lives in THIS
  // file, so it is added as an explicit `@source`.
  const sourceLine = `@source inline("${CRITICAL_404_SOURCE}");`;
  const compiler = await compile(`${globalsCss}\n${sourceLine}`, options);
  const css = compiler.build([]);
  const projectRoot = path.resolve(path.dirname(globalsPath), '..', '..');
  const fontRules = [CRITICAL_FONT_RULES, extractFontVariableRules(projectRoot)]
    .filter(Boolean)
    .join('\n');
  // Font tokens without a fallback invalidate the whole declaration (Times).
  // MEASURED: next/font only defines --font-space-grotesk after its own CSS is
  // applied; the global body rule otherwise wins with `--font-sans`. Hence the
  // fallback is appended here.
  const withFallbacks = css.replace(
    /font-family:\s*var\(--font-(mono|body|heading|sans)\)\s*;/g,
    (_match, name: string) =>
      `font-family: var(--font-${name}, ui-${name === 'mono' ? 'monospace' : 'sans-serif'}, sans-serif);`,
  );
  return `${withFallbacks}\n${fontRules}\n`;
}

/** Reads globals.css, compiles the subset with Tailwind, returns CSS + hash. */
export async function generateCritical404Css(
  projectRoot = process.cwd(),
): Promise<{ css: string; hash: string }> {
  const globalsPath = path.join(projectRoot, 'src', 'app', 'globals.css');
  const css = await buildCritical404Css(
    readFileSync(globalsPath, 'utf8'),
    globalsPath,
    () => undefined,
  );
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 12);
  return { css, hash };
}
