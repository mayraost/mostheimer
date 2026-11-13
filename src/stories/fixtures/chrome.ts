import type { CommandItem } from '@/components/ui/CommandPalette';
import type { ErrorScreenCopy } from '@/components/layout/ErrorScreen';
import type { Translation } from '@/payload-types';

/**
 * Fixtures für die Chrome-/Layout-Stories (Header, MobileNavPortal, Footer,
 * SiteChrome, StatusScreen, ErrorScreen).
 *
 * RULE: Was in der App aus dem CMS kommt, kommt in der Story aus einer Fixture —
 * niemals als Literal in der Story-Datei. `brandName` ist Daten (`site-settings`),
 * die Navigation ist Content (`navigation`), die Chrome-Copy ist das
 * `chrome.*`-Set aus `translations` und die Fehler-Copy ist `routes.error.*`.
 *
 * Die Registry-Seeds in `src/lib/translations.ts` sind die englischen Fallbacks;
 * die deutschen Werte existieren nur im CMS und stehen deshalb hier.
 */

/** Navigations-Eintrag, wie ihn `navigation.headerLinks`/`footerLinks` liefert. */
export type ChromeNavLink = {
  label: string;
  link: string;
  newTab?: boolean | null;
  id?: string | null;
};

/**
 * Shell-Copy des Headers (`chrome.*`). Bewusst Props statt Context: der Header
 * ist eine Client-Komponente und kann den `'use cache'`-Read nicht awaiten.
 */
export type ChromeCopy = {
  homeAria: string;
  /** Name der ZIEL-Sprache (der Link schaltet um). */
  languageName: string;
  /** Enthält den Platzhalter `{language}`. */
  languageSwitchAria: string;
  closeMenu: string;
  drawerStatus: string;
  currentPage: string;
};

export const chromeCopyDe: ChromeCopy = {
  homeAria: 'Startseite',
  languageName: 'Englisch (EN)',
  languageSwitchAria: 'Sprache wechseln zu {language}',
  closeMenu: 'Menü schließen',
  drawerStatus: 'Kiebitzreihe · DE',
  currentPage: 'Aktuelle Seite',
};

export const chromeCopyEn: ChromeCopy = {
  homeAria: 'home',
  languageName: 'Deutsch (DE)',
  languageSwitchAria: 'Switch language to {language}',
  closeMenu: 'Close menu',
  drawerStatus: 'Kiebitzreihe · DE',
  currentPage: 'Current page',
};

/** Brand aus `site-settings` (Anzeigename + Claim unter dem Namen). */
export const brandFixture = {
  name: 'Mayra Ostheimer',
  claim: 'Web & Application Architect',
} as const;

/** Navigation (DE) — dieselben Ziele wie im `navigation`-Global. */
export const navFixture: ChromeNavLink[] = [
  { id: 'nav-home', label: 'Startseite', link: '/de' },
  { id: 'nav-leadership', label: 'Leadership', link: '/de/leadership' },
  { id: 'nav-projects', label: 'Projekte', link: '/de/projects' },
  { id: 'nav-contact', label: 'Kontakt', link: '/de/contact' },
];

/** Navigation (EN) — gleiche Slugs, englische Labels. */
export const navFixtureEn: ChromeNavLink[] = [
  { id: 'nav-home', label: 'Home', link: '/en' },
  { id: 'nav-leadership', label: 'Leadership', link: '/en/leadership' },
  { id: 'nav-projects', label: 'Projects', link: '/en/projects' },
  { id: 'nav-contact', label: 'Contact', link: '/en/contact' },
];

/**
 * Ein Eintrag mit `javascript:`-Schema — beide Renderer filtern ihn über
 * `safeHrefOrNull()` still heraus (kein kaputtes `href`, kein XSS).
 */
export const unsafeNavLink: ChromeNavLink = {
  id: 'nav-unsafe',
  label: 'Unsafe (wird gefiltert)',
  link: 'javascript:alert(1)',
};

/** Command-Palette-Einträge (`src/components/ui/commandItems.ts`-Form). */
export const commandItemsFixture: CommandItem[] = [
  { id: 'home', label: 'Startseite', href: '/', group: 'pages', keywords: ['home', 'start'] },
  {
    id: 'leadership',
    label: 'Leadership',
    href: '/leadership',
    group: 'pages',
    keywords: ['führung', 'team'],
  },
  {
    id: 'projects',
    label: 'Projekte',
    href: '/projects',
    group: 'pages',
    keywords: ['projects', 'arbeiten'],
  },
  { id: 'contact', label: 'Kontakt', href: '/contact', group: 'pages', keywords: ['contact'] },
  {
    id: 'architecture',
    label: 'Architektur',
    href: '#architektur',
    group: 'sections',
    keywords: ['architecture', 'aufbau'],
  },
];

/** Cookie-Einstellungen (EN) — Footer-Link-Label + Consent-Texte. */
export const cookiesCopyEn: NonNullable<Translation['cookies']> = {
  eyebrow: 'Consent',
  title: 'Cookie settings',
  description:
    'We only use necessary cookies unless you explicitly allow more. You can change this at any time.',
  privacyLabel: 'Privacy',
  privacyLink: '/en/privacy',
  necessaryLabel: 'Necessary',
  necessaryDescription: 'Session, language and consent state. Always on.',
  necessaryBadge: 'Required',
  analyticsLabel: 'Analytics',
  analyticsDescription: 'Anonymous reach measurement through the tag manager.',
  marketingLabel: 'Marketing',
  marketingDescription: 'Conversion measurement for campaigns.',
  rejectAll: 'Only necessary',
  saveSelection: 'Save selection',
  acceptAll: 'Accept all',
  settingsLink: 'Cookie settings',
};

/** Copyright-Zeile (EN) — Pendant zu `translations.footer`. */
export const footerCopyEn: NonNullable<Translation['footer']> = {
  rightsReserved: 'All rights reserved.',
  eyebrow: '// site',
};

/** 404-Karte (Copy des `not-found`-Globals). */
export const notFoundScreen = {
  code: 'HTTP 404 · Not Found',
  title: 'Diese Seite gibt es nicht',
  message:
    'Der Link ist veraltet oder die Seite wurde verschoben. Die Navigation führt zurück auf den aktuellen Stand.',
  primary: { label: 'Zur Startseite', href: '/de' },
  secondary: { label: 'Kontakt aufnehmen', href: '/de/contact' },
};

/** Fehlerkarte (Copy aus `routes.error.*`, DE). */
export const errorScreenCopyDe: ErrorScreenCopy = {
  code: 'HTTP 500 · Fehler',
  title: 'Da ist etwas schiefgelaufen',
  message: 'Der Fehler wurde protokolliert. Ein erneuter Versuch lädt die Seite neu.',
  home: 'Zur Startseite',
  retry: 'Erneut versuchen',
};

/** Fehlerkarte (Copy aus `routes.error.*`, EN). */
export const errorScreenCopyEn: ErrorScreenCopy = {
  code: 'HTTP 500 · Error',
  title: 'Something went wrong',
  message: 'The error has been logged. Retrying reloads the page.',
  home: 'Back to home',
  retry: 'Try again',
};
