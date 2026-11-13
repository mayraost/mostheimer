import coverAsset from '@/public/icon-512.png';
import type { Page } from '@/payload-types';
import type { ProjectImage } from '@/components/projects/pickImage';
import type { ProjectShowcaseItem, ProjectShowcaseView } from '@/components/projects/showcaseView';

/**
 * Block-Fixtures für die Content-Block-Stories (Teil B).
 *
 * Die Typen werden aus `Page['layout']` abgeleitet — nicht neu deklariert. Damit
 * bricht die Fixture beim nächsten Schema-Change im Build, statt still an der
 * Komponente vorbei zu laufen. Pflichtfelder sind gesetzt, optionale Felder nur
 * dort, wo die Story den Zustand zeigen soll.
 */

export type CaseStudyBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'caseStudy' }
>;
export type TimelineBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'timeline' }
>;
export type TestimonialBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'testimonial' }
>;
export type TechRadarBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'techRadar' }
>;
export type TechSectionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'techSection' }
>;
export type ArchitectureDiagramBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'architectureDiagram' }
>;
export type ProjectShowcaseBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'projectShowcase' }
>;

/**
 * Storybook hat keine Payload-Media-Route (`/api/media/file/…` würde 404
 * liefern). Der Asset-Import läuft durch den Vite-Image-Plugin und ergibt einen
 * servierbaren URL-String — die Tiles zeigen also ein echtes Bild statt eines
 * kaputten `<img>`.
 */
const PLACEHOLDER_COVER: ProjectImage = {
  url: coverAsset.src,
  width: coverAsset.width,
  height: coverAsset.height,
  alt: 'Platzhalter-Cover',
};

/* ── Case Study ─────────────────────────────────────────────────────────── */

export const caseStudyFull = {
  blockType: 'caseStudy',
  client: 'BORA',
  period: '2024 – Heute',
  role: 'Senior Fullstack Developer',
  context:
    'Der bestehende Shop lief auf einem monolithischen Shopsystem. Jede Kampagnenseite brauchte einen Deploy, Redaktion und Engineering blockierten sich gegenseitig.\n\nDie Anforderung war ein Content-Layer, den das Marketing selbst bedienen kann, ohne die Kasse anzufassen.',
  solution:
    'Next.js App Router mit cacheComponents, Payload als Headless-CMS und Postgres als gemeinsame Datenbank. Public Routes werden statisch über `use cache` gerendert, Änderungen invalidieren gezielt per Cache-Tag statt per Redeploy.\n\nDer Checkout blieb unangetastet und wird über eine Route-Group eingebunden.',
  contribution:
    'Aufbau der Cache-Schicht inklusive On-Demand-Revalidierung, Migration der Bestandsseiten und Übergabe der Redaktionsschulung.\n\nTime-to-publish sank von einem Release-Zyklus auf unter eine Minute.',
  link: 'https://example.com/case-study',
  linkLabel: 'Case Study ansehen',
  tags: ['Next.js', 'Payload CMS', 'Postgres'],
} satisfies CaseStudyBlockData;

/** Nur das Pflichtfeld `client`: kein Zeitraum, keine Spalten, keine Chips. */
export const caseStudyMinimal = {
  blockType: 'caseStudy',
  client: 'Allianz',
} satisfies CaseStudyBlockData;

export const caseStudyLong = {
  blockType: 'caseStudy',
  client: 'hoerzu.de',
  period: '2023 – 2024',
  role: 'Fullstack Developer, Platform Team',
  context:
    'Die Redaktion pflegte rund 4.000 Seiten über ein Formular-Frontend, das bei jedem Speichern die komplette Seite neu aufbaute. Ein Artikel mit zwanzig Bildern brauchte mehrere Sekunden bis zum ersten Feld.\n\nDazu kamen drei gewachsene Inhaltsmodelle, die sich gegenseitig überschrieben, sobald zwei Redakteurinnen dieselbe Seite offen hatten.',
  solution:
    'Ein gemeinsames Content-Modell mit expliziten Versionen, dazu ein Editor, der nur das geänderte Feld speichert. Die Vorschau läuft über ein separates Rendering, das den Entwurf clientseitig über die Formularwerte mischt — kein Reload, kein zweiter Datenpfad.\n\nDie Migration der Bestandsdaten lief in einem nächtlichen Batch mit Abgleich der Zeilenzahlen pro Collection.',
  contribution:
    'Ich habe das Content-Modell entworfen, die Migration geschrieben und den Editor auf inkrementelle Saves umgestellt. Zusätzlich ein Audit-Skript, das verwaiste Medien und tote interne Links meldet.\n\nDie Speicherzeit im Editor fiel von 4,2 s auf 180 ms, die Zahl der Support-Tickets zum Thema „Seite kaputt" auf null.',
  link: 'https://example.com/hoerzu',
  tags: ['Content-Migration', 'Editor-Performance', 'Playwright'],
} satisfies CaseStudyBlockData;

