import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Korrektur zur Migration 20261101_212429_add_page_drafts: die
 * auto-generierte Migration legte `pages_locales._status` mit
 * DEFAULT 'draft' an — dadurch wurden bereits bestehende, publizierte
 * Seiten beim Migration-Run zu Drafts (Public-Read mit der
 * published-only-Access-Kette lieferte Null → 404).
 *
 * Diese Migration setzt ALLE existierenden Docs einmalig auf
 * 'published' (nur beim Migrationslauf, nicht die Workflow-Default:
 * per-UI erzeugte Seiten bleiben draft-first).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_locales" SET "_status" = 'published' WHERE "_status" IS DISTINCT FROM 'published';`);
}

export async function down({ payload, req, db }: MigrateDownArgs): Promise<void> {
  // Kein Down-Rollback: Status wäre vor der Add-Page-Drafts-Migration
  // (ohne _status-Spalte) — Down fuehrt nichts aus.
}
