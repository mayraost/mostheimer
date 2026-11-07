import type { CollectionConfig } from 'payload';
import { protectedAuthorshipFields } from '../security/authorship';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Hardened admin cookies: Secure (HTTPS only — fine behind the tunnel and
    // on localhost's secure context) and SameSite=Strict (never sent
    // cross-site). The live-preview iframe is same-origin, so 'Strict' is safe.
    cookies: {
      secure: true,
      sameSite: 'Strict',
    },
    // Native Payload API keys for the MCP client's auth
    // (`Authorization: users API-Key <value>` — not a Bearer token). Keys are
    // stored encrypted; `reveal` lets an admin read one back via
    // POST /api/users/:id/api-key/reveal.
    useAPIKey: { reveal: true },
  },
  access: {
    // Security (07.11.2026): `users` never leaves the server without a session.
    // Public `GET /api/pages?depth=1` used to populate `createdBy`/`updatedBy`
    // into full user documents (email, apiKey metadata, active sessions). The
    // read rule plus the defaultPopulate allowlist below close that path.
    read: ({ req: { user } }) => Boolean(user),
  },
  // Relation populates of users only ever carry the display name. Even an
  // access-allowed read can therefore not leak email, sessions, api_key or
  // hash/salt fields into a JSON response.
  defaultPopulate: {
    name: true,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    // Authorship is admin-only metadata; public reads must not carry it.
    ...protectedAuthorshipFields(),
  ],
};
