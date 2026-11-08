import type { Translation } from '@/payload-types';

/**
 * Typed accessors for the `translations` global.
 *
 * RULE (08.11.2026): no user-visible string lives in the codebase. Every label,
 * accessible name, chip and status line is CMS copy, read through the cached
 * layer (`translations.server.ts` → `'use cache'`) and rendered on the server.
 * This module is the ONLY way components reach a string.
 *
 * STORAGE: the global keeps its legacy groups (`common`, `cookies`, …) AND a
 * key/value array (`copy`) for everything added since. The array exists because
 * Payload's Postgres adapter aggregates a localized table with
 * `json_build_array(<one argument per column>)` and Postgres caps function
 * arguments at 100 — a localized table wider than that cannot be read at all
 * (measured: `translations_locales` hit 129 columns). New strings are ROWS, so
 * the key space can grow without bound.
 *
 * WHY A HELPER:
 *
 * 1. **Type-safe keys.** {@link COPY_KEYS} is the single declared registry of
 *    addresses; {@link TranslationKey} is derived from it, so a typo is a
 *    compile error and every consumer of a removed key stops compiling.
 * 2. **One fallback policy.** A partially seeded database (new key, editor
 *    cleared a row) must never print `undefined`. Every miss returns `''`, and
 *    the renderer decides whether that means "render nothing" — it never
 *    invents English copy.
 * 3. **Placeholders.** `{name}` tokens are the only interpolation mechanism, so
 *    translators can move them ("switch to {language}") without code edits.
 *
 * CLIENT-SAFE MODULE. It holds the key registry and the pure readers and must
 * never import `next/cache` or anything `'use cache'` — client components use
 * it with the `TranslationsProvider` context, server components through
 * `translations.server.ts`.
 */

/** One copy row: the address plus its value(s). */
export type TranslationCopyRow = {
  key: string;
  text?: string | null;
  /** For list values: one entry per line. */
  values?: string | null;
};

/** Everything the readers accept: the global, or just its `copy` rows. */
export type TranslationSource =
  Partial<Translation> | readonly TranslationCopyRow[] | null | undefined;

/** Substitutions for `{token}` placeholders, e.g. `{ language: 'Deutsch' }`. */
export type TranslationVars = Record<string, string>;

/**
 * THE registry of copy addresses.
 *
 * Values are the fallback used when a row is missing — deliberately the SAME
 * string as the CMS seed (see the migration), so a fresh database renders the
 * real copy and an editor can still override every entry. They are not a second
 * copy table to maintain: they are the seed, and the runtime never renders them
 * when the CMS has an answer.
 */