/** Link mit eigenem Label — der Renderer nimmt `linkLabel` vor dem Fallback. */
export const caseStudyWithLink = {
  blockType: 'caseStudy',
  client: 'BORA',
  period: '2024 – Heute',
  role: 'Senior Fullstack Developer',
  context: 'Kampagnenseiten brauchten bisher einen Deploy.',
  solution: 'Content-Layer mit gezielter Cache-Invalidierung.',
  contribution: 'Time-to-publish unter einer Minute.',
  link: 'https://example.com/bora',
  linkLabel: 'Projekt lesen',
} satisfies CaseStudyBlockData;

/**
 * `javascript:`-Schema. `safeHrefOrNull` verwirft es, der Renderer lässt den
 * Link komplett weg — der Altbestand kann also nie ein klickbares Skript werden.
 */
export const caseStudyUnsafeLink = {
  blockType: 'caseStudy',
  client: 'Unsichere Quelle',
  period: '2022',
  context: 'Der Link im Dokument zeigt auf ein nicht erlaubtes Schema.',
  solution: 'Validierung beim Schreiben, Filter beim Rendern.',
  contribution: 'Kein Link in der Meta-Spalte.',
  link: 'javascript:alert(1)',
  linkLabel: 'Sollte nicht erscheinen',
} satisfies CaseStudyBlockData;

/* ── Timeline ───────────────────────────────────────────────────────────── */

export const timelineDefault = {
  blockType: 'timeline',
  heading: 'Werdegang',
  entries: [
    {
      id: 'tl-1',
      period: 'Seit 09/2024 – Heute',
      company: 'valantic DXA',
      role: 'Senior Fullstack Developer',
      highlights:
        'Architektur und Betrieb von Next.js-Anwendungen mit Payload CMS.\n\nTechnische Leitung von zwei Produktteams, Review-Kultur und Release-Gates eingeführt.',
    },
    {
      id: 'tl-2',
      period: '2021 – 2024',
      company: 'hoerzu.de',
      role: 'Fullstack Developer',
      highlights:
        'Migration eines gewachsenen Redaktionssystems auf ein gemeinsames Content-Modell.\n\nEditor-Performance von 4,2 s auf 180 ms pro Save.',
    },
    {
      id: 'tl-3',
      period: '2019 – 2021',
      company: 'BORA',
      role: 'Frontend Developer',
      highlights: 'Design-System und Kampagnen-Baukasten für den DACH-Markt.',
    },
    {
      id: 'tl-4',
      period: '2017 – 2019',
      company: 'Agentur Nordlicht',
      role: 'Web Developer',
      highlights: 'Kundenprojekte von der Konzeption bis zum Betrieb.',
    },
    {
      id: 'tl-5',
      period: '2016 – 2017',
      company: 'Freelance',
      role: 'Web Developer',
      highlights: 'Erste eigene Projekte, überwiegend WordPress und Vanilla JS.',
    },
  ],
} satisfies TimelineBlockData;

export const timelineSingle = {
  blockType: 'timeline',
  heading: 'Aktuelle Station',
  entries: [
    {
      id: 'tl-single',
      period: 'Seit 09/2024 – Heute',
      company: 'valantic DXA',
      role: 'Senior Fullstack Developer',
      highlights: 'Architektur, Betrieb und Reviews.',
    },
  ],
} satisfies TimelineBlockData;

