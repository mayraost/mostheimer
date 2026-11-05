import type { Page } from '@/payload-types';

/**
 * Derives the meta description from CMS content.
 *
 * The `pages` collection has no description field, so every page used to fall
 * back to the layout's global site description. Rather than change the schema
 * (migration + admin UI), the description is taken from the first content-
 * bearing block: an intentional short summary (`hero.subheading`,
 * `statusBlock.description`) wins, otherwise the first text block
 * (`techSection.body`, `caseStudy.context`, `richText`, `imageText.text`,
 * `callToAction.text`).
 *
 * Results are truncated to ~155 characters at a word boundary (Google snippet
 * width); anything under 40 characters counts as "no description" and returns
 * `null` so the caller uses its fallback.
 */

export const META_DESCRIPTION_MAX = 155;
const META_DESCRIPTION_MIN = 40;

type PageBlock = NonNullable<Page['layout']>[number];

/** Lexical root → plain text, with nodes joined by spaces. */
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
      // `imageText.text` is a Lexical rich-text field, not a string.
      return lexicalToText(JSON.parse(JSON.stringify(block.text)));
    case 'callToAction':
      return block.text ?? '';
    case 'richText': {
      // `content` is typed as a Lexical root object; the extractor walks its
      // JSON form (children/text recursively).
      return lexicalToText(JSON.parse(JSON.stringify({ root: block.content })));
    }
    default:
      return '';
  }
}

/** Collapse whitespace (CMS textareas contain paragraph line breaks). */
function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Truncate to `max` characters at a word boundary, with an ellipsis. */
export function truncateDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const normalized = normalize(text);
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[,;:.\-–—\s]+$/, '')}…`;
}

/**
 * Description of a page from its content; `null` when no block yields usable
 * text.
 */
export function derivePageDescription(page: Pick<Page, 'layout'>): string | null {
  for (const block of page.layout ?? []) {
    const text = truncateDescription(blockText(block));
    if (text.length >= META_DESCRIPTION_MIN) return text;
  }
  return null;
}