export const COPY_KEYS = {
  // -- Chrome (header, drawer, footer, page header) ---------------------------
  'chrome.brandClaim': 'Web & Application Architect',
  'chrome.skipToContent': 'Skip to content',
  'chrome.homeAria': 'home',
  'chrome.languageSwitchAria': 'Switch language to {language}',
  'chrome.languageName': 'English (EN)',
  'chrome.closeMenu': 'Close menu',
  'chrome.currentPage': 'Current page',
  'chrome.drawerStatus': 'Kiebitzreihe · DE',
  'chrome.footerNavAria': 'Footer',
  'chrome.footerCredits': 'Next.js 16 / Payload 4 / Postgres',
  'chrome.roleBadge': 'web & application architect',
  'chrome.levelBadge': 'Senior-Level FullStack',
  'chrome.modeBadge': 'remote · DE',
  'chrome.locationBadge': 'Kiebitzreihe · Hamburg area',
  'chrome.portraitMonogram': 'MO',
  'chrome.breadcrumbHome': 'Home',
  'chrome.notFoundCode': 'HTTP 404 · Not Found',

  // -- Settings --------------------------------------------------------------
  'settings.eyebrow': 'settings',

  // -- Hero ------------------------------------------------------------------
  'blocks.hero.stackLabel': 'stack',

  // -- Case study ------------------------------------------------------------
  'blocks.caseStudy.eyebrow': 'case study',
  'blocks.caseStudy.periodLabel': 'period',
  'blocks.caseStudy.roleLabel': 'role',
  'blocks.caseStudy.contextLabel': 'Context',
  'blocks.caseStudy.solutionLabel': 'Architecture',
  'blocks.caseStudy.impactLabel': 'Impact',
  'blocks.caseStudy.tagsLabel': 'context',
  'blocks.caseStudy.linkSrLabel': 'Reference link',
  'blocks.caseStudy.linkFallbackLabel': 'Link',
  'blocks.caseStudy.impactEyebrow': 'impact',

  // -- Timeline --------------------------------------------------------------
  'blocks.timeline.stationSingular': 'station',
  'blocks.timeline.stationPlural': 'stations',
  'blocks.timeline.emptyPeriod': '—',

  // -- Tech radar ------------------------------------------------------------
  'blocks.techRadar.tierCore': 'core',
  'blocks.techRadar.tierProven': 'proven',
  'blocks.techRadar.tierFocus': 'focus',
  'blocks.techRadar.entriesSingular': 'entry',
  'blocks.techRadar.entriesPlural': 'entries',
  'blocks.techRadar.quadrantPrefix': 'q',

  // -- Call to action --------------------------------------------------------
  'blocks.callToAction.eyebrowPrimary': 'call to action',
  'blocks.callToAction.eyebrowSecondary': 'next step',
  'blocks.callToAction.responseNote': 'Usually answered within 24 hours',

  // -- Architecture diagram --------------------------------------------------
  'blocks.architecture.defaultSectionLabel': 'Architecture',
  'blocks.architecture.layerSingular': 'layer',
  'blocks.architecture.layerPlural': 'layers',
  'blocks.architecture.tablistAria': 'Architecture layers',
  'blocks.architecture.stackLabel': 'stack',

  // -- Status strip ----------------------------------------------------------
  'blocks.status.gaugeLabel': 'signal',

  // -- Bento grid ------------------------------------------------------------
  'blocks.bento.pillarPrefix': 'Pillar',
  'blocks.bento.featuredLabel': 'Featured',
  'blocks.bento.eyebrow': 'Architecture approach',
  'blocks.bento.pillarSingular': 'pillar',
  'blocks.bento.pillarPlural': 'pillars',
  'blocks.bento.architectureChip': 'System architecture',
  'blocks.bento.composableChip': 'composable',

  // -- Skillset --------------------------------------------------------------
  'blocks.skillset.eyebrow': 'skillset',
  'blocks.skillset.itemPrefix': 'skill',

  // -- Image/text ------------------------------------------------------------
  'blocks.imageText.eyebrow': 'content',
  'blocks.imageText.imagePlaceholder': '[ image ]',

  // -- Routes ----------------------------------------------------------------
  'routes.imprint.title': 'Imprint',
  'routes.imprint.eyebrow': 'Home // Imprint',
  'routes.imprint.empty':
    'The imprint content is being updated. Please direct any enquiry to mail@mostheimer.de.',
  'routes.imprint.metaDescription':
    'Legal notice under § 5 DDG (German law): provider, contact, email and phone number of Mayra Ostheimer.',
  'routes.error.code': 'HTTP 500 · Error',
  'routes.error.title': 'Something went wrong',
  'routes.error.message':
    'This page could not be loaded right now. Please try again — the home page is always reachable.',
  'routes.error.home': 'Back to home',
  'routes.error.retry': 'Try again',
} as const satisfies Record<string, string>;

/** Address of one copy string (`'chrome.brandClaim'`, `'routes.error.title'`). */
export type TranslationKey = keyof typeof COPY_KEYS;

/**
 * THE registry of LIST addresses (`values` = one entry per line).
 *
 * Lists cannot be a plain string row, so they are declared separately and read
 * with {@link getTranslationList}. `commandItems.*` are addressed per entry id
 * at runtime (`commandItems.<id>.label`), which is why the two command-palette
 * addresses are not enumerated here.
 */
export const COPY_LIST_KEYS = {
  /** Stack chips of the hero (`Node 26` …). */
  'blocks.hero.stackItems': ['Node 26', 'Next.js 16', 'Tailwind 4', 'PayloadCMS 4'],
  /** Hero metric strip: `label|value` per line. */
  'blocks.hero.metrics': [
    'Experience|~10 yrs',
    'Focus|composable',
    'Mode|remote (DE)',
    'Response|< 24 h',
  ],
  /** Command-palette entry labels, addressed as `commandItems.<id>.label`. */
  'commandItems.labels': [],
} as const satisfies Record<string, readonly string[]>;

/** Address of one copy LIST. */
export type TranslationListKey = keyof typeof COPY_LIST_KEYS;

/** A resolved copy value; `''` means "not translated" (render nothing). */
export type TranslationValue = string;

// -- Reading ----------------------------------------------------------------

/** Normalises the source to a key → row map (row arrays are indexed once). */
function toRowMap(source: TranslationSource): Map<string, TranslationCopyRow> {
  const map = new Map<string, TranslationCopyRow>();
  if (!source) return map;

  const rows: readonly TranslationCopyRow[] = Array.isArray(source)
    ? (source as readonly TranslationCopyRow[])
    : ((source as Partial<Translation>).copy ?? []);
  for (const row of rows) {
    if (row && typeof row.key === 'string') map.set(row.key.trim(), row);
  }
  return map;
}

/**
 * Legacy groups (`common`, `cookies`, `clipboard`, …) still live as real
 * columns. A row wins over a legacy field of the same address, so migrating a
 * group into `copy` needs no code change.
 */
