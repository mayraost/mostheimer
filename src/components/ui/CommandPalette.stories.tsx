import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { mockTranslations } from '@/stories/mockTranslations';
import { getLegacyCopy } from '@/lib/translations';
import { CommandPalette } from './CommandPalette';
import type { CommandItem } from './CommandPalette';

const emptyLabel = getLegacyCopy(mockTranslations, 'commandPalette.emptyLabel');

/**
 * Demo-Einträge: die Palette bekommt ihre Items als Prop (Struktur + Labels aus
 * dem `translations`-Global). Hier stehen sie als Fixture, damit die Story ohne
 * CMS auskommt.
 */
const items: CommandItem[] = [
  { id: 'home', label: 'Startseite', href: '', group: 'pages', keywords: ['home', 'start'] },
  {
    id: 'architektur',
    label: 'Architektur',
    href: '#architektur',
    group: 'sections',
    keywords: ['architecture', 'aufbau'],
  },
  { id: 'case-studies', label: 'Case Studies', href: '/case-studies', group: 'pages' },
  { id: 'projects', label: 'Projects', href: '/projects', group: 'pages', keywords: ['projekte'] },
  { id: 'tech-radar', label: 'Tech Radar', href: '/tech-radar', group: 'pages' },
  { id: 'leadership', label: 'Leadership', href: '/leadership', group: 'pages' },
  { id: 'career', label: 'Werdegang', href: '/career', group: 'pages', keywords: ['career'] },
  { id: 'contact', label: 'Kontakt', href: '/contact', group: 'pages', keywords: ['contact'] },
  { id: 'impressum', label: 'Impressum', href: '/impressum', group: 'pages' },
  { id: 'settings', label: 'Einstellungen', href: '/settings', group: 'pages' },
];

const manyItems: CommandItem[] = [
  ...items,
  { id: 'privacy', label: 'Datenschutz', href: '/privacy', group: 'pages' },
  { id: 'skills', label: 'Skillset', href: '#skillset', group: 'sections' },
  { id: 'stack', label: 'Stack', href: '#stack', group: 'sections' },
  { id: 'timeline', label: 'Timeline', href: '#timeline', group: 'sections' },
  { id: 'kontakt-mail', label: 'E-Mail', href: '#kontakt', group: 'sections' },
  { id: 'kontakt-tel', label: 'Telefon', href: '#kontakt', group: 'sections' },
];

const meta = {
  title: 'UI/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  args: { locale: 'de', items },
  argTypes: {
    locale: { control: 'select', options: ['de', 'en'] },
  },
  parameters: {
    appShell: { maxWidth: '4xl' },
    // Der App-Router-Mock muss aktiv sein, sonst wirft `useRouter()` aus
    // `next/navigation` (Storybook liefert die Mocks, aktiviert sie aber nur
    // über dieses Flag).
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          '⌘K/Ctrl+K-Palette. A11y-Vertrag: `role="dialog"` + `aria-modal`, Fokus wandert ins Suchfeld und beim Schließen zum Trigger zurück, Tab/Shift+Tab zyklieren im Dialog, ↑/↓ bewegen die aktive Option (`aria-activedescendant`), Enter öffnet, Esc schließt, die Trefferzahl läuft über `aria-live="polite"`. Der Dialog existiert nur im geöffneten Zustand — kein Offscreen-Fokus, kein Layout-Überlauf. Die Trigger sind auf Mobile/Desktop unterschiedlich breit (`md:`), der Shortcut funktioniert in beiden Fällen.',
      },
    },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;

/** Öffnet die Palette über den globalen Shortcut (unabhängig von der Viewport-Breite). */
async function openPalette() {
  await userEvent.keyboard('{Control>}k{/Control}');
}

export const Closed: StoryObj<typeof meta> = {
  name: 'Zustand — geschlossen',
  render: (args) => <CommandPalette {...args} />,
};

export const Open: StoryObj<typeof meta> = {
  name: 'Zustand — geöffnet',
  render: (args) => <CommandPalette {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPalette();
    await expect(await canvas.findByRole('dialog')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveFocus());
  },
};

export const Filtered: StoryObj<typeof meta> = {
  name: 'Zustand — gefiltert',
  render: (args) => <CommandPalette {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPalette();
    const input = await canvas.findByRole('combobox');
    await userEvent.type(input, 'kont');
    await expect(canvas.getByRole('option', { name: 'Kontakt' })).toBeVisible();
  },
};

export const EmptyResults: StoryObj<typeof meta> = {
  name: 'Zustand — leere Trefferliste',
  render: (args) => <CommandPalette {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPalette();
    const input = await canvas.findByRole('combobox');
    await userEvent.type(input, 'zzzz');
    await expect(canvas.getByText(emptyLabel)).toBeVisible();
    await expect(canvas.queryAllByRole('option')).toHaveLength(0);
  },
};

export const ManyResults: StoryObj<typeof meta> = {
  name: 'Zustand — viele Treffer',
  args: { items: manyItems },
  render: (args) => <CommandPalette {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPalette();
    await expect(await canvas.findByRole('dialog')).toBeVisible();
    await expect(canvas.getAllByRole('option').length).toBeGreaterThan(items.length);
  },
};

export const EnglishLocale: StoryObj<typeof meta> = {
  name: 'Locale — en',
  args: { locale: 'en' },
  render: (args) => <CommandPalette {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPalette();
    await expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};
