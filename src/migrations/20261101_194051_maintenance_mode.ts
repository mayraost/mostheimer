import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "maintenance_mode" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_maintenance_mode" boolean DEFAULT false;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "maintenance_mode";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_maintenance_mode";`);
}
