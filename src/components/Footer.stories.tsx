import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Suspense } from 'react';
import { headers } from '@storybook/nextjs-vite/headers.mock';

import { Footer } from './Footer';
import { AsyncComponent } from '@/stories/fixtures/async';
import {
  brandFixture,
  cookiesCopyEn,
  footerCopyEn,
  navFixture,
  navFixtureEn,
  unsafeNavLink,
} from '@/stories/fixtures/chrome';
import { mockTranslations } from '@/stories/mockTranslations';

/**
 * Site-Footer — eine ASYNC Server Component.
 *
 * Sie ruft `getPathname()` (→ `next/headers`), um den aktiven Link zu setzen.
 * In der Story wird sie deshalb nicht als Element gerendert, sondern
 * AUFGERUFEN (`Footer(args)` liefert ein Promise) und über
 * {@link AsyncComponent} mit `use()` aufgelöst. Das `key` remountet bei
 * Arg-Änderungen, damit das Promise neu entsteht.
 *
 * `next/headers` ist im Framework auf `headers.mock` gemappt; die
 * `ActiveLink`-Story setzt dort `x-pathname` — genau den Header, den der Proxy
 * in der App setzt. Ohne Wert ist `pathname === null` und nichts ist aktiv.
 */
const meta = {
  title: 'Chrome/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Ruhige Abschlussfläche: Brand + Claim, Footer-Navigation mit Cookie-Einstellungen und Copyright/Tech-Zeile. Alle sichtbaren Wörter kommen aus `translations`/`site-settings`; fehlt ein Wert, verschwindet das Segment, statt auf eine andere Sprache zurückzufallen.',
      },
    },
  },
  args: {
    brandName: brandFixture.name,
    brandClaim: brandFixture.claim,
    navLinks: navFixture,
    navAria: 'Footer',
    credits: 'Next.js 16 / Payload 4 / Postgres',
    cookieSettingsLabel: mockTranslations.cookies,
    rightsReserved: mockTranslations.footer,
  },
  argTypes: {
    brandName: { control: 'text' },
    brandClaim: { control: 'text' },
    navLinks: { control: 'object' },
    navAria: { control: 'text' },
    credits: { control: 'text' },
    cookieSettingsLabel: { control: 'object' },
    rightsReserved: { control: 'object' },
  },
  render: (args) => (
    <Suspense
      fallback={<p className="mono-label py-8 text-muted-foreground">Footer wird geladen …</p>}
    >
      <AsyncComponent key={JSON.stringify(args)} create={() => Footer(args)} />
    </Suspense>
  ),
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vollständiger Footer, keine aktive Seite (`x-pathname` fehlt). */
export const Default: Story = {};

/** Aktive Seite: `x-pathname` wie vom Proxy gesetzt → Emerald-Text + Punkt. */
export const ActiveLink: Story = {
  beforeEach: () => {
    headers().set('x-pathname', '/de/projects');
  },
  afterEach: () => {
    headers.mockRestore();
  },
};

/** Ohne Navigation (`navLinks` leer) entfällt der komplette `<nav>`-Block. */
export const EmptyNav: Story = {
  args: { navLinks: [] },
};

/** Ein `javascript:`-Link wird von `safeHrefOrNull()` verworfen statt gerendert. */
export const UnsafeLink: Story = {
  args: { navLinks: [...navFixture, unsafeNavLink] },
};

/** Englische Locale: Navigation und Copy kommen aus dem EN-Datensatz. */
export const En: Story = {
  args: {
    navLinks: navFixtureEn,
    navAria: 'Footer',
    rightsReserved: footerCopyEn,
    cookieSettingsLabel: cookiesCopyEn,
    credits: 'Next.js 16 / Payload 4 / Postgres',
  },
};

/**
 * Leere Globals: die Copyright-Zeile degradiert zu `© <Jahr> <Brand>`, Claim,
 * Credits und der Cookie-Link verschwinden — kein erfundenes Ersatz-Label.
 */
export const MinimalCopy: Story = {
  args: {
    brandClaim: undefined,
    credits: undefined,
    cookieSettingsLabel: undefined,
    rightsReserved: undefined,
  },
};
