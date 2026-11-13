import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Project } from '@/cms/cache/frontend/queries';
import type { Page } from '@/payload-types';
import { PROJECT_SHOWCASE_SLUG, projectPath } from '@/cms/cache/frontend/routes';
import type { ProjectImage } from './pickImage';
import { pickProjectImage } from './pickImage';
import type { ProjectKind } from './showcaseView';
import { toProjectKind } from './showcaseView';

/**
 * View model of ONE projects project (`/[locale]/projects/<slug>`).
 *
 * Same reasoning as `showcaseView.ts`: the public route, the live preview and
 * the JSON-LD/OG metadata all read the same normalized shape instead of
 * re-deriving "which image, is the URL safe, which kind" three times.
 *
 * PURE and client-safe (no `next/*`, no Payload config).
 */

/** A narrative section: label copy comes from `routes.project.*`. */
export type ProjectSectionKey = 'context' | 'approach' | 'learnings' | 'outcome';

/**
 * Lexical document type. Taken from the `pages` rich-text BLOCK because it is
 * structurally identical to the project's `approach` field (same node union)
 * and is available without a circular import from the cache layer.
 */
type LexicalContent = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'richText' }
>['content'];

export type ProjectView = {
  id: number | null;
  slug: string;
  title: string;
  teaser: string;
  kind: ProjectKind;
  /** Locale-prefixed route of this project (`/de/projects/<slug>`). */
  path: string;
  /** Listing route of this locale (`/de/projects`) — breadcrumb + back link. */
  listingPath: string;
  /** Wide hero image (`hero` variant, falls back to the original). */
  hero: ProjectImage | null;
  /** Tile crop, used as the OG/JSON-LD image when no hero exists. */
  cover: ProjectImage | null;
  stack: string[];
  tags: { slug: string; label: string }[];
  liveUrl: string | null;
  githubUrl: string | null;
  /** Optional component documentation (Storybook) — `null` when not provided. */
  storybookUrl: string | null;
  /** `\n\n`-separated CMS textareas, already split into paragraphs. */
  context: string[];
  learnings: string[];
  outcome: string[];
  /** Lexical document — rendered by the CMS rich-text renderer. */
  approach: LexicalContent | null;
  updatedAt: string | null;
};

/** `\n\n` = paragraph break (the admin field description promises exactly that). */
function paragraphs(value: string | null | undefined): string[] {
  return (
    value
      ?.split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean) ?? []
  );
}

function safeUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

/** Document → detail view. `null` when the document has no usable slug. */
export function toProjectView(project: Project, locale: FrontendLocale): ProjectView | null {
  if (!project) return null;
  const slug = project.slug?.trim();
  if (!slug) return null;
  const cover = pickProjectImage(project.coverImage, 'tile');
  return {
    id: typeof project.id === 'number' ? project.id : null,
    slug,
    title: project.title ?? '',
    teaser: project.teaser ?? '',
    kind: toProjectKind(project.kind),
    path: projectPath(locale, slug),
    listingPath: `/${locale}/${PROJECT_SHOWCASE_SLUG}`,
    hero: pickProjectImage(project.coverImage, 'hero') ?? cover,
    cover,
    stack: (project.stack ?? []).map((entry) => entry.trim()).filter(Boolean),
    tags: (project.tags ?? []).flatMap((tag) => {
      if (!tag || typeof tag !== 'object') return [];
      const tagSlug = tag.slug?.trim();
      if (!tagSlug) return [];
      return [{ slug: tagSlug, label: tag.label?.trim() || tagSlug }];
    }),
    liveUrl: safeUrl(project.liveUrl),
    githubUrl: safeUrl(project.githubUrl),
    storybookUrl: safeUrl(project.storybookUrl),
    context: paragraphs(project.context),
    learnings: paragraphs(project.learnings),
    outcome: paragraphs(project.outcome),
    approach: project.approach ?? null,
    updatedAt: project.updatedAt ?? null,
  };
}

/** True when the section has anything to render (no empty headings). */
export function hasSection(view: ProjectView, section: ProjectSectionKey): boolean {
  switch (section) {
    case 'approach':
      return Boolean(view.approach && view.approach.root);
    default:
      return view[section].length > 0;
  }
}
