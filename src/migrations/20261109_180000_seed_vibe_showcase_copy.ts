import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';

/**
 * Retired seed — kept as an empty migration on purpose.
 *
 * This migration used to INSERT the `translations.copy` rows of the project
 * showcase directly through SQL. That bypassed the Payload hooks and therefore
 * the cache invalidation the app relies on, so UI copy is seeded through the
 * Payload MCP instead (same write path as the admin panel).
 *
 * The migration is NOT deleted: Payload records applied migrations by name, and
 * environments that already ran it (local dev, preview) must not fall back to
 * "not applied" and try to run it again. `up`/`down` are therefore no-ops.
 *
 * Only reached on fresh databases. Existing installs keep whatever rows the
 * earlier version wrote; `src/lib/translations.ts` declares the same strings as
 * fallbacks, and the admin can override every row.
 */
export async function up({}: MigrateUpArgs): Promise<void> {
  // intentionally empty
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // intentionally empty
}