/** 12 Stationen = `maxRows` der Collection. */
export const timelineMany = {
  blockType: 'timeline',
  heading: 'Zwölf Stationen',
  entries: Array.from({ length: 12 }, (_, index) => ({
    id: `tl-many-${index + 1}`,
    period: `${2015 + index} – ${2016 + index}`,
    company: `Station ${String(index + 1).padStart(2, '0')}`,
    role: index % 2 === 0 ? 'Fullstack Developer' : 'Frontend Developer',
    highlights:
      index % 3 === 0
        ? 'Zwei Absätze, damit die Karte nicht wie eine Zeile wirkt.\n\nZweiter Absatz mit etwas mehr Text für den Umbruch.'
        : 'Ein Absatz Highlight-Text.',
  })),
} satisfies TimelineBlockData;

/** Ohne `heading` fehlt auch der Zähler-Chip (er hängt am Heading-Block). */
export const timelineWithoutHeading = {
  blockType: 'timeline',
  entries: [
    {
      id: 'tl-nh-1',
      period: '2024 – Heute',
      company: 'valantic DXA',
      role: 'Senior Fullstack Developer',
    },
    {
      id: 'tl-nh-2',
      period: '2021 – 2024',
      company: 'hoerzu.de',
      role: 'Fullstack Developer',
    },
  ],
} satisfies TimelineBlockData;

/** Leerer Zeitraum → Copy-Fallback (`copy.emptyPeriod`). */
export const timelineEmptyPeriod = {
  blockType: 'timeline',
  heading: 'Ohne Zeitraum',
  entries: [
    { id: 'tl-ep-1', period: '', company: 'Station ohne Datum', role: 'Rolle' },
    { id: 'tl-ep-2', period: '', company: 'Noch eine', highlights: 'Mit Highlight.' },
  ],
} satisfies TimelineBlockData;

/* ── Testimonial ────────────────────────────────────────────────────────── */

export const testimonialDefault = {
  blockType: 'testimonial',
  heading: 'Stimmen',
  items: [
    {
      id: 'tm-1',
      quote:
        'Die Zusammenarbeit war ungewöhnlich ruhig: klare Fragen, klare Antworten, und am Ende stand ein System, das auch nach dem Projekt noch verstanden wird.',
      author: 'Katrin Behrens',
      role: 'Head of Digital, BORA',
    },
    {
      id: 'tm-2',
      quote:
        'Wir haben zum ersten Mal einen Release ohne Nachtschicht gefahren. Das lag nicht an Glück, sondern an der Art, wie vorher geprüft wurde.',
      author: 'Tobias Reimers',
      role: 'CTO, hoerzu.de',
    },
    {
      id: 'tm-3',
      quote: 'Reviews waren fordernd und immer nachvollziehbar begründet.',
      author: 'Sara Lindqvist',
      role: 'Engineering Manager',
    },
    {
      id: 'tm-4',
      quote:
        'Die Dokumentation ist so geschrieben, dass ein neues Teammitglied nach einem Tag produktiv committen konnte.',
      author: 'Michael Ostrowski',
    },
  ],
} satisfies TestimonialBlockData;

export const testimonialSingle = {
  blockType: 'testimonial',
  heading: 'Eine Stimme',
  items: [
    {
      id: 'tm-single',
      quote: 'Klare Kommunikation, saubere Übergabe.',
      author: 'Katrin Behrens',
      role: 'Head of Digital, BORA',
    },
  ],
} satisfies TestimonialBlockData;

export const testimonialWithoutHeading = {
  blockType: 'testimonial',
  items: [
    {
      id: 'tm-nh-1',
      quote: 'Ohne Überschrift beginnt der Block direkt mit der ersten Karte.',
      author: 'Tobias Reimers',
      role: 'CTO, hoerzu.de',
    },
    {
      id: 'tm-nh-2',
      quote: 'Zweite Karte im selben Raster.',
      author: 'Sara Lindqvist',
    },
  ],
} satisfies TestimonialBlockData;

