import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  /*
   * Identity facts for the Person JSON-LD node, the OG card and the imprint.
   *
   * Deliberately NO icon_name statements: the generated diff also replaces the
   * Lucide enums, but prod carries the full historical icon set (2020 values,
   * incl. values the current catalog no longer knows). Re-creating the enum
   * fails on existing rows and would silently drop editor choices — see
   * AGENTS.md § "Migrationen auf Prod".
   */
  await db.execute(sql`
   CREATE TABLE "site_settings_identity_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_identity_knows_language" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_identity_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_identity_knows_language" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "identity_email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "identity_telephone" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "identity_street_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "identity_postal_code" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "identity_address_country" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "identity_person_name" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "identity_address_locality" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_identity_email" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_identity_telephone" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_identity_street_address" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_identity_postal_code" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_identity_address_country" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_identity_person_name" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_identity_address_locality" varchar;
  ALTER TABLE "site_settings_identity_same_as" ADD CONSTRAINT "site_settings_identity_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_identity_knows_language" ADD CONSTRAINT "site_settings_identity_knows_language_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_identity_same_as" ADD CONSTRAINT "_site_settings_v_version_identity_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_identity_knows_language" ADD CONSTRAINT "_site_settings_v_version_identity_knows_language_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_identity_same_as_order_idx" ON "site_settings_identity_same_as" USING btree ("_order");
  CREATE INDEX "site_settings_identity_same_as_parent_id_idx" ON "site_settings_identity_same_as" USING btree ("_parent_id");
  CREATE INDEX "site_settings_identity_knows_language_order_idx" ON "site_settings_identity_knows_language" USING btree ("_order");
  CREATE INDEX "site_settings_identity_knows_language_parent_id_idx" ON "site_settings_identity_knows_language" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_identity_same_as_order_idx" ON "_site_settings_v_version_identity_same_as" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_identity_same_as_parent_id_idx" ON "_site_settings_v_version_identity_same_as" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_identity_knows_language_order_idx" ON "_site_settings_v_version_identity_knows_language" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_identity_knows_language_parent_id_idx" ON "_site_settings_v_version_identity_knows_language" USING btree ("_parent_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_identity_same_as" CASCADE;
  DROP TABLE "site_settings_identity_knows_language" CASCADE;
  DROP TABLE "_site_settings_v_version_identity_same_as" CASCADE;
  DROP TABLE "_site_settings_v_version_identity_knows_language" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "identity_email";
  ALTER TABLE "site_settings" DROP COLUMN "identity_telephone";
  ALTER TABLE "site_settings" DROP COLUMN "identity_street_address";
  ALTER TABLE "site_settings" DROP COLUMN "identity_postal_code";
  ALTER TABLE "site_settings" DROP COLUMN "identity_address_country";
  ALTER TABLE "site_settings_locales" DROP COLUMN "identity_person_name";
  ALTER TABLE "site_settings_locales" DROP COLUMN "identity_address_locality";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_identity_email";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_identity_telephone";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_identity_street_address";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_identity_postal_code";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_identity_address_country";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_identity_person_name";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_identity_address_locality";`);
}
