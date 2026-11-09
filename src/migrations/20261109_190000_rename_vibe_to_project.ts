import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Rename the showcase feature from `vibe*` to `project*` — naming decision by
 * the repo owner: the projects are AI-assisted but held to professional
 * standards, so the "vibe" framing is rejected (see AGENTS.md § Naming).
 *
 * ## Why hand-written, not `migrate:create`
 *
 * The schema change is a PURE RENAME: no column is added, dropped or retyped, no
 * row is touched. Drizzle's snapshot diff cannot express "rename", so
 * `migrate:create` would emit `DROP TABLE … / CREATE TABLE …` and destroy the
 * data already in production. Every statement below is an `ALTER … RENAME` —
 * Postgres rewrites the catalog only; data, OIDs and foreign keys survive.
 *
 * ## What Postgres renames for us and what it does not (measured 09.11.2026)
 *
 * `ALTER TABLE x RENAME TO y` renames the table **and its composite row types**
 * (`x` → `y`, `_x` → `_y`) — those come from `pg_class` and follow the name.
 * It does **NOT** rename:
 *
 *   - indexes           → `ALTER INDEX`
 *   - constraints       → `ALTER TABLE … RENAME CONSTRAINT`
 *   - sequences         → `ALTER SEQUENCE` (ownership follows the table, the
 *                         NAME does not)
 *   - enum types        → `ALTER TYPE`
 *
 * Payload names every index/constraint `<table><suffix>`, so the new name is
 * the old one with the table prefix swapped (`deriveRenamed` below). The few
 * names that break that rule — the truncated 63-char media-variant indexes and
 * the enum types — are listed explicitly.
 *
 * ## Idempotency
 *
 * Every statement is guarded on "old name still exists AND new name does not"
 * (`to_regclass` / `pg_type` / `information_schema` / `pg_catalog`). A second
 * run, a partially applied run, or a fresh database created from the
 * already-renamed snapshots is therefore a no-op instead of an error.
 *
 * ## Deliberately NOT in this migration
 *
 * - `payload_migrations`: applied migrations are identified by NAME and are
 *   never renamed; the four `*_vibe_*` rows stay as history.
 * - `translations.copy`: the copy keys were renamed in code
 *   (`blocks.vibeShowcase.*` → `blocks.projectShowcase.*`,
 *   `routes.vibeProject.*` → `routes.project.*`,
 *   `commandItems.vibe-coding.*` → `commandItems.projects.*`). Those rows are
 *   CONTENT and are re-seeded through the Payload MCP, never by SQL (AGENTS.md
 *   § Payload-MCP). No DELETE here: the orphaned old rows are inert, and
 *   deleting them would be an irreversible content change hidden in a schema
 *   migration.
 */

/** `[old, new]` — the rename rule every PK/index/constraint name is derived from. */
const TABLES = [
  // collection `vibeProjects` → `projects`
  ['vibe_projects', 'projects'],
  ['vibe_projects_locales', 'projects_locales'],
  ['vibe_projects_rels', 'projects_rels'],
  ['vibe_projects_texts', 'projects_texts'],
  // versions of `projects`
  ['_vibe_projects_v', '_projects_v'],
  ['_vibe_projects_v_locales', '_projects_v_locales'],
  ['_vibe_projects_v_rels', '_projects_v_rels'],
  ['_vibe_projects_v_texts', '_projects_v_texts'],
  // collection `vibeTags` → `projectTags`
  ['vibe_tags', 'project_tags'],
  ['vibe_tags_locales', 'project_tags_locales'],
  ['vibe_tags_rels', 'project_tags_rels'],
  ['_vibe_tags_v', '_project_tags_v'],
  ['_vibe_tags_v_locales', '_project_tags_v_locales'],
  ['_vibe_tags_v_rels', '_project_tags_v_rels'],
  // block `vibeShowcase` → `projectShowcase` (lives on `pages`)
  ['pages_blocks_vibe_showcase', 'pages_blocks_project_showcase'],
  ['_pages_v_blocks_vibe_showcase', '_pages_v_blocks_project_showcase'],
] as const;

