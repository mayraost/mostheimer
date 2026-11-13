import type { Translation } from '@/payload-types';
import type { ArchitectureCopy } from '@/components/blocks/ArchitectureDiagramBlock';
import type { BentoCopy } from '@/components/blocks/BentoGridBlock';
import type { CaseStudyCopy } from '@/components/blocks/CaseStudyBlock';
import type { CtaCopy } from '@/components/blocks/CallToActionBlock';
import type { HeroCopy } from '@/components/blocks/HeroBlock';
import type { ProjectShowcaseCopy } from '@/components/blocks/ProjectShowcaseBlock';
import type { SkillsetCopy } from '@/components/blocks/SkillsetBlock';
import type { TechRadarCopy } from '@/components/blocks/TechRadarBlock';
import type { TimelineCopy } from '@/components/blocks/TimelineBlock';
import type { ProjectDetailCopy } from '@/components/projects/ProjectDetail';
import type { ProjectKind } from '@/components/projects/showcaseView';

/**
 * Fixtures für Storybook.
 *
 * RULE: Komponenten lesen KEINE Texte aus dem Code, sie bekommen sie als
 * Prop/Context aus dem `translations`-Global. Stories müssen also dieselbe
 * Form liefern — hier als typisierte Konstante statt als CMS-Read.
 *
 * Nur die Gruppen, die Komponenten tatsächlich über `getLegacyCopy(...)`
 * anfassen, sind gefüllt; alles andere fällt über die `COPY_KEYS`-Registry in
 * `src/lib/translations.ts` auf den deklarierten Seed zurück. Das heißt: eine
 * fehlende Zeile erzeugt leeren Text, NIE einen Crash — aber eine Story mit
 * leerem Label sieht aus wie ein Bug, deshalb sind die sichtbaren Gruppen
 * ausgeschrieben.
 */

const kindLabels: Record<ProjectKind, string> = {
  experiment: 'Experiment',
  tool: 'Tool',
  product: 'Produkt',
};

export const mockTranslations: Translation = {
  id: 1,
  settings: {
    title: 'Einstellungen',
    themeHeading: 'Erscheinungsbild',
    themeDescription: 'Dunkel, hell oder der Systemeinstellung folgen.',
    fontSizeHeading: 'Schriftgröße',
    fontSizeDescription: 'Größere Schrift für mehr Lesbarkeit.',
    animationsHeading: 'Animationen',
    animationsDescription: 'Bewegung reduzieren oder komplett abschalten.',
  },
  common: {
    system: 'System',
    light: 'Hell',
    dark: 'Dunkel',
    normal: 'Normal',
    large: 'Groß',
    on: 'An',
    off: 'Aus',
    theme: 'Theme',
    settingsButtonAria: 'Einstellungen öffnen',
    menu: 'Menü',
  },
  commandPalette: {
    triggerLabel: 'Suche — Befehlspalette öffnen',
    triggerText: 'Suche',
    title: 'Befehlspalette',
    placeholder: 'Seite oder Abschnitt suchen …',
    searchLabel: 'Suche',
    resultsLabel: 'Ergebnisse',
    emptyLabel: 'Keine Treffer.',
    hintNavigate: 'navigieren',
    hintOpen: 'öffnen',
    resultCount: 'Treffer',
    resultCountPlural: 'Treffer',
    groupPages: 'Seiten',
    groupSections: 'Abschnitte',
  },
  footer: {
    rightsReserved: 'Alle Rechte vorbehalten.',
    eyebrow: '// site',
  },
  cookies: {
    eyebrow: 'Consent',
    title: 'Cookie-Einstellungen',
    description:
      'Wir verwenden ausschließlich notwendige Cookies, solange du nicht ausdrücklich mehr erlaubst.',
    privacyLabel: 'Datenschutz',
    privacyLink: '/de/privacy',
    necessaryLabel: 'Notwendig',
    necessaryDescription: 'Session, Sprache und Consent-Status. Immer aktiv.',
    necessaryBadge: 'Pflicht',
    analyticsLabel: 'Analyse',
    analyticsDescription: 'Anonyme Reichweitenmessung über den Tag Manager.',
    marketingLabel: 'Marketing',
    marketingDescription: 'Conversion-Messung für Kampagnen.',
    rejectAll: 'Nur notwendige',
    saveSelection: 'Auswahl speichern',
    acceptAll: 'Alle akzeptieren',
    settingsLink: 'Cookie-Einstellungen',
  },
  clipboard: {
    copyLabel: 'E-Mail kopieren',
    copiedMessage: 'E-Mail-Adresse kopiert',
    failedMessage: 'Kopieren fehlgeschlagen',
    copiedInline: '[ KOPIERT // 200 OK ]',
  },
  contactActions: {
    callLabel: 'Anrufen',
    githubLabel: 'GitHub',
    linkedinLabel: 'LinkedIn',
    newTabHint: 'öffnet in neuem Tab',
  },
  copy: [
    { key: 'chrome.brandClaim', text: 'Web & Application Architect' },
    { key: 'chrome.footerCredits', text: 'Next.js 16 / Payload 4 / Postgres' },
  ],
};

