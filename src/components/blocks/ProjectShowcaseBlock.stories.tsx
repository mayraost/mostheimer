import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectShowcaseBlock } from './ProjectShowcaseBlock';
import { mockCopy } from '@/stories/mockTranslations';
import {
  projectShowcaseBlock,
  showcaseViewDefault,
  showcaseViewEmpty,
  showcaseViewFilteredEmpty,
  showcaseViewManyPages,
  showcaseViewNoCovers,
  showcaseViewSinglePage,
} from '@/stories/fixtures/blocksB';

/**
 * Projekt-Listing: Raster, Tag-Filter und Pagination.
 *
 * Der Block ist ein reiner Prop-Renderer — die Seite löst Daten (`view`) und
 * URL-State (`?page=`, `?tag=`) auf und reicht beides hinein. Deshalb stehen die
 * Zustände hier als fertige View-Modelle, nicht als `searchParams`.
 *
 * **Im Canvas navigieren die Links nicht**: Filter-Chips und Pagination sind
 * echte `<a href>` (crawlbar, ohne JS nutzbar), aber Storybook hat keine
 * Listing-Route — ein Klick landet im Router-Mock bzw. auf einem 404.
 */
const meta = {
  title: 'Blocks/Project Showcase',
  component: ProjectShowcaseBlock,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '6xl' },
    docs: {
      description: {
        component:
          'Kopfzeile (Eyebrow, `h2`, Lead, Gesamtzähler), optionale Filterzeile, Tile-Raster (Featured-Tile spannt zwei Spalten) und nummerierte Pagination. `view` trägt die Tiles der aktuellen Seite, die Gesamtzahl und den aktiven Tag; `basePath` ist die Listing-Route der Locale (`/de/projects` bzw. `/en/projects`). Die Pagination rendert bei einer Seite nichts.',
      },
    },
  },
  args: {
    block: projectShowcaseBlock,
    view: showcaseViewDefault,
    basePath: '/de/projects',
    copy: mockCopy.projectShowcase,
  },
  argTypes: {
    block: { control: false },
    view: { control: false },
    copy: { control: false },
    basePath: { control: 'text' },
  },
} satisfies Meta<typeof ProjectShowcaseBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Deutsche Listing-Seite, Seite 1 von 3, alle Tag-Chips inaktiv. */
export const Default: Story = {};

/** Englische Listing-Route: dieselben Daten, `basePath` steuert die Linkziele. */
export const En: Story = {
  args: { basePath: '/en/projects' },
};

/** Eine Seite: die Pagination fehlt komplett (`totalPages <= 1`). */
export const SinglePage: Story = {
  args: { view: showcaseViewSinglePage },
};

/** Seite 5 von 12: beide Ellipsen und die Sprunglinks zu Seite 1 und 12. */
export const ManyPages: Story = {
  args: { view: showcaseViewManyPages },
};

/** Tag-Filter aktiv ohne Treffer: Filterzeile bleibt sichtbar, Ansage zeigt 0. */
export const FilteredEmpty: Story = {
  args: { view: showcaseViewFilteredEmpty },
};

/** Nichts veröffentlicht: keine Chips, keine Pagination, Fallback-Text aus der Copy. */
export const EmptyCollection: Story = {
  args: { view: showcaseViewEmpty },
};

/** `emptyState` im Block gesetzt: der Redaktionstext ersetzt den Copy-Fallback. */
export const CustomEmptyState: Story = {
  args: {
    block: {
      ...projectShowcaseBlock,
      emptyState: 'Die Projektliste wird gerade überarbeitet — schau später noch einmal vorbei.',
    },
    view: showcaseViewEmpty,
  },
};

/** `showFilter: false`: die Filterzeile entfällt, das Raster bleibt. */
export const WithoutFilter: Story = {
  args: { block: { ...projectShowcaseBlock, showFilter: false } },
};

/** Keine Cover: das 16:9-Band bleibt als Platzhalter, die Titel-Links tragen den Inhalt. */
export const NoCovers: Story = {
  args: { view: showcaseViewNoCovers },
};