/**
 * Explicitly named objects the `TABLES` rule cannot derive, plus the four
 * relationship columns that also carry the collection slug.
 * `[old, new]` for indexes and constraints alike (they share one guard: the
 * object must exist as an index OR a constraint).
 */
const IRREGULAR = [
  // enum TYPES — `ALTER TYPE … RENAME` keeps every label and every stored value.
  // Never DROP/CREATE while rows can use the type (the enum-churn trap in AGENTS.md).
  ['enum_vibe_projects_kind', 'enum_projects_kind'],
  ['enum_vibe_projects_status', 'enum_projects_status'],
  ['enum__vibe_projects_v_version_kind', 'enum__projects_v_version_kind'],
  ['enum__vibe_projects_v_version_status', 'enum__projects_v_version_status'],
  ['enum__vibe_projects_v_published_locale', 'enum__projects_v_published_locale'],
  // media-variant filename indexes. The NEW names are not guessable: Postgres
  // truncates identifiers at 63 chars, so the new name depends on the prefix
  // length. Taken verbatim from Payload's own diff (`migrate:create` against the
  // live schema emitted exactly these), so the snapshot stays in sync.
  [
    'media_variants_vibe_tile_variants_vibe_tile_filename_idx',
    'media_variants_tile_variants_tile_filename_idx',
  ],
  [
    'media_variants_vibe_tile_wide_variants_vibe_tile_wide_fi_idx',
    'media_variants_tile_wide_variants_tile_wide_filename_idx',
  ],
  [
    'media_variants_vibe_hero_variants_vibe_hero_filename_idx',
    'media_variants_hero_variants_hero_filename_idx',
  ],
  [
    '_media_v_version_variants_vibe_tile_version_variants_vib_idx',
    '_media_v_version_variants_tile_version_variants_tile_fil_idx',
  ],
  [
    '_media_v_version_variants_vibe_tile_wide_version_variant_idx',
    '_media_v_version_variants_tile_wide_version_variants_til_idx',
  ],
  [
    '_media_v_version_variants_vibe_hero_version_variants_vib_idx',
    '_media_v_version_variants_hero_version_variants_hero_fil_idx',
  ],
  // relationship columns that embed BOTH collection slugs
  ['vibe_projects_rels_vibe_tags_id_idx', 'projects_rels_project_tags_id_idx'],
  ['_vibe_projects_v_rels_vibe_tags_id_idx', '_projects_v_rels_project_tags_id_idx'],
  ['vibe_projects_rels_vibe_tags_fk', 'projects_rels_project_tags_fk'],
  ['_vibe_projects_v_rels_vibe_tags_fk', '_projects_v_rels_project_tags_fk'],
  [
    'payload_locked_documents_rels_vibe_projects_id_idx',
    'payload_locked_documents_rels_projects_id_idx',
  ],
  [
    'payload_locked_documents_rels_vibe_tags_id_idx',
    'payload_locked_documents_rels_project_tags_id_idx',
  ],
  ['payload_locked_documents_rels_vibe_projects_fk', 'payload_locked_documents_rels_projects_fk'],
  ['payload_locked_documents_rels_vibe_tags_fk', 'payload_locked_documents_rels_project_tags_fk'],
  ['_vibe_tags_v_parent_id_vibe_tags_id_fk', '_project_tags_v_parent_id_project_tags_id_fk'],
  ['_vibe_projects_v_parent_id_vibe_projects_id_fk', '_projects_v_parent_id_projects_id_fk'],
] as const;

/**
 * Every suffix Payload emits on the tables above — taken from the LIVE catalog
 * (`pg_indexes` + `pg_constraint`), not from memory: a missed suffix leaves a
 * `vibe*` name behind, and a wrong index name breaks `migrate:create` later.
 */
