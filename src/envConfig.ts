import { z } from 'zod';

/**
 * Zod-validated environment variables with fail-fast (security hardening):
 *
 * - `PAYLOAD_SECRET`: required in production (min 32 chars) — a short
 *   guessable signing secret is not acceptable. Dev/build use an obvious,
 *   documented fallback.
 * - `DATABASE_URL`: must be a postgres connection string for the central
 *   coolify-postgres instance (there is no SQLite fallback). An empty string is
 *   only tolerated during the build phase, where Payload never connects.
 * - `NEXT_PUBLIC_SERVER_URL`: if set, it must be a valid URL; invalid values
 *   fail soft to the default (metadata field, not a secret — production should
 *   not crash over a cosmetic metadata value).
 * - `NEXT_PUBLIC_GTM_ID`: optional (GTM-XXXXXXX). Without an ID no container
 *   loads; the consent layer and banner keep working.
 *   `NEXT_PUBLIC_*` because the browser reads the ID at build time.
 * - `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ZONE_ID`: optional, server-only. Used
 *   for edge-cache purges after CMS changes and after a deploy. Unset → purge
 *   is a no-op (local dev, build phase). Never `NEXT_PUBLIC_`.
 * - `CLOUDFLARE_PURGE_ON_START`: optional kill switch for the deploy-time
 *   purge ("0" disables it, anything else/empty = on).
 *
 * Warnings and errors never print env values, so no secret leaks into the logs.
 */

const DEV_FALLBACK_PAYLOAD_SECRET = 'dev-not-a-real-secret-fallback-0123456789abcdef';
const DEFAULT_SERVER_URL = 'https://mostheimer.de';

const envSchema = z.object({
  payloadSecret: z.string().min(32),
  dbUrl: z
    .string()
    .refine(
      (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL must start with postgresql:// or postgres://',
    ),
  serverUrl: z.string().url(),
  /** GTM-Container-ID; leer = kein Google Tag Manager (kein Fail-Fast). */
  gtmId: z
    .string()
    .regex(/^$|^GTM-[A-Z0-9]+$/, 'NEXT_PUBLIC_GTM_ID must be empty or look like GTM-XXXXXXX'),
  /**
   * Cloudflare edge-cache purge credentials (server-only, never NEXT_PUBLIC_).
   * Both optional: without them every purge is a silent no-op (local dev,
   * build phase). Token permissions: Zone → Cache Purge → Purge, scoped to the
   * mosthi.de zone. See AGENTS.md § "Cloudflare Edge-Cache".
   */
  cloudflareApiToken: z.string(),
  cloudflareZoneId: z
    .string()
    .regex(/^$|^[0-9a-f]{32}$/, 'CLOUDFLARE_ZONE_ID must be a 32-char zone id'),
  /** Kill switch for the deploy-time purge (default on when credentials exist). */
  cloudflarePurgeOnStart: z.boolean(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * envConfig is evaluated at module import, before any DB is reachable, so the
 * build phase must not fail fast.
 */
const isProductionBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isProductionRuntime = process.env.NODE_ENV === 'production';

function resolveEnvConfig(): EnvConfig {
  const rawPayloadSecret = process.env.PAYLOAD_SECRET ?? '';
  const rawDbUrl = process.env.DATABASE_URL ?? '';
  const rawServerUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? DEFAULT_SERVER_URL;

  const payloadSecret = envSchema.shape.payloadSecret.safeParse(rawPayloadSecret);
  const dbUrl = envSchema.shape.dbUrl.safeParse(rawDbUrl);
  const serverUrl = envSchema.shape.serverUrl.safeParse(rawServerUrl);

  // gtmId: optional; malformed values fall back to '' (no container, no crash).
  const rawGtmId = process.env.NEXT_PUBLIC_GTM_ID ?? '';
  const gtmId = envSchema.shape.gtmId.safeParse(rawGtmId);
  let gtmIdValue = '';
  if (gtmId.success) {
    gtmIdValue = gtmId.data;
  } else {
    console.warn(
      '[envConfig] NEXT_PUBLIC_GTM_ID does not match GTM-XXXXXXX — Google Tag ' +
        'Manager stays disabled. Fix the value to enable the container.',
    );
  }

  // serverUrl: fail soft to the default (metadata field, not a secret).
  let serverUrlValue = DEFAULT_SERVER_URL;
  if (serverUrl.success) {
    serverUrlValue = serverUrl.data;
  } else if (process.env.NEXT_PUBLIC_SERVER_URL) {
    console.warn(
      '[envConfig] NEXT_PUBLIC_SERVER_URL is set but not a valid URL — falling back to ' +
        'the default domain. Fix the value to control the metadata base.',
    );
  }

  // Cloudflare purge credentials: optional, malformed values are ignored
  // (purges degrade to a no-op). Never log the token.
  const rawZoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const zoneId = envSchema.shape.cloudflareZoneId.safeParse(rawZoneId);
  let cloudflareZoneIdValue = '';
  if (zoneId.success) {
    cloudflareZoneIdValue = zoneId.data;
  } else {
    console.warn(
      '[envConfig] CLOUDFLARE_ZONE_ID is not a 32-character zone id — edge-cache ' +
        'purges stay disabled.',
    );
  }
  const cloudflareApiTokenValue = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const cloudflarePurgeOnStartValue = process.env.CLOUDFLARE_PURGE_ON_START !== '0';

  // payloadSecret: required at runtime in production, dev fallback otherwise.
  let payloadSecretValue = DEV_FALLBACK_PAYLOAD_SECRET;
  if (payloadSecret.success) {
    payloadSecretValue = payloadSecret.data;
  } else if (isProductionRuntime && !isProductionBuildPhase) {
    throw new Error(
      'Invalid or missing PAYLOAD_SECRET in production runtime: at least 32 characters ' +
        'are required. Set it via the Coolify-App-Env (or .env) and restart.',
    );
  } else {
    console.warn(
      '[envConfig] PAYLOAD_SECRET missing or weaker than 32 characters — using the ' +
        'documented dev fallback. This must never reach a production deployment.',
    );
  }

  // DATABASE_URL: required outside the build phase.
  if (dbUrl.success) {
    return {
      payloadSecret: payloadSecretValue,
      dbUrl: dbUrl.data,
      serverUrl: serverUrlValue,
      gtmId: gtmIdValue,
      cloudflareApiToken: cloudflareApiTokenValue,
      cloudflareZoneId: cloudflareZoneIdValue,
      cloudflarePurgeOnStart: cloudflarePurgeOnStartValue,
    };
  }

  if (isProductionBuildPhase) {
    // Empty connection string during the build: nothing connects during
    // `next build` (see the 'use cache' guards in queries.ts).
    console.warn(
      '[envConfig] DATABASE_URL during build phase invalid or missing — continuing ' +
        'without DB connection (the build container never connects to the database).',
    );
    return {
      payloadSecret: payloadSecretValue,
      dbUrl: '',
      serverUrl: serverUrlValue,
      gtmId: gtmIdValue,
      cloudflareApiToken: cloudflareApiTokenValue,
      cloudflareZoneId: cloudflareZoneIdValue,
      cloudflarePurgeOnStart: cloudflarePurgeOnStartValue,
    };
  }

  if (rawDbUrl === '') {
    throw new Error(
      'DATABASE_URL is missing: the postgres adapter requires a connection string ' +
        'pointing at the central coolify-postgres instance (postgresql:// or postgres://).',
    );
  }

  throw new Error(
    'DATABASE_URL is malformed: it must start with postgresql:// or postgres:// ' +
      '(central coolify-postgres instance).',
  );
}

export const envConfig = resolveEnvConfig();
