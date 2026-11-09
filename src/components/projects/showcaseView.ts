import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { ProjectListingPage, Project, ProjectTagDoc } from '@/cms/cache/frontend/queries';
import { normalizeTagSlug, projectPath } from '@/cms/cache/frontend/routes';
import type { ProjectImage } from './pickImage';
import { pickProjectImage } from './pickImage';

/**
 * View model of the projects listing — the ONE mapping from documents to the
 * tiles the renderers draw.
 *
 * Why a mapper and not inline JSX reads: the same list is rendered by three
 * surfaces (public listing block, live-preview page, JSON-LD `ItemList`), and
 * the last time a property was derived in three places it disagreed with itself
 * (see AGENTS.md § Navigation: `isEmphasis`). Everything that is a decision
 * lives here; the renderers only draw.
 *
 * PURE: no cache, no Payload, no `next/*` imports — client-safe for the live
 * preview.
 */

export type ProjectKind = 'experiment' | 'tool' | 'product';

/** One tile. Every optional field is already normalized to `null`, never `''`. */
export type ProjectShowcaseItem = {
  id: number | null;
  slug: string;
  title: string;
  teaser: string;
  kind: ProjectKind;
  /** Link target of the detail route (locale-prefixed, absolute path). */
  href: string;
  featured: boolean;
  /** Cover in the tile crop; `null` when the upload has no renderable URL. */
  cover: ProjectImage | null;
  stack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
};

/** One filter chip: tag slug, visible label (locale-resolved), published count. */
export type ProjectShowcaseTag = { slug: string; label: string; count: number };

const KIND_VALUES: readonly ProjectKind[] = ['experiment', 'tool', 'product'];

/**
 * A `kind` outside the three known values is coerced to `experiment` instead of
 * being dropped: the tile still renders, and the label lookup cannot fall
 * through to an unlabeled chip.
 */
export function toProjectKind(value: string | null | undefined): ProjectKind {
  return KIND_VALUES.find((kind) => kind === value) ?? 'experiment';
}

/** Trims an optional URL and keeps only absolute http(s) targets. */
function safeUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

/**
 * Document → tile.
 *
 * `locale` decides the href only (`/de/projects/<slug>`). The project's own
 * fields are already locale-resolved by the cached read.
 */
export function toShowcaseItem(
  project: Project,
  locale: FrontendLocale,
): ProjectShowcaseItem | null {
  if (!project) return null;
  const slug = project.slug?.trim();
  if (!slug) return null;
  return {
    id: typeof project.id === 'number' ? project.id : null,
    slug,
    title: project.title ?? '',
    teaser: project.teaser ?? '',
    kind: toProjectKind(project.kind),
    href: projectPath(locale, slug),
    featured: Boolean(project.featured),
    cover: pickProjectImage(project.coverImage, 'tile'),
    stack: (project.stack ?? []).map((entry) => entry.trim()).filter(Boolean),
    liveUrl: safeUrl(project.liveUrl),
    githubUrl: safeUrl(project.githubUrl),
  };
}

/**
 * The tag chips of the filter row.
 *
 * Counts are the UNFILTERED published count per tag (design § 10.4: the row
 * describes the whole set, so the numbers never change while filtering).
 * Tags without a project are omitted — a chip that always leads to the empty
 * state is noise, and a tag created before its first project appears with it.
 */
export function toShowcaseTags(
  tags: readonly ProjectTagDoc[],
  counts: ReadonlyMap<string, number>,
): ProjectShowcaseTag[] {
  const seen = new Set<string>();
  const result: ProjectShowcaseTag[] = [];
  for (const tag of tags) {
    if (!tag) continue;
    const slug = normalizeTagSlug(tag.slug);
    if (!slug || seen.has(slug)) continue;
    const count = counts.get(slug) ?? 0;
    if (count <= 0) continue;
    seen.add(slug);
    result.push({ slug, label: tag.label?.trim() || slug, count });
  }
  return result;
}

/**
 * Tag slug of the request, resolved against the REAL tag set.
 *
 * An unknown `?tag=` renders the unfiltered listing (design § 10.1) — never an
 * empty page a dead chip could not recover from. The URL stays `noindex`, which
 * the page decides from `hasTagParam`.
 */
export function resolveActiveTag(
  requested: string | null | undefined,
  tags: readonly ProjectShowcaseTag[],
): string | null {
  const slug = normalizeTagSlug(requested ?? null);
  if (!slug) return null;
  return tags.some((tag) => tag.slug === slug) ? slug : null;
}

/**
 * Listing view model handed to the block: the tiles of the rendered page plus
 * the request state the chrome needs.
 */
export type ProjectShowcaseView = {
  items: ProjectShowcaseItem[];
  /** Published projects in the whole (unfiltered) set. */
  totalDocs: number;
  /** Pages for the active filter — the pagination chrome. */
  totalPages: number;
  currentPage: number;
  tags: ProjectShowcaseTag[];
  activeTag: string | null;
};

/** Maps one cached listing page + chip row onto the view model. */
export function toShowcaseView(
  locale: FrontendLocale,
  listing: ProjectListingPage,
  tags: readonly ProjectShowcaseTag[],
): ProjectShowcaseView {
  return {
    items: listing.docs.flatMap((doc) => {
      const item = toShowcaseItem(doc, locale);
      return item ? [item] : [];
    }),
    totalDocs: listing.totalDocs,
    totalPages: listing.totalPages,
    currentPage: listing.page,
    tags: [...tags],
    activeTag: resolveActiveTag(listing.tagSlug, tags),
  };
}
