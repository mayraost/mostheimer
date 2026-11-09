import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Seeds the `seo.*` copy rows (layout metadata, manifest, OG card, Person JSON-LD,
 * global error document) for both locales.
 *
 * Same contract as the first copy seed: idempotent (WHERE NOT EXISTS), values
 * identical to the `COPY_KEYS` registry so a fresh database renders the real
 * strings and an editor can override any of them afterwards.
 */
const ROWS: Array<{ key: string; en: string; de: string }> = [
  {
    key: 'seo.title',
    en: 'Mayra Ostheimer — Web & Application Architect',
    de: 'Mayra Ostheimer — Web & Application Architect',
  },
  {
    key: 'seo.description',
    en: 'Mayra Ostheimer — Senior-Level Fullstack Engineer and Web Architect. Composable architectures, Next.js/Payload, team and project leadership for production-ready systems.',
    de: 'Mayra Ostheimer — Web & Application Architect und Senior-Level FullStack Engineer. Composable Architekturen, Next.js/Payload, Team- & Projektleitung für produktionsreife Systeme.',
  },
  {
    key: 'seo.ogSubtitle',
    en: 'Web & Application Architect',
    de: 'Web & Application Architect',
  },
  {
    key: 'seo.manifestName',
    en: 'Mayra Ostheimer — Web & Application Architect',
    de: 'Mayra Ostheimer — Web & Application Architect',
  },
  { key: 'seo.manifestShortName', en: 'Mayra Ostheimer', de: 'Mayra Ostheimer' },
  {
    key: 'seo.manifestDescription',
    en: 'Senior Fullstack Developer and web application architect. Composable architectures, TypeScript, React and Next.js.',
    de: 'Senior Fullstack Developer und Web-Application-Architekt. Composable Architekturen, TypeScript, React und Next.js.',
  },
  {
    key: 'seo.personJobTitle',
    en: 'Senior Fullstack Developer',
    de: 'Senior Fullstack Developer',
  },
  {
    key: 'seo.personDescription',
    en: 'Senior Fullstack Developer for resilient web and application architectures: Next.js, React, TypeScript, Payload CMS and Pimcore in enterprise environments.',
    de: 'Senior Fullstack Developer für resiliente Web- und Anwendungsarchitekturen: Next.js, React, TypeScript, Payload CMS und Pimcore im Enterprise-Umfeld.',
  },
  { key: 'seo.worksFor', en: 'valantic DXA', de: 'valantic DXA' },
  { key: 'seo.contactType', en: 'personal', de: 'personal' },
  {
    key: 'routes.globalError.code',
    en: 'HTTP 500 · Critical error',
    de: 'HTTP 500 · Kritischer Fehler',
  },
  {
    key: 'routes.globalError.title',
    en: 'The site could not be loaded',
    de: 'Die Seite konnte nicht geladen werden',
  },
  {
    key: 'routes.globalError.message',
    en: 'A fatal error occurred while rendering this page. Please try again or return to the home page.',
    de: 'Beim Rendern dieser Seite ist ein schwerwiegender Fehler aufgetreten. Bitte lade die Seite neu oder kehre zur Startseite zurück.',
  },
  { key: 'routes.globalError.home', en: 'Back to home', de: 'Zur Startseite' },
  { key: 'routes.globalError.retry', en: 'Try again', de: 'Erneut versuchen' },
];

function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const values: string[] = [];
  let order = 100; // after the UI copy rows (0..99)
  for (const row of ROWS) {
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.en)}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.de)}, null)`,
    );
    order += 1;
  }

  await db.execute(
    sql.raw(`
    INSERT INTO "translations_copy" ("_parent_id", "_order", "_locale", "id", "key", "text", "values")
    SELECT v.parent_id, v.ord, v.loc::"_locales", v.rid, v.k, v.t, v.vals
    FROM (VALUES ${values.join(',\n')}) AS v(parent_id, ord, loc, rid, k, t, vals)
    WHERE v.parent_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "translations_copy" c
        WHERE c."_parent_id" = v.parent_id AND c."_locale" = v.loc::"_locales" AND c."key" = v.k
      );`),
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const keys = ROWS.map((row) => lit(row.key)).join(', ');
  await db.execute(sql.raw(`DELETE FROM "translations_copy" WHERE "key" IN (${keys});`));
}
