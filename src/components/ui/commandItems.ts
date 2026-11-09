import type { CommandItem } from '@/components/ui/CommandPalette';
import { commandItemCopy } from '@/lib/translations';
import type { TranslationSource } from '@/lib/translations';

/**
 * Command palette entries.
 *
 * Split by concern (rule since 08.11.2026 — no hardcoded copy):
 *
 * - **Structure** (this constant): entry id, target path, group, and the
 *   locale-aware anchor. Which pages exist and where they point is
 *   information architecture, not editorial copy — it must not be editable in
 *   the CMS, or a typo in a path breaks navigation.
 * - **Copy** (translations global, `commandItems.labels`): the visible label
 *   and the search keywords, per entry id. Until 08.11.2026 these were two
 *   parallel tables in this file (German base + English override), i.e.
 *   exactly the hardcoded prose the rule forbids.
 *
 * `keywords` are search synonyms, not display text: they legitimately mix
 * languages (a German visitor may type "about"), which is why the CMS field is
 * a free-text list.
 *
 * Anchors (`#architektur` / `#architecture`) only exist on the home page and
 * follow the locale (see BentoGridBlock); hence the anchor lives here.
 */

type CommandItemDefinition = Omit<CommandItem, 'label' | 'keywords'> & {
  /** Anchors are locale-dependent; absent = same path in both locales. */
  anchor?: { de: string; en: string };
};

/** Ordered exactly as the palette lists the pages group. */
const ITEMS: CommandItemDefinition[] = [
  { id: 'home', href: '', group: 'pages' },
  {
    id: 'architektur',
    href: '',
    anchor: { de: '#architektur', en: '#architecture' },
    group: 'sections',
  },
  {
    id: 'schaubild',
    href: '',
    anchor: { de: '#architektur-schaubild', en: '#architektur-schaubild' },
    group: 'sections',
  },
  { id: 'case-studies', href: '/case-studies', group: 'pages' },
  { id: 'vibe-coding', href: '/vibe-coding', group: 'pages' },
  { id: 'tech-radar', href: '/tech-radar', group: 'pages' },
  { id: 'leadership', href: '/leadership', group: 'pages' },
  { id: 'career', href: '/career', group: 'pages' },
  { id: 'contact', href: '/contact', group: 'pages' },
  { id: 'impressum', href: '/impressum', group: 'pages' },
  { id: 'settings', href: '/settings', group: 'pages' },
];

/**
 * Builds the palette entries for one locale from the translations global.
 *
 * An entry whose CMS label is empty is DROPPED instead of rendering a blank
 * row: a palette entry without a name is unusable, and inventing a fallback
 * string would reintroduce hardcoded copy.
 */
export function getCommandItems(translations: TranslationSource, locale: string): CommandItem[] {
  const items: CommandItem[] = [];

  for (const definition of ITEMS) {
    const copy = commandItemCopy(translations, definition.id);
    if (!copy.label) continue;

    const href = definition.anchor
      ? definition.anchor[locale === 'de' ? 'de' : 'en']
      : definition.href;

    items.push({
      id: definition.id,
      label: copy.label,
      href,
      group: definition.group,
      keywords: copy.keywords ?? undefined,
    });
  }

  return items;
}
