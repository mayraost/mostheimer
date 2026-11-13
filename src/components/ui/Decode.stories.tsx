import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Decode } from './Decode';
import { LiveDot } from './LiveDot';

const meta = {
  title: 'UI/Decode',
  component: Decode,
  tags: ['autodocs'],
  args: {
    text: 'SYSTEM // OPERATIONAL',
    as: 'span',
    className: 'mono-label text-primary',
  },
  argTypes: {
    text: { control: 'text' },
    as: { control: 'select', options: ['span', 'p', 'h2', 'h3'] },
    className: { control: 'text' },
  },
  parameters: {
    appShell: { maxWidth: '4xl' },
    chromatic: { pauseAnimationAtEnd: true },
    docs: {
      description: {
        component:
          'Mono-Telemetrie: sobald die Sektion das erste Mal im Viewport ist, scrambelt ein Label 280 ms durch technische Zeichen und setzt sich dann links-nach-rechts. Zahlen werden NICHT gescrambelt (das läse sich als Datenfehler), sondern zählen 350 ms hoch — mit `tabular-nums`, damit die Breite nicht zittert. Der Server rendert immer den Endtext; die Animation ist reines Client-Overlay. Bei `no-animations`/reduce-motion steht sofort der Endtext.',
      },
    },
  },
} satisfies Meta<typeof Decode>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  name: 'Zustand — Text (scramble)',
  render: (args) => <Decode {...args} />,
};

export const CountUp: StoryObj<typeof meta> = {
  name: 'Zustand — Zahl (count-up)',
  args: { text: '99.4%', className: 'font-mono text-3xl text-foreground' },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Decode {...args} />
      <p className="text-sm text-muted-foreground">
        Nur der Zahlenteil animiert — Präfix und Suffix bleiben stehen.
      </p>
    </div>
  ),
};

export const NumericFormats: StoryObj = {
  name: 'Zahlenformate',
  render: () => (
    <div className="flex flex-col gap-3 font-mono text-2xl text-foreground">
      <Decode text="99.4%" />
      <Decode text="1.284,5 ms" />
      <Decode text="-12 °C" />
      <Decode text="~10 yrs" />
      <Decode text="kein Zahlenteil" className="mono-label text-muted-foreground" />
    </div>
  ),
};

export const Elements: StoryObj<{ as: 'span' | 'p' | 'h2' | 'h3' }> = {
  name: 'Semantische Elemente (`as`)',
  args: { as: 'h2' },
  argTypes: { as: { control: 'select', options: ['span', 'p', 'h2', 'h3'] } },
  render: ({ as }) => (
    <div className="flex flex-col gap-4">
      <Decode as={as} text="Architektur" className="text-2xl text-foreground" />
      <Decode
        as="p"
        text="Der Wrapper bleibt ein echtes Text-Element — kein zusätzliches div."
        className="text-sm text-muted-foreground"
      />
    </div>
  ),
};

export const ComposedChildren: StoryObj = {
  name: 'Zusammengesetzter Inhalt (`children`)',
  render: () => (
    <div className="flex flex-col gap-3">
      <Decode text="LIVE" className="mono-label inline-flex items-center gap-2 text-foreground">
        <LiveDot />
        LIVE
      </Decode>
      <p className="text-sm text-muted-foreground">
        Mit <code>children</code> gewinnt der gerenderte Inhalt: er ist sofort da und wird nicht
        animiert — gedacht für zusammengesetzte Zeilen (Dot + Label), deren Text ohnehin live ist.
      </p>
    </div>
  ),
};
