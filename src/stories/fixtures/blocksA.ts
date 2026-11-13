import type { LexicalNodes_8BF8C994, LexicalRichText, Media, Page } from '@/payload-types';

/**
 * Block-Fixtures für Storybook (Satz A: Hero, Bento, Status, CTA, FeatureGrid,
 * ImageText, RichText, Skillset).
 *
 * Alle Objekte sind mit `satisfies` gegen den GENERIERTEN Payload-Typ geprüft —
 * die Form ist also exakt das, was die Local API liefert, nicht „ungefähr so".
 * Fehlende Beziehungen sind `null` bzw. eine nackte ID (depth 0), nie erfunden.
 */

type LayoutBlock = NonNullable<Page['layout']>[number];

export type HeroBlockData = Extract<LayoutBlock, { blockType: 'hero' }>;
export type BentoGridBlockData = Extract<LayoutBlock, { blockType: 'bentoGrid' }>;
export type StatusBlockData = Extract<LayoutBlock, { blockType: 'statusBlock' }>;
export type CallToActionBlockData = Extract<LayoutBlock, { blockType: 'callToAction' }>;
export type FeatureGridBlockData = Extract<LayoutBlock, { blockType: 'featureGrid' }>;
export type ImageTextBlockData = Extract<LayoutBlock, { blockType: 'imageText' }>;
export type RichTextBlockData = Extract<LayoutBlock, { blockType: 'richText' }>;
export type SkillsetBlockData = Extract<LayoutBlock, { blockType: 'skillset' }>;

/**
 * Media-Platzhalter. Die URL ist absichtlich ein relativer Pfad unter
 * `/media/…` (so liefert sie auch der laufende Server); die Datei existiert im
 * Storybook-Kontext nicht — `next/image` rendert trotzdem ein `<img>`, es gibt
 * also keinen Crash, nur ein leeres Bild.
 */
export const placeholderMedia = {
  id: 1,
  alt: 'Platzhalterbild',
  url: '/media/placeholder.png',
  filename: 'placeholder.png',
  mimeType: 'image/png',
  filesize: 48_000,
  width: 1600,
  height: 900,
  focalX: 50,
  focalY: 50,
  updatedAt: '2026-11-01T00:00:00.000Z',
  createdAt: '2026-11-01T00:00:00.000Z',
} satisfies Media;

/* ── Lexical-Bausteine ─────────────────────────────────────────────────── */

/** Textknoten; `format: 1` ist Lexicals Bit für fett. */
function text(value: string, bold = false): LexicalNodes_8BF8C994 {
  return {
    type: 'text',
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
    text: value,
    version: 1,
  };
}

function paragraph(...children: LexicalNodes_8BF8C994[]): LexicalNodes_8BF8C994 {
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  };
}

function heading(tag: 'h2' | 'h3', value: string): LexicalNodes_8BF8C994 {
  return {
    type: 'heading',
    tag,
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  };
}

