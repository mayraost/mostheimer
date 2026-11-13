import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Header } from './Header';
import {
  brandFixture,
  chromeCopyDe,
  chromeCopyEn,
  commandItemsFixture,
  navFixture,
  navFixtureEn,
} from '@/stories/fixtures/chrome';

/**
 * Site-Header (Client-Komponente): Lockup, Command-Palette, Sprachwechsel,
 * Theme/Settings (nur ab `lg`) und Burger.
 *
 * Drei Dinge, die die Story-Umgebung liefern muss:
 *
 * 1. `nextjs.appDirectory: true` — `CommandPalette` ruft `useRouter()`, das
 *    ohne App-Router-Context wirft. Der Router-Decorator des Frameworks baut
 *    ihn aus `parameters.nextjs`.
 * 2. `parameters.nextjs.navigation.pathname` — `usePathname()` speist den
 *    Sprachwechsel-Link und (im Drawer) den aktiven Eintrag.
 * 3. `TranslationsProvider` — global im Preview (`withTranslations`), weil
 *    Theme-/Menü-Labels aus `translations.common` kommen.
 *
 * Der Drawer hängt in einem Portal an `<body>` (sticky-Header + `fixed` wäre
 * sonst am 64px-Band geklippt) — er erscheint deshalb NEBEN dem Story-Rahmen,
 * nicht darin. Die Zustände stehen in `Chrome/MobileNavPortal`.
 */
const meta = {
  title: 'Chrome/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de' } },
    docs: {
      description: {
        component:
          'Sticky Site-Header mit Brand-Lockup, ⌘K-Palette, Sprachwechsel und Burger. Theme und Settings liegen ab `lg` inline in der Leiste, darunter im Burger-Drawer (`MobileNavPortal`). Der Header komprimiert ab 24px Scroll (`data-header-compact`) — das ist Scroll-Verhalten, kein Story-Arg.',
      },
    },
  },
  args: {
    locale: 'de',
    navLinks: navFixture,
    commandItems: commandItemsFixture,
    copy: chromeCopyDe,
    brandName: brandFixture.name,
  },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    brandName: { control: 'text' },
    navLinks: { control: 'object' },
    commandItems: { control: 'object' },
    copy: { control: 'object' },
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Desktop-Breite, deutsch, keine aktive Seite. */
export const Default: Story = {};

/** Aktive Seite: `isActiveNavLink` markiert Leadership im Drawer (`aria-current`). */
export const ActiveLink: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/de/leadership' } },
  },
};

/** Unter `lg`: Theme und Settings wandern in den Drawer, die Leiste bleibt einzeilig. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2' } },
};

/** Kein `navigation`-Content: die Leiste bleibt vollständig, nur der Drawer ist leer. */
export const EmptyNav: Story = {
  args: { navLinks: [] },
};

/** Englische Locale: Labels, Copy und Sprachwechsel-Ziel drehen mit. */
export const En: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/en' } },
  },
  args: {
    locale: 'en',
    navLinks: navFixtureEn,
    copy: chromeCopyEn,
  },
};

/**
 * `html.large-font` (Einstellungsseite, 18px Wurzelgröße).
 *
 * Die Klasse liegt bewusst auf `<html>`; ein Wrapper-`div` würde die
 * `html.large-font`-Regel nicht treffen. `play` statt `beforeEach`, weil der
 * `SettingsProvider` beim Mount selbst über `fontSize` entscheidet und eine
 * vor dem Mount gesetzte Klasse wieder entfernen würde.
 */
export const LargeFont: Story = {
  play: () => {
    document.documentElement.classList.add('large-font');
  },
  afterEach: () => {
    document.documentElement.classList.remove('large-font');
  },
};
