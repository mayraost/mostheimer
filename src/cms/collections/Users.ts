import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Cookie-Haertung (Payload-4-Keys verifiziert in
    // node_modules/payload/dist/auth/types.d.ts: cookies.{secure,sameSite}).
    // Secure + SameSite strict: Admin-Cookies nur via HTTPS (Tunnel/localhost-
    // Secure-Context ok) und ohne Cross-Site-Sendung; Live-Preview-iframe
    // ist same-origin -> 'Strict' blockiert das nicht.
    cookies: {
      secure: true,
      sameSite: 'Strict',
    },
    // Native Payload API-Keys fuer den MCP-Plugin-Bearer-Flow:
    // `Authorization: users API-Key <value>` (Auth-Header-Format verifiziert in
    // node_modules/payload/dist/auth/strategies/apiKey.js). reveal: true erlaubt
    // Admins, den verschluesselten Key via POST /api/users/:id/api-key/reveal
    // auszulesen. Key wird encrypted gespeichert (api_key ciphertext +
    // HMAC api_key_index + api_key_last4; Migration add_mcp_api_keys).
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
