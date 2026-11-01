import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres';

// Codifies the localize-field drift on site_settings: `siteName` / `siteDescription`
// are `localized: true` since the config change, so Payload expects the locale rows in
// `site_settings_locales` (+ `_site_settings_v_locales` for versions) instead of the
// root columns `site_name` / `site_description` (`version_*` on the versions table).
// Without it, a fresh volume bootstrap fails with 42703 / missing relation on any
// localized read or admin access to `site-settings`.
// Data-preserving + guarded so re-running on an already-migrated DB is a no-op:
// tables/indexes IF NOT EXISTS, FKs guarded via pg_constraint lookups, root values
// copied per default locale 'en' (if the source columns exist) BEFORE dropping them.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "site_settings_locales" (
  	"site_name" varchar DEFAULT 'Mostheimer' NOT NULL,
  	"site_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "_site_settings_v_locales" (
  	"version_site_name" varchar DEFAULT 'Mostheimer' NOT NULL,
  	"version_site_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_locales_parent_id_fk') THEN
      ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_site_settings_v_locales_parent_id_fk') THEN
      ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_locales_parent_id_locale_unique" ON "site_settings_locales" USING btree ("_parent_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "_site_settings_v_locales_parent_id_locale_unique" ON "_site_settings_v_locales" USING btree ("_parent_id","_locale");

  -- Copy existing root values per default locale 'en' BEFORE dropping the columns.
  -- Guarded on source-column existence + target-row absence so it is a no-op when
  -- already copied or when the columns are gone (fresh volume).
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_name')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings_locales' AND column_name = 'site_name') THEN
      INSERT INTO "site_settings_locales" ("site_name", "site_description", "_locale", "_parent_id")
      SELECT s."site_name", s."site_description", 'en', s."id" FROM "site_settings" s
      WHERE NOT EXISTS (SELECT 1 FROM "site_settings_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = 'en');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_site_settings_v' AND column_name = 'version_site_name')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_site_settings_v_locales' AND column_name = 'version_site_name') THEN
      INSERT INTO "_site_settings_v_locales" ("version_site_name", "version_site_description", "_locale", "_parent_id")
      SELECT s."version_site_name", s."version_site_description", 'en', s."id" FROM "_site_settings_v" s
      WHERE NOT EXISTS (SELECT 1 FROM "_site_settings_v_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = 'en');
    END IF;
  END $$;

  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "site_name";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "site_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_site_name";
  ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_site_description";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "site_name" varchar DEFAULT 'Mostheimer' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "site_description" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_site_name" varchar DEFAULT 'Mostheimer' NOT NULL;
  ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_site_description" varchar;

  -- Best-effort restore: copy 'en' locale values back if the tables/data exist.
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings_locales') THEN
      UPDATE "site_settings" s SET "site_name" = l."site_name", "site_description" = l."site_description"
      FROM "site_settings_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = 'en';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_site_settings_v_locales') THEN
      UPDATE "_site_settings_v" s SET "version_site_name" = l."version_site_name", "version_site_description" = l."version_site_description"
      FROM "_site_settings_v_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = 'en';
    END IF;
  END $$;

  DROP TABLE IF EXISTS "site_settings_locales" CASCADE;
  DROP TABLE IF EXISTS "_site_settings_v_locales" CASCADE;`);
}
