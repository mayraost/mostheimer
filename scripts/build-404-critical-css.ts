import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { generateCritical404Css } from './generate-404-critical-css';

/**
 * Writes `src/404-critical.generated.ts`: the pre-hydration stylesheet for the
 * global 404 boundary, compiled from `src/app/globals.css` by Tailwind itself
 * (plus its content hash for cache-busting in the <link> href).
 *
 * Runs via `prebuild` and `npm run generate:css`. The output is committed, so
 * dev server and `next build` never depend on this script.
 */
const root = process.cwd();
const { css, hash } = await generateCritical404Css(root);

const file = `// GENERATED FILE - do not edit by hand.
// Source: src/app/globals.css · Generator: scripts/generate-404-critical-css.ts
// Served at /404-critical.css (src/app/404-critical.css/route.ts) and linked
// eagerly by the global 404 boundary (src/app/(frontend)/not-found.tsx).
// Regenerate: \`npm run generate:css\` (runs automatically before \`npm run build\`).

export const CRITICAL_404_CSS = ${JSON.stringify(css)};

/** Content hash of the CSS — cache-busting query for the <link> href. */
export const CRITICAL_404_HASH = ${JSON.stringify(hash)};
`;

writeFileSync(path.join(root, 'src', '404-critical.generated.ts'), file, 'utf8');

// Format with the project's Prettier config: the emitted JSON uses double
// quotes, while the repo formats with single quotes — without this the file
// fails `npm run lint` on every regeneration.
const prettier = await import('prettier');
const prettierConfig =
  (await prettier.resolveConfig(path.join(root, 'src', '404-critical.generated.ts'))) ?? {};
const formatted = await prettier.format(file, { ...prettierConfig, parser: 'typescript' });
writeFileSync(path.join(root, 'src', '404-critical.generated.ts'), formatted, 'utf8');

console.log(`src/404-critical.generated.ts: ${css.length} bytes of CSS, hash ${hash}`);