function bulletList(items: string[]): LexicalNodes_8BF8C994 {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    children: items.map((item, index) => ({
      type: 'listitem',
      value: index + 1,
      checked: false,
      children: [text(item)],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

/** Minimales, gültiges Lexical-Root: zwei Absätze, ein fetter Span. */
export const richTextBasic = {
  root: {
    children: [
      paragraph(
        text('Erster Absatz aus dem CMS — '),
        text('fett gesetzt', true),
        text(' und normal weiter.'),
      ),
      paragraph(text('Zweiter Absatz. Der Renderer setzt Absätze als echte <p>-Elemente.')),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} satisfies LexicalRichText<LexicalNodes_8BF8C994>;

/** Struktur-Variante: Heading, Absatz, Liste. */
export const richTextStructured = {
  root: {
    children: [
      heading('h2', 'Vorgehen'),
      paragraph(
        text('Analyse, Schnitt, Umsetzung — in dieser Reihenfolge, mit Gate vor jedem Merge.'),
      ),
      bulletList([
        'Architektur-Review vor dem ersten Commit',
        'Migrationen als Snapshot-Diff',
        'Deploy mit Cache-Purge und Warming',
      ]),
      paragraph(text('Abschließender Absatz nach der Liste.')),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} satisfies LexicalRichText<LexicalNodes_8BF8C994>;

/** Leeres Root — Payload liefert das, wenn ein Editor nie gefüllt wurde. */
export const richTextEmpty = {
  root: {
    children: [],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} satisfies LexicalRichText<LexicalNodes_8BF8C994>;

/* ── Hero ──────────────────────────────────────────────────────────────── */

export const heroHome = {
  id: 'hero-home',
  blockType: 'hero',
  heading: 'Systeme, die tragen: Architektur für Web und Produkt',
  subheading:
    'Komplexe Anforderungen werden zu klaren Schnittstellen: Next.js, Payload und Postgres, betrieben mit Cache-Vertrag und Deploy-Gates.',
  backgroundImage: null,
  showStackBadge: true,
  ctaLabel: 'Projekte ansehen',
  ctaLink: '/de/projects',
  ctaLabel2: 'Kontakt aufnehmen',
  ctaLink2: '/de/contact',
} satisfies HeroBlockData;

export const heroWithoutCta = {
  id: 'hero-no-cta',
  blockType: 'hero',
  heading: 'Architektur ohne Abkürzung',
  subheading: 'Ein Hero ohne Handlungsaufforderung — die Pillen-Zeile entfällt vollständig.',
  backgroundImage: null,
  showStackBadge: true,
} satisfies HeroBlockData;

export const heroLongHeading = {
  id: 'hero-long',
  blockType: 'hero',
  heading:
    'Wenn die Anforderung größer ist als die Seite: komponierbare Architektur, gemessene Performance und ein Betrieb, der auch ohne den einen Container weiterläuft',
  subheading: null,
  backgroundImage: null,
  showStackBadge: true,
  ctaLabel: 'Weiterlesen',
  ctaLink: '/de/case-studies',
} satisfies HeroBlockData;

export const heroWithBackgroundImage = {
  id: 'hero-image',
  blockType: 'hero',
  heading: 'Hintergrundbild hinter dem Raster',
  subheading: 'Das Bild liegt bei 15 % Deckkraft unter Gitter und Radialverlauf.',
  backgroundImage: placeholderMedia,
  showStackBadge: true,
  ctaLabel: 'Projekte ansehen',
  ctaLink: '/de/projects',
} satisfies HeroBlockData;

/* ── Bento-Grid ────────────────────────────────────────────────────────── */

export const bentoGridFull = {
  id: 'bento-full',
  blockType: 'bentoGrid',
  heading: 'Vier Säulen, ein Raster',
  items: [
    {
      id: 'bento-1',
      highlight: 'Milliarden Requests pro Jahr',
      title: 'Edge & Delivery',
      description:
        'Cache-Verträge, Purge-Ketten und Failover: der Edge trägt die Seite auch dann, wenn der Ursprung fehlt.',
      ctaLabel: 'Architektur ansehen',
      ctaLink: '/de/case-studies',
      iconName: 'Globe',
      featured: true,
    },
    {
      id: 'bento-2',
      highlight: 'Typsicher bis in die Query',
      title: 'Application Layer',
      description: 'Server Components, Server Actions, keine Client-Rundreisen ohne Grund.',
      ctaLabel: null,
      ctaLink: null,
      iconName: 'Layers',
      featured: false,
    },
    {
      id: 'bento-3',
      highlight: 'Schema als Vertrag',
      title: 'Content & CMS',
      description:
        'Payload mit Migrationen, Drafts und Live Preview — Inhalte sind Daten, nicht Markup.',
      iconName: 'Database',
      featured: false,
    },
    {
      id: 'bento-4',
      highlight: 'Ein Volume, ein Vertrag',
      title: 'Daten & State',
      description: 'Postgres als einzige Wahrheit, Indizes dort, wo die Query sie braucht.',
      iconName: 'Server',
      featured: false,
    },
    {
      id: 'bento-5',
      highlight: null,
      title: 'Ohne Icon',
      description: 'Ein leerer iconName rendert bewusst KEINEN Rahmen — kein Platzhalterring.',
      iconName: '',
      featured: false,
    },
  ],
} satisfies BentoGridBlockData;

export const bentoGridSingle = {
  id: 'bento-single',
  blockType: 'bentoGrid',
  heading: null,
  items: [
    {
      id: 'bento-solo',
      highlight: 'Einzelne Säule',
      title: 'Nur eine Karte',
      description: 'Zählwerk und Singular-Chip folgen der Anzahl der Einträge.',
      iconName: 'Box',
      featured: true,
    },
  ],
} satisfies BentoGridBlockData;

export const bentoGridEmpty = {
  id: 'bento-empty',
  blockType: 'bentoGrid',
  heading: 'Leeres Raster',
  items: [],
} satisfies BentoGridBlockData;

/* ── Status ────────────────────────────────────────────────────────────── */

export const statusBlockDefault = {
  id: 'status-default',
  blockType: 'statusBlock',
  badgeLabel: 'Aktuell',
  title: 'Offen für Architektur- und Plattformthemen',
  description:
    'Schwerpunkt auf komponierbaren Systemen: Edge-Caching, Content-Modellierung und Betrieb ohne Handarbeit.',
  networkTopics: [
    { id: 'topic-1', topic: 'Modern JS-Architekturen' },
    { id: 'topic-2', topic: 'Next.js & React Server Components' },
    { id: 'topic-3', topic: 'Postgres & Datenmodellierung' },
    { id: 'topic-4', topic: 'Observability & Deploy-Gates' },
  ],
} satisfies StatusBlockData;

export const statusBlockMinimal = {
  id: 'status-minimal',
  blockType: 'statusBlock',
  badgeLabel: null,
  title: 'Status ohne Badge',
  description: 'Ohne Badge-Zeile und ohne Themenliste bleibt die Leiste einzeilig.',
  networkTopics: [],
} satisfies StatusBlockData;

export const statusBlockLong = {
  id: 'status-long',
  blockType: 'statusBlock',
  badgeLabel: 'Verfügbar',
  title: 'Lange Beschreibung, viele Themen',
  description:
    'Diese Beschreibung ist deutlich länger als im Normalfall, damit der Umbruch im zweispaltigen Themen-Raster und die Ausrichtung des Gauge-Rings geprüft werden können. Sie läuft über mehrere Zeilen und endet erst hier.',
  networkTopics: [
    { id: 'topic-long-1', topic: 'Architektur-Reviews' },
    { id: 'topic-long-2', topic: 'Performance-Budgets' },
    { id: 'topic-long-3', topic: 'Cache-Invalidierung' },
    { id: 'topic-long-4', topic: 'Migrationen ohne Downtime' },
    { id: 'topic-long-5', topic: 'Accessibility' },
    { id: 'topic-long-6', topic: 'Security-Header & CSP' },
  ],
} satisfies StatusBlockData;

/* ── Call to Action ────────────────────────────────────────────────────── */

export const callToActionPrimary = {
  id: 'cta-primary',
  blockType: 'callToAction',
  heading: 'Projekt im Kopf? Dann sortieren wir es.',
  text: 'Kurze Nachricht mit Kontext und Zielbild genügt — die Antwort kommt mit einer Einschätzung, nicht mit einer Preisliste.',
  buttonLabel: 'Projekt anfragen',
  buttonLink: '/de/contact',
  style: 'primary',
} satisfies CallToActionBlockData;

export const callToActionSecondary = {
  id: 'cta-secondary',
  blockType: 'callToAction',
  heading: 'Erst ein Gespräch, dann ein Angebot',
  text: 'Sekundärer Stil: cyanfarbene Kante, Outline-Button.',
  buttonLabel: 'Termin vorschlagen',
  buttonLink: '/de/contact',
  style: 'secondary',
} satisfies CallToActionBlockData;

export const callToActionWithoutButton = {
  id: 'cta-no-button',
  blockType: 'callToAction',
  heading: 'Ohne Handlungsaufforderung',
  text: 'Ohne buttonLabel und buttonLink entfällt die Pille vollständig — es bleibt keine leere Fläche.',
  buttonLabel: null,
  buttonLink: null,
  style: 'primary',
} satisfies CallToActionBlockData;

export const callToActionWithoutText = {
  id: 'cta-no-text',
  blockType: 'callToAction',
  heading: 'Nur Überschrift und Button',
  text: null,
  buttonLabel: 'Kontakt',
  buttonLink: '/de/contact',
  style: 'secondary',
} satisfies CallToActionBlockData;

export const callToActionLongHeading = {
  id: 'cta-long',
  blockType: 'callToAction',
  heading:
    'Eine Überschrift, die über zwei Zeilen läuft und den Button in der Zeile daneben trotzdem nicht aus dem Rahmen drückt',
  text: 'Auf schmalen Viewports stapelt sich das Layout, ab md steht der Button rechts.',
  buttonLabel: 'Projekt anfragen',
  buttonLink: '/de/contact',
  style: 'primary',
} satisfies CallToActionBlockData;

/* ── Feature-Grid ──────────────────────────────────────────────────────── */

export const featureGridDefault = {
  id: 'features-default',
  blockType: 'featureGrid',
  heading: 'Was den Unterschied macht',
  features: [
    {
      id: 'feature-1',
      title: 'Architektur vor Code',
      description: 'Schnitte, Grenzen und Datenflüsse zuerst — der Code folgt der Entscheidung.',
      iconName: 'Layers',
    },
    {
      id: 'feature-2',
      title: 'Messbare Performance',
      description: 'Budgets pro Route, Lighthouse als Gate, keine Optimierung nach Gefühl.',
      iconName: 'Gauge',
    },
    {
      id: 'feature-3',
      title: 'Betrieb ohne Handarbeit',
      description:
        'Health-Checks, Migrate-on-Connect und Cache-Purge hängen am Deploy, nicht am Kalender.',
      iconName: 'Workflow',
    },
  ],
} satisfies FeatureGridBlockData;

export const featureGridWithoutHeading = {
  id: 'features-no-heading',
  blockType: 'featureGrid',
  heading: null,
  features: [
    {
      id: 'feature-a',
      title: 'Ohne Abschnittsüberschrift',
      description: 'Das Raster startet direkt — der Kopfbereich entfällt samt Trennlinie.',
      iconName: 'Zap',
    },
    {
      id: 'feature-b',
      title: 'Zweite Karte',
      description: 'Der CardHeader wechselt den Ton pro Index (primary/secondary).',
      iconName: 'ShieldCheck',
    },
  ],
} satisfies FeatureGridBlockData;

export const featureGridEmpty = {
  id: 'features-empty',
  blockType: 'featureGrid',
  heading: 'Leeres Raster',
  features: [],
} satisfies FeatureGridBlockData;

/* ── Image + Text ──────────────────────────────────────────────────────── */

export const imageTextRight = {
  id: 'image-text-right',
  blockType: 'imageText',
  heading: 'Bild rechts, Text links',
  text: richTextBasic,
  image: placeholderMedia,
  imagePosition: 'right',
} satisfies ImageTextBlockData;

export const imageTextLeft = {
  id: 'image-text-left',
  blockType: 'imageText',
  heading: 'Bild links, Text rechts',
  text: richTextStructured,
  image: placeholderMedia,
  imagePosition: 'left',
} satisfies ImageTextBlockData;

/**
 * Relation nicht aufgelöst (depth 0): Payload liefert die nackte ID statt des
 * Media-Objekts — der Block fällt auf den Platzhalter zurück.
 */
export const imageTextWithoutImage = {
  id: 'image-text-no-image',
  blockType: 'imageText',
  heading: 'Ohne aufgelöstes Bild',
  text: richTextBasic,
  image: 12,
  imagePosition: 'right',
} satisfies ImageTextBlockData;

export const imageTextWithoutText = {
  id: 'image-text-no-text',
  blockType: 'imageText',
  heading: 'Nur Bild und Überschrift',
  text: null,
  image: placeholderMedia,
  imagePosition: 'left',
} satisfies ImageTextBlockData;

/* ── Rich Text ─────────────────────────────────────────────────────────── */

export const richTextBlockBasic = {
  id: 'rich-text-basic',
  blockType: 'richText',
  content: richTextBasic,
} satisfies RichTextBlockData;

export const richTextBlockStructured = {
  id: 'rich-text-structured',
  blockType: 'richText',
  content: richTextStructured,
} satisfies RichTextBlockData;

export const richTextBlockEmpty = {
  id: 'rich-text-empty',
  blockType: 'richText',
  content: richTextEmpty,
} satisfies RichTextBlockData;

/* ── Skillset ──────────────────────────────────────────────────────────── */

export const skillsetDefault = {
  id: 'skillset-default',
  blockType: 'skillset',
  heading: 'Werkzeugkasten mit Begründung',
  description:
    'Nicht die längste Liste gewinnt, sondern die, die im Betrieb trägt. Level sind Freitext-Badges, keine Balken.',
  ctaLabel: 'Alle Projekte ansehen',
  ctaLink: '/de/projects',
  items: [
    {
      id: 'skill-1',
      name: 'TypeScript',
      level: 'Experte',
      description: 'Strict mode, generierte Typen aus dem Schema, keine `any`-Fluchtwege.',
      iconName: 'Code',
      highlight: true,
    },
    {
      id: 'skill-2',
      name: 'Next.js',
      level: 'Experte',
      description: 'App Router, Cache Components, Server Actions statt API-Routen.',
      iconName: 'Rocket',
      highlight: false,
    },
    {
      id: 'skill-3',
      name: 'Postgres',
      level: 'Solide',
      description: 'Schema-Migrationen als Snapshot-Diff, Indizes nach Query, nicht nach Gefühl.',
      iconName: 'Database',
      highlight: false,
    },
    {
      id: 'skill-4',
      name: 'Payload CMS',
      level: 'Solide',
      description: 'Blöcke, Drafts, Live Preview, Access Control bis auf Feld-Ebene.',
      iconName: 'Layers',
      highlight: false,
    },
    {
      id: 'skill-5',
      name: 'Cloudflare',
      level: 'Solide',
      description: 'Cache-Rules, Purge-Ketten, Failover über `stale-if-error`.',
      iconName: 'Cloud',
      highlight: false,
    },
    {
      id: 'skill-6',
      name: 'Accessibility',
      level: 'Grundlage',
      description: 'Fokusführung, `aria-current`, 44-px-Targets — geprüft, nicht behauptet.',
      iconName: 'Accessibility',
      highlight: false,
    },
  ],
} satisfies SkillsetBlockData;

export const skillsetWithoutIcons = {
  id: 'skillset-no-icons',
  blockType: 'skillset',
  heading: 'Ohne Icons',
  description: 'Leerer iconName lässt den Rahmen weg, statt einen leeren Kreis zu zeigen.',
  items: [
    { id: 'skill-a', name: 'Ohne Icon', level: 'Freitext', description: null, iconName: '' },
    { id: 'skill-b', name: 'Zweiter Eintrag', level: 'ohne Icon', iconName: '' },
  ],
} satisfies SkillsetBlockData;

export const skillsetWithoutCta = {
  id: 'skillset-no-cta',
  blockType: 'skillset',
  heading: 'Ohne Block-CTA',
  description: 'Der CTA rendert nur, wenn Label UND Link gesetzt sind.',
  ctaLabel: 'Nur ein Label, kein Link',
  ctaLink: null,
  items: [
    {
      id: 'skill-solo',
      name: 'Einzelner Skill',
      level: 'Solide',
      description: 'Die Karte bleibt eine Karte, unabhängig von der Anzahl.',
      iconName: 'Terminal',
      highlight: true,
    },
  ],
} satisfies SkillsetBlockData;

export const skillsetEmpty = {
  id: 'skillset-empty',
  blockType: 'skillset',
  heading: 'Leeres Skillset',
  description: null,
  ctaLabel: null,
  ctaLink: null,
  items: [],
} satisfies SkillsetBlockData;
