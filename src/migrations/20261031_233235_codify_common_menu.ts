import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres';

// Codifies the manual ALTER TABLE drift: `translations_locales.common_menu`
// (and `version_common_menu` on the versions table) was patched on the live
// DB outside the migration history — a fresh volume bootstrap would fail with
// 42703 without it. Additive + IF NOT EXISTS guarded so re-running on an
// already-patched DB is a no-op.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "common_menu" varchar DEFAULT 'Menu';
  ALTER TABLE "translations_locales" ALTER COLUMN "common_menu" SET DEFAULT 'Menu';
  ALTER TABLE "translations_locales" ALTER COLUMN "common_menu" SET NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_common_menu" varchar DEFAULT 'Menu';
  ALTER TABLE "_translations_v_locales" ALTER COLUMN "version_common_menu" SET DEFAULT 'Menu';
  ALTER TABLE "_translations_v_locales" ALTER COLUMN "version_common_menu" SET NOT NULL;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "common_menu";
  ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_common_menu";`);
}