const OBJECT_SUFFIXES = [
  '_pkey',
  '__status_idx',
  '_created_at_idx',
  '_updated_at_idx',
  '_slug_idx',
  '_order_idx',
  '_featured_idx',
  '_published_locale_idx',
  '_latest_idx',
  '_parent_idx',
  '_path_idx',
  '_locale_idx',
  '_parent_id_idx',
  '_cover_image_idx',
  '_cover_image_id_media_id_fk',
  '_media_fk',
  '_media_id_idx',
  '_users_fk',
  '_users_id_idx',
  '_parent_fk',
  '_parent_id_fk',
  '_parent_id_locale_unique',
  '_texts_parent_fk',
  '_texts_locale_parent',
  '_texts_order_parent',
  '_version_version__status_idx',
  '_version_version_slug_idx',
  '_version_version_order_idx',
  '_version_version_created_at_idx',
  '_version_version_updated_at_idx',
  '_version_version_cover_image_idx',
  '_version_cover_image_id_media_id_fk',
] as const;

type Direction = 'up' | 'down';
type Pair = readonly [string, string];

/** Swaps `from`/`to` for the `down()` direction. */
function orient([old, next]: Pair, dir: Direction): Pair {
  return dir === 'up' ? [old, next] : [next, old];
}

/** SQL string literal. The inputs are compile-time constants above. */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** `to_regclass` argument for a public relation — ONE literal, not `lit()` of a concat. */
function regclass(value: string): string {
  return lit(`public.${value}`);
}

/**
 * `<old table><suffix>` → `<new table><suffix>`, always in OLD→NEW order.
 * The caller orients each pair for its direction (orienting here too would
 * apply the swap twice and break `down()`).
 */
function deriveObjectNames(): Pair[] {
  const names: Pair[] = [];
  for (const [fromTable, toTable] of TABLES) {
    for (const suffix of OBJECT_SUFFIXES) {
      names.push([`${fromTable}${suffix}`, `${toTable}${suffix}`]);
    }
  }
  return names;
}

/** Sequences follow the OWNED table's name — derived, never implicit. Always OLD→NEW. */
function deriveSequenceNames(): Pair[] {
  return TABLES.map(
    ([fromTable, toTable]) => [`${fromTable}_id_seq`, `${toTable}_id_seq`] as const,
  );
}

/** Renamed media-variant columns, built from the three variant names. */
const VARIANTS = ['tile', 'tile_wide', 'hero'] as const;
const VARIANT_FIELDS = [
  'url',
  'width',
  'height',
  'mime_type',
  'filesize',
  'filename',
  'prefix',
  '_objectkey',
] as const;

/** `['table', oldColumn, newColumn]` — table names are the NEW ones. */
function columnPairs(): Array<readonly [string, string, string]> {
  const pairs: Array<readonly [string, string, string]> = [];
  for (const variant of VARIANTS) {
    for (const field of VARIANT_FIELDS) {
      pairs.push(['media', `variants_vibe_${variant}_${field}`, `variants_${variant}_${field}`]);
      pairs.push([
        '_media_v',
        `version_variants_vibe_${variant}_${field}`,
        `version_variants_${variant}_${field}`,
      ]);
    }
  }
  // relationship columns (after the table rename)
  pairs.push(['projects_rels', 'vibe_tags_id', 'project_tags_id']);
  pairs.push(['_projects_v_rels', 'vibe_tags_id', 'project_tags_id']);
  pairs.push(['payload_locked_documents_rels', 'vibe_projects_id', 'projects_id']);
  pairs.push(['payload_locked_documents_rels', 'vibe_tags_id', 'project_tags_id']);
  return pairs;
}

/** One guarded `ALTER … RENAME` per object: no-op when already renamed. */
function tableStatements(dir: Direction): string {
  return TABLES.map((table) => {
    const [from, to] = orient(table, dir);
    return `
DO $do$ BEGIN
  IF to_regclass(${regclass(from)}) IS NOT NULL
     AND to_regclass(${regclass(to)}) IS NULL THEN
    ALTER TABLE "${from}" RENAME TO "${to}";
  END IF;
END $do$;`;
  }).join('\n');
}

/** Enum-type pairs, isolated from `IRREGULAR` so index/constraint handling never sees them. */
const ENUM_PAIRS = IRREGULAR.filter(([from]) => from.startsWith('enum'));
/** Index/constraint pairs of `IRREGULAR` (media-variant + relationship labels). */
const IRREGULAR_OBJECTS = IRREGULAR.filter(([from]) => !from.startsWith('enum'));

