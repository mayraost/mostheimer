import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Page } from '@/payload-types';
import { BentoTile, Chip, CornerTicks, Eyebrow, StatusDot } from '../ui/industrial';
import { RevealGrid } from '../ui/MotionWrappers';
import { buildListingHref, pageWindow } from '@/cms/cache/frontend/routes';
import type { ProjectImage, ProjectImageSlot } from '../projects/pickImage';
import type {
  ProjectKind,
  ProjectShowcaseItem,
  ProjectShowcaseView,
} from '../projects/showcaseView';

// The tile/view model and its mapper are owned by `components/projects/` (pure,
// client-safe). Re-exported here so callers of the block import from one place.
export type {
  ProjectShowcaseItem,
  ProjectShowcaseTag,
  ProjectShowcaseView,
} from '../projects/showcaseView';
export { toShowcaseTags, toShowcaseView } from '../projects/showcaseView';

type ProjectShowcaseBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'projectShowcase' }
>;

/**
 * Shell copy of the listing (`blocks.projectShowcase.*` in the translations
 * global). The project CONTENT is `projects` data; these are the labels
 * around it (kind names, counts, filter, pagination, empty states).
 */
export type ProjectShowcaseCopy = {
  eyebrow: string;
  countSingular: string;
  countPlural: string;
  featuredLabel: string;
  detailLabel: string;
  liveLabel: string;
  githubLabel: string;
  /** Chip-row label of the tile stack row. */
  stackLabel: string;
  newTabHint: string;
  emptyLabel: string;
  paginationAria: string;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
  ofLabel: string;
  kindLabels: Record<ProjectKind, string>;
  filterLabel: string;
  filterAll: string;
  filterEmpty: string;
  filterResultCountSingular: string;
  filterResultCountPlural: string;
};

/**
 * Fills `{count}` in the result-count line. Kept local (a one-liner over a
 * template the translator owns) instead of importing the client module, so this
 * server component stays dependency-free.
 */
function fillCount(template: string, count: number): string {
  return template.replace(/\{count\}/g, String(count));
}

/**
 * Header count: `3 projects`. Singular/plural come from copy, the number from
 * the UNFILTERED published set — the header describes the collection, the
 * filter row describes the subset.
 */
function countLabel(view: ProjectShowcaseView, copy: ProjectShowcaseCopy): string {
  const total = view.totalDocs;
  const noun = total === 1 ? copy.countSingular : copy.countPlural;
  return [String(total), noun].filter(Boolean).join(' ');
}

/**
 * Tile cover. `next/image` with explicit width/height and a `sizes` hint — no
 * `fill`, so the box is reserved before the image loads (no CLS). The seed for
 * `sizes` matches the grid: 1 column < 640px, 2 < 1024px, 3 above, and 2
 * columns for the featured tile.
 */
function TileCover({
  cover,
  featured,
  alt,
}: {
  cover: ProjectImage;
  featured: boolean;
  alt: string;
}) {
  const sizes = featured
    ? '(min-width: 1024px) 66vw, (min-width: 640px) 100vw, 100vw'
    : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
  const slot: ProjectImageSlot = featured ? 'tileWide' : 'tile';
  return (
    <Image
      src={cover.url}
      alt={alt}
      width={cover.width}
      height={cover.height}
      sizes={sizes}
      data-image-slot={slot}
      className="h-auto w-full object-cover"
      // The tile is below the fold on most listings: let the browser decide.
      loading="lazy"
    />
  );
}

/**
 * One project tile.
 *
 * LINK CONTRACT (a11y + crawlers): ONE primary link per tile, the title inside
 * it, and a stretched overlay (`::after`-free, an absolutely positioned anchor
 * covering the tile) so the whole surface is clickable. The `live`/`github`
 * links are SIBLINGS of that anchor, never nested inside it — nested `<a>`
 * elements are invalid HTML and break the tab order. They sit above the overlay
 * via `relative z-10`.
 */
