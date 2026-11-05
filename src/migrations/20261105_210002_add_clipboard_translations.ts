import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN "clipboard_copy_label" varchar DEFAULT 'Copy e-mail' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "clipboard_copied_message" varchar DEFAULT 'E-mail address copied to the clipboard' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "clipboard_failed_message" varchar DEFAULT 'Copying failed — please select the address manually' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_clipboard_copy_label" varchar DEFAULT 'Copy e-mail' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_clipboard_copied_message" varchar DEFAULT 'E-mail address copied to the clipboard' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_clipboard_failed_message" varchar DEFAULT 'Copying failed — please select the address manually' NOT NULL;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" DROP COLUMN "clipboard_copy_label";
  ALTER TABLE "translations_locales" DROP COLUMN "clipboard_copied_message";
  ALTER TABLE "translations_locales" DROP COLUMN "clipboard_failed_message";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_clipboard_copy_label";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_clipboard_copied_message";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_clipboard_failed_message";`);
}
