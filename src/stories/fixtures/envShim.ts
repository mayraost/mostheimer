/**
 * Storybook-Env-Shim für Module, die `src/envConfig.ts` importieren.
 *
 * `envConfig` validiert `process.env` beim Modul-Import und wirft ohne
 * `PAYLOAD_SECRET`/`DATABASE_URL` (im Production-Modus von `storybook build`
 * sogar mit einer eigenen Fehlermeldung). Im Browser gibt es diese Variablen
 * nicht — die Story würde also schon beim Import sterben.
 *
 * Diese Datei wird in der Story als ERSTE Import-Anweisung eingebunden
 * (Side-Effect-Import). ES-Module werden in Quelltext-Reihenfolge ausgewertet,
 * der Shim läuft also vor `@/components/StructuredData` und damit vor
 * `envConfig`. Die Werte sind offensichtlich Attrappen und öffnen keine
 * Verbindung; vorhandene echte Werte werden nie überschrieben.
 */

type ProcessLike = { env: Record<string, string | undefined> };

const globalScope = globalThis as unknown as { process?: ProcessLike };

const proc: ProcessLike = globalScope.process ?? { env: {} };
proc.env ??= {};
globalScope.process = proc;

if (!proc.env.PAYLOAD_SECRET || proc.env.PAYLOAD_SECRET.length < 32) {
  proc.env.PAYLOAD_SECRET = 'storybook-fixture-secret-0123456789abcdef';
}

if (!proc.env.DATABASE_URL) {
  proc.env.DATABASE_URL = 'postgresql://storybook:storybook@localhost:5432/storybook';
}
