import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN "clipboard_copied_inline" varchar DEFAULT '[ COPIED // 200 OK ]' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_clipboard_copied_inline" varchar DEFAULT '[ COPIED // 200 OK ]' NOT NULL;`);

  // Bestandszeilen der deutschen Locale bekommen den deutschen Terminal-Text;
  // alle anderen (u. a. 'en') behalten den Spalten-Default.
  await db.execute(sql`
   UPDATE "translations_locales"
      SET "clipboard_copied_inline" = '[ KOPIERT // 200 OK ]'
    WHERE "_locale" = 'de';`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" DROP COLUMN "clipboard_copied_inline";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_clipboard_copied_inline";`);
}
