import type { CollectionConfig } from 'payload';

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
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
};
