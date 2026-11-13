import '@/stories/fixtures/envShim';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import {
  buildCareerJsonLd,
  buildCaseStudiesJsonLd,
  buildPerson,
  buildProfilePageJsonLd,
  buildProjectJsonLd,
  buildProjectListingJsonLd,
  buildSiteJsonLd,
  buildWebPageJsonLd,
  jsonLdLanguageTag,
  parsePeriod,
  type JsonLdObject,
  type PersonIdentity,
} from './StructuredData';
import {
  careerLayout,
  caseStudyLayout,
  personIdentity,
  projectFull,
  projectMinimal,
} from '@/stories/fixtures/features';

/**
 * JSON-LD-Builder (AEO/Discovery-Schicht).
 *
 * `StructuredData.tsx` exportiert KEINE UI-Komponente (bis auf den
 * `<script>`-Wrapper `JsonLdScript`). Dokumentiert werden hier die reinen
 * Builder: jede Story zeigt das erzeugte Objekt als JSON — dieselbe Form, die
 * `JsonLdScript` in den `<head>` schreibt.
 *
 * Fakten kommen aus `site-settings.identity` (Adresse, Profile, Sprachen) und
 * aus den CMS-Blöcken (Timeline → `hasOccupation`, Case Studies → `ItemList`).
 * Leere Felder werden ENTFERNT statt als `""` emittiert — schema.org weist
 * leere Werte zurück.
 *
 * Der Env-Shim-Import oben ist Pflicht: `envConfig` validiert beim Import und
 * wirft im Browser ohne `PAYLOAD_SECRET`/`DATABASE_URL`.
 */

function JsonView({ data }: { data: JsonLdObject }) {
  return (
    <pre className="overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const DESCRIPTION =
  'Web & Application Architect: komponierbare Systeme mit Next.js, Payload und Postgres.';
const DATE_MODIFIED = '2026-11-13T09:30:00.000Z';

const meta = {
  title: 'Features/StructuredData',
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '5xl' },
    docs: {
      description: {
        component:
          'Reine Builder für JSON-LD: Person, WebSite, ProfilePage, WebPage, Karriere (`Person.hasOccupation`), Case Studies (`ItemList`), Projekt-Detail und Projekt-Listing. Kein DB-Zugriff, keine Seiteneffekte — testbar ohne Datenbank.',
      },
    },
  },
} satisfies Meta;

export default meta;

/* ── Person ────────────────────────────────────────────────────────────── */

export const Person: StoryObj<{ identity: PersonIdentity }> = {
  name: 'Person',
  args: { identity: personIdentity },
  argTypes: {
    identity: {
      control: 'object',
      description: 'Identität aus `site-settings.identity` (Adresse, Profile, Sprachen).',
    },
  },
  render: ({ identity }) => <JsonView data={buildPerson(identity)} />,
};

/* ── WebSite (Homepage-Graph) ──────────────────────────────────────────── */

export const WebSite: StoryObj<{ locale: FrontendLocale; description: string }> = {
  name: 'WebSite (Home)',
  args: { locale: 'de', description: DESCRIPTION },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    description: { control: 'text' },
  },
  render: ({ locale, description }) => (
    <JsonView
      data={buildSiteJsonLd({
        locale,
        siteName: personIdentity.siteName,
        description,
        person: buildPerson(personIdentity),
      })}
    />
  ),
};

/* ── ProfilePage ───────────────────────────────────────────────────────── */

export const ProfilePage: StoryObj<{
  locale: FrontendLocale;
  path: string;
  name: string;
  description: string;
  withDate: boolean;
}> = {
  name: 'ProfilePage',
  args: {
    locale: 'de',
    path: '/de/career',
    name: 'Werdegang',
    description: DESCRIPTION,
    withDate: true,
  },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    path: { control: 'text' },
    name: { control: 'text' },
    description: { control: 'text' },
    withDate: { control: 'boolean', description: '`dateModified` aus dem CMS-`updatedAt`.' },
  },
  render: ({ locale, path, name, description, withDate }) => (
    <JsonView
      data={buildProfilePageJsonLd({
        person: buildPerson(personIdentity),
        locale,
        path,
        name,
        description,
        dateModified: withDate ? DATE_MODIFIED : null,
      })}
    />
  ),
};

/* ── WebPage ───────────────────────────────────────────────────────────── */

export const WebPage: StoryObj<{
  locale: FrontendLocale;
  path: string;
  name: string;
  includeContact: boolean;
}> = {
  name: 'WebPage',
  args: { locale: 'de', path: '/de/contact', name: 'Kontakt', includeContact: true },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    path: { control: 'text' },
    name: { control: 'text' },
    includeContact: {
      control: 'boolean',
      description: '`/contact`: Person-Knoten als `mainEntity` in den Graph aufnehmen.',
    },
  },
  render: ({ locale, path, name, includeContact }) => (
    <JsonView
      data={buildWebPageJsonLd({
        person: buildPerson(personIdentity),
        locale,
        path,
        name,
        description: DESCRIPTION,
        dateModified: DATE_MODIFIED,
        includeContact,
      })}
    />
  ),
};

