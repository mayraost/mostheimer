import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { mockTranslations } from '@/stories/mockTranslations';
import { getLegacyCopy } from '@/lib/translations';
import { CopyButton } from './CopyButton';

/**
 * Die Labels kommen im Betrieb aus dem `translations`-Global; die Story liest
 * sie über denselben Pfad wie die Komponente (`getLegacyCopy`), damit die
 * Erwartungen in den `play`-Funktionen nicht driften.
 */
const copyLabel = getLegacyCopy(mockTranslations, 'clipboard.copyLabel');
const copiedInline = getLegacyCopy(mockTranslations, 'clipboard.copiedInline');
const copiedMessage = getLegacyCopy(mockTranslations, 'clipboard.copiedMessage');
const failedMessage = getLegacyCopy(mockTranslations, 'clipboard.failedMessage');

const meta = {
  title: 'UI/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '2xl' },
    docs: {
      description: {
        component:
          'Kopiert einen Wert in die Zwischenablage (`navigator.clipboard`, sonst `execCommand`-Fallback). Bestätigung: das sichtbare Label wechselt für 2 s auf die Terminal-Zeile `[ KOPIERT // 200 OK ]`, während der Button emerald wird — der Accessible Name bleibt über `aria-label` stabil, die volle Bestätigung läuft über eine separate `role="status"`-Region. Schlägt beides fehl, gibt es KEIN falsches „kopiert“, nur die lokalisierte Fehlermeldung für Screenreader. Der Button ist eine ZUSATZ-Aktion neben einem sichtbaren `mailto:`-Link, nie ein Ersatz.',
      },
    },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

/**
 * `navigator.clipboard` liegt in Chrome auf dem Prototyp — ein eigenes Property
 * überschreibt es und `delete` stellt das Original wieder her.
 */
function stubClipboard(writeText: () => Promise<void>): () => void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return () => {
    Reflect.deleteProperty(navigator, 'clipboard');
  };
}

export const Default: StoryObj<{ value: string; label: string }> = {
  name: 'Zustand — idle',
  args: { value: 'mail@example.com', label: '' },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text', description: 'Leer = Label aus `clipboard.copyLabel`' },
  },
  render: ({ value, label }) => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-sm text-foreground">{value}</span>
      <CopyButton value={value} label={label || undefined} />
    </div>
  ),
};

export const CustomLabel: StoryObj<{ label: string }> = {
  name: 'Eigenes Label',
  args: { label: 'Adresse kopieren' },
  argTypes: { label: { control: 'text' } },
  render: ({ label }) => (
    <div className="flex flex-col gap-2">
      <CopyButton value="mail@example.com" label={label} />
      <p className="text-sm text-muted-foreground">
        Ein gesetztes <code>label</code> gewinnt gegen die Übersetzung; der Accessible Name folgt
        dem Label.
      </p>
    </div>
  ),
};

export const Copied: StoryObj = {
  name: 'Zustand — kopiert',
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <CopyButton value="mail@example.com" />
      <p className="text-sm text-muted-foreground">
        Die Bestätigung läuft 2 s und fällt danach von selbst auf „idle“ zurück.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const restoreClipboard = stubClipboard(() => Promise.resolve());
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: copyLabel });

    await userEvent.click(button);

    await waitFor(() => expect(button).toHaveTextContent(copiedInline));
    await expect(canvas.getByRole('status')).toHaveTextContent(copiedMessage);
    restoreClipboard();
  },
};

export const Failed: StoryObj = {
  name: 'Zustand — Fehler',
  render: () => (
    <div className="flex flex-col gap-3">
      <CopyButton value="mail@example.com" />
      <p className="text-sm text-muted-foreground">
        Sichtbar ändert sich nichts — der Fehler wird ausschließlich über die{' '}
        <code>role=&quot;status&quot;</code>-Region angesagt (kein falsches „kopiert“). Der Pfad
        wird in der <code>play</code>-Funktion erzwungen: <code>clipboard.writeText</code> rejected,{' '}
        <code>execCommand</code> liefert <code>false</code>.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const restoreClipboard = stubClipboard(() => Promise.reject(new Error('blocked')));
    const originalExecCommand = document.execCommand;
    document.execCommand = () => false;

    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: copyLabel });

    await userEvent.click(button);

    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(failedMessage));
    await expect(button).toHaveTextContent(copyLabel);

    document.execCommand = originalExecCommand;
    restoreClipboard();
  },
};

export const LightTheme: StoryObj = {
  name: 'Light-Theme',
  globals: { theme: 'light' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-sm text-foreground">mail@example.com</span>
      <CopyButton value="mail@example.com" />
    </div>
  ),
};
