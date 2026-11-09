import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { VibeProject } from '@/cms/cache/frontend/queries';
import type { Page } from '@/payload-types';
import { VIBE_SHOWCASE_SLUG, vibeProjectPath } from '@/cms/cache/frontend/routes';
import type { VibeImage } from './pickImage';
import { pickVibeImage } from './pickImage';
import type { VibeKind } from './showcaseView';
import { toVibeKind } from './showcaseView';

/**
 * View model of ONE vibe-coding project (`/[locale]/vibe-coding/<slug>`).
 *
 * Same reasoning as `showcaseView.ts`: the public route, the live preview and
 * the JSON-LD/OG metadata all read the same normalized shape instead of
 * re-deriving "which image, is the URL safe, which kind" three times.
 *
 * PURE and client-safe (no `next/*`, no Payload config).
 */

/** A narrative section: label copy comes from `routes.vibeProject.*`. */
export type VibeSectionKey = 'context' | 'approach' | 'learnings' | 'outcome';

/**
 * Lexical document type. Taken from the `pages` rich-text BLOCK because it is
 * structurally identical to the project's `approach` field (same node union)
 * and is available without a circular import from the cache layer.
 */
type LexicalContent = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'richText' }
>['content'];

export type VibeProjectView = {
  id: number | null;
  slug: string;
  title: string;
  teaser: string;
  kind: VibeKind;
  /** Locale-prefixed route of this project (`/de/vibe-coding/<slug>`). */
  path: string;
  /** Listing route of this locale (`/de/vibe-coding`) — breadcrumb + back link. */
  listingPath: string;
  /** Wide hero image (`vibeHero` variant, falls back to the original). */
  hero: VibeImage | null;
  /** Tile crop, used as the OG/JSON-LD image when no hero exists. */
  cover: VibeImage | null;
  stack: string[];
  tags: { slug: string; label: string }[];
  liveUrl: string | null;
  githubUrl: string | null;
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
export function toProjectView(
  project: VibeProject,
  locale: FrontendLocale,
): VibeProjectView | null {
  if (!project) return null;
  const slug = project.slug?.trim();
  if (!slug) return null;
  const cover = pickVibeImage(project.coverImage, 'tile');
  return {
    id: typeof project.id === 'number' ? project.id : null,
    slug,
    title: project.title ?? '',
    teaser: project.teaser ?? '',
    kind: toVibeKind(project.kind),
    path: vibeProjectPath(locale, slug),
    listingPath: `/${locale}/${VIBE_SHOWCASE_SLUG}`,
    hero: pickVibeImage(project.coverImage, 'hero') ?? cover,
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
    context: paragraphs(project.context),
    learnings: paragraphs(project.learnings),
    outcome: paragraphs(project.outcome),
    approach: project.approach ?? null,
    updatedAt: project.updatedAt ?? null,
  };
}

/** True when the section has anything to render (no empty headings). */
export function hasSection(view: VibeProjectView, section: VibeSectionKey): boolean {
  switch (section) {
    case 'approach':
      return Boolean(view.approach && view.approach.root);
    default:
      return view[section].length > 0;
  }
}
