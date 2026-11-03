import { LLMS_TXT } from '@/cms/aeo/llmsTxt';

/**
 * /llms.txt (llmstxt.org v2, kuratiert — AEO-Layer, Research P2):
 * kuratierte Markdown-Übersicht für Agenten und KI-Such-Surfaces.
 * Inhalt: H1 (Pflicht) → Blockquote-TL;DR → Kontext-Absätze → H2-Linklisten
 * (v2: `Optional`-Semantik entfallen).
 *
 * Route-Handler statt public-Datei: Next serves public-Assets nur aus
 * <root>/public; dieses Repo haellt statische Assets in src/public
 * (Dockerfile kopiert sie), der Dev-Server erreicht src/public aber
 * nicht. Ein Route-Handler greift in Dev UND Prod identisch — ohne
 * Dockerfile-Aenderung.
 *
 * cacheComponents-Compat: Handler ohne Request-time-APIs und ohne DB-Read
 * → default-cached (buildtime-statisch, Doku opengraph-image.md „special
 * Route Handlers ... cached by default unless ..."), kein Build-ohne-DB-
 * Risiko. Content-Type text/plain; charset=utf-8 (Agent-ROM-Parsing).
 *
 * .md-Varianten je Page und `rel="describedby"`-/Link-Header sind
 * Research P3 — bewusst NICHT in diesem Layer (llms.txt-Einstieg deckt
 * die Discovery-Menge; Ausbau ggf. Folgetask).
 */
export function GET(): Response {
  return new Response(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
