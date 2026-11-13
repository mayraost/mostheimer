// MUSS der erste Import bleiben: `SiteChrome` → `@/envConfig` liest
// `process.env` beim Modul-Import (Shim: src/stories/fixtures/envShim.ts).
import '@/stories/fixtures/envShim';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Suspense } from 'react';

import { SiteChrome } from './SiteChrome';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AsyncComponent } from '@/stories/fixtures/async';
import {
  brandFixture,
  chromeCopyDe,
  chromeCopyEn,
  commandItemsFixture,
  cookiesCopyEn,
  footerCopyEn,
  navFixture,
  navFixtureEn,
} from '@/stories/fixtures/chrome';
import { mockTranslations } from '@/stories/mockTranslations';

const footerArgsDe = {
  brandName: brandFixture.name,
  brandClaim: brandFixture.claim,
  navLinks: navFixture,
  navAria: 'Footer',
  credits: 'Next.js 16 / Payload 4 / Postgres',
  cookieSettingsLabel: mockTranslations.cookies,
  rightsReserved: mockTranslations.footer,
} as const;

const footerArgsEn = {
  brandName: brandFixture.name,
  brandClaim: brandFixture.claim,
  navLinks: navFixtureEn,
  navAria: 'Footer',
  credits: 'Next.js 16 / Payload 4 / Postgres',
  cookieSettingsLabel: cookiesCopyEn,
  rightsReserved: footerCopyEn,
} as const;

const headerDe = (
  <Header
    locale="de"
    navLinks={navFixture}
    commandItems={commandItemsFixture}
    copy={chromeCopyDe}
    brandName={brandFixture.name}
  />
);

const headerEn = (
  <Header
    locale="en"
    navLinks={navFixtureEn}
    commandItems={commandItemsFixture}
    copy={chromeCopyEn}
    brandName={brandFixture.name}
  />
);

/** Footer ist async — er kommt als aufgelöstes Promise in die Chrome. */
const footerDe = (
  <Suspense fallback={<div className="h-28" />}>
    <AsyncComponent create={() => Footer(footerArgsDe)} />
  </Suspense>
);

const footerEn = (
  <Suspense fallback={<div className="h-28" />}>
    <AsyncComponent create={() => Footer(footerArgsEn)} />
  </Suspense>
);

/**
 * Dokument-Rahmen der Seite: Header + `<main id="main-content">` + Footer +
 * Consent-Mount.
 *
 * Die Komponente ist absichtlich nur Markup — Payload-Reads und Provider
 * bleiben beim Aufrufer (`[locale]/layout.tsx` bzw. die 404-Boundary). Damit
 * können beide Dokument-Pfade nicht auseinanderdriften (Skip-Link-Ziel,
 * Sticky-Footer, Consent-Mountpunkt).
 *
 * Die Story setzt die echte Chrome zusammen: `Header` (Client) plus `Footer`
 * (async Server Component, über `use()` aufgelöst). Die Spalte ist
 * `min-h-page` (mind. 100dvh/1400px), damit der Footer unten sitzt — deshalb
 * ist die Story absichtlich hoch.
 */
const meta = {
  title: 'Layout/SiteChrome',
  component: SiteChrome,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    // Der Header enthält die Command-Palette (`useRouter()`); ohne App-Router-
    // Context wirft Next. `navigation.pathname` speist zusätzlich den
    // Sprachwechsel-Link.
    nextjs: { appDirectory: true, navigation: { pathname: '/de' } },
    docs: {
      description: {
        component:
          'Gemeinsamer Seitenrahmen für `[locale]/layout.tsx` und die Route-Group-404: Skip-Link-Ziel, sticky Footer, Consent-Mount. `showConsent={false}` ist der Pfad ohne CMS/Translations-Context (statische 404-Chrome).',
      },
    },
  },
  args: {
    header: headerDe,
    footer: footerDe,
    showConsent: false,
    children: (
      <section className="mx-auto w-full max-w-6xl px-0 py-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Seiteninhalt
        </h1>
        <p className="mt-3 max-w-prose text-base text-muted-foreground">
          Der Inhalt zwischen Header und Footer. In der App rendert hier die Page — in der Story
          steht ein Platzhalter, damit die drei Zonen des Rahmens sichtbar bleiben.
        </p>
      </section>
    ),
  },
  argTypes: {
    header: { control: false },
    footer: { control: false },
    children: { control: false },
    showConsent: { control: 'boolean' },
  },
} satisfies Meta<typeof SiteChrome>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Ohne Consent-Banner (der 404-Pfad ohne Translations-Context). */
export const Default: Story = {};

/**
 * Mit `CookieConsent`: der Banner ist `position: fixed` und erscheint nach dem
 * Mount (keine Entscheidung gespeichert) — deshalb unten am Story-Rahmen.
 */
export const WithConsentBanner: Story = {
  args: { showConsent: true },
};

/** Englische Chrome: Header, Navigation und Footer-Copy drehen mit. */
export const En: Story = {
  args: {
    header: headerEn,
    footer: footerEn,
  },
};

/** Ohne Inhalt: nur die beiden Ränder — zeigt Skip-Link-Ziel und Footer-Anbindung. */
export const EmptyContent: Story = {
  args: { children: null },
};
