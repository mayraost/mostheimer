import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_sessions" ADD COLUMN "refresh_count" numeric;
  ALTER TABLE "users_sessions" ADD COLUMN "refreshed_at" timestamp(3) with time zone;
  ALTER TABLE "_users_v_version_sessions" ADD COLUMN "refresh_count" numeric;
  ALTER TABLE "_users_v_version_sessions" ADD COLUMN "refreshed_at" timestamp(3) with time zone;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_sessions" DROP COLUMN "refresh_count";
  ALTER TABLE "users_sessions" DROP COLUMN "refreshed_at";
  ALTER TABLE "_users_v_version_sessions" DROP COLUMN "refresh_count";
  ALTER TABLE "_users_v_version_sessions" DROP COLUMN "refreshed_at";`);
}
