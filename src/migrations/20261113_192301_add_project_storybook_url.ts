import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Adds the optional `storybookUrl` link to the projects collection.
 *
 * `migrate:create` also emitted six enum `DROP TYPE`/`CREATE TYPE` blocks for
 * `*_icon_name` (local Lucide drift, not part of this feature). They are
 * deliberately removed: prod carries a larger historical enum, and recreating
 * it would fail on rows whose icon is not in the new list. The generated
 * snapshot (`*.json`) is kept as-is so the diff does not resurface.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "storybook_url" varchar;
    ALTER TABLE "_projects_v" ADD COLUMN IF NOT EXISTS "version_storybook_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "storybook_url";
    ALTER TABLE "_projects_v" DROP COLUMN IF EXISTS "version_storybook_url";
  `);
}
