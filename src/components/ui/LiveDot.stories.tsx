import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LiveDot } from './LiveDot';

const meta = {
  title: 'UI/LiveDot',
  component: LiveDot,
  tags: ['autodocs'],
  args: { tone: 'primary', className: '' },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'secondary'] },
    className: { control: 'text' },
  },
  parameters: {
    appShell: { maxWidth: '2xl' },
    // Endlos-Puls: der Screenshot wird am letzten Frame eingefroren, sonst
    // unterscheidet sich jeder Lauf.
    chromatic: { pauseAnimationAtEnd: true },
    docs: {
      description: {
        component:
          'Telemetrie-Punkt: der Kern bleibt stehen, ein zweiter Ring skaliert 1 → 2.2 und blendet 0.5 → 0 im 3.5-s-Zyklus. Nur `transform`/`opacity`, also nie Layoutkosten. Rein dekorativ (`aria-hidden`), ohne Text. Bei `no-animations`/reduce-motion bleibt der Ring statisch, der Kern ist weiter sichtbar.',
      },
    },
  },
} satisfies Meta<typeof LiveDot>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  name: 'Zustand — primary',
  render: (args) => <LiveDot {...args} />,
};

export const Secondary: StoryObj<typeof meta> = {
  name: 'Zustand — secondary',
  args: { tone: 'secondary' },
  render: (args) => <LiveDot {...args} />,
};

export const AllTones: StoryObj = {
  name: 'Beide Töne',
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <span className="mono-label flex items-center gap-2 text-foreground">
        <LiveDot />
        primary
      </span>
      <span className="mono-label flex items-center gap-2 text-foreground">
        <LiveDot tone="secondary" />
        secondary
      </span>
    </div>
  ),
};

export const InlineWithLabel: StoryObj = {
  name: 'Im Fließtext / Label',
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="mono-label flex items-center gap-2 text-foreground">
        <LiveDot />
        ALL SYSTEMS OPERATIONAL
      </p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LiveDot tone="secondary" />
        Status wird live aus der Telemetrie gelesen
      </p>
    </div>
  ),
};

export const Larger: StoryObj<{ className: string }> = {
  name: 'Größer (`className`)',
  args: { className: 'h-3 w-3' },
  argTypes: { className: { control: 'text' } },
  render: ({ className }) => (
    <div className="flex items-center gap-6">
      <LiveDot className={className} />
      <LiveDot className={className} tone="secondary" />
    </div>
  ),
};

export const LightTheme: StoryObj = {
  name: 'Light-Theme',
  globals: { theme: 'light' },
  render: () => (
    <span className="mono-label flex items-center gap-2 text-foreground">
      <LiveDot />
      ALL SYSTEMS OPERATIONAL
    </span>
  ),
};
