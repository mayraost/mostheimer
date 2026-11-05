import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_eyebrow" varchar DEFAULT 'Consent' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_title" varchar DEFAULT 'Cookie settings' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_description" varchar DEFAULT 'This site uses technically necessary storage only. Analytics and marketing are optional and stay disabled until you allow them.' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_privacy_label" varchar DEFAULT 'Privacy policy' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_privacy_link" varchar DEFAULT '/en/privacy' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_necessary_label" varchar DEFAULT 'Necessary' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_necessary_description" varchar DEFAULT 'Theme, font size and your consent decision. Required for the site to work; cannot be disabled.' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_necessary_badge" varchar DEFAULT 'Always on' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_analytics_label" varchar DEFAULT 'Analytics' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_analytics_description" varchar DEFAULT 'Google Tag Manager and Analytics: anonymous usage statistics that help improve the site.' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_marketing_label" varchar DEFAULT 'Marketing' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_marketing_description" varchar DEFAULT 'Advertising and remarketing tags. Currently unused, but reserved for future campaigns.' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_reject_all" varchar DEFAULT 'Only necessary' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_save_selection" varchar DEFAULT 'Save selection' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_accept_all" varchar DEFAULT 'Accept all' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN IF NOT EXISTS "cookies_settings_link" varchar DEFAULT 'Cookie settings' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_eyebrow" varchar DEFAULT 'Consent' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_title" varchar DEFAULT 'Cookie settings' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_description" varchar DEFAULT 'This site uses technically necessary storage only. Analytics and marketing are optional and stay disabled until you allow them.' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_privacy_label" varchar DEFAULT 'Privacy policy' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_privacy_link" varchar DEFAULT '/en/privacy' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_necessary_label" varchar DEFAULT 'Necessary' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_necessary_description" varchar DEFAULT 'Theme, font size and your consent decision. Required for the site to work; cannot be disabled.' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_necessary_badge" varchar DEFAULT 'Always on' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_analytics_label" varchar DEFAULT 'Analytics' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_analytics_description" varchar DEFAULT 'Google Tag Manager and Analytics: anonymous usage statistics that help improve the site.' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_marketing_label" varchar DEFAULT 'Marketing' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_marketing_description" varchar DEFAULT 'Advertising and remarketing tags. Currently unused, but reserved for future campaigns.' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_reject_all" varchar DEFAULT 'Only necessary' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_save_selection" varchar DEFAULT 'Save selection' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_accept_all" varchar DEFAULT 'Accept all' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN IF NOT EXISTS "version_cookies_settings_link" varchar DEFAULT 'Cookie settings' NOT NULL;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_settings_link";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_accept_all";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_save_selection";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_reject_all";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_marketing_description";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_marketing_label";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_analytics_description";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_analytics_label";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_necessary_badge";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_necessary_description";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_necessary_label";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_privacy_link";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_privacy_label";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_description";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_title";
   ALTER TABLE "_translations_v_locales" DROP COLUMN IF EXISTS "version_cookies_eyebrow";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_settings_link";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_accept_all";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_save_selection";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_reject_all";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_marketing_description";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_marketing_label";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_analytics_description";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_analytics_label";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_necessary_badge";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_necessary_description";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_necessary_label";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_privacy_link";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_privacy_label";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_description";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_title";
   ALTER TABLE "translations_locales" DROP COLUMN IF EXISTS "cookies_eyebrow";`);
}