/**
 * Copy-Bundles der Content-Blöcke (`blocks.*`). Die Blöcke sind reine
 * Renderer und bekommen ihre Labels als Prop — die Stories reichen dieses
 * Objekt durch.
 */
export const mockCopy: {
  hero: HeroCopy;
  bento: BentoCopy;
  skillset: SkillsetCopy;
  callToAction: CtaCopy;
  caseStudy: CaseStudyCopy;
  timeline: TimelineCopy;
  techRadar: TechRadarCopy;
  architecture: ArchitectureCopy;
  projectShowcase: ProjectShowcaseCopy;
  projectDetail: ProjectDetailCopy;
} = {
  hero: {
    roleBadge: 'web & application architect',
    levelBadge: 'Senior-Level FullStack',
    modeBadge: 'remote · DE',
    locationBadge: 'Kiebitzreihe · Hamburg area',
    portraitName: 'Mayra Ostheimer',
    portraitMonogram: 'MO',
    stackLabel: 'Stack',
    stackItems: [{ item: 'TypeScript' }, { item: 'Next.js' }, { item: 'Postgres' }],
    metrics: [
      { label: 'Erfahrung', value: '~10 yrs' },
      { label: 'Architektur', value: 'composable' },
      { label: 'Standort', value: 'remote (DE)' },
      { label: 'Antwort', value: '< 24 h' },
    ],
  },
  bento: {
    pillarPrefix: 'Säule',
    featuredLabel: 'Featured',
    eyebrow: 'Architektur',
    pillarSingular: 'Säule',
    pillarPlural: 'Säulen',
    architectureChip: 'Architektur',
    composableChip: 'composable',
  },
  skillset: {
    eyebrow: 'Skillset',
    itemPrefix: 'Skill',
  },
  callToAction: {
    eyebrowPrimary: 'Projekt starten',
    eyebrowSecondary: 'Zusammenarbeit',
    responseNote: 'Antwort in der Regel innerhalb von 24 Stunden.',
  },
  caseStudy: {
    eyebrow: 'Case Study',
    periodLabel: 'Zeitraum',
    roleLabel: 'Rolle',
    contextLabel: 'Kontext',
    solutionLabel: 'Lösung',
    impactLabel: 'Wirkung',
    tagsLabel: 'Tags',
    linkSrLabel: 'Case Study öffnen',
    linkFallbackLabel: 'Mehr lesen',
    impactEyebrow: 'Impact',
  },
  timeline: {
    stationSingular: 'Station',
    stationPlural: 'Stationen',
    emptyPeriod: 'Zeitraum folgt',
  },
  techRadar: {
    tierCore: 'Core',
    tierProven: 'Proven',
    tierFocus: 'Focus',
    entriesSingular: 'Eintrag',
    entriesPlural: 'Einträge',
    quadrantPrefix: 'Quadrant',
  },
  architecture: {
    defaultSectionLabel: 'Architektur',
    layerSingular: 'Layer',
    layerPlural: 'Layer',
    tablistAria: 'Architektur-Layer',
    stackLabel: 'Stack',
  },
  projectShowcase: {
    eyebrow: 'Projekte',
    countSingular: 'Projekt',
    countPlural: 'Projekte',
    featuredLabel: 'Featured',
    detailLabel: 'Details',
    liveLabel: 'Live',
    githubLabel: 'Code',
    stackLabel: 'Stack',
    newTabHint: 'öffnet in neuem Tab',
    emptyLabel: 'Keine Projekte in dieser Auswahl.',
    paginationAria: 'Seiten',
    prevLabel: 'Zurück',
    nextLabel: 'Weiter',
    pageLabel: 'Seite',
    ofLabel: 'von',
    kindLabels,
    filterLabel: 'Filter',
    filterAll: 'Alle',
    filterEmpty: 'Kein Projekt mit diesem Tag.',
    filterResultCountSingular: 'Projekt',
    filterResultCountPlural: 'Projekte',
  },
  projectDetail: {
    eyebrow: 'Projekt',
    contextLabel: 'Kontext',
    approachLabel: 'Vorgehen',
    learningsLabel: 'Learnings',
    outcomeLabel: 'Ergebnis',
    stackLabel: 'Stack',
    tagsLabel: 'Tags',
    liveCta: 'Live ansehen',
    githubCta: 'Code ansehen',
    storybookCta: 'Komponenten-Doku',
    backToList: 'Zurück zur Übersicht',
    noCover: 'Kein Cover',
    empty: 'Für dieses Projekt ist noch kein Text hinterlegt.',
    newTabHint: 'öffnet in neuem Tab',
    kindLabels,
  },
};
