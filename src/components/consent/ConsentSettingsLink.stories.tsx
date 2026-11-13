import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConsentSettingsLink } from './ConsentSettingsLink';
import { getLegacyCopy } from '@/lib/translations';
import { mockTranslations } from '@/stories/mockTranslations';

/**
 * Footer-Link „Cookie-Einstellungen".
 *
 * Bewusst ein `<button>` und kein `<a href="#">`: der Klick öffnet den
 * Consent-Dialog und navigiert nirgendwohin. Ohne JS ist der Button inert —
 * der Banner selbst braucht ohnehin JS.
 */
const defaultLabel = getLegacyCopy(mockTranslations, 'cookies.settingsLink');

const meta = {
  title: 'Features/ConsentSettingsLink',
  component: ConsentSettingsLink,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '3xl' },
    docs: {
      description: {
        component:
          'Dispatcht `mosthi:consent:open`; der `CookieConsent` hört auf dieses Event und öffnet sich mit dem gespeicherten Zustand. Die Beschriftung kommt aus dem `translations`-Global (`cookies.settingsLink`).',
      },
    },
  },
  args: { label: defaultLabel },
  argTypes: {
    label: { control: 'text' },
    className: { control: 'text', description: 'Leer = Default-Klassen der Komponente.' },
  },
} satisfies Meta<typeof ConsentSettingsLink>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default-Klassen: Mono-Label, muted, Hover auf Primary. */
export const Default: Story = {
  render: ({ label, className }) => (
    <ConsentSettingsLink label={label} className={className || undefined} />
  ),
};

/** Eigene Klasse: als umrandeter Button in einer Footer-Zeile. */
export const CustomClass: Story = {
  name: 'Eigene Klasse',
  args: {
    className:
      'mono-label inline-flex min-h-11 items-center rounded-[6px] border border-border-strong px-4 text-foreground transition-colors hover:border-primary',
  },
  render: ({ label, className }) => (
    <ConsentSettingsLink label={label} className={className || undefined} />
  ),
};

/** Lange Beschriftung: bricht nicht um, die Zeile bleibt ein 44-px-Target. */
export const LongLabel: Story = {
  name: 'Lange Beschriftung',
  args: { label: 'Cookie-Einstellungen und Einwilligungen verwalten' },
  render: ({ label, className }) => (
    <ConsentSettingsLink label={label} className={className || undefined} />
  ),
};

/** Im Footer-Kontext: Copyright links, Link rechts, gleiche Zeilenhöhe. */
export const InFooterRow: Story = {
  name: 'In der Footer-Zeile',
  args: { className: '' },
  render: ({ label }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
      <span className="mono-label text-muted-foreground">
        {getLegacyCopy(mockTranslations, 'footer.rightsReserved')}
      </span>
      <ConsentSettingsLink label={label} />
    </div>
  ),
};