export const testimonialLongQuote = {
  blockType: 'testimonial',
  heading: 'Langes Zitat',
  items: [
    {
      id: 'tm-long',
      quote:
        'Was dieses Projekt von anderen unterschieden hat, war die Bereitschaft, Annahmen zu prüfen, bevor Code entsteht. Wir haben zwei Wochen mit Messen und Nachdenken verbracht, und danach war die Umsetzung fast unspektakulär: weniger Code, weniger Sonderfälle, weniger Betriebsarbeit. Genau das war der Punkt, an dem das Team aufgehört hat, über Architektur zu diskutieren, und angefangen hat, sie zu benutzen.',
      author: 'Michael Ostrowski',
      role: 'Principal Engineer, Platform',
    },
  ],
} satisfies TestimonialBlockData;

/** Leeres `items`-Array: das Raster bleibt leer, die Überschrift steht. */
export const testimonialEmpty = {
  blockType: 'testimonial',
  heading: 'Noch keine Stimmen',
  items: [],
} satisfies TestimonialBlockData;

/* ── Tech Radar ─────────────────────────────────────────────────────────── */

export const techRadarDefault = {
  blockType: 'techRadar',
  heading: 'Tech Radar',
  quadrants: [
    {
      id: 'tr-1',
      title: 'Sprache & Runtime',
      items: [
        {
          id: 'tr-1-1',
          name: 'TypeScript',
          tier: 'core',
          description: 'Strict mode, keine impliziten `any`, Typen aus dem Schema generiert.',
        },
        { id: 'tr-1-2', name: 'Node.js', tier: 'core', description: 'LTS, exakt gepinnt.' },
        {
          id: 'tr-1-3',
          name: 'Bun',
          tier: 'focus',
          description: 'Beobachtet, nicht im Produktivpfad.',
        },
      ],
    },
    {
      id: 'tr-2',
      title: 'Frameworks',
      items: [
        {
          id: 'tr-2-1',
          name: 'Next.js',
          tier: 'core',
          description: 'App Router, cacheComponents, Server Actions vor API-Routen.',
        },
        { id: 'tr-2-2', name: 'React', tier: 'core' },
        {
          id: 'tr-2-3',
          name: 'Tailwind CSS',
          tier: 'proven',
          description: 'Design-Tokens als `@theme`-Variablen.',
        },
        { id: 'tr-2-4', name: 'Motion', tier: 'proven' },
      ],
    },
    {
      id: 'tr-3',
      title: 'Daten & State',
      items: [
        {
          id: 'tr-3-1',
          name: 'Postgres',
          tier: 'core',
          description: 'Eine geteilte Instanz, Datenbank pro Projekt.',
        },
        {
          id: 'tr-3-2',
          name: 'Payload CMS',
          tier: 'proven',
          description: 'Content-Modell statt Freitext.',
        },
        { id: 'tr-3-3', name: 'Redis', tier: 'focus' },
      ],
    },
    {
      id: 'tr-4',
      title: 'Betrieb',
      items: [
        {
          id: 'tr-4-1',
          name: 'Docker',
          tier: 'proven',
          description: 'Standalone-Images, exakte Base-Image-Pins.',
        },
        {
          id: 'tr-4-2',
          name: 'Cloudflare',
          tier: 'proven',
          description: 'Edge-Cache mit Purge-Vertrag.',
        },
        { id: 'tr-4-3', name: 'Kubernetes', tier: 'focus' },
        { id: 'tr-4-4', name: 'Coolify', tier: 'core' },
      ],
    },
  ],
} satisfies TechRadarBlockData;

export const techRadarSingleQuadrant = {
  blockType: 'techRadar',
  heading: 'Ein Quadrant',
  quadrants: [
    {
      id: 'tr-single',
      title: 'Sprache & Runtime',
      items: [
        { id: 'tr-single-1', name: 'TypeScript', tier: 'core' },
        { id: 'tr-single-2', name: 'Node.js', tier: 'core' },
      ],
    },
  ],
} satisfies TechRadarBlockData;

