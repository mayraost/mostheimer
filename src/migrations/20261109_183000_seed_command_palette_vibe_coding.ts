import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';

/**
 * Retired seed — kept as an empty migration on purpose.
 *
 * This migration used to INSERT the `translations.copy` rows for the ⌘K entry
 * (`commandItems.projects.*`) directly through SQL. UI copy is seeded through
 * the Payload MCP instead: same write path as the admin, same hooks, same cache
 * invalidation.
 *
 * The file stays because Payload tracks applied migrations by name — deleting it
 * would make already-migrated environments report it as pending. `up`/`down` are
 * therefore no-ops.
 *
 * Note for whoever seeds the palette entry: `getCommandItems` DROPS an entry
 * whose label is empty, so both locales must be written or the page silently
 * disappears from ⌘K.
 */
export async function up({}: MigrateUpArgs): Promise<void> {
  // intentionally empty
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // intentionally empty
}
