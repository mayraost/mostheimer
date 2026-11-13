import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReleaseGuard } from './ReleaseGuard';

/**
 * `ReleaseGuard` rendert bewusst `null` — er ist reine Wirkung (fetch auf
 * `/api/health`, Vergleich mit der Release-ID dieses Tabs, höchstens ein
 * Hard-Reload pro Release). Eine „normale" Story wäre eine leere Fläche.
 *
 * Deshalb zeigen die Stories den Vertrag sichtbar: eine kurze Erklärung plus
 * der echte Guard, dessen Netzwerkzugriff in `beforeEach` auf einen festen
 * Release-Antwortwert gemockt ist. Der erste Check setzt nur `loadedWith`
 * (kein Reload), die Stories sind also gefahrlos im ausgelieferten Storybook
 * lauffähig.
 *
 * Bewusst NICHT gebaut: eine Story mit abweichender Release-ID. Sie würde
 * `window.location.reload()` auslösen und den Storybook-Frame in eine
 * Reload-Schleife schicken.
 */
const meta = {
  title: 'UI/ReleaseGuard',
  component: ReleaseGuard,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '3xl' },
    docs: {
      description: {
        component:
          'Deploy-Guard: vergleicht die Release-ID des laufenden Images (`/api/health` → `release`) mit der des Tabs und lädt höchstens einmal pro Release hart neu. Rendert `null`; sichtbar ist nur die Wirkung.',
      },
    },
  },
} satisfies Meta<typeof ReleaseGuard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Originale für den Restore in `afterEach` (nie in der Render-Phase gesetzt). */
let originalFetch: typeof window.fetch | undefined;
let originalSetItem: Storage['setItem'] | undefined;

function GuardNotes({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-border bg-surface p-5 text-sm leading-relaxed text-muted-foreground">
      <p className="mono-label mb-2 text-primary">deploy guard</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Erster Check merkt sich die Release-ID des Tabs und lädt NICHT neu.</li>
        <li>Erst eine abweichende, noch nicht quittierte ID löst einen Reload aus.</li>
        <li>Ohne schreibbaren Storage wird nur adoptiert — nie neu geladen.</li>
      </ul>
      {children}
    </div>
  );
}

/** Normalfall: Release-Antwort vorhanden, Storage schreibbar, kein Reload. */
export const Default: Story = {
  beforeEach: () => {
    originalFetch = window.fetch;
    window.fetch = async () =>
      new Response(JSON.stringify({ status: 'ok', release: 'storybook' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
  },
  afterEach: () => {
    if (originalFetch) window.fetch = originalFetch;
    originalFetch = undefined;
  },
  decorators: [
    (Story) => (
      <>
        <GuardNotes />
        <Story />
      </>
    ),
  ],
};

/** Kein schreibbarer Storage → der Guard bleibt lesend, kein Reload möglich. */
export const StorageUnavailable: Story = {
  name: 'Storage nicht verfügbar',
  beforeEach: () => {
    originalFetch = window.fetch;
    originalSetItem = Storage.prototype.setItem;
    window.fetch = async () =>
      new Response(JSON.stringify({ status: 'ok', release: 'storybook' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      // Nur der Guard-Key ist „nicht schreibbar" — Storybook selbst schreibt
      // eigene Keys (Panel-State) und würde sonst harmlose Konsolenfehler
      // produzieren, die wie ein Story-Bug aussehen.
      if (key.startsWith('mayraostheimer.release')) {
        throw new Error('storage disabled (story)');
      }
      originalSetItem?.call(this, key, value);
    };
  },
  afterEach: () => {
    if (originalFetch) window.fetch = originalFetch;
    if (originalSetItem) Storage.prototype.setItem = originalSetItem;
    originalFetch = undefined;
    originalSetItem = undefined;
  },
  decorators: [
    (Story) => (
      <>
        <GuardNotes>
          <p className="mt-2 text-xs">
            Diese Story lässt <code>Storage.prototype.setItem</code> werfen; der Guard adoptiert die
            Release-ID und bleibt stehen.
          </p>
        </GuardNotes>
        <Story />
      </>
    ),
  ],
};