export const techRadarWithoutHeading = {
  blockType: 'techRadar',
  quadrants: [
    {
      id: 'tr-nh-1',
      title: 'Frameworks',
      items: [{ id: 'tr-nh-1-1', name: 'Next.js', tier: 'core' }],
    },
    {
      id: 'tr-nh-2',
      title: 'Betrieb',
      items: [{ id: 'tr-nh-2-1', name: 'Docker', tier: 'proven' }],
    },
  ],
} satisfies TechRadarBlockData;

/** Keine Quadranten: Kopfzeile mit Tier-Chips bleibt, das Raster ist leer. */
export const techRadarEmpty = {
  blockType: 'techRadar',
  heading: 'Leerer Radar',
  quadrants: [],
} satisfies TechRadarBlockData;

/* ── Tech Section ───────────────────────────────────────────────────────── */

export const techSectionDefault = {
  blockType: 'techSection',
  sectionLabel: 'Deep Dive',
  heading: 'Caching ohne Redeploy',
  body: 'Die öffentlichen Routen werden statisch gerendert und über Cache-Tags invalidiert. Ein Publish im CMS stößt die Invalidierung im selben Request an, der den Datensatz schreibt — es gibt keinen zweiten Pfad, der „irgendwann" aufräumt.\n\nLange TTLs sind dadurch reine Ausfall-Resistenz: Wenn der Origin-Container fehlt, liefert der Edge weiter aus. Korrektheit kommt aus dem Flush, nicht aus der Frist.',
  keyFacts: [
    { id: 'kf-1', label: 'E-Mail', value: 'kontakt@mostheimer.de' },
    { id: 'kf-2', label: 'Telefon', value: '+49 151 2345678' },
    { id: 'kf-3', label: 'Profile', value: 'github.com/mayraost · linkedin.com/in/mayraost' },
    { id: 'kf-4', label: 'Caching', value: 'Cloudflare Edge' },
  ],
} satisfies TechSectionBlockData;

/** Ohne `sectionLabel` keine Eyebrow — kein Platzhaltertext. */
export const techSectionMinimal = {
  blockType: 'techSection',
  heading: 'Nur Überschrift und Text',
  body: 'Ein einzelner Absatz, ohne Kennzahlen-Zeile.',
} satisfies TechSectionBlockData;

export const techSectionLong = {
  blockType: 'techSection',
  sectionLabel: '§ 5 DDG / Legal Notice',
  heading: 'Anbieterkennzeichnung',
  body: 'Die folgenden Angaben gelten für alle Inhalte unter dieser Domain. Sie sind bewusst als Fließtext gepflegt und nicht als Tabelle, weil sich die rechtlichen Vorgaben zwischen den Fassungen ändern und die Redaktion sie ohne Schema-Änderung nachziehen können muss.\n\nVerantwortlich für den Inhalt ist die im Impressum genannte Person. Anfragen zu Inhalten richten Sie bitte an die dort hinterlegte Adresse; Anfragen zu technischen Themen an die E-Mail-Adresse im Kontaktbereich.\n\nAlle Kennzahlen in diesem Bereich stammen aus Messungen am Produktionssystem und werden bei Änderungen der Infrastruktur aktualisiert. Sie sind keine Zusicherung eines Service-Levels.\n\nFür externe Links übernehmen wir keine Haftung; zum Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar.',
  keyFacts: [
    { id: 'kf-long-1', label: 'Anschrift', value: 'Kiebitzreihe, Schleswig-Holstein' },
    { id: 'kf-long-2', label: 'Registereintrag', value: 'nicht vorhanden' },
    { id: 'kf-long-3', label: 'Umsatzsteuer-ID', value: 'gemäß § 27 a UStG' },
  ],
} satisfies TechSectionBlockData;

/** Nur Fakten ohne Aktion (keine Mail-/Telefon-/Profilwerte). */
export const techSectionPlainFacts = {
  blockType: 'techSection',
  sectionLabel: 'Messwerte',
  heading: 'Kennzahlen',
  body: 'Die Werte stammen aus dem letzten Lighthouse-Lauf auf einem Mittelklasse-Notebook.',
  keyFacts: [
    { id: 'kf-p-1', label: 'Performance', value: '98 / 100' },
    { id: 'kf-p-2', label: 'Accessibility', value: '100 / 100' },
    { id: 'kf-p-3', label: 'CLS', value: '0.000' },
    { id: 'kf-p-4', label: 'LCP', value: '1.1 s' },
    { id: 'kf-p-5', label: 'TTFB', value: '< 120 ms' },
    { id: 'kf-p-6', label: 'Image', value: '299 MB' },
  ],
} satisfies TechSectionBlockData;