function ShowcaseTile({ item, copy }: { item: ProjectShowcaseItem; copy: ProjectShowcaseCopy }) {
  return (
    <BentoTile
      as="li"
      data-reveal=""
      className={[
        'spotlight-card bento-reveal group h-full transition-colors duration-200',
        item.featured
          ? 'border-primary/50 bg-surface hover:border-primary'
          : 'border-border-strong/70 bg-surface/70 hover:border-secondary/60 hover:bg-surface',
        'sm:col-span-1',
        item.featured ? 'lg:col-span-2' : '',
      ].join(' ')}
    >
      <CornerTicks className={item.featured ? 'text-primary/40' : undefined} />

      {item.cover ? (
        <div className="relative overflow-hidden border-b border-border">
          <TileCover cover={item.cover} featured={item.featured} alt={item.cover.alt} />
        </div>
      ) : (
        // No renderable upload → the tile keeps its 16:9 box and simply has no
        // image band. Nothing is announced here; the title link below is the
        // tile's content.
        <div
          className="aspect-video border-b border-border bg-surface-raised/60"
          aria-hidden="true"
        />
      )}

      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="mono-label text-muted-foreground">{copy.kindLabels[item.kind]}</span>
          {item.featured && (
            <span className="mono-label flex items-center gap-1.5 text-primary">
              <StatusDot tone="primary" />
              {copy.featuredLabel}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground">
          <Link
            href={item.href}
            className="rounded-[2px] outline-none after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group-hover:text-primary"
          >
            {item.title}
          </Link>
        </h3>

        {item.teaser && (
          <p className="text-sm leading-relaxed text-muted-foreground">{item.teaser}</p>
        )}

        {item.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={copy.stackLabel}>
            {item.stack.map((tech) => (
              <li key={tech}>
                <Chip variant="outline">{tech}</Chip>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {/* Sibling links, NOT children of the stretched anchor above. */}
          <div className="relative z-10 flex flex-wrap gap-2 empty:hidden">
            <TileExternal href={item.liveUrl} label={copy.liveLabel} hint={copy.newTabHint} />
            <TileExternal href={item.githubUrl} label={copy.githubLabel} hint={copy.newTabHint} />
          </div>
          <span className="mono-label ml-auto text-primary" aria-hidden="true">
            {copy.detailLabel} →
          </span>
        </div>
      </div>
    </BentoTile>
  );
}

/** Compact external affordance of a tile (the stretched overlay covers the rest). */
function TileExternal({ href, label, hint }: { href: string | null; label: string; hint: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mono-label inline-flex min-h-8 items-center gap-1 rounded-[4px] border border-border px-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {label}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> {hint}</span>
    </a>
  );
}

/** Filter chip state: the active chip is a `<span>`, never a link to itself. */
const CHIP_BASE =
  'mono-label inline-flex min-h-11 items-center gap-2 rounded-[4px] border px-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const CHIP_ACTIVE = 'border-primary bg-primary-muted text-primary';
const CHIP_IDLE =
  'border-border-strong bg-transparent text-foreground hover:border-secondary hover:text-secondary';

/** One chip of the tag row: `<a>` when inactive, `<span aria-current>` when active. */
function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  const content = (
    <>
      {active && <StatusDot tone="primary" />}
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className="tabular-nums text-muted-foreground">{count}</span>
      )}
    </>
  );
  if (active) {
    return (
      <li>
        {/* aria-current carries the state for assistive tech; the visible state
            is border + fill + dot, so colour is never the only signal. */}
        <span aria-current="true" className={[CHIP_BASE, CHIP_ACTIVE].join(' ')}>
          {content}
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className={[CHIP_BASE, CHIP_IDLE].join(' ')}>
        {content}
      </Link>
    </li>
  );
}

/**
 * "All" + one chip per tag. The active chip keeps the current page; switching a
 * tag resets to page 1 (design § 10.1) — `buildListingHref` owns both rules and
 * never emits `?page=1`.
 */
function FilterRow({
  view,
  basePath,
  copy,
}: {
  view: ProjectShowcaseView;
  basePath: string;
  copy: ProjectShowcaseCopy;
}) {
  return (
    <nav aria-label={copy.filterLabel} className="mb-4">
      <ul className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListingHref({ basePath, tag: null, page: view.currentPage })}
          label={copy.filterAll}
          active={view.activeTag === null}
        />
        {view.tags.map((tag) => (
          <FilterChip
            key={tag.slug}
            href={buildListingHref({ basePath, tag: tag.slug })}
            label={tag.label}
            count={tag.count}
            active={view.activeTag === tag.slug}
          />
        ))}
      </ul>
    </nav>
  );
}

/**
 * Filtered result announcement (`aria-live="polite"`). Rendered only while a
 * tag filter is active — the unfiltered count already sits in the section
 * header, so repeating it would double-announce the same number.
 */
function ResultCount({ view, copy }: { view: ProjectShowcaseView; copy: ProjectShowcaseCopy }) {
  const template =
    view.items.length === 1 ? copy.filterResultCountSingular : copy.filterResultCountPlural;
  return (
    <p className="mono-label mb-4 text-muted-foreground" aria-live="polite" aria-atomic="true">
      {fillCount(template, view.items.length)}
    </p>
  );
}

/**
 * Numbered pagination.
 *
 * Every entry is a `next/link` (renders a real `<a href>` — works without JS,
 * crawlable — but navigates client-side instead of reloading the page); the current
 * page is a `<span aria-current="page">`, NOT a link to itself. Prev/next are
 * `<span>`s when there is nowhere to go (`aria-disabled` + visually muted, kept
 * `aria-hidden` so a screen reader does not announce a dead control), and real
 * links otherwise — those carry the plain-language label in `aria-label` and the
 * glyph stays decorative. Gaps are `<span aria-hidden>` ellipses plus an
 * `sr-only` notice, so a jump of many pages is still announced.
 *
 * 44px targets (`min-h-11 min-w-11`), `tabular-nums` digits (no width jitter),
 * focus ring via `focus-visible`.
 */
function Pagination({
  view,
  basePath,
  copy,
}: {
  view: ProjectShowcaseView;
  basePath: string;
  copy: ProjectShowcaseCopy;
}) {
  // One page needs no navigation chrome at all.
  if (view.totalPages <= 1) return null;
  const { currentPage, totalPages } = view;

  const href = (page: number) => buildListingHref({ basePath, tag: view.activeTag, page });
  const stepClass = 'mono-label inline-flex min-h-11 min-w-11 items-center justify-center px-3';

  const pages = pageWindow(currentPage, totalPages, 1);
  const first = pages[0];
  const last = pages[pages.length - 1];
  const showFirstEllipsis = first > 1;
  const showLastEllipsis = last < totalPages;

  return (
    <nav aria-label={copy.paginationAria} className="mt-8 border-t border-border pt-6">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {currentPage > 1 ? (
            <Link
              href={href(currentPage - 1)}
              rel="prev"
              aria-label={copy.prevLabel}
              className={`${stepClass} rounded-[4px] border border-border-strong text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
            >
              <span aria-hidden="true">←</span>
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className={`${stepClass} rounded-[4px] border border-border text-muted-foreground/50`}
            >
              ←
            </span>
          )}
        </li>

        {showFirstEllipsis && (
          <>
            <li>
              <Link
                href={href(1)}
                className={`${stepClass} rounded-[4px] border border-border-strong tabular-nums text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                1
              </Link>
            </li>
            <li>
              <span aria-hidden="true" className="mono-label px-1 text-muted-foreground">
                …
              </span>
              <span className="sr-only">
                {[copy.pageLabel, `2–${first - 1}`, copy.ofLabel, totalPages].join(' ')}
              </span>
            </li>
          </>
        )}

        {pages.map((page) =>
          page === currentPage ? (
            <li key={page}>
              <span
                aria-current="page"
                className={`${stepClass} rounded-[4px] border border-primary bg-primary-muted tabular-nums font-semibold text-primary`}
              >
                {page}
              </span>
            </li>
          ) : (
            <li key={page}>
              <Link
                href={href(page)}
                className={`${stepClass} rounded-[4px] border border-border-strong tabular-nums text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                {page}
              </Link>
            </li>
          ),
        )}

        {showLastEllipsis && (
          <>
            <li>
              <span aria-hidden="true" className="mono-label px-1 text-muted-foreground">
                …
              </span>
              <span className="sr-only">
                {[copy.pageLabel, `${last + 1}–${totalPages}`, copy.ofLabel, totalPages].join(' ')}
              </span>
            </li>
            <li>
              <Link
                href={href(totalPages)}
                className={`${stepClass} rounded-[4px] border border-border-strong tabular-nums text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                {totalPages}
              </Link>
            </li>
          </>
        )}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={href(currentPage + 1)}
              rel="next"
              aria-label={copy.nextLabel}
              className={`${stepClass} rounded-[4px] border border-border-strong text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
            >
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className={`${stepClass} rounded-[4px] border border-border text-muted-foreground/50`}
            >
              →
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

/**
 * Project-Showcase: the paginated, tag-filtered listing of `projects`.
 *
 * PURE RENDERER (server component, synchronous): the page resolves the data
 * (`getCachedProjectPage`, `getCachedProjectTags`) and the URL state
 * (`?page=`, `?tag=`) and hands them in — the block never reads
 * `searchParams` itself, so it stays renderable from the live preview
 * (design § 3). Zero client JS: pagination and filtering are `<a href>`s.
 *
 * Structure: `<h2>` heading, tiles `<h3>` inside `<li>` of a `<ul>`, the filter
 * `<nav>` above the grid, the pagination `<nav>` below it. The filter row is
 * never hidden — an empty result must keep the way back visible.
 */
export function ProjectShowcaseBlock({
  block,
  view,
  basePath,
  copy,
}: {
  block: ProjectShowcaseBlockData;
  /** Resolved listing: tile slice, request state and chip row. */
  view: ProjectShowcaseView;
  /** Listing route of the current locale (`/de/projects`). */
  basePath: string;
  /** Shell copy (`blocks.projectShowcase`), read by the dispatcher. */
  copy: ProjectShowcaseCopy;
}) {
  const showFilter = block.showFilter ?? true;
  // A tag filter narrows the set: the "no projects yet" state then describes
  // the filter, not the collection (and is announced with a count of 0).
  const isFiltered = view.activeTag !== null;
  const emptyText = block.emptyState?.trim() || copy.emptyLabel;

  return (
    <section className="w-full scroll-mt-24 pt-6 pb-16 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 border-b border-border pb-6">
          <Eyebrow>{block.eyebrow?.trim() || copy.eyebrow}</Eyebrow>
          {block.heading && (
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl">
              {block.heading}
            </h2>
          )}
          {block.intro && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {block.intro}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip variant="fill">{countLabel(view, copy)}</Chip>
          </div>
        </div>

        {showFilter && view.tags.length > 0 && (
          <FilterRow view={view} basePath={basePath} copy={copy} />
        )}

        {isFiltered && <ResultCount view={view} copy={copy} />}

        {view.items.length === 0 ? (
          <BentoTile className="p-6">
            {isFiltered ? (
              <p className="text-base leading-relaxed text-foreground" aria-live="polite">
                {copy.filterEmpty}
              </p>
            ) : (
              <p className="text-base leading-relaxed text-foreground">{emptyText}</p>
            )}
          </BentoTile>
        ) : (
          <RevealGrid as="ul" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {view.items.map((item) => (
              <ShowcaseTile key={item.id ?? item.slug} item={item} copy={copy} />
            ))}
          </RevealGrid>
        )}

        <Pagination view={view} basePath={basePath} copy={copy} />
      </div>
    </section>
  );
}
