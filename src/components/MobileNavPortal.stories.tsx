import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Moon } from 'lucide-react';
import { fn } from 'storybook/test';

import { MobileNavPortal } from './MobileNavPortal';
import {
  chromeCopyDe,
  chromeCopyEn,
  navFixture,
  navFixtureEn,
  unsafeNavLink,
} from '@/stories/fixtures/chrome';

/**
 * Burger-Drawer als Portal-Dialog.
 *
 * Die Komponente rendert `createPortal(…, document.body)` — sie erscheint
 * deshalb NICHT im Story-Rahmen, sondern am rechten Rand des Preview-Iframes.
 * Genau das ist der Punkt: der Trigger lebt im `sticky`-Header, und ein
 * `fixed`-Kind würde `inset-0` gegen das 64px-Band auflösen statt gegen den
 * Viewport.
 *
 * Der offene/geschlossene Zustand kommt aus der echten `open`-Prop (der
 * Header hält den State). `onClose` ist hier eine Mock-Funktion — der Klick
 * auf Backdrop, Schließen-Button oder einen Link landet im Actions-Panel,
 * statt den Drawer zu schließen.
 */
const meta = {
  title: 'Chrome/MobileNavPortal',
  component: MobileNavPortal,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de' } },
    docs: {
      description: {
        component:
          'Navigations-Drawer unter `lg`: Fokus-Falle, Scroll-Lock über `position: fixed` + negativem `top`, `aria-current="page"` für die aktive Seite und Theme-/Settings-Zeilen am Ende (dieselben Ziele wie die Desktop-Leiste, nur mit Text-Label).',
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    onThemeToggle: fn(),
    navLinks: navFixture,
    title: 'Menü',
    closeLabel: chromeCopyDe.closeMenu,
    currentPageLabel: chromeCopyDe.currentPage,
    statusLabel: chromeCopyDe.drawerStatus,
    settingsHref: '/de/settings',
    settingsLabel: 'Einstellungen öffnen',
    themeLabel: 'Theme: dark',
    themeIcon: <Moon className="h-4 w-4 text-primary" />,
  },
  argTypes: {
    open: { control: 'boolean' },
    navLinks: { control: 'object' },
    title: { control: 'text' },
    closeLabel: { control: 'text' },
    currentPageLabel: { control: 'text' },
    statusLabel: { control: 'text' },
    settingsHref: { control: 'text' },
    settingsLabel: { control: 'text' },
    themeLabel: { control: 'text' },
    themeIcon: { control: false },
    onClose: { control: false },
    onThemeToggle: { control: false },
  },
} satisfies Meta<typeof MobileNavPortal>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Offen, Desktop-Breite (dort würde der Header den Drawer nie öffnen). */
export const Open: Story = {};

/** Geschlossen: der Dialog steht unsichtbar im DOM, alle Fokuszielen sind `-1`. */
export const Closed: Story = {
  args: { open: false },
};

/** Aktive Seite über `usePathname()` — Emerald-Rail, `// now` und `aria-current`. */
export const ActiveLink: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/de/projects' } },
  },
};

/** Ohne Navigations-Content bleiben nur Theme-/Settings-Zeilen und der Status. */
export const EmptyNav: Story = {
  args: { navLinks: [] },
};

/** Ein `javascript:`-Link wird von `safeHrefOrNull()` verworfen statt gerendert. */
export const UnsafeLink: Story = {
  args: { navLinks: [...navFixture, unsafeNavLink] },
};

/** Englische Copy — der Drawer bekommt alle Labels als Props, nichts ist hartkodiert. */
export const En: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/en' } },
  },
  args: {
    navLinks: navFixtureEn,
    title: 'Menu',
    closeLabel: chromeCopyEn.closeMenu,
    currentPageLabel: chromeCopyEn.currentPage,
    statusLabel: chromeCopyEn.drawerStatus,
    settingsHref: '/en/settings',
    settingsLabel: 'Open settings',
    themeLabel: 'Theme: dark',
  },
};

/** Echte Mobile-Breite: 85 % Breite, max. `sm` — hier entscheidet sich die Lesbarkeit. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2' } },
};