/* ── Architecture Diagram ───────────────────────────────────────────────── */

export const architectureDefault = {
  blockType: 'architectureDiagram',
  sectionLabel: 'Architektur',
  heading: 'Vier Layer, eine Richtung',
  description:
    'Der Aufbau folgt der Frage, was passiert, wenn ein Layer ausfällt. Jeder Layer kennt nur seinen Nachbarn; es gibt keinen Pfad, der zwei Ebenen überspringt.',
  layers: [
    {
      id: 'al-1',
      title: 'Edge',
      subtitle: 'Cloudflare · Cache · Redirects',
      summary:
        'Terminierung, Cache und die Sprach-Negotiation. Der Edge hält die Seite auch dann erreichbar, wenn der Origin fehlt.',
      principles: [
        {
          id: 'al-1-p1',
          title: 'Cache ist Ausfall-Resistenz',
          text: 'Lange Fristen, harte Invalidierung per Purge — nicht umgekehrt.',
        },
        {
          id: 'al-1-p2',
          title: 'Keine Logik, die der Origin braucht',
          text: 'Redirects sind Edge-Regeln, nicht Middleware.',
        },
      ],
      stack: 'Cloudflare · Varnish · mTLS',
      metricLabel: 'TTFB p95',
      metricValue: '< 120 ms',
    },
    {
      id: 'al-2',
      title: 'App / BFF',
      subtitle: 'Next.js · Server Actions',
      summary:
        'Rendering, Formulare und die Auth-Grenze. Server Actions sind der Standard für Writes; API-Routen nur für externe Caller.',
      principles: [
        {
          id: 'al-2-p1',
          title: 'Ein Datenweg',
          text: 'Kein zweiter Fetch-Pfad für die Vorschau.',
        },
        {
          id: 'al-2-p2',
          title: 'Auth bleibt serverseitig',
          text: 'Session-Reads niemals im Client-Bundle.',
        },
      ],
      stack: 'Next.js 16 · React 19 · Zod',
      metricLabel: 'LCP',
      metricValue: '1.1 s',
    },
    {
      id: 'al-3',
      title: 'Core / CMS',
      subtitle: 'Payload · Content-Modell',
      summary:
        'Content, Rechte und Versionen. Jede Änderung läuft durch dieselben Hooks wie der Admin — inklusive Cache-Invalidierung.',
      principles: [
        {
          id: 'al-3-p1',
          title: 'Schema statt Freitext',
          text: 'Blöcke sind typisiert, nicht als JSON abgelegt.',
        },
        {
          id: 'al-3-p2',
          title: 'Kein Bypass',
          text: 'Content-Writes nur über MCP/Admin, nie per Skript.',
        },
      ],
      stack: 'Payload 4 · Lexical · REST',
      metricLabel: 'Saves',
      metricValue: '180 ms',
    },
    {
      id: 'al-4',
      title: 'Data / State',
      subtitle: 'Postgres · Migrationen',
      summary:
        'Eine geteilte Instanz, pro Projekt eine Datenbank und ein eigener User. Migrationen laufen beim Init, nicht per CLI im Container.',
      principles: [
        {
          id: 'al-4-p1',
          title: 'Isolation pro App',
          text: 'Eigene DB, eigener Restricted-User, kein PUBLIC-Grant.',
        },
        {
          id: 'al-4-p2',
          title: 'Append-only Historie',
          text: 'Migrationen werden nie umbenannt oder editiert.',
        },
      ],
      stack: 'Postgres 17 · Drizzle',
      metricLabel: 'Connections',
      metricValue: '≤ 20',
    },
  ],
} satisfies ArchitectureDiagramBlockData;

