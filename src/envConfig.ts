export const envConfig = {
  payloadSecret: process.env.PAYLOAD_SECRET || 'ABC',
  dbUrl: process.env.DATABASE_URL || 'file:./payload.db',
  dbType: process.env.DATABASE_TYPE || 'sqlite',
  // Canonical site URL for metadataBase / robots.txt / sitemap.xml.
  // Falls back to the production domain when NEXT_PUBLIC_SERVER_URL is unset
  // (shared single source of truth — no per-file fallbacks, no drift).
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://mosthi.de',
};
