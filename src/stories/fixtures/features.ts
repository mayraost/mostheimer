import type { Page } from '@/payload-types';
import type { PreviewCopy } from '@/components/preview/PreviewBlocks';
import type { PersonIdentity } from '@/components/StructuredData';
import type { ProjectDetailCopy } from '@/components/projects/ProjectDetail';
import type { ProjectView } from '@/components/projects/projectView';
import type { ProjectShowcaseItem, ProjectShowcaseView } from '@/components/projects/showcaseView';
import { getTranslation } from '@/lib/translations';
import { mockCopy, mockTranslations } from '@/stories/mockTranslations';
import {
  bentoGridFull,
  callToActionPrimary,
  heroHome,
  richTextStructured,
  statusBlockDefault,
} from './blocksA';

/**
 * Fixtures für die Feature-/Projekt-Komponenten (Consent, Settings, Projects,
 * Live-Preview, JSON-LD, OG-Card).
 *
 * Alle Objekte sind mit `satisfies` gegen den echten Typ geprüft: die Stories
 * zeigen damit die Form, die die Komponenten im Betrieb bekommen — nicht
 * „ungefähr so". URLs sind bewusst Beispielwerte; `/media/placeholder.png`
 * existiert im Storybook-Kontext nicht (next/image rendert trotzdem ein `<img>`,
 * es gibt also kein Crash, nur ein leeres Bild).
 */

type PageBlock = NonNullable<Page['layout']>[number];

/** Ein einzelner `projectShowcase`-Block (Listing-Ansicht). */
type ProjectShowcaseBlockData = Extract<PageBlock, { blockType: 'projectShowcase' }>;

/* ── Projects: Detail ──────────────────────────────────────────────────── */

/** Vollständiges Projekt: Cover, Stack, Tags, alle vier Sektionen, drei Links. */
export const projectFull = {
  id: 42,
  slug: 'internal-dashboard',
  title: 'Internal Dashboard',
  teaser:
    'Ein Betriebs-Cockpit für Deployments, CVE-Audits und Cache-Zustand — gebaut als komponierbares Next.js-System mit Payload als Inhaltsvertrag.',
  kind: 'product',
  path: '/de/projects/internal-dashboard',
  listingPath: '/de/projects',
  hero: {
    url: '/media/placeholder.png',
    width: 1600,
    height: 900,
    alt: 'Dashboard-Cover mit Deployment-Liste',
  },
  cover: {
    url: '/media/placeholder.png',
    width: 1200,
    height: 675,
    alt: 'Dashboard-Kachel',
  },
  stack: ['TypeScript', 'Next.js 16', 'Payload 4', 'Postgres 17', 'Cloudflare'],
  tags: [
    { slug: 'developer-tooling', label: 'Developer Tooling' },
    { slug: 'observability', label: 'Observability' },
  ],
  liveUrl: 'https://dashboard.mosthi.de',
  githubUrl: 'https://github.com/mayraost/internal-dashboard',
  storybookUrl: 'https://mostheimer.de/storybook',
  context: [
    'Vier Repositories, acht Apps und ein geteilter Coolify-Host: der Zustand des Systems lag vorher in Logs, Tickets und Zuruf.',
    'Gebraucht war eine Oberfläche, die Deployments, offene Sicherheitsfindings und den Edge-Cache-Zustand in einer Ansicht zusammenführt — ohne dafür ein zweites Backend zu bauen.',
  ],
  learnings: [
    'Ein Dashboard ist ein Cache-Problem: die Seite darf nicht bei jedem Reload sechs APIs abfragen.',
    'Server Actions decken die Schreibpfade ab; API-Routen bleiben den externen Aufrufern (Cron, CI) vorbehalten.',
  ],
  outcome: [
    'Deployments, Audit-Findings und Cache-Purges laufen heute über eine Ansicht; der wöchentliche Statusbericht entsteht aus denselben Daten.',
  ],
  approach: richTextStructured,
  updatedAt: '2026-11-13T09:30:00.000Z',
} satisfies ProjectView;

