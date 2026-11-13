/**
 * Storybook-Manager-HTML auf absolute Asset-Pfade heben.
 *
 * Warum: `storybook build` schreibt den Manager so, dass er auch direkt aus dem
 * Dateisystem geöffnet werden kann — die Bundles stehen deshalb relativ
 * (`./sb-manager/runtime.js`, `./sb-addons/…`). Ausgeliefert wird hier aber
 * unter dem Unterpfad `/storybook` (kanonisch OHNE trailing slash, siehe
 * `next.config.ts`); dort würde `./sb-manager/…` gegen `/sb-manager/…`
 * aufgelöst und liefe ins 404.
 *
 * `.storybook/main.ts` setzt zusätzlich `<base href="/storybook/">`, das alle
 * URLs abfängt, die der Manager erst zur Laufzeit baut (Preview-iframe,
 * `index.json`). Die `<link rel="modulepreload">`-Tags stehen im Template aber
 * VOR dem `<base>` und werden beim Parsen schon gegen die Dokument-URL
 * aufgelöst — genau diese vier Requests waren im Smoke-Test 404 (Content-Type
 * `text/html` statt JavaScript). Deshalb hier statisch absolut machen.
 *
 * Plain Node, keine Imports aus `src/**` (Build-Time-Skript).
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT_DIR = 'src/public/storybook';
const BASE_PATH = '/storybook/';
const INDEX_FILE = `${OUT_DIR}/index.html`;

const html = await readFile(INDEX_FILE, 'utf8');
// Nur echte HTML-Attribute (`href="./…"`, `src="./…"`) und Inline-CSS-`url()`
// (`@font-face` der Manager-UI), kein Inline-JS.
const fixed = html
  .replace(/(href|src)="\.\//g, `$1="${BASE_PATH}`)
  .replace(/url\('\.\//g, `url('${BASE_PATH}`);

if (fixed === html) {
  console.log(`[storybook] ${INDEX_FILE}: keine relativen Asset-Pfade gefunden`);
} else {
  await writeFile(INDEX_FILE, fixed);
  const count = html.match(/(href|src)="\.\/|url\('\.\//g)?.length ?? 0;
  console.log(`[storybook] ${INDEX_FILE}: ${count} Asset-Pfad(e) auf ${BASE_PATH} gehoben`);
}