function readLegacy(source: TranslationSource, key: string): unknown {
  if (!source || Array.isArray(source)) return undefined;
  let cursor: unknown = source;
  for (const segment of key.split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

/**
 * Legacy groups (`cookies`, `clipboard`, `common`, …) that still map to real
 * columns. They predate the `copy` row array and keep their addressable name, so
 * `getCopy(source, 'cookies.title')` works exactly like a new key.
 */
export const LEGACY_GROUP_NAMES = [
  'settings',
  'common',
  'commandPalette',
  'footer',
  'cookies',
  'clipboard',
  'contactActions',
] as const;

export type LegacyGroupName = (typeof LEGACY_GROUP_NAMES)[number];

/** `'cookies.title'` → group `cookies`, field `title`. */
export type LegacyCopyKey = `${LegacyGroupName}.${string}`;

/**
 * Reads a legacy group field (`cookies.title`, `clipboard.copyLabel`).
 *
 * Kept separate from {@link getTranslation} so the typed key space of the new
 * copy stays closed while legacy groups remain reachable by their historical
 * paths. Returns `''` for anything missing.
 */
export function getLegacyCopy(source: TranslationSource, key: LegacyCopyKey): string {
  const legacy = readLegacy(source, key);
  return typeof legacy === 'string' ? legacy.trim() : '';
}

/**
 * Replaces `{token}` placeholders. Unknown tokens stay untouched (visible in
 * review) instead of being silently dropped.
 */
export function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in vars ? vars[token] : match,
  );
}

/**
 * Reads one copy string.
 *
 * Resolution order: CMS row → legacy column → declared seed. A blank editor
 * value is treated as "not translated" and falls through, so clearing a field
 * can never blank the UI by accident; the declared seed is the same text the
 * migration wrote, so a fresh database renders the real copy either way.
 *
 * @example
 * getTranslation(t, 'chrome.brandClaim');                       // 'Web & Application Architect'
 * getTranslation(t, 'chrome.languageSwitchAria', { language }); // 'Switch language to Deutsch'
 */
export function getTranslation(
  source: TranslationSource,
  key: TranslationKey,
  vars?: TranslationVars,
): TranslationValue {
  const row = toRowMap(source).get(key);
  const fromCms = typeof row?.text === 'string' ? row.text.trim() : '';
  const legacy = readLegacy(source, key);
  const fromLegacy = typeof legacy === 'string' ? legacy.trim() : '';
  const value = fromCms || fromLegacy || COPY_KEYS[key];
  return interpolate(value, vars).trim();
}

/**
 * Like {@link getTranslation} but with an explicit fallback for a key that is
 * intentionally absent from the CMS (data, not copy — e.g. a brand name coming
 * from `site-settings`).
 */
export function getTranslationOr<T>(
  source: TranslationSource,
  key: TranslationKey,
  fallback: T,
  vars?: TranslationVars,
): TranslationValue | T {
  return getTranslation(source, key, vars) || fallback;
}

/**
 * Reads a copy LIST (stack chips, metric strip).
 *
 * The CMS row holds one entry per line; an unset row resolves to the declared
 * seed. Blank lines are dropped, so an editor may leave gaps.
 */
export function getTranslationList(source: TranslationSource, key: TranslationListKey): string[] {
  const row = toRowMap(source).get(key);
  const raw = typeof row?.values === 'string' ? row.values : '';
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [...COPY_LIST_KEYS[key]];
}

/**
 * Command-palette copy for one entry id.
 *
 * The information architecture (id → href, anchor) stays a static constant in
 * `commandItems.ts` — that is structure, not prose. This only provides what is
 * visible: the label (`commandItems.<id>.label`) and the search keywords
 * (`commandItems.<id>.keywords`, comma separated).
 */
export function commandItemCopy(
  source: TranslationSource,
  id: string,
): { label: string; keywords: string[] | null } {
  const rows = toRowMap(source);
  const label = (rows.get(`commandItems.${id}.label`)?.text ?? '').trim();
  const keywords = (rows.get(`commandItems.${id}.keywords`)?.text ?? '')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  return { label, keywords: keywords.length > 0 ? keywords : null };
}

/** Copy rows of the global, for writers that append/update a single address. */
export function withCopyRow(
  source: TranslationSource,
  key: string,
  patch: Partial<Pick<TranslationCopyRow, 'text' | 'values'>>,
): TranslationCopyRow[] {
  const rows = (
    Array.isArray(source) ? [...source] : [...((source as Partial<Translation>)?.copy ?? [])]
  ).map((row) => ({ key: row.key, text: row.text ?? '', values: row.values ?? '' }));
  const index = rows.findIndex((row) => row.key === key);
  if (index === -1) {
    rows.push({ key, text: patch.text ?? '', values: patch.values ?? '' });
  } else {
    rows[index] = { ...rows[index], ...patch };
  }
  return rows;
}
