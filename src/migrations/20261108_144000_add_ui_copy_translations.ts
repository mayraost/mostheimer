import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  /*
   * Only the new KEY/VALUE copy table.
   *
   * Deliberately NO icon_name statements: the generated diff also wants to
   * replace the Lucide enums, but prod carries the full historical icon set
   * (2020 values, incl. `Braces`) while the current catalog is far smaller.
   * Re-creating the enum would fail on existing rows AND silently drop values
   * editors already picked. That churn is pre-existing drift and does not
   * belong to this feature.
   */
  await db.execute(sql`
   CREATE TABLE "translations_copy" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"text" varchar,
  	"values" varchar
  );
  
  CREATE TABLE "_translations_v_version_copy" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"text" varchar,
  	"values" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "translations_copy" ADD CONSTRAINT "translations_copy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_translations_v_version_copy" ADD CONSTRAINT "_translations_v_version_copy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_translations_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "translations_copy_order_idx" ON "translations_copy" USING btree ("_order");
  CREATE INDEX "translations_copy_parent_id_idx" ON "translations_copy" USING btree ("_parent_id");
  CREATE INDEX "translations_copy_locale_idx" ON "translations_copy" USING btree ("_locale");
  CREATE INDEX "translations_copy_key_idx" ON "translations_copy" USING btree ("key");
  CREATE INDEX "_translations_v_version_copy_order_idx" ON "_translations_v_version_copy" USING btree ("_order");
  CREATE INDEX "_translations_v_version_copy_parent_id_idx" ON "_translations_v_version_copy" USING btree ("_parent_id");
  CREATE INDEX "_translations_v_version_copy_locale_idx" ON "_translations_v_version_copy" USING btree ("_locale");
  CREATE INDEX "_translations_v_version_copy_key_idx" ON "_translations_v_version_copy" USING btree ("key");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "translations_copy" CASCADE;
  DROP TABLE IF EXISTS "_translations_v_version_copy" CASCADE;`);
}
