import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Corrective migration for 20261101_212429_add_page_drafts: the generated
 * migration added `pages_locales._status` with DEFAULT 'draft', which turned
 * already published pages into drafts (published-only public reads returned
 * null → 404).
 *
 * Re-publishes existing docs once; the per-UI default stays draft-first.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_locales" SET "_status" = 'published' WHERE "_status" IS DISTINCT FROM 'published';`);
}

export async function down({ payload, req, db }: MigrateDownArgs): Promise<void> {
  // No down rollback: before add_page_drafts there was no _status column.
}
