import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Seeds the ⌘K entry of the vibe-coding listing (BOTH locales).
 *
 * The palette is the LAST navigation surface that did not know about the
 * listing: the drawer and the footer read the `navigation` global (editorial),
 * while the palette builds its entries from a static structure constant
 * (`src/components/ui/commandItems.ts`) plus these copy rows. An entry whose
 * label is empty is DROPPED by `getCommandItems`, so without this seed the page
 * would simply never appear in ⌘K — no error, just a gap.
 *
 * Values are the SAME text the code declares, so a fresh deployment renders the
 * real copy and an editor can override the rows afterwards in the admin.
 *
 * Name ordering matters: Payload applies migrations in NAME order, so this
 * (183000) runs after the showcase schema (171931), the block (175000) and the
 * showcase copy (180000). `translations_copy` itself predates all of them.
 *
 * Idempotent via `WHERE NOT EXISTS`: a re-run never duplicates a key.
 */
const ID = 'vibe-coding';

const COMMAND_ROWS: Array<{ key: string; en: string; de: string }> = [
  {
    key: `commandItems.${ID}.label`,
    en: 'Vibe Coding Showcase',
    de: 'Vibe-Coding-Showcase',
  },
  {
    key: `commandItems.${ID}.keywords`,
    en: 'projects, showcase, experiments, tools, portfolio, side projects, built with ai',
    de: 'projekte, showcase, referenzen, experimente, tools, portfolio, nebenprojekte, selbst gebaut',
  },
];

/** SQL literal escaping (single quotes doubled). */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (COMMAND_ROWS.length === 0) return;
  const values: string[] = [];
  // 2000 keeps the rows below the showcase seed (1000+) in the admin list.
  let order = 2000;
  for (const row of COMMAND_ROWS) {
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
  if (COMMAND_ROWS.length === 0) return;
  const keys = COMMAND_ROWS.map((row) => lit(row.key)).join(', ');
  await db.execute(sql.raw(`DELETE FROM "translations_copy" WHERE "key" IN (${keys});`));
}
