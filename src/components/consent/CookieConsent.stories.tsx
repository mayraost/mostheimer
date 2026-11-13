import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, type ReactNode } from 'react';
import { CookieConsent } from './CookieConsent';
import { ConsentSettingsLink } from './ConsentSettingsLink';
import { BentoTile, Eyebrow } from '@/components/ui/industrial';
import { CONSENT_OPEN_EVENT, CONSENT_STORAGE_KEY } from '@/lib/consent';
import { getLegacyCopy } from '@/lib/translations';
import { mockTranslations } from '@/stories/mockTranslations';

/**
 * Consent-Banner (Consent Mode v2).
 *
 * Der Banner ist `position: fixed` und rendert NUR, wenn keine Entscheidung im
 * `localStorage` liegt (oder er explizit über den Footer-Link geöffnet wird).
 * Deshalb steuern die Stories den Speicherzustand VOR dem Mount:
 *
 * - `Undecided`: Key wird entfernt → Banner erscheint automatisch.
 * - `Decided`: gültige Entscheidung liegt vor → Banner bleibt geschlossen
 *   (sichtbar ist die Erklärung plus der echte Footer-Link zum Wiederöffnen).
 * - `Reopen`: Entscheidung liegt vor, danach wird `mosthi:consent:open`
 *   dispatcht → Banner öffnet mit den gespeicherten Toggles.
 *
 * `gtmId` bleibt leer: ohne Container-ID lädt kein Google-Tag-Manager, es gibt
 * also keinen Netzwerk-Traffic in der Story.
 */

const STORED_DECISION = JSON.stringify({
  analytics: true,
  marketing: false,
  decidedAt: '2026-11-13T09:00:00.000Z',
  version: 1,
});

function removeDecision() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
}

function storeDecision() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, STORED_DECISION);
}

/** Kein gespeicherter Zustand → der Banner öffnet sich nach der Hydration. */
const withUndecidedStorage: Decorator = (Story) => {
  removeDecision();
  return <Story />;
};

/** Gespeicherte Entscheidung → der Banner bleibt zu. */
const withStoredDecision: Decorator = (Story) => {
  storeDecision();
  return (
    <div className="flex flex-col gap-4">
      <BentoTile className="p-5">
        <Eyebrow>Zustand: entschieden</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Im <code className="font-mono text-xs">localStorage</code> liegt eine gültige Entscheidung
          (<code className="font-mono text-xs">analytics: true</code>,{' '}
          <code className="font-mono text-xs">marketing: false</code>). Der Banner rendert deshalb{' '}
          <strong className="text-foreground">nichts</strong> — sichtbar ist hier nur der Weg
          zurück: der Footer-Link öffnet ihn mit den gespeicherten Toggles.
        </p>
        <p className="mt-4">
          <ConsentSettingsLink
            label={getLegacyCopy(mockTranslations, 'cookies.settingsLink')}
            className="mono-label inline-flex min-h-11 items-center rounded-[6px] border border-border-strong px-4 text-foreground transition-colors hover:border-primary"
          />
        </p>
      </BentoTile>
      <Story />
    </div>
  );
};

/** Gespeicherte Entscheidung + Öffnen-Event nach dem Mount (Footer-Link-Pfad). */
function ReopenFrame({ children }: { children: ReactNode }) {
  storeDecision();
  useEffect(() => {
    // Effekte laufen von innen nach außen: der Listener des Banners ist zu
    // diesem Zeitpunkt bereits registriert.
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  }, []);
  return <>{children}</>;
}

const withReopenEvent: Decorator = (Story) => (
  <ReopenFrame>
    <Story />
  </ReopenFrame>
);

const meta = {
  title: 'Features/CookieConsent',
  component: CookieConsent,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de/privacy' } },
    docs: {
      description: {
        component:
          'Cookie-Banner mit Consent Mode v2: drei gleich gewichtete Aktionen (kein Dark Pattern), echte Checkboxen, Focus-Trap, Esc führt zur konservativsten Option statt zu schließen. Alle Texte kommen aus dem `translations`-Global (`cookies`), nie aus dem Code.',
      },
    },
  },
  argTypes: {
    gtmId: {
      control: 'text',
      description: 'GTM-Container-ID. Leer = kein Container (kein Netzwerk-Traffic).',
    },
  },
} satisfies Meta<typeof CookieConsent>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Erstbesuch: keine Entscheidung gespeichert, der Banner ist sichtbar. */
export const Undecided: Story = {
  args: { gtmId: '' },
  decorators: [withUndecidedStorage],
};

/** Entscheidung liegt vor: der Banner ist geschlossen, der Link öffnet ihn. */
export const Decided: Story = {
  name: 'Entschieden (Banner zu)',
  args: { gtmId: '' },
  decorators: [withStoredDecision],
};

/** Wiederöffnen über `mosthi:consent:open` — Toggles spiegeln die Entscheidung. */
export const Reopen: Story = {
  name: 'Wieder geöffnet',
  args: { gtmId: '' },
  decorators: [withReopenEvent],
};
