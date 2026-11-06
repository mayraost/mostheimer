import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Contact key-fact action labels (`translations.contactActions`).
 *
 * Purely additive: every statement is `IF NOT EXISTS` and carries the schema
 * `DEFAULT … NOT NULL`, so existing translation rows are backfilled by the
 * column default without a follow-up data migration. The generated file was
 * checked for unrelated default drift (none present — the known `site_name`
 * diff did not appear this time).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "contact_actions_call_label" varchar DEFAULT 'Call' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "contact_actions_github_label" varchar DEFAULT 'GitHub' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "contact_actions_linkedin_label" varchar DEFAULT 'LinkedIn' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "contact_actions_new_tab_hint" varchar DEFAULT '(opens in a new tab)' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_contact_actions_call_label" varchar DEFAULT 'Call' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_contact_actions_github_label" varchar DEFAULT 'GitHub' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_contact_actions_linkedin_label" varchar DEFAULT 'LinkedIn' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_contact_actions_new_tab_hint" varchar DEFAULT '(opens in a new tab)' NOT NULL;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "contact_actions_call_label";
  ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "contact_actions_github_label";
  ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "contact_actions_linkedin_label";
  ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "contact_actions_new_tab_hint";
  ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_contact_actions_call_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_contact_actions_github_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_contact_actions_linkedin_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_contact_actions_new_tab_hint";`);
}
