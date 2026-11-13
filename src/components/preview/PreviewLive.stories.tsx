import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PreviewLive } from './PreviewLive';
import { previewCopy, previewPageEmpty, previewPageHome } from '@/stories/fixtures/features';

/**
 * Live-Preview (Client-Seite) über `useLivePreview`.
 *
 * WICHTIG FÜR DIESE STORIES: Außerhalb des Payload-Admin-Panels passiert
 * **kein** Live-Merging. Der Hook wartet auf `postMessage`-Nachrichten vom
 * Admin (`payload-live-preview`) und rendert bis dahin `initialData`. Genau das
 * zeigen die Stories: den serverseitig geladenen Draft, so wie er im
 * Admin-iframe beim ersten Frame aussieht.
 *
 * Im Admin gilt: jede Formularänderung schickt die Formularwerte hierher, der
 * Hook merged sie über `POST /api/pages/<id>` (`X-Payload-HTTP-Method-Override:
 * GET`, Cookie-Auth) und rendert neu — ohne Reload, ohne RSC-Request.
 *
 * `serverURL` ist gleichzeitig `postMessage`-Origin-Filter und Basis des
 * Merge-Requests. Hier zeigt er auf den Storybook-Server; im Betrieb kommt er
 * aus den Request-Headern (`x-forwarded-proto` + `host`), nie aus der Message.
 */
const meta = {
  title: 'Features/PreviewLive',
  component: PreviewLive,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de/preview' } },
    docs: {
      description: {
        component:
          'Rendert das Preview-Dokument (Draft) mit dem Block-Dispatcher der Preview. Ohne Admin-iframe bleibt es beim `initialData` — Live-Merging passiert nur im Admin-Panel.',
      },
    },
  },
  args: {
    serverURL: 'http://localhost:6006',
    copy: previewCopy,
  },
  argTypes: {
    serverURL: { control: 'text' },
    variant: { control: 'select', options: ['home', 'compact'] },
  },
} satisfies Meta<typeof PreviewLive>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Home-Draft in der Home-Variante (voller Hero, Metriken). */
export const HomeVariant: Story = {
  name: 'Home-Variante',
  args: { initialPage: previewPageHome, variant: 'home' },
};

/** Derselbe Draft als Unterseite (`compact`): kleinere H1, Breadcrumb. */
export const CompactVariant: Story = {
  name: 'Compact-Variante',
  args: { initialPage: previewPageHome, variant: 'compact' },
};

/**
 * Frischer Draft ohne Blöcke: der Renderer gibt eine leere `<article>` zurück
 * statt zu crashen (ein gerade angelegter Block kann ohne `blockType` ankommen
 * und wird übersprungen).
 */
export const EmptyLayout: Story = {
  name: 'Ohne Blöcke',
  args: { initialPage: previewPageEmpty, variant: 'compact' },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="min-h-11 rounded-[6px] border border-dashed border-border px-4 py-3">
        <span className="mono-label text-muted-foreground">
          layout: null → keine Blöcke, kein Crash
        </span>
      </div>
      <PreviewLive {...args} />
    </div>
  ),
};