/* ── Karriere ──────────────────────────────────────────────────────────── */

export const Career: StoryObj<{ locale: FrontendLocale }> = {
  name: 'Career (hasOccupation)',
  args: { locale: 'de' },
  argTypes: { locale: { control: 'inline-radio', options: ['de', 'en'] } },
  render: ({ locale }) => (
    <JsonView
      data={buildCareerJsonLd({
        person: buildPerson(personIdentity),
        locale,
        path: '/de/career',
        name: 'Werdegang',
        description: DESCRIPTION,
        dateModified: DATE_MODIFIED,
        layout: careerLayout,
      })}
    />
  ),
};

/* ── Case Studies ──────────────────────────────────────────────────────── */

export const CaseStudies: StoryObj<{ locale: FrontendLocale }> = {
  name: 'Case Studies (ItemList)',
  args: { locale: 'de' },
  argTypes: { locale: { control: 'inline-radio', options: ['de', 'en'] } },
  render: ({ locale }) => (
    <JsonView
      data={buildCaseStudiesJsonLd({
        locale,
        path: '/de/case-studies',
        name: 'Case Studies',
        description: DESCRIPTION,
        dateModified: DATE_MODIFIED,
        layout: caseStudyLayout,
      })}
    />
  ),
};

/* ── Projekt-Detail ────────────────────────────────────────────────────── */

export const Project: StoryObj<{ locale: FrontendLocale; listingName: string }> = {
  name: 'Projekt (Detail)',
  args: { locale: 'de', listingName: 'Projekte' },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    listingName: {
      control: 'text',
      description: 'Sichtbarer Titel der Listing-Seite (Breadcrumb).',
    },
  },
  render: ({ locale, listingName }) => (
    <JsonView data={buildProjectJsonLd({ locale, project: projectFull, listingName })} />
  ),
};

/* ── Projekt-Listing ───────────────────────────────────────────────────── */

export const ProjectListing: StoryObj<{ locale: FrontendLocale; totalDocs: number }> = {
  name: 'Projekt-Listing (ItemList)',
  args: { locale: 'de', totalDocs: 2 },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    totalDocs: { control: { type: 'number', min: 0, step: 1 } },
  },
  render: ({ locale, totalDocs }) => (
    <JsonView
      data={buildProjectListingJsonLd({
        locale,
        path: '/de/projects',
        name: 'Projekte',
        description: DESCRIPTION,
        items: [projectFull, projectMinimal],
        totalDocs,
      })}
    />
  ),
};

/* ── parsePeriod ───────────────────────────────────────────────────────── */

export const ParsePeriod: StoryObj<{ periods: string[] }> = {
  name: 'parsePeriod',
  args: {
    periods: [
      '09/2024',
      'Seit 09/2024 – Heute',
      'Since 09/2024 – Today',
      '2012 – 2014',
      '2014',
      '2019 - 2024',
      'Juli 2020 – Dezember 2021',
      '13/2020 – 2021',
      'Freelance',
      '',
    ],
  },
  argTypes: {
    periods: { control: 'object', description: 'Strings, wie sie im Timeline-Block stehen.' },
  },
  render: ({ periods }) => (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="mono-label border-b border-border text-muted-foreground">
          <th className="py-2 pr-4">period</th>
          <th className="py-2 pr-4">startDate</th>
          <th className="py-2 pr-4">endDate</th>
          <th className="py-2">JSON</th>
        </tr>
      </thead>
      <tbody>
        {periods.map((period, index) => {
          const parsed = parsePeriod(period);
          return (
            <tr key={`${period}-${index}`} className="border-b border-border/60">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                {period === '' ? '""' : period}
              </td>
              <td className="py-2 pr-4 font-mono text-xs text-primary">
                {parsed?.startDate ?? '—'}
              </td>
              <td className="py-2 pr-4 font-mono text-xs text-secondary">
                {parsed?.endDate ?? '—'}
              </td>
              <td className="py-2 font-mono text-xs text-muted-foreground">
                {parsed ? JSON.stringify(parsed) : 'null'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
};

/* ── jsonLdLanguageTag ─────────────────────────────────────────────────── */

export const LanguageTag: StoryObj<{ locale: FrontendLocale }> = {
  name: 'jsonLdLanguageTag',
  args: { locale: 'de' },
  argTypes: { locale: { control: 'inline-radio', options: ['de', 'en'] } },
  render: ({ locale }) => (
    <p className="font-mono text-sm text-foreground">
      jsonLdLanguageTag(&apos;{locale}&apos;) →{' '}
      <span className="text-primary">{jsonLdLanguageTag(locale)}</span>
    </p>
  ),
};
