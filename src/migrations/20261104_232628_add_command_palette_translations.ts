import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN "command_palette_trigger_label" varchar DEFAULT 'Search — open command palette' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_trigger_text" varchar DEFAULT 'Search' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_title" varchar DEFAULT 'Command palette' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_placeholder" varchar DEFAULT 'Search pages, sections or technologies …' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_search_label" varchar DEFAULT 'Search' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_results_label" varchar DEFAULT 'Results' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_empty_label" varchar DEFAULT 'no matches' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_hint_navigate" varchar DEFAULT '↑↓ navigate' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_hint_open" varchar DEFAULT '↵ open' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_result_count" varchar DEFAULT 'result' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_result_count_plural" varchar DEFAULT 's' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_group_pages" varchar DEFAULT 'Pages' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "command_palette_group_sections" varchar DEFAULT 'Sections' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_trigger_label" varchar DEFAULT 'Search — open command palette' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_trigger_text" varchar DEFAULT 'Search' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_title" varchar DEFAULT 'Command palette' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_placeholder" varchar DEFAULT 'Search pages, sections or technologies …' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_search_label" varchar DEFAULT 'Search' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_results_label" varchar DEFAULT 'Results' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_empty_label" varchar DEFAULT 'no matches' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_hint_navigate" varchar DEFAULT '↑↓ navigate' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_hint_open" varchar DEFAULT '↵ open' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_result_count" varchar DEFAULT 'result' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_result_count_plural" varchar DEFAULT 's' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_group_pages" varchar DEFAULT 'Pages' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_command_palette_group_sections" varchar DEFAULT 'Sections' NOT NULL;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" DROP COLUMN "command_palette_trigger_label";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_trigger_text";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_title";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_placeholder";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_search_label";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_results_label";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_empty_label";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_hint_navigate";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_hint_open";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_result_count";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_result_count_plural";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_group_pages";
  ALTER TABLE "translations_locales" DROP COLUMN "command_palette_group_sections";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_trigger_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_trigger_text";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_title";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_placeholder";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_search_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_results_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_empty_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_hint_navigate";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_hint_open";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_result_count";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_result_count_plural";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_group_pages";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_command_palette_group_sections";`);
}
