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
