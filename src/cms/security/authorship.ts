import type { CollectionSlug, Field } from 'payload';
import { createCreatedByField, createUpdatedByField } from 'payload';

/**
 * Authorship (createdBy / updatedBy) hardening - security fix 07.11.2026.
 *
 * Payload 4 stamps collections and globals with `createdBy` / `updatedBy`
 * relations pointing at the `users` collection. With public reads enabled, a
 * request like `GET /api/pages?depth=1` populated those relations into full
 * user documents - including `email`, API-key metadata and the active
 * `sessions` array (verified against production before this fix).
 *
 * Two independent layers close the leak:
 *   1. `access.read` on `users` requires a session (collections/Users.ts) and a
 *      `defaultPopulate` allowlist that only ever exposes `name`.
 *   2. The authorship fields themselves are unreadable without a session.
 *
 * Keeping the fields (instead of `authorship: { createdBy: false }`) preserves
 * the stamping hooks, so admin history and MCP writes behave as before.
 */
const AUTH_COLLECTIONS = ['users'] as const satisfies readonly CollectionSlug[];

type AccessArgs = { req: { user?: unknown } };

const sessionOnlyRead = ({ req }: AccessArgs) => Boolean(req.user);

/**
 * Append to `fields` of a collection or global (same field type for both):
 * `fields: [...ownFields, ...protectedAuthorshipFields()]`.
 */
export function protectedAuthorshipFields(): Field[] {
  return [
    createCreatedByField({
      authCollections: [...AUTH_COLLECTIONS],
      overrides: {
        access: { read: sessionOnlyRead },
        admin: { hidden: true, position: 'sidebar' },
      },
    }),
    createUpdatedByField({
      authCollections: [...AUTH_COLLECTIONS],
      overrides: {
        access: { read: sessionOnlyRead },
        admin: { hidden: true, position: 'sidebar' },
      },
    }),
  ];
}
