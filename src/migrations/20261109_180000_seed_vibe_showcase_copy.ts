import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Seeds the `translations.copy` rows of the vibe-coding showcase (BOTH locales).
 *
 * Values are the SAME text the TypeScript registry (`src/lib/translations.ts`)
 * declares as fallback, so a fresh deployment renders the real copy and an
 * editor can override every row afterwards in the admin.
 *
 * Timestamp ordering matters: Payload applies migrations in NAME order, so this
 * data seed (180000) runs AFTER the block schema (175000) and after the
 * `vibeProjects` schema (171931). The `translations_copy` table itself predates
 * both — no dependency, but the order keeps the history readable.
 *
 * Rows for `en` and `de` are inserted in one statement; `WHERE NOT EXISTS` makes
 * the seed idempotent (a re-run never duplicates a key).
 */
const ROWS: Array<{ key: string; en: string; de: string }> = [
  // -- Listing block (`blocks.vibeShowcase.*`) ------------------------------
  { key: 'blocks.vibeShowcase.eyebrow', en: 'vibe coding', de: 'vibe coding' },
  { key: 'blocks.vibeShowcase.countSingular', en: 'project', de: 'Projekt' },
  { key: 'blocks.vibeShowcase.countPlural', en: 'projects', de: 'Projekte' },
  { key: 'blocks.vibeShowcase.featuredLabel', en: 'Featured', de: 'Featured' },
  { key: 'blocks.vibeShowcase.detailLabel', en: 'Case study', de: 'Case Study' },
  { key: 'blocks.vibeShowcase.liveLabel', en: 'Live', de: 'Live' },
  { key: 'blocks.vibeShowcase.githubLabel', en: 'GitHub', de: 'GitHub' },
  { key: 'blocks.vibeShowcase.tagLabel', en: 'Tags', de: 'Tags' },
  { key: 'blocks.vibeShowcase.stackLabel', en: 'Stack', de: 'Stack' },
  {
    key: 'blocks.vibeShowcase.newTabHint',
    en: '(opens in a new tab)',
    de: '(öffnet in neuem Tab)',
  },
  {
    key: 'blocks.vibeShowcase.emptyLabel',
    en: 'No projects published yet.',
    de: 'Noch keine Projekte veröffentlicht.',
  },
  {
    key: 'blocks.vibeShowcase.paginationAria',
    en: 'Vibe coding pagination',
    de: 'Seitennavigation Vibe Coding',
  },
  { key: 'blocks.vibeShowcase.prevLabel', en: 'Previous', de: 'Zurück' },
  { key: 'blocks.vibeShowcase.nextLabel', en: 'Next', de: 'Weiter' },
  { key: 'blocks.vibeShowcase.pageLabel', en: 'Page', de: 'Seite' },
  { key: 'blocks.vibeShowcase.ofLabel', en: 'of', de: 'von' },
  { key: 'blocks.vibeShowcase.kindExperiment', en: 'Experiment', de: 'Experiment' },
  { key: 'blocks.vibeShowcase.kindTool', en: 'Tool', de: 'Tool' },
  { key: 'blocks.vibeShowcase.kindProduct', en: 'Product', de: 'Produkt' },
  { key: 'blocks.vibeShowcase.filterLabel', en: 'Filter by tag', de: 'Nach Tag filtern' },
  { key: 'blocks.vibeShowcase.filterAll', en: 'All', de: 'Alle' },
  {
    key: 'blocks.vibeShowcase.filterEmpty',
    en: 'No projects with this tag yet.',
    de: 'Noch keine Projekte mit diesem Tag.',
  },
  {
    key: 'blocks.vibeShowcase.filterResultCount',
    en: '{count} project',
    de: '{count} Projekt',
  },
  {
    key: 'blocks.vibeShowcase.filterResultCountPlural',
    en: '{count} projects',
    de: '{count} Projekte',
  },

  // -- Detail route (`routes.vibeProject.*`) --------------------------------
  { key: 'routes.vibeProject.eyebrow', en: 'vibe coding', de: 'vibe coding' },
  { key: 'routes.vibeProject.contextLabel', en: 'Context', de: 'Ausgangslage' },
  { key: 'routes.vibeProject.approachLabel', en: 'How it was built', de: 'So entstanden' },
  { key: 'routes.vibeProject.learningsLabel', en: 'What I learned', de: 'Was ich gelernt habe' },
  { key: 'routes.vibeProject.outcomeLabel', en: 'Outcome', de: 'Ergebnis' },
  { key: 'routes.vibeProject.stackLabel', en: 'Stack', de: 'Stack' },
  { key: 'routes.vibeProject.tagsLabel', en: 'Tags', de: 'Tags' },
  { key: 'routes.vibeProject.liveCta', en: 'Open live demo', de: 'Live-Demo öffnen' },
  { key: 'routes.vibeProject.githubCta', en: 'View source on GitHub', de: 'Quellcode auf GitHub' },
  {
    key: 'routes.vibeProject.backToList',
    en: 'All vibe coding projects',
    de: 'Alle Vibe-Coding-Projekte',
  },
  { key: 'routes.vibeProject.noCover', en: '[ screenshot ]', de: '[ Screenshot ]' },
  {
    key: 'routes.vibeProject.empty',
    en: 'This project is being documented.',
    de: 'Dieses Projekt wird gerade dokumentiert.',
  },
  {
    key: 'routes.vibeProject.metaSuffix',
    en: 'Vibe coding project',
    de: 'Vibe-Coding-Projekt',
  },
];

/** SQL literal escaping (single quotes doubled). */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (ROWS.length === 0) return;
  const values: string[] = [];
  let order = 1000;
  for (const row of ROWS) {
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.en)}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.de)}, null)`,
    );
    order += 1;
  }

  await db.execute(
    sql.raw(`
    INSERT INTO "translations_copy" ("_parent_id", "_order", "_locale", "id", "key", "text", "values")
    SELECT v.parent_id, v.ord, v.loc::"_locales", v.rid, v.k, v.t, v.vals
    FROM (VALUES ${values.join(',\n')}) AS v(parent_id, ord, loc, rid, k, t, vals)
    WHERE v.parent_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "translations_copy" c
        WHERE c."_parent_id" = v.parent_id AND c."_locale" = v.loc::"_locales" AND c."key" = v.k
      );`),
  );
}

/** Removes exactly the keys this migration seeded — never the whole copy table. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  if (ROWS.length === 0) return;
  const keys = ROWS.map((row) => lit(row.key)).join(', ');
  await db.execute(sql.raw(`DELETE FROM "translations_copy" WHERE "key" IN (${keys});`));
}
