import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Seeds the `translations.copy` rows for BOTH locales.
 *
 * The schema migration created the table; this writes the actual UI copy, so a
 * fresh deployment renders the real strings without any manual step. Values are
 * the SAME text the TypeScript registry (`src/lib/translations.ts`) declares as
 * fallback — the editor can override every row afterwards in the admin.
 *
 * Rows for `en` and `de` are inserted in one statement. `id` is a random uuid
 * (Payload's array row id); `_order` keeps a stable, readable sort order in the
 * admin list.
 */
const ROWS: Array<{ key: string; en: string; de: string }> = [
  // -- Chrome ---------------------------------------------------------------
  {
    key: 'chrome.brandClaim',
    en: 'Web & Application Architect',
    de: 'Web & Application Architect',
  },
  { key: 'chrome.skipToContent', en: 'Skip to content', de: 'Zum Inhalt springen' },
  { key: 'chrome.homeAria', en: 'home', de: 'Startseite' },
  {
    key: 'chrome.languageSwitchAria',
    en: 'Switch language to {language}',
    de: 'Sprache wechseln zu {language}',
  },
  { key: 'chrome.languageName', en: 'English (EN)', de: 'Deutsch' },
  { key: 'chrome.closeMenu', en: 'Close menu', de: 'Menü schließen' },
  { key: 'chrome.currentPage', en: 'Current page', de: 'Aktuelle Seite' },
  { key: 'chrome.drawerStatus', en: 'Kiebitzreihe · DE', de: 'Kiebitzreihe · DE' },
  { key: 'chrome.footerNavAria', en: 'Footer', de: 'Footer' },
  {
    key: 'chrome.footerCredits',
    en: 'Next.js 16 / Payload 4 / Postgres',
    de: 'Next.js 16 / Payload 4 / Postgres',
  },
  { key: 'chrome.roleBadge', en: 'web & application architect', de: 'web & application architect' },
  { key: 'chrome.levelBadge', en: 'Senior-Level FullStack', de: 'Senior-Level FullStack' },
  { key: 'chrome.modeBadge', en: 'remote · DE', de: 'remote · DE' },
  {
    key: 'chrome.locationBadge',
    en: 'Kiebitzreihe · Hamburg area',
    de: 'Kiebitzreihe · Metropolregion Hamburg',
  },
  { key: 'chrome.portraitMonogram', en: 'MO', de: 'MO' },
  { key: 'chrome.breadcrumbHome', en: 'Home', de: 'Start' },
  { key: 'chrome.notFoundCode', en: 'HTTP 404 · Not Found', de: 'HTTP 404 · Nicht gefunden' },

  // -- Settings -------------------------------------------------------------
  { key: 'settings.eyebrow', en: 'settings', de: 'settings' },

  // -- Hero -----------------------------------------------------------------
  { key: 'blocks.hero.stackLabel', en: 'stack', de: 'stack' },

  // -- Case study -----------------------------------------------------------
  { key: 'blocks.caseStudy.eyebrow', en: 'case study', de: 'case study' },
  { key: 'blocks.caseStudy.periodLabel', en: 'period', de: 'Zeitraum' },
  { key: 'blocks.caseStudy.roleLabel', en: 'role', de: 'Rolle' },
  { key: 'blocks.caseStudy.contextLabel', en: 'Context', de: 'Kontext' },
  { key: 'blocks.caseStudy.solutionLabel', en: 'Architecture', de: 'Architektur' },
  { key: 'blocks.caseStudy.impactLabel', en: 'Impact', de: 'Wirkung' },
  { key: 'blocks.caseStudy.tagsLabel', en: 'context', de: 'Kontext' },
  { key: 'blocks.caseStudy.linkSrLabel', en: 'Reference link', de: 'Referenz-Link' },
  { key: 'blocks.caseStudy.linkFallbackLabel', en: 'Link', de: 'Link' },
  { key: 'blocks.caseStudy.impactEyebrow', en: 'impact', de: 'Wirkung' },

  // -- Timeline -------------------------------------------------------------
  { key: 'blocks.timeline.stationSingular', en: 'station', de: 'Station' },
  { key: 'blocks.timeline.stationPlural', en: 'stations', de: 'Stationen' },
  { key: 'blocks.timeline.emptyPeriod', en: '—', de: '—' },

  // -- Tech radar -----------------------------------------------------------
  { key: 'blocks.techRadar.tierCore', en: 'core', de: 'Kern' },
  { key: 'blocks.techRadar.tierProven', en: 'proven', de: 'bewährt' },
  { key: 'blocks.techRadar.tierFocus', en: 'focus', de: 'Fokus' },
  { key: 'blocks.techRadar.entriesSingular', en: 'entry', de: 'Eintrag' },
  { key: 'blocks.techRadar.entriesPlural', en: 'entries', de: 'Einträge' },
  { key: 'blocks.techRadar.quadrantPrefix', en: 'q', de: 'Q' },

  // -- Call to action -------------------------------------------------------
  { key: 'blocks.callToAction.eyebrowPrimary', en: 'call to action', de: 'Kontakt aufnehmen' },
  { key: 'blocks.callToAction.eyebrowSecondary', en: 'next step', de: 'nächster Schritt' },
  {
    key: 'blocks.callToAction.responseNote',
    en: 'Usually answered within 24 hours',
    de: 'Antwort in der Regel innerhalb von 24 Stunden',
  },

  // -- Architecture diagram -------------------------------------------------
  {
    key: 'blocks.architecture.defaultSectionLabel',
    en: 'Architecture',
    de: 'Architektur',
  },
  { key: 'blocks.architecture.layerSingular', en: 'layer', de: 'Ebene' },
  { key: 'blocks.architecture.layerPlural', en: 'layers', de: 'Ebenen' },
  { key: 'blocks.architecture.tablistAria', en: 'Architecture layers', de: 'Architektur-Ebenen' },
  { key: 'blocks.architecture.stackLabel', en: 'stack', de: 'stack' },

  // -- Status strip ---------------------------------------------------------
  { key: 'blocks.status.gaugeLabel', en: 'signal', de: 'Signal' },

  // -- Bento grid -----------------------------------------------------------
  { key: 'blocks.bento.pillarPrefix', en: 'Pillar', de: 'Säule' },
  { key: 'blocks.bento.featuredLabel', en: 'Featured', de: 'Featured' },
  { key: 'blocks.bento.eyebrow', en: 'Architecture approach', de: 'Architektur-Ansatz' },
  { key: 'blocks.bento.pillarSingular', en: 'pillar', de: 'Säule' },
  { key: 'blocks.bento.pillarPlural', en: 'pillars', de: 'Säulen' },
  { key: 'blocks.bento.architectureChip', en: 'System architecture', de: 'Systemarchitektur' },
  { key: 'blocks.bento.composableChip', en: 'composable', de: 'composable' },

  // -- Skillset -------------------------------------------------------------
  { key: 'blocks.skillset.eyebrow', en: 'skillset', de: 'Skillset' },
  { key: 'blocks.skillset.itemPrefix', en: 'skill', de: 'Skill' },

  // -- Image/text -----------------------------------------------------------
  { key: 'blocks.imageText.eyebrow', en: 'content', de: 'Inhalt' },
  { key: 'blocks.imageText.imagePlaceholder', en: '[ image ]', de: '[ Bild ]' },

  // -- Imprint --------------------------------------------------------------
  { key: 'routes.imprint.title', en: 'Imprint', de: 'Impressum' },
  { key: 'routes.imprint.eyebrow', en: 'Home // Imprint', de: 'Start // Impressum' },
  {
    key: 'routes.imprint.empty',
    en: 'The imprint content is being updated. Please direct any enquiry to mail@mostheimer.de.',
    de: 'Der Impressumstext wird gerade gepflegt. Anfragen richten Sie bitte direkt an mail@mostheimer.de.',
  },
  {
    key: 'routes.imprint.metaDescription',
    en: 'Legal notice under § 5 DDG (German law): provider, contact, email and phone number of Mayra Ostheimer.',
    de: 'Impressum und rechtliche Angaben gemäß § 5 DDG: Anbieter, Kontakt, E-Mail und Telefonnummer von Mayra Ostheimer.',
  },

  // -- Error screen ---------------------------------------------------------
  { key: 'routes.error.code', en: 'HTTP 500 · Error', de: 'HTTP 500 · Fehler' },
  { key: 'routes.error.title', en: 'Something went wrong', de: 'Etwas ist schiefgelaufen' },
  {
    key: 'routes.error.message',
    en: 'This page could not be loaded right now. Please try again — the home page is always reachable.',
    de: 'Diese Seite konnte gerade nicht geladen werden. Bitte versuche es erneut — die Startseite ist immer erreichbar.',
  },
  { key: 'routes.error.home', en: 'Back to home', de: 'Zur Startseite' },
  { key: 'routes.error.retry', en: 'Try again', de: 'Erneut versuchen' },
];

/** List rows (`values`: one entry per line). */
const LIST_ROWS: Array<{ key: string; en: string; de: string }> = [
  {
    key: 'blocks.hero.stackItems',
    en: 'Node 26\nNext.js 16\nTailwind 4\nPayloadCMS 4',
    de: 'Node 26\nNext.js 16\nTailwind 4\nPayloadCMS 4',
  },
  {
    key: 'blocks.hero.metrics',
    en: 'Experience|~10 yrs\nFocus|composable\nMode|remote (DE)\nResponse|< 24 h',
    de: 'Erfahrung|~10 yrs\nFokus|composable\nModus|remote (DE)\nAntwort|< 24 h',
  },
];

/** Command-palette entries: label + keywords per entry id. */
const COMMAND_ROWS: Array<{ id: string; en: [string, string]; de: [string, string] }> = [
  {
    id: 'home',
    en: ['Home / Profile', 'start, about, profile'],
    de: ['Home / Profil', 'start, profil, about, über'],
  },
  {
    id: 'architektur',
    en: [
      'Architecture philosophy',
      'pillars, system architecture, principles, approach, architektur',
    ],
    de: [
      'Architektur-Philosophie',
      'säulen, systemarchitektur, principles, architektur, philosophie',
    ],
  },
  {
    id: 'schaubild',
    en: ['Interactive architecture diagram', 'edge, bff, cms, data, layers, diagram'],
    de: ['Interaktives Architektur-Schaubild', 'edge, bff, cms, data, diagramm, layer, schaubild'],
  },
  {
    id: 'case-studies',
    en: ['Case Studies', 'projects, enterprise, impact'],
    de: ['Fallstudien', 'projekte, enterprise, impact, referenzen, hoerzu, bora, allianz'],
  },
  {
    id: 'tech-radar',
    en: ['Tech Radar', 'skills, technologies, stack'],
    de: ['Tech-Radar', 'skills, technologien, stack, capabilities, quadranten'],
  },
  {
    id: 'leadership',
    en: ['Leadership & Enablement', 'team, mentoring'],
    de: ['Leadership & Enablement', 'führung, team, mentoring, enablement'],
  },
  {
    id: 'career',
    en: ['Career', 'cv, resume, stations, testimonials'],
    de: ['Werdegang', 'lebenslauf, cv, stationen, referenzen, stimmen'],
  },
  {
    id: 'contact',
    en: ['Contact', 'email, mail, enquiry, hire'],
    de: ['Kontakt', 'email, mail, schreiben, anfrage, hire'],
  },
  {
    id: 'impressum',
    en: ['Imprint', 'imprint, legal notice, provider, ddg'],
    de: ['Impressum', 'impressum, imprint, legal, rechtliches, anbieter, § 5 ddg'],
  },
  {
    id: 'settings',
    en: ['Settings', 'theme, dark, light, font size'],
    de: ['Einstellungen', 'theme, dark, light, schriftgröße, animationen'],
  },
];

/** SQL literal escaping (single quotes doubled). */
function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Idempotent: a re-run (or a deployment that already seeded manually) must
  // not duplicate rows. `translations.id` is always 1 for a singleton global.
  const values: string[] = [];
  let order = 0;
  for (const row of ROWS) {
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.en)}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(row.key)}, ${lit(row.de)}, null)`,
    );
    order += 1;
  }
  for (const row of LIST_ROWS) {
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(row.key)}, null, ${lit(row.en)})`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(row.key)}, null, ${lit(row.de)})`,
    );
    order += 1;
  }
  for (const entry of COMMAND_ROWS) {
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(`commandItems.${entry.id}.label`)}, ${lit(entry.en[0])}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(`commandItems.${entry.id}.label`)}, ${lit(entry.de[0])}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'en', gen_random_uuid()::text, ${lit(`commandItems.${entry.id}.keywords`)}, ${lit(entry.en[1])}, null)`,
    );
    values.push(
      `((select id from translations limit 1), ${order}, 'de', gen_random_uuid()::text, ${lit(`commandItems.${entry.id}.keywords`)}, ${lit(entry.de[1])}, null)`,
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
  await db.execute(sql`DELETE FROM "translations_copy";`);
}
