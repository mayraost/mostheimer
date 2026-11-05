import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Removes the maintenance mode (feature dropped on 05.11.2026).
 *
 * The columns were introduced by `20261101_194051_maintenance_mode`; that
 * migration stays untouched — migration history is append-only. This one is
 * guarded so it is safe to (re-)run against a database that never had them.
 * No data is needed: the boolean only ever flipped a UI branch.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "maintenance_mode";
  ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_maintenance_mode";`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "maintenance_mode" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_maintenance_mode" boolean DEFAULT false;`);
}
