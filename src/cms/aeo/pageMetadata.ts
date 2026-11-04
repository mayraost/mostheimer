import type { Page } from '@/payload-types';

/**
 * Meta-Description-Ableitung aus dem CMS-Inhalt (AEO/SEO-Layer).
 *
 * Die `pages`-Collection hat kein Description-Feld — Metadaten fielen
 * bislang auf die globale Site-Description des Layouts zurück (identisch
 * auf JEDER Seite, Lighthouse-SEO-/Snippet-Schwachpunkt). Statt das Schema
 * zu ändern (Migration + Admin-UI) leiten wir die Description aus dem
 * ersten inhaltstragenden Block ab:
 *
 * - erste bewusst gesetzte Kurzbeschreibung (`hero.subheading`,
 *   `statusBlock.description`) gewinnt,
 * - sonst der erste Textblock (`techSection.body`, `caseStudy.context`,
 *   `richText`-Fließtext, `imageText.text`, `callToAction.text`).
 *
 * Ergebnis wird auf ~155 Zeichen (Google-Snippet-Breite) an einer
 * Wortgrenze gekürzt; zu kurze Treffer (< 40 Zeichen) gelten als
 * „keine Description" → `null`, damit der Aufrufer den Fallback nutzt.
 */

export const META_DESCRIPTION_MAX = 155;
const META_DESCRIPTION_MIN = 40;

type PageBlock = NonNullable<Page['layout']>[number];

/** Lexical-Root → reiner Text (Absätze mit Leerzeichen verbunden). */
function lexicalToText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const record = node as { text?: unknown; children?: unknown };
  const own = typeof record.text === 'string' ? record.text : '';
  const children = Array.isArray(record.children)
    ? record.children.map((child) => lexicalToText(child)).join(' ')
    : '';
  return `${own} ${children}`.trim();
}

function blockText(block: PageBlock): string {
  switch (block.blockType) {
    case 'hero':
      return block.subheading ?? '';
    case 'statusBlock':
      return block.description ?? '';
    case 'techSection':
      return block.body ?? '';
    case 'caseStudy':
      return block.context ?? block.solution ?? '';
    case 'imageText':
      // `imageText.text` ist ein Lexical-Rich-Text-Feld (kein String).
      return lexicalToText(JSON.parse(JSON.stringify(block.text)));
    case 'callToAction':
      return block.text ?? '';
    case 'richText': {
      // `content` ist typseitig ein Lexical-Root-Objekt; der Textabzug
      // arbeitet auf der JSON-Form (children/text rekursiv).
      return lexicalToText(JSON.parse(JSON.stringify({ root: block.content })));
    }
    default:
      return '';
  }
}

/** Whitespace normalisieren (CMS-Textareas enthalten Absatz-Umbrüche). */
function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** An einer Wortgrenze auf `max` Zeichen kürzen, mit Ellipse. */
export function truncateDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const normalized = normalize(text);
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[,;:.\-–—\s]+$/, '')}…`;
}

/**
 * Beschreibung der Seite aus ihrem Inhalt; `null`, wenn kein Block einen
 * verwendbaren Text liefert.
 */
export function derivePageDescription(page: Pick<Page, 'layout'>): string | null {
  for (const block of page.layout ?? []) {
    const text = truncateDescription(blockText(block));
    if (text.length >= META_DESCRIPTION_MIN) return text;
  }
  return null;
}
