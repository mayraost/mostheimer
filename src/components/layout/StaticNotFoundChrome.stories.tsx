import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StaticFooter, StaticHeader, StaticNotFoundChrome } from './StaticNotFoundChrome';
import { StatusScreen } from './StatusScreen';
import { notFoundScreen } from '@/stories/fixtures/chrome';

/**
 * Statische Chrome für das LETZTE 404-Dokument.
 *
 * Die dokumentierte Ausnahme der „keine hartkodierten Texte"-Regel: dieses
 * Modul rendert die Notfall-Dokumente (`(frontend)/not-found.tsx`,
 * `global-not-found.tsx`), die auch dann stehen müssen, wenn die Datenbank
 * weg ist. Ein CMS-Read hier würde aus „Seite nicht gefunden" ein „500, weil
 * die DB fehlt" machen.
 *
 * Folge für die Story: die Labels sind bewusst fest (DE/EN-Tabelle im Modul)
 * und kommen NICHT aus `mockTranslations` — der Umschalter ist deshalb
 * `locale`, nicht die Copy.
 */
const meta = {
  title: 'Layout/StaticNotFoundChrome',
  component: StaticNotFoundChrome,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'DB-freie Chrome (Header mit Mark + Links, Footer mit Claim/Rechtlichem) für das kritische 404-Dokument. Nutzt dieselben Tailwind-Klassen wie die echte Chrome, damit das aus `globals.css` generierte Critical-CSS-Subset sie abdeckt.',
      },
    },
  },
  args: {
    locale: 'de',
    children: <StatusScreen {...notFoundScreen} />,
  },
  argTypes: {
    locale: { control: 'inline-radio', options: ['de', 'en'] },
    children: { control: false },
  },
} satisfies Meta<typeof StaticNotFoundChrome>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vollständiges 404-Dokument (DE): statische Chrome + Statuskarte. */
export const NotFound: Story = {};

/** Englische Variante — dieselben Slugs, englische Labels. */
export const En: Story = {
  args: { locale: 'en' },
};

/** Nur der Kopfbereich: Mark, Hauptnavigation, Sprachwechsel. */
export const HeaderOnly: Story = {
  render: (args) => <StaticHeader locale={args.locale} />,
};

/** Nur der Fußbereich: Claim, Rechtliches, Copyright und Tech-Zeile. */
export const FooterOnly: Story = {
  render: (args) => <StaticFooter locale={args.locale} />,
};

/** Ohne Inhalt: der Rahmen bleibt (Skip-Link-Ziel, Footer am Dokumentende). */
export const WithoutContent: Story = {
  args: { children: null },
};
