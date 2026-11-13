import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectDetail } from './ProjectDetail';
import { mockCopy } from '@/stories/mockTranslations';
import {
  projectDetailCopyEn,
  projectEmpty,
  projectFull,
  projectMinimal,
  projectNoLinks,
} from '@/stories/fixtures/features';

/**
 * Detailseite eines Projekts (`/[locale]/projects/<slug>`).
 *
 * Reiner Prop-Renderer: die Route löst das Dokument über den gecachten Reader
 * auf, mappt es mit `toProjectView` und reicht View + Copy hinein — dieselbe
 * Form rendert die Live-Preview. Sektionen ohne Inhalt erscheinen NICHT (keine
 * leeren Überschriften); fehlt alles, greift `copy.empty`.
 *
 * Externe Links (Live, Code, Komponenten-Doku) werden pro Feld einzeln
 * weggelassen, wenn die URL fehlt — `githubUrl` ist bei privaten Repos legitim
 * leer. `storybookUrl` ist der dritte, optionale Chip.
 */
const meta = {
  title: 'Projects/ProjectDetail',
  component: ProjectDetail,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    nextjs: { appDirectory: true, navigation: { pathname: '/de/projects/internal-dashboard' } },
    docs: {
      description: {
        component:
          'Hero mit Cover, Stack-Chips und drei externen Links; darunter die Case-Study-Sektionen (Kontext → Vorgehen → Learnings → Ergebnis) und eine Sidebar mit Tags, Stack und Links. Alle Labels kommen aus `routes.project.*` (`ProjectDetailCopy`).',
      },
    },
  },
} satisfies Meta<typeof ProjectDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vollständig: Cover, Stack, Tags, alle Sektionen und drei Links. */
export const FullProject: Story = {
  name: 'Vollständiges Projekt',
  args: { project: projectFull, copy: mockCopy.projectDetail },
};

/** Minimalfall: nur `context`, kein Cover, keine Links, keine Tags. */
export const MinimalProject: Story = {
  name: 'Minimales Projekt',
  args: { project: projectMinimal, copy: mockCopy.projectDetail },
};

/** Voller Inhalt, aber ohne externen Link — die Link-Zeile entfällt. */
export const NoLinks: Story = {
  name: 'Ohne Links',
  args: { project: projectNoLinks, copy: mockCopy.projectDetail },
};

/** Ohne Hero: der Renderer reserviert die 12:5-Fläche und zeigt `noCover`. */
export const WithoutCover: Story = {
  name: 'Ohne Cover',
  args: { project: { ...projectNoLinks, hero: null }, copy: mockCopy.projectDetail },
};

/** Keine Sektion gefüllt: statt leerer Überschriften steht `copy.empty`. */
export const Empty: Story = {
  name: 'Ohne Sektionen',
  args: { project: projectEmpty, copy: mockCopy.projectDetail },
};

/** Sehr langer Titel: die H1 bricht um, der Kopf bleibt lesbar. */
export const LongTitle: Story = {
  name: 'Langer Titel',
  args: {
    project: {
      ...projectFull,
      title:
        'Ein Projekttitel, der deutlich länger ist als die Regel und deshalb über mehrere Zeilen läuft — inklusive Untertitel und Klammerzusatz',
    },
    copy: mockCopy.projectDetail,
  },
};

/** Deutsche Copy (CMS-Locale `de`). */
export const De: Story = {
  name: 'Deutsch',
  args: { project: projectFull, copy: mockCopy.projectDetail },
};

/** Englische Copy (CMS-Locale `en`) — dieselben Daten, andere Labels. */
export const En: Story = {
  name: 'Englisch',
  args: { project: projectFull, copy: projectDetailCopyEn },
};