/** Gleiches Projekt, aber ohne externen Link — die Link-Zeile entfällt komplett. */
export const projectNoLinks = {
  ...projectFull,
  liveUrl: null,
  githubUrl: null,
  storybookUrl: null,
} satisfies ProjectView;

/** Minimalfall: nur `context`, kein Cover, keine Links, keine Tags. */
export const projectMinimal = {
  id: null,
  slug: 'halloween-counter',
  title: 'Halloween Counter',
  teaser: '',
  kind: 'experiment',
  path: '/de/projects/halloween-counter',
  listingPath: '/de/projects',
  hero: null,
  cover: null,
  stack: [],
  tags: [],
  liveUrl: null,
  githubUrl: null,
  storybookUrl: null,
  context: ['Ein einzelner Satz Kontext — mehr ist für dieses Projekt nicht hinterlegt.'],
  learnings: [],
  outcome: [],
  approach: null,
  updatedAt: null,
} satisfies ProjectView;

/** Kein Cover und keine Sektion: der Renderer zeigt `noCover` + `empty`. */
export const projectEmpty = {
  ...projectMinimal,
  slug: 'placeholder-404',
  title: 'Placeholder 404',
  path: '/de/projects/placeholder-404',
  context: [],
} satisfies ProjectView;

/** Englische Detail-Copy (die CMS-Gruppe `routes.project.*` je Locale). */
export const projectDetailCopyEn: ProjectDetailCopy = {
  eyebrow: 'Project',
  contextLabel: 'Context',
  approachLabel: 'Approach',
  learningsLabel: 'Learnings',
  outcomeLabel: 'Outcome',
  stackLabel: 'Stack',
  tagsLabel: 'Tags',
  liveCta: 'View live',
  githubCta: 'View code',
  storybookCta: 'Component docs',
  backToList: 'Back to overview',
  noCover: 'No cover',
  empty: 'No text has been added to this project yet.',
  newTabHint: 'opens in a new tab',
  kindLabels: { experiment: 'Experiment', tool: 'Tool', product: 'Product' },
};

/* ── Projects: Listing-View (Live-Preview) ─────────────────────────────── */

/** Tile-Shape eines Detail-Views (das Listing kennt keinen Storybook-Link). */
function toListingItem(project: ProjectView, featured: boolean): ProjectShowcaseItem {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    teaser: project.teaser,
    kind: project.kind,
    href: project.path,
    featured,
    cover: project.cover,
    stack: project.stack,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
  };
}

export const previewProjectListing: ProjectShowcaseView = {
  items: [toListingItem(projectFull, true), toListingItem(projectMinimal, false)],
  totalDocs: 2,
  totalPages: 1,
  currentPage: 1,
  tags: [
    { slug: 'developer-tooling', label: 'Developer Tooling', count: 1 },
    { slug: 'observability', label: 'Observability', count: 1 },
  ],
  activeTag: null,
};

/* ── Live-Preview: Copy + Seiten ───────────────────────────────────────── */

/**
 * Alle Copy-Gruppen, die der Preview-Dispatcher braucht. `mockCopy` deckt die
 * Block-Bundles ab; `status` und `imageText` liegen nicht als Bundle vor und
 * kommen deshalb über den typisierten Reader aus der `COPY_KEYS`-Registry
 * (derselbe Seed, den die CMS-Migration schreibt).
 */
export const previewCopy: PreviewCopy = {
  ...mockCopy,
  status: { gaugeLabel: getTranslation(mockTranslations, 'blocks.status.gaugeLabel') },
  imageText: {
    eyebrow: getTranslation(mockTranslations, 'blocks.imageText.eyebrow'),
    imagePlaceholder: getTranslation(mockTranslations, 'blocks.imageText.imagePlaceholder'),
  },
};

/** Home-Draft mit den Blöcken, die im Admin-iframe live gemerged werden. */
export const previewPageHome = {
  id: 101,
  title: 'Home',
  slug: 'home',
  layout: [heroHome, statusBlockDefault, bentoGridFull, callToActionPrimary],
  updatedAt: '2026-11-13T09:30:00.000Z',
  createdAt: '2026-10-01T08:00:00.000Z',
  _status: 'published',
} satisfies Page;