function enumStatements(dir: Direction): string {
  return ENUM_PAIRS.map((pair) => {
    const [from, to] = orient(pair, dir);
    return `
DO $do$ BEGIN
  IF to_regtype(${lit(`public."${from}"`)}) IS NOT NULL
     AND to_regtype(${lit(`public."${to}"`)}) IS NULL THEN
    ALTER TYPE "${from}" RENAME TO "${to}";
  END IF;
END $do$;`;
  }).join('\n');
}

function sequenceStatements(dir: Direction): string {
  return deriveSequenceNames()
    .map((pair) => {
      const [from, to] = orient(pair, dir);
      return `
DO $do$ BEGIN
  IF to_regclass(${regclass(from)}) IS NOT NULL
     AND to_regclass(${regclass(to)}) IS NULL THEN
    ALTER SEQUENCE "${from}" RENAME TO "${to}";
  END IF;
END $do$;`;
    })
    .join('\n');
}

function columnStatements(dir: Direction): string {
  return columnPairs()
    .map(([table, oldName, newName]) => {
      const [from, to] = dir === 'up' ? [oldName, newName] : [newName, oldName];
      return `
DO $do$ BEGIN
  IF to_regclass(${regclass(table)}) IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = ${lit(table)}
                   AND column_name = ${lit(from)})
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = ${lit(table)}
                       AND column_name = ${lit(to)}) THEN
    ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}";
  END IF;
END $do$;`;
    })
    .join('\n');
}

/**
 * Index and constraint renames in ONE guarded block: `ALTER INDEX` fails for a
 * constraint-backed index, so the block picks the right statement by looking up
 * what the name currently is. `pg_class` covers both (a PK/UNIQUE constraint
 * index is also a relation).
 */
function objectStatements(dir: Direction): string {
  const pairs: Pair[] = [...IRREGULAR_OBJECTS, ...deriveObjectNames()];
  return pairs
    .map((pair) => {
      const [from, to] = orient(pair, dir);
      return `
DO $do$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relname = ${lit(from)} AND c.relkind = 'i')
     AND NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                     WHERE n.nspname = 'public' AND c.relname = ${lit(to)} AND c.relkind = 'i') THEN
    ALTER INDEX "${from}" RENAME TO "${to}";
  ELSIF EXISTS (SELECT 1 FROM pg_constraint
                WHERE connamespace = 'public'::regnamespace AND conname = ${lit(from)})
        AND NOT EXISTS (SELECT 1 FROM pg_constraint
                        WHERE connamespace = 'public'::regnamespace AND conname = ${lit(to)}) THEN
    EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
      (SELECT conrelid::regclass::text FROM pg_constraint
       WHERE connamespace = 'public'::regnamespace AND conname = ${lit(from)}),
      ${lit(from)}, ${lit(to)});
  END IF;
END $do$;`;
    })
    .join('\n');
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    '-- 1. enum types (labels + stored values preserved)',
    enumStatements('up'),
    '-- 2. tables (composite row types follow the name; indexes/constraints/sequences do not)',
    tableStatements('up'),
    '-- 3. sequences owned by the renamed tables (ownership follows, the NAME does not)',
    sequenceStatements('up'),
    '-- 4. columns: media variants + relationship columns',
    columnStatements('up'),
    '-- 5. catalog labels: indexes, primary keys, foreign keys',
    objectStatements('up'),
  ].join('\n');
  await db.execute(sql.raw(statements));
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Exact mirror in reverse order — every step is a rename, so this restores
  // the pre-rename catalog without touching a single row.
  const statements = [
    '-- 5b. catalog labels (reverse)',
    objectStatements('down'),
    '-- 4b. columns (reverse)',
    columnStatements('down'),
    '-- 3b. sequences (reverse)',
    sequenceStatements('down'),
    '-- 2b. tables (reverse)',
    tableStatements('down'),
    '-- 1b. enum types (reverse)',
    enumStatements('down'),
  ].join('\n');
  await db.execute(sql.raw(statements));
}
