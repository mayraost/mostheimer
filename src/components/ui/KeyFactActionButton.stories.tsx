import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KeyFactActionButton } from './KeyFactActionButton';

const meta = {
  title: 'UI/KeyFactActionButton',
  component: KeyFactActionButton,
  tags: ['autodocs'],
  args: { value: 'mail@example.com' },
  argTypes: {
    value: { control: 'text' },
    className: { control: 'text' },
  },
  parameters: {
    appShell: { maxWidth: '2xl' },
    docs: {
      description: {
        component:
          'Aktions-Zeile unter einem Kontakt-Key-Fact. Die Aktion wird AUS DEM ANGEZEIGTEN TEXT abgeleitet (`keyFactAction`): Telefonnummer → `tel:`-Button, E-Mail → Kopier-Button, Host → externer Profil-Button (GitHub/LinkedIn mit Marken-Label, sonst der nackte Host). Ein reiner Text-Wert bleibt Text — die Komponente rendert dann `null`. So muss im CMS nie ein zweites `tel:`/`https:` gepflegt werden.',
      },
    },
  },
} satisfies Meta<typeof KeyFactActionButton>;

export default meta;

function KeyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[6px] border border-border bg-surface p-4">
      <span className="mono-label text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
      <KeyFactActionButton value={value} />
    </div>
  );
}

export const Email: StoryObj<typeof meta> = {
  name: 'E-Mail → kopieren',
  render: (args) => <KeyFactActionButton {...args} />,
};

export const Phone: StoryObj<typeof meta> = {
  name: 'Telefon → anrufen',
  args: { value: '(+49) 176 63 78 79 51' },
  render: (args) => <KeyFactActionButton {...args} />,
};

export const GitHub: StoryObj<typeof meta> = {
  name: 'GitHub → externes Profil',
  args: { value: 'github.com/mayraost' },
  render: (args) => <KeyFactActionButton {...args} />,
};

export const LinkedIn: StoryObj<typeof meta> = {
  name: 'LinkedIn → externes Profil',
  args: { value: 'linkedin.com/in/mayra-ostheimer' },
  render: (args) => <KeyFactActionButton {...args} />,
};

export const UnknownHost: StoryObj<typeof meta> = {
  name: 'Unbekannter Host → Host als Label',
  args: { value: 'example.dev/@mayra' },
  render: (args) => <KeyFactActionButton {...args} />,
};

export const PlainText: StoryObj<typeof meta> = {
  name: 'Reiner Text → keine Aktion',
  args: { value: 'Kiebitzreihe · Schleswig-Holstein' },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="rounded-[6px] border border-dashed border-border-strong p-4">
        <KeyFactActionButton {...args} />
      </div>
      <p className="text-sm text-muted-foreground">
        Kein Telefon, keine Adresse, kein Host — der Wert bleibt ein Fakt ohne Button (die
        Komponente rendert <code>null</code>, der Rahmen oben ist nur die Story-Hilfe).
      </p>
    </div>
  ),
};

export const AllVariants: StoryObj = {
  name: 'Alle Varianten',
  render: () => (
    <div className="grid gap-3 sm:grid-cols-2">
      <KeyFact label="E-Mail" value="mail@example.com" />
      <KeyFact label="Telefon" value="(+49) 176 63 78 79 51" />
      <KeyFact label="GitHub" value="github.com/mayraost" />
      <KeyFact label="LinkedIn" value="linkedin.com/in/mayra-ostheimer" />
      <KeyFact label="Host" value="example.dev/@mayra" />
      <KeyFact label="Ort" value="Kiebitzreihe · Schleswig-Holstein" />
    </div>
  ),
};

export const LightTheme: StoryObj = {
  name: 'Light-Theme',
  globals: { theme: 'light' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <KeyFactActionButton value="mail@example.com" />
      <KeyFactActionButton value="(+49) 176 63 78 79 51" />
      <KeyFactActionButton value="github.com/mayraost" />
    </div>
  ),
};
