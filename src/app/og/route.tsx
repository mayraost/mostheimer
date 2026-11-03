import { ImageResponse } from 'next/og';
import { OG_SIZE, OgCard, sanitizeOgTitle } from '@/components/og/ogCard';

/**
 * OG-Image-Route (AEO-Layer, Research P2 — aber mit Pivot):
 *
 * Die `opengraph-image.tsx`-Dateikonvention kann NICHT im optionalen
 * Catch-All-`[[...slug]]`-Segment liegen (Next 16.4.5, verifiziert am
 * Build: „Optional catch-all must be the last part of the URL" — die
 * interne Metadata-Route `opengraph-image-<hash>` wird als Kind-Segment
 * hinter den optionalen Catch-All gehängt). Per-Page-Karten stattdessen
 * über explizite `openGraph.images`-URLs in `generateMetadata`, die auf
 * diese Route zeigen (klassisches Metadata-API-Pattern, wiki-Todo-Record
 * vermerkt die Abweichung vom Research-Empfehlungspath).
 *
 * Begründung Route-Handler statt Server Action (AGENTS-Regel): reine
 * Byte-Response (PNG) ohne UI-Anteil, Abnehmer sind externe Crawler/
 * Link-Vorschau-Fetcher. Kein DB-Read (Titel kommt per Query-Param aus
 * generateMetadata) → kein Build-Prerender-Risiko; searchParams machen
 * den Handler request-time (ƒ, cacheComponents-Kompatibilität).
 *
 * Sicherheitsprofil: Parameter sind Textslots in einem SVG-Render, kein
 * HTML-Ausgabe-Kontext (Satori → PNG); Länge via sanitizeOgTitle
 * begrenzt. Kein SSRF/DB-Zugriff möglich.
 */
export function GET(request: Request): ImageResponse {
  const searchParams = new URL(request.url).searchParams;
  const title = sanitizeOgTitle(searchParams.get('t') ?? 'Mostheimer');
  const subtitle = sanitizeOgTitle(searchParams.get('s') ?? 'Personal website');

  return new ImageResponse(<OgCard title={title} subtitle={subtitle} />, {
    ...OG_SIZE,
  });
}
