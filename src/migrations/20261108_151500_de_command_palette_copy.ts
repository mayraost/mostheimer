import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * German copy for the legacy `commandPalette` group.
 *
 * The group predates the `copy` row array and was seeded English-only: on /de the
 * ⌘K dialog therefore rendered English labels ("Search — open command palette",
 * "results"), which violates the no-English-on-/de rule. This migration sets the
 * German wording. `resultCountPlural` stays a single space because German does
 * not pluralize the noun ("1 Treffer" / "5 Treffer").
 *
 * Idempotent: plain UPDATEs on the singleton row, so a re-run is harmless.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "translations_locales" SET
      "command_palette_trigger_label" = 'Suche — Befehlspalette öffnen',
      "command_palette_trigger_text" = 'Suche',
      "command_palette_title" = 'Befehlspalette',
      "command_palette_placeholder" = 'Seiten, Abschnitte oder Technologien durchsuchen …',
      "command_palette_search_label" = 'Suche',
      "command_palette_results_label" = 'Ergebnisse',
      "command_palette_empty_label" = 'Keine Treffer',
      "command_palette_hint_navigate" = '↑↓ navigieren',
      "command_palette_hint_open" = '↵ öffnen',
      "command_palette_result_count" = 'Treffer',
      "command_palette_result_count_plural" = ' ',
      "command_palette_group_pages" = 'Seiten',
      "command_palette_group_sections" = 'Abschnitte'
    WHERE "_locale" = 'de';`);

  await db.execute(sql`
    UPDATE "_translations_v_locales" SET
      "version_command_palette_trigger_label" = 'Suche — Befehlspalette öffnen',
      "version_command_palette_trigger_text" = 'Suche',
      "version_command_palette_title" = 'Befehlspalette',
      "version_command_palette_placeholder" = 'Seiten, Abschnitte oder Technologien durchsuchen …',
      "version_command_palette_search_label" = 'Suche',
      "version_command_palette_results_label" = 'Ergebnisse',
      "version_command_palette_empty_label" = 'Keine Treffer',
      "version_command_palette_hint_navigate" = '↑↓ navigieren',
      "version_command_palette_hint_open" = '↵ öffnen',
      "version_command_palette_result_count" = 'Treffer',
      "version_command_palette_result_count_plural" = ' ',
      "version_command_palette_group_pages" = 'Seiten',
      "version_command_palette_group_sections" = 'Abschnitte'
    WHERE "_locale" = 'de';`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restores the previous (English) wording of the group.
  await db.execute(sql`
    UPDATE "translations_locales" SET
      "command_palette_trigger_label" = 'Search — open command palette',
      "command_palette_trigger_text" = 'Search',
      "command_palette_title" = 'Command palette',
      "command_palette_placeholder" = 'Search pages, sections or technologies …',
      "command_palette_search_label" = 'Search',
      "command_palette_results_label" = 'Results',
      "command_palette_empty_label" = 'no matches',
      "command_palette_hint_navigate" = '↑↓ navigate',
      "command_palette_hint_open" = '↵ open',
      "command_palette_result_count" = 'result',
      "command_palette_result_count_plural" = 's',
      "command_palette_group_pages" = 'Pages',
      "command_palette_group_sections" = 'Sections'
    WHERE "_locale" = 'de';`);
}
