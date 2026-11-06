import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" ADD COLUMN "footer_rights_reserved" varchar DEFAULT 'All rights reserved' NOT NULL;
  ALTER TABLE "translations_locales" ADD COLUMN "footer_eyebrow" varchar DEFAULT 'site' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_footer_rights_reserved" varchar DEFAULT 'All rights reserved' NOT NULL;
  ALTER TABLE "_translations_v_locales" ADD COLUMN "version_footer_eyebrow" varchar DEFAULT 'site' NOT NULL;`);

  // Bestandszeilen mit der bereits gesetzten 'de'-Sprache bekommen die deutsche
  // Wortlaut-Variante; alle anderen (u. a. 'en') behalten den Spalten-Default.
  await db.execute(sql`
   UPDATE "translations_locales"
      SET "footer_rights_reserved" = 'Alle Rechte vorbehalten'
    WHERE "_locale" = 'de';`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations_locales" DROP COLUMN "footer_rights_reserved";
  ALTER TABLE "translations_locales" DROP COLUMN "footer_eyebrow";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_footer_rights_reserved";
  ALTER TABLE "_translations_v_locales" DROP COLUMN "version_footer_eyebrow";`);
}