export const architectureSingleLayer = {
  blockType: 'architectureDiagram',
  sectionLabel: 'Architektur',
  heading: 'Ein einzelner Layer',
  description: 'Der Zähler im Header zeigt „1 Layer" (Singular aus der Copy).',
  layers: [
    {
      id: 'al-single',
      title: 'Edge',
      subtitle: 'Cloudflare',
      summary: 'Ein Layer genügt, um Tablist, Panel und Zähler zu prüfen.',
      principles: [{ id: 'al-single-p1', title: 'Prinzip', text: 'Kurze Erläuterung.' }],
      stack: 'Cloudflare',
      metricLabel: 'TTFB',
      metricValue: '< 120 ms',
    },
  ],
} satisfies ArchitectureDiagramBlockData;

/** Keine Subtitle/Metriken/Stack/Prinzipien — nur die Pflichtfelder. */
export const architectureMinimal = {
  blockType: 'architectureDiagram',
  heading: 'Ohne Beschreibung',
  layers: [
    { id: 'al-min-1', title: 'Edge' },
    { id: 'al-min-2', title: 'App', summary: 'Nur eine Kurzfassung, kein Stack.' },
  ],
} satisfies ArchitectureDiagramBlockData;

/** Layer ohne `principles`: der Panel-Body besteht nur aus Summary/Stack. */
export const architectureWithoutPrinciples = {
  blockType: 'architectureDiagram',
  sectionLabel: 'Architektur',
  heading: 'Ohne Prinzipien',
  layers: [
    {
      id: 'al-wp-1',
      title: 'Edge',
      summary: 'Ein Layer ohne Prinzipien-Liste.',
      stack: 'Cloudflare',
    },
    {
      id: 'al-wp-2',
      title: 'App',
      summary: 'Zweiter Layer, ebenfalls ohne Liste.',
      stack: 'Next.js',
    },
  ],
} satisfies ArchitectureDiagramBlockData;

/** `layers: []` → die Komponente rendert `null` (kein leerer Rahmen). */
export const architectureEmpty = {
  blockType: 'architectureDiagram',
  heading: 'Keine Layer',
  layers: [],
} satisfies ArchitectureDiagramBlockData;

/* ── Project Showcase ───────────────────────────────────────────────────── */

export const projectShowcaseBlock = {
  blockType: 'projectShowcase',
  eyebrow: 'Projekte',
  heading: 'Gebaute Systeme',
  intro:
    'Projekte entstehen mit KI-Unterstützung und werden an professionellen Standards gemessen: Regelwerk im Repo, Gates vor jedem Merge, automatisierter Audit.',
  pageSize: 6,
  showFilter: true,
  featureFirst: true,
} satisfies ProjectShowcaseBlockData;

