import { z } from 'zod';

/**
 * Zod-validierte Umgebungsvariablen mit Fail-Fast (Security-Hardening):
 *
 * - `PAYLOAD_SECRET`: in Produktion pflichtig (min 32 Zeichen). Ein Fallback
 *   'ABC' wie vormals waere ein trivial ratbares Signing-Secret. Dev/Build
 *   erhalten einen dokumentierten, offenkundigen Dev-Fallback-Wert.
 * - `DATABASE_URL`: muss ein postgres://-Connect-String sein (zentrale
 *   coolify-postgres-Instanz, kein SQLite-Fallback — vgl. Postgres-only-
 *   Migration in AGENTS.md). Nur in der Build-Phase (Coolify-Docker-Build
 *   erreicht die DB nicht, Payload connectiert dort nie) bleibt ein leerer
 *   String erlaubt, wie zuvor '' statt Fail.
 * - `NEXT_PUBLIC_SERVER_URL`: wenn gesetzt, muss es eine URL sein; bei
 *   Invaliditaet fail-soft auf den Default (Metadata-Feld, kein Secret —
 *   Produktion soll nicht wegen kosmetischer Metadata crashen).
 *
 * Warnungen/Errors geben KEINE Env-Werte aus (kein Secret-Leak im Log).
 */

const DEV_FALLBACK_PAYLOAD_SECRET = 'dev-not-a-real-secret-fallback-0123456789abcdef';
const DEFAULT_SERVER_URL = 'https://mosthi.de';

const envSchema = z.object({
  payloadSecret: z.string().min(32),
  dbUrl: z
    .string()
    .refine(
      (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL must start with postgresql:// or postgres://',
    ),
  serverUrl: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Coolify-Docker-Build-Phase: envConfig wird beim Modul-Import ausgewertet,
 * bevor irgendeine DB erreichbar waere -> kein Fail-Fast im Build.
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

  // -- serverUrl: fail-soft auf Default (Metadata-Feld, kein Secret) ----------
  let serverUrlValue = DEFAULT_SERVER_URL;
  if (serverUrl.success) {
    serverUrlValue = serverUrl.data;
  } else if (process.env.NEXT_PUBLIC_SERVER_URL) {
    console.warn(
      '[envConfig] NEXT_PUBLIC_SERVER_URL is set but not a valid URL — falling back to ' +
        'the default domain. Fix the value to control the metadata base.',
    );
  }

  // -- payloadSecret: pflichtig in Produktion, Dev-Fallback sonst -------------
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

  // -- DATABASE_URL: pflichtig ausserhalb der Build-Phase ----------------------
  if (dbUrl.success) {
    return { payloadSecret: payloadSecretValue, dbUrl: dbUrl.data, serverUrl: serverUrlValue };
  }

  if (isProductionBuildPhase) {
    // Build ohne DB: leerer Connect-String wie vormals — nichts verbindet
    // waehrend `next build` (siehe 'use cache'-Guards in queries.ts).
    console.warn(
      '[envConfig] DATABASE_URL during build phase invalid or missing — continuing ' +
        'without DB connection (the build container never connects to the database).',
    );
    return { payloadSecret: payloadSecretValue, dbUrl: '', serverUrl: serverUrlValue };
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