/** Seite ohne Blöcke: ein frischer Draft, in dem noch nichts angelegt wurde. */
export const previewPageEmpty = {
  id: 102,
  title: 'Neue Seite',
  slug: 'neue-seite',
  layout: null,
  updatedAt: '2026-11-13T09:30:00.000Z',
  createdAt: '2026-11-13T09:30:00.000Z',
  _status: 'draft',
} satisfies Page;

/** Listing-Block: braucht die Projektdaten als zusätzliche Prop. */
export const projectShowcaseBlock = {
  id: 'showcase-preview',
  blockType: 'projectShowcase',
  eyebrow: 'Projekte',
  heading: 'Projekte aus dem Betrieb',
  intro: 'Auszug aus dem laufenden Betrieb: Architektur, Gates und die Entscheidungen dahinter.',
  emptyState: null,
  pageSize: 6,
  showFilter: true,
  featureFirst: true,
} satisfies ProjectShowcaseBlockData;

/** Listing-Seite: der `projectShowcase`-Block braucht die Daten als Prop. */
export const previewPageProjects = {
  id: 103,
  title: 'Projekte',
  slug: 'projects',
  layout: [projectShowcaseBlock],
  updatedAt: '2026-11-13T09:30:00.000Z',
  createdAt: '2026-10-01T08:00:00.000Z',
  _status: 'published',
} satisfies Page;

/* ── JSON-LD: Identität, CV, Case Studies ──────────────────────────────── */

/**
 * Identitäts-Fixture (`site-settings.identity`). Bewusst erkennbar generische
 * Adressdaten — die echten Werte stehen im CMS, nicht in einer Story.
 */
export const personIdentity: PersonIdentity = {
  siteName: 'Mayra Ostheimer',
  personName: 'Mayra Ostheimer',
  email: 'hallo@mostheimer.de',
  telephone: '+49 151 0000000',
  streetAddress: 'Musterweg 1',
  postalCode: '12345',
  addressLocality: 'Musterstadt',
  addressCountry: 'DE',
  sameAs: ['https://github.com/mayraost', 'https://www.linkedin.com/in/mayraostheimer'],
  knowsLanguage: ['de', 'en'],
  jobTitle: 'Senior Fullstack Developer',
  description:
    'Web & Application Architect: komponierbare Systeme mit Next.js, Payload und Postgres.',
  worksFor: 'valantic DXA',
  contactType: 'professional',
  localePath: '/de',
};

/** Karriere-Seite: die Timeline ist die Quelle für `Person.hasOccupation`. */
export const careerLayout = [
  {
    id: 'career-timeline',
    blockType: 'timeline',
    heading: 'Stationen',
    entries: [
      {
        id: 'career-1',
        period: 'Seit 09/2024 – Heute',
        company: 'valantic DXA',
        role: 'Senior Fullstack Developer',
      },
      {
        id: 'career-2',
        period: '2019 – 2024',
        company: 'BORA',
        role: 'Frontend Architect',
      },
      {
        id: 'career-3',
        period: '2014 – 2019',
        company: 'Allianz',
        role: 'Software Engineer',
      },
      {
        id: 'career-4',
        period: 'Freelance',
        company: 'Selbstständig',
        role: 'Developer',
      },
    ],
  },
] satisfies PageBlock[];

/** Case-Studies-Seite: `client` wird `name`, `context` die Beschreibung. */
export const caseStudyLayout = [
  {
    id: 'case-1',
    blockType: 'caseStudy',
    client: 'BORA',
    period: '2019 – 2024',
    role: 'Frontend Architect',
    context:
      'Produktkonfigurator mit hoher Lastspitze: Inhalte, Preise und Varianten mussten ohne Neubau konsistent bleiben.',
    link: 'https://www.bora.com',
    linkLabel: 'bora.com',
  },
  {
    id: 'case-2',
    blockType: 'caseStudy',
    client: 'Allianz',
    period: '2014 – 2019',
    role: 'Software Engineer',
    context: 'Beratungsstrecke mit mehreren Schritten und klaren Abbruchpfaden.',
  },
] satisfies PageBlock[];