const SHOWCASE_ITEMS: ProjectShowcaseItem[] = [
  {
    id: 1,
    slug: 'audit-scanner',
    title: 'audit-scanner',
    teaser:
      'Prüft alle Repos auf floating Pins und offene CVEs, erzeugt Fix-PRs und meldet den Stand täglich.',
    kind: 'product',
    href: '/de/projects/audit-scanner',
    featured: true,
    cover: PLACEHOLDER_COVER,
    stack: ['TypeScript', 'Docker', 'Trivy'],
    liveUrl: null,
    githubUrl: 'https://github.com/mayraost/audit-scanner',
  },
  {
    id: 2,
    slug: 'coolify-postgres',
    title: 'coolify-postgres',
    teaser:
      'Eine geteilte Postgres-Instanz für alle Projekte, mit eigenem User und eigener DB pro App.',
    kind: 'tool',
    href: '/de/projects/coolify-postgres',
    featured: false,
    cover: null,
    stack: ['Postgres', 'Docker Compose'],
    liveUrl: null,
    githubUrl: 'https://github.com/mayraost/coolify-postgres',
  },
  {
    id: 3,
    slug: 'placeholder-404',
    title: 'placeholder-404',
    teaser:
      'Catch-All für unbekannte Hostnames: 404 mit Impressum statt nackter Proxy-Fehlerseite.',
    kind: 'tool',
    href: '/de/projects/placeholder-404',
    featured: false,
    cover: PLACEHOLDER_COVER,
    stack: ['nginx', 'Traefik'],
    liveUrl: 'https://mostheimer.de',
    githubUrl: 'https://github.com/mayraost/placeholder-404',
  },
  {
    id: 4,
    slug: 'halloween-counter',
    title: 'halloween-counter',
    teaser: 'Mobile-only Zähler als statische Seite, Image von 385 MB auf 299 MB reduziert.',
    kind: 'experiment',
    href: '/de/projects/halloween-counter',
    featured: false,
    cover: null,
    stack: ['Next.js', 'Tailwind CSS'],
    liveUrl: 'https://halloween.mosthi.de',
    githubUrl: 'https://github.com/mayraost/halloween-counter',
  },
  {
    id: 5,
    slug: 'internal-dashboard',
    title: 'internal-dashboard',
    teaser: 'Betriebs-Dashboard mit serverseitig gerenderten Icons und JSON-Daten im Repo.',
    kind: 'product',
    href: '/de/projects/internal-dashboard',
    featured: false,
    cover: PLACEHOLDER_COVER,
    stack: ['Next.js', 'Payload CMS', 'Postgres'],
    liveUrl: null,
    githubUrl: 'https://github.com/mayraost/internal-dashboard',
  },
  {
    id: 6,
    slug: 'private-ai-interface',
    title: 'private-ai-interface',
    teaser: 'Lokaler Chat-Client gegen selbst gehostete Modelle, ohne externe Provider.',
    kind: 'experiment',
    href: '/de/projects/private-ai-interface',
    featured: false,
    cover: null,
    stack: ['Next.js', 'Ollama'],
    liveUrl: null,
    githubUrl: 'https://github.com/mayraost/private-ai-interface',
  },
];

const SHOWCASE_TAGS = [
  { slug: 'nextjs', label: 'Next.js', count: 4 },
  { slug: 'payload', label: 'Payload', count: 3 },
  { slug: 'infra', label: 'Infrastruktur', count: 2 },
];

/** Seite 1 von 3, alle Chips inaktiv. */
export const showcaseViewDefault = {
  items: SHOWCASE_ITEMS,
  totalDocs: 14,
  totalPages: 3,
  currentPage: 1,
  tags: SHOWCASE_TAGS,
  activeTag: null,
} satisfies ProjectShowcaseView;

/** Eine Seite: die Pagination rendert `null` (`totalPages <= 1`). */
export const showcaseViewSinglePage = {
  items: SHOWCASE_ITEMS.slice(0, 3),
  totalDocs: 3,
  totalPages: 1,
  currentPage: 1,
  tags: SHOWCASE_TAGS,
  activeTag: null,
} satisfies ProjectShowcaseView;

/** Mitte einer langen Serie: beide Ellipsen und beide Sprunglinks. */
export const showcaseViewManyPages = {
  items: SHOWCASE_ITEMS,
  totalDocs: 72,
  totalPages: 12,
  currentPage: 5,
  tags: SHOWCASE_TAGS,
  activeTag: null,
} satisfies ProjectShowcaseView;

/** Tag-Filter aktiv, kein Treffer: Filterzeile bleibt, Ergebnis-Ansage zeigt 0. */
export const showcaseViewFilteredEmpty = {
  items: [],
  totalDocs: 14,
  totalPages: 1,
  currentPage: 1,
  tags: SHOWCASE_TAGS,
  activeTag: 'infra',
} satisfies ProjectShowcaseView;

/** Nichts veröffentlicht: keine Chips, keine Pagination, `emptyState`-Text. */
export const showcaseViewEmpty = {
  items: [],
  totalDocs: 0,
  totalPages: 0,
  currentPage: 1,
  tags: [],
  activeTag: null,
} satisfies ProjectShowcaseView;

/** Alle Tiles ohne Cover: der 16:9-Platzhalterband ersetzt das Bild. */
export const showcaseViewNoCovers = {
  items: SHOWCASE_ITEMS.map((item) => ({ ...item, cover: null })),
  totalDocs: SHOWCASE_ITEMS.length,
  totalPages: 1,
  currentPage: 1,
  tags: SHOWCASE_TAGS,
  activeTag: null,
} satisfies ProjectShowcaseView;
