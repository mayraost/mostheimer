# Design: Project-Coding Showcase (`projects` collection + `projectShowcase` block)

`/home/devagent/.local/share/opencode/worktree/f0fd50/projects` · read-only design.

**Fixed model:** separate collection **`projects`**; listing = CMS page `pages.slug='projects'` with
block **`projectShowcase`**; detail = `/[locale]/projects/[project]`.

**Why the collection:** proxy slug cache, 404-in-proxy, sitemap and the purge registry assume "one document =
one route" (slash-slugs overload `pages.slug`); per-project drafts need their own version row and
`afterChange` (a block shares the page's draft); `?page=N` needs a countable set outside `pages.layout`;
media/SEO map 1:1 to documents; per-project flush without dropping the page set.

---

## 1. Routing

| URL                               | Owner                      | Proxy branch                     |
| --------------------------------- | -------------------------- | -------------------------------- |
| `/[locale]/projects`           | `pages.slug='projects'` | existing `publishedSlugStatus`   |
| `/[locale]/projects/[project]` | collection doc             | new `publishedProjectStatus` |

```ts
// src/proxy.ts — `projects` is NOT a STATIC_CHILD_ROUTE; only its one-segment child is special.
async function handleLocalizedRequest(request: NextRequest, locale: FrontendLocale) {
  const { pathname } = request.nextUrl;
  const slug = pathnameToSlug(locale, pathname);
  if (slug === null || slug === '') return forward(request, pathname, locale);
  if (STATIC_CHILD_ROUTES.has(slug.split('/')[0] ?? '')) return forward(request, pathname, locale);

  const [head, child, ...rest] = slug.split('/');
  if (head === 'projects' && child && rest.length === 0) {
    const status = await publishedProjectStatus(child);
    return forward(request, pathname, locale, status === 'missing' ? 404 : undefined);
  }
  const status = await publishedSlugStatus(slug);
  return forward(request, pathname, locale, status === 'missing' ? 404 : undefined);
}
```

`notFound()` in `generateMetadata` does **not** work here: the route sits in the streaming `[locale]` shell, so
the status freezes at 200 (`AGENTS.md` § "404-Handling"). Keep `NextResponse.next({ status: 404 })`; the route
still calls `notFound()` so the segment's own `not-found.tsx` renders. In `src/proxy-slug-cache.ts` add a
**second independent snapshot** (mirror `loadSlugs`/`snapshotStillValid`/`publishedSlugStatus`, one `find` on
`projects`, `depth:0`, `select:{slug:true}`, published only, plus the count + newest-`updatedAt` probe):

```ts
export async function publishedProjectStatus(
  slug: string,
): Promise<'exists' | 'missing' | 'unknown'>;
```

Same 60 s negative TTL, single-flight, fail-open — a new project is reachable within 60 s.

---

## 2. `src/cms/collections/Projects.ts`

```ts
import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { protectedAuthorshipFields } from '../security/authorship';
import { wordingBeforeValidate } from '../wording/beforeValidateWordingCheck';
import {
  revalidateProjectCache,
  revalidatePreviousProjectCache,
} from '../cache/frontend/frontendCache';

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project-Projekt', plural: 'Project-Projekte' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'kind', 'order', 'featured', 'updatedAt'],
    group: 'Content',
    livePreview: {
      // Relative URL: Payload injects the admin origin (works through the tunnel).
      url: ({ data, locale }) =>
        `/${locale?.code ?? 'en'}/preview/project?slug=${data?.slug ?? ''}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 720 },
      ],
    },
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  versions: { drafts: true },
  hooks: {
    beforeValidate: [wordingBeforeValidate],
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateProjectCache(doc.slug);
        revalidatePreviousProjectCache(previousDoc?.slug, doc.slug);
      },
    ],
    afterDelete: [({ doc }) => revalidateProjectCache(doc.slug)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-Segment /de/projects/<slug> (nicht übersetzen)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            (value || String(data?.title ?? ''))
              .toLowerCase()
              .normalize('NFKD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
        ],
      },
    },
    {
      name: 'teaser',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 220,
      admin: { description: 'Tile-Teaser + Fallback für die Meta-Description' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'experiment',
      options: [
        { label: 'Experiment', value: 'experiment' },
        { label: 'Tool', value: 'tool' },
        { label: 'Produkt', value: 'product' },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Tile-Preview (16:9); Alt-Text ist im Media-Dokument Pflicht' },
    },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'stack',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Chips, z. B. "Next.js 16" (Reihenfolge = Anzeige)' },
    },
    { name: 'liveUrl', type: 'text', admin: { description: 'Externe Demo (https://…)' } },
    { name: 'githubUrl', type: 'text', admin: { description: 'Repo (https://github.com/…)' } },
    // Filter tags — CMS-managed collection (§10), NOT a select enum.
    { name: 'tags', type: 'relationship', relationTo: 'projectTags', hasMany: true, index: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      index: true,
      admin: { position: 'sidebar', description: 'Aufsteigend; Gleichstand → neueste zuerst' },
    },
    // -- Case study (localized) ------------------------------------------------
    {
      name: 'context',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Ausgangslage (\\n\\n = Absatz)' },
    },
    {
      name: 'approach',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({}),
      admin: { description: 'Wie gebaut / AI-assisted: Schleifen, Prompts, Werkzeuge' },
    },
    {
      name: 'learnings',
      type: 'textarea',
      localized: true,
      admin: { description: 'Was lief schief, was würde ich anders machen' },
    },
    {
      name: 'outcome',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ergebnis & Wirkung' },
    },
    ...protectedAuthorshipFields(), // LAST — users must never leak via relations
  ],
};
```

`src/payload.config.ts`: add to `collections`, add an MCP `collections.projects` entry (content goes
through the MCP), add the media variants of §4.

---

## 3. Block `projectShowcase`

A block, not a route component: the page keeps its editorial frame in `pages`; the listing is a data
projection belonging to exactly one URL.

```ts
// src/cms/blocks/ProjectShowcase.ts — add to allBlocks, components/blocks.tsx AND preview/PreviewBlocks.tsx
import type { Block } from 'payload';

export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  labels: { singular: 'Project-Showcase', plural: 'Project-Showcases' },
  interfaceName: 'ProjectShowcaseBlock',
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'emptyState', type: 'textarea', localized: true },
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 6,
      min: 3,
      max: 12,
      admin: { description: 'Tiles pro Seite — Teil der Edge-Purge-URL-Liste' },
    },
    { name: 'featureFirst', type: 'checkbox', defaultValue: true },
  ],
};
```

**Placed twice:** `blocks` fields have no row limit, so the renderer guards — the `projectShowcase` case checks
`index === layout.findIndex((b) => b.blockType === 'projectShowcase')`; later occurrences render nothing
(`console.warn` in dev). Two listings would duplicate the `?page=N` set, the `aria-current` landmark and the
`ItemList` JSON-LD.

```ts
// src/components/blocks/projectPagination.ts — client-safe, pure
export type PageRequest = { page: number; isCanonical: boolean };
/** absent → {1,true}; `?page=2` → {2,true}; `?page=1|02|0|abc` → parsed, isCanonical:false */
export function parsePageRequest(raw: string | string[] | undefined): PageRequest;
/** Page 1 is ALWAYS the bare URL (never `?page=1`). */
export function projectPageHref(basePath: string, page: number): string;

// -- tag filter (see §10) ---------------------------------------------------
/** Invalid/unknown → null (= unfiltered). Normalised lowercase, `[a-z0-9-]` only. */
export function parseTagParam(raw: string | string[] | undefined): string | null;
/** Single URL builder: tag kept across pages, page reset on tag change. */
export function buildListingHref(input: {
  basePath: string;
  tag?: string | null;
  page?: number;
}): string;
```

```tsx
// src/components/blocks/ProjectShowcaseBlock.tsx — pure prop renderer (server + preview)
export type ProjectShowcaseItem = {
  slug: string;
  title: string;
  teaser: string;
  kind: 'experiment' | 'tool' | 'product';
  stack: string[];
  featured: boolean;
  cover: { url: string; width: number; height: number; alt: string } | null;
  href: string;
  liveUrl: string | null;
  githubUrl: string | null;
};
export type ProjectShowcaseCopy = {
  eyebrow: string;
  countSingular: string;
  countPlural: string;
  featuredLabel: string;
  detailLabel: string;
  liveLabel: string;
  githubLabel: string;
  newTabHint: string;
  emptyLabel: string;
  paginationAria: string;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
  ofLabel: string;
  kindLabels: Record<'experiment' | 'tool' | 'product', string>;
  // filter chrome (§10)
  filterLabel: string;
  filterAll: string;
  filterEmpty: string;
  /** `{count}` placeholder, singular/plural forms. */
  filterResultCountSingular: string;
  filterResultCountPlural: string;
};
export type ProjectShowcaseTag = { slug: string; label: string; count: number };
export function ProjectShowcaseBlock(props: {
  block: ProjectShowcaseBlockData;
  items: ProjectShowcaseItem[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nonCanonicalParams: boolean;
  basePath: string;
  /** All tags with published counts (unfiltered) — drives the chip row. */
  tags: ProjectShowcaseTag[];
  /** Active tag slug, or null for "all". */
  activeTag: string | null;
  copy: ProjectShowcaseCopy;
}): React.JSX.Element;
```

Invariants (tests §9): `<h2>` heading, tiles `<h3>` in `<li>` of `<ul>`; **one** primary link per tile (cover
`<a href={item.href}>` + stretched overlay, never nested `<a>`); `liveUrl`/`githubUrl` are sibling links with
`rel="noopener noreferrer"`, `target="_blank"`, `newTabHint` in `<span class="sr-only">`; pagination is `<nav
aria-label>` with real `<a href>`, current page a `<span aria-current="page">` (not a link), prev/next
`rel="prev|next"`, nav omitted when `totalPages <= 1`; zero client JS (page from `searchParams`).

**Tag row** (rendered above the grid, between the section header and the grid): `<nav aria-label={copy.filterLabel}>`
with `<a href>` chips — `filterAll` first, then one chip per tag. The active chip is a `<span
aria-current="true">` with `aria-current`-parity styling (visible outline + colour, not colour alone); chips are
never `<button>` (crawlable, works with JS disabled). `filterAll` is active when `activeTag === null`; an
`aria-live="polite"` line below the row announces `filterResultCount` (`{count}` interpolated). Empty result
set → `filterEmpty` inside the grid area, the tag row stays visible (never hide the way back).

---

## 4. Media variants (`src/payload.config.ts`) + picker

```ts
media: {
  formatOptions: { format: 'webp' },
  variants: [
    { name: 'thumbnail', width: 400, height: 300, position: 'centre' },      // existing
    { name: 'card', width: 768, height: 1024, position: 'centre' },          // existing (3:4)
    { name: 'tile', width: 768, height: 432, position: 'centre' },       // 16:9 tile
    { name: 'tileWide', width: 1280, height: 720, position: 'centre' },  // 16:9 featured (2 cols)
    { name: 'hero', width: 1920, height: 800, position: 'centre' },      // wide detail hero (12:5)
  ],
}
```

```ts
// src/components/projects/pickImage.ts — pure, shared by route + preview
export function pickProjectImage(media: Media | string | null, slot: 'tile' | 'tileWide' | 'hero') {
  if (!media || typeof media === 'string') return null;
  const variant =
    media.sizes?.[{ tile: 'tile', tileWide: 'tileWide', hero: 'hero' }[slot]];
  const src = variant?.url ?? media.url; // fallback for uploads predating the variants
  return src
    ? {
        url: src,
        width: variant?.width ?? media.width ?? 1280,
        height: variant?.height ?? media.height ?? 720,
        alt: media.alt ?? '',
      }
    : null;
}
```

`next/image` with explicit `width`/`height` (no `fill` → no CLS) and `sizes`: tile `(min-width:1024px) 33vw,
(min-width:640px) 50vw, 100vw`, featured `66vw`, hero `100vw`. OG stays `ogImageUrl(...)`.

---

## 5. Detail route

```
src/app/(frontend)/[locale]/projects/[project]/page.tsx        NEW
src/app/(frontend)/[locale]/projects/[project]/not-found.tsx   NEW
src/app/(frontend)/[locale]/preview/project/page.tsx              NEW
```

A static literal `projects` beside `[[...slug]]` is legal (only `[locale]` is dynamic) and wins over the
catch-all. `generateStaticParams()` → `['en','de'].map((locale) => ({ locale }))` (no project slugs: the build
has no DB), `export const instant = false;`, `await connection()`. `getCachedProject(slug, locale)`;
`if (!project) notFound()` in metadata **and** body.

Draft safety: public reader `draft:false` + `overrideAccess:true` (published gate in `access.read`); preview
`draft:true, overrideAccess:false, user` (`AGENTS.md` § "Local API") — drafts never reach the public path and
`createdBy`/`updatedBy` stay unreadable.

Metadata: canonical `/{locale}/projects/{slug}`, `languages {en, de, 'x-default': de}`, OG via
`ogImageUrl`; no `opengraph-image.tsx` under the dynamic parent. `preview/project/page.tsx` mirrors
`preview/page.tsx` and renders `PreviewProject` from the pure mapper `toProjectView(project)`
(`src/components/projects/projectView.ts`), shared with the public route.

**JSON-LD** (`src/components/StructuredData.tsx`): detail → `WebPage` + `mainEntity: CreativeWork` (`creator:
personRef()`, `keywords: stack`, `url: liveUrl`, `codeRepository: githubUrl`, `image: cover`) +
`BreadcrumbList` (Home → Projects → project). Listing → `WebPage` + `ItemList` of the **rendered page's**
items (`numberOfItems: totalDocs`). `CreativeWork` because `SoftwareSourceCode` implies a public source tree,
`TechArticle` is documentation, `Product` needs an offer (invalid otherwise).

---

## 6. Cache layer + `?page=N`

```ts
// constants.ts
projects: 'cms:projects',
project: (slug: string) => `cms:projects:${slug}`,
projectShowcase: 'cms:project-showcase',
projectTags: 'cms:project-tags',

// queries.ts — 'use cache' + cacheLife(CACHE_PROFILES.page) + build guards like getCachedPageBySlug
getCachedProjectStatic(slug, locale)                              // ALL, projects, project(slug)
getCachedProjectPageStatic(locale, page, pageSize, featureFirst, tagSlug?)  // ALL, projectShowcase
  // where: { _status: published, ...(tagSlug ? { 'tags.slug': { equals: tagSlug } } : {}) }
  // → { docs, totalDocs, totalPages, page }; registerProjectSlugs(…), registerProjectShowcaseTagCount(…)
getCachedProjectTags(locale)                                             // chips: ALL, projectTags
getCachedAllProjects()                                            // sitemap: ALL, projects, sitemap

// revalidate.ts
export function revalidateProjectCache(slug?: string | null): void {
  if (!slug) return;
  safeRevalidate(CACHE_TAGS.project(normalizeSlug(slug)), `project ${slug}`);
  safeRevalidate(CACHE_TAGS.projects, 'projects domain');
  safeRevalidate(CACHE_TAGS.projectShowcase, 'project showcase listing');
  safeRevalidate(CACHE_TAGS.sitemap, 'sitemap (project changed)');
}
export function revalidatePreviousProjectCache(prev?: string | null, next?: string | null): void;
/** Called from ProjectTags afterChange/afterDelete: rename/delete changes every ?tag= variant. */
export function revalidateProjectTagsCache(slug?: string | null): void {
  safeRevalidate(CACHE_TAGS.projectTags, 'project tags');
  safeRevalidate(CACHE_TAGS.projectShowcase, 'project showcase (tag set changed)');
  revalidateProjectShowcaseListingEverywhere(); // SAME prefix purge as a page-set change
}

// route registries, next to KNOWN_SLUGS
const KNOWN_PROJECT_SLUGS = new Set<string>();
const PROJECT_SHOWN_PAGES = new Map<string, number>(); // listingPath → pages seen in the last render
export function registerProjectSlugs(slugs: readonly string[]): void;
export function registerProjectShowcasePageCount(listingPath: string, totalPages: number): void;
/** DB-derived variant list (one `find` with limit:0 → totalDocs). */
export async function projectShowcaseVariantPaths(
  pageSize: number,
): Promise<{ pages: string[]; details: string[] }>;

export function edgePurgePathsForTag(tag: string, slugs = [...KNOWN_SLUGS]): string[] {
  const detail = (slug: string) => FRONTEND_LOCALES.map((l) => `/${l}/projects/${slug}`);
  const variants = (totalPages: number) =>
    FRONTEND_LOCALES.flatMap((l) => [
      `/${l}/projects`,
      ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => `/${l}/projects?page=${i + 2}`),
    ]);
  if (tag === CACHE_TAGS.ALL || tag === CACHE_TAGS.projects || tag === CACHE_TAGS.projectShowcase) {
    return [...contentPaths, ...variants(1), ...[...KNOWN_PROJECT_SLUGS].flatMap(detail)];
  }
  if (tag.startsWith('cms:projects:')) {
    return detail(normalizeSlug(tag.slice('cms:projects:'.length)));
  }
  /* … existing branches unchanged … */
}
```

**`?tag=` variants are covered by the same prefix purge.** The listing subtree (bare URL, `?page=N`,
`?tag=<slug>`, `?tag=<slug>&page=N`) is evicted with ONE prefix purge of `/de/projects` and `/en/projects`
(both content hosts) — no per-tag enumeration needed, and a tag-only rename/delete needs exactly that same
prefix purge (a deleted tag's URLs then self-heal to the unfiltered listing on the next request). Only a
project *set* change uses the exact paginated URL list below (the prefix purge is the broader instrument and is
reserved for set/tag-structure changes to stay inside the 5/min budget).

**`?page=N` decision — purge the enumerated variant URLs.** A `?page=N` response is a separate edge object and
the API has no wildcard purge; `projectShowcaseVariantPaths()` derives `page=2…N` from `totalDocs`/`pageSize` (page
1 = the bare URL). With 3 projects at `pageSize:6` that is zero extra URLs; the mechanism appears past 12
entries (48 URLs incl. details) — one request, under the 100-URL cap. Do **not** exclude `?page` from the edge
cache rule (canonical page 2 would become `BYPASS` and hit the single origin) and do **not** accept staleness
(publishing shifts projects to page 2 → one duplicated, one missing). Registry fallback: purge `max(DB count,
PROJECT_SHOWN_PAGES)`. Details keep their own tag, so one edit purges 2 URLs; only set changes fire the broad
purge. Never slice past the cap silently (`sendPurge` already warns).

**Sitemap** (`src/app/sitemap.ts`): the listing entry already comes from the `pages` loop; add
`getCachedAllProjects()` → `/{locale}/projects/{slug}` per locale with `languages {en,de,x-default:de}`
and `lastModified = updatedAt`. **Never** list `?page=N` or `?tag=<slug>` (only the unfiltered listing + every
detail). `src/cms/aeo/llmsTxt.ts` gets a `## Project`
block (listing DE/EN + one line per project) — static, so edit it in the same PR that seeds the projects.

---

## 7. Copy keys (`src/lib/translations.ts` → `translations.copy` rows, never a new group)

`COPY_KEYS` additions (value = runtime fallback, identical to the seed migration):

| Key                                  | EN                                | DE                                       |
| ------------------------------------ | --------------------------------- | ---------------------------------------- |
| `blocks.projectShowcase.eyebrow`        | project coding                       | project coding                              |
| `blocks.projectShowcase.countSingular`  | project                           | Projekt                                  |
| `blocks.projectShowcase.countPlural`    | projects                          | Projekte                                 |
| `blocks.projectShowcase.featuredLabel`  | Featured                          | Featured                                 |
| `blocks.projectShowcase.detailLabel`    | Case study                        | Case Study                               |
| `blocks.projectShowcase.liveLabel`      | Live                              | Live                                     |
| `blocks.projectShowcase.githubLabel`    | GitHub                            | GitHub                                   |
| `blocks.projectShowcase.newTabHint`     | (opens in a new tab)              | (öffnet in neuem Tab)                    |
| `blocks.projectShowcase.emptyLabel`     | No projects published yet.        | Noch keine Projekte veröffentlicht.      |
| `blocks.projectShowcase.paginationAria` | Project pagination            | Seitennavigation Projekte             |
| `blocks.projectShowcase.prevLabel`      | Previous                          | Zurück                                   |
| `blocks.projectShowcase.nextLabel`      | Next                              | Weiter                                   |
| `blocks.projectShowcase.pageLabel`      | Page                              | Seite                                    |
| `blocks.projectShowcase.ofLabel`        | of                                | von                                      |
| `blocks.projectShowcase.kindExperiment` | Experiment                        | Experiment                               |
| `blocks.projectShowcase.kindTool`       | Tool                              | Tool                                     |
| `blocks.projectShowcase.kindProduct`    | Product                           | Produkt                                  |
| `routes.project.contextLabel`    | Context                           | Ausgangslage                             |
| `routes.project.approachLabel`   | How it was built                  | So entstanden                            |
| `routes.project.learningsLabel`  | What I learned                    | Was ich gelernt habe                     |
| `routes.project.outcomeLabel`    | Outcome                           | Ergebnis                                 |
| `routes.project.stackLabel`      | Stack                             | Stack                                    |
| `routes.project.liveCta`         | Open live demo                    | Live-Demo öffnen                         |
| `routes.project.githubCta`       | View source on GitHub             | Quellcode auf GitHub                     |
| `routes.project.backToList`      | All project coding projects          | Alle Projekte                |
| `routes.project.noCover`         | [ screenshot ]                    | [ Screenshot ]                           |
| `routes.project.empty`           | This project is being documented. | Dieses Projekt wird gerade dokumentiert. |
| `blocks.projectShowcase.filterLabel`    | Filter by tag                     | Nach Tag filtern                         |
| `blocks.projectShowcase.filterAll`      | All                               | Alle                                     |
| `blocks.projectShowcase.filterEmpty`    | No projects with this tag yet.    | Noch keine Projekte mit diesem Tag.      |
| `blocks.projectShowcase.filterResultCount` | `{count} project`              | `{count} Projekt`                        |
| `blocks.projectShowcase.filterResultCountPlural` | `{count} projects`      | `{count} Projekte`                       |
| `commandItems.projects.label`     | Projects / Lab                 | Projects / Lab                        |
| `commandItems.projects.keywords`  | project, ai, experiments, tools      | project, ki, experimente, tools             |

`COPY_LIST_KEYS`: none. New loaders `loadProjectShowcaseCopy`, `loadProjectCopy` in
`translationBundles.server.ts`, both added to `loadPreviewCopy`/`PreviewCopy`.

**Navigation:** (1) CMS `navigation` global via the MCP — append `{ label: 'Projects', link:
'/de/projects' }` (en: `/en/projects`) to `headerLinks` by rewriting the full localized array per locale;
`isActiveNavLink` already highlights the parent on detail routes, no code change. (2) `commandItems.ts`:
`{ id: 'projects', href: '/projects', group: 'pages' }`. (3) the two `commandItems.projects.*` rows.

---

## 8. Migration plan (Payload sorts by NAME → schema timestamp < data timestamp)

1. Create the collection, the block, the `blocks/index.ts` entry, the `payload.config.ts` changes.
2. `npx payload migrate:create add_projects < /dev/null` (without the redirect it waits and writes nothing).
3. **Trim the diff — keep only:** `projects`, `projects_locales`, `projects_texts` +
   `_projects_v_texts` (the `stack` hasMany), `projects_rels` (cover/gallery), `_projects_v*`,
   `pages_blocks_project_showcase*` + `_pages_v_blocks_*`, `enum_projects_kind`, plus the TAG model
   (§10): `project_tags` + `project_tags_locales` (localized label), `projects_rels` rows with
   `path = 'tags'` (relationship join, no new table) and `_projects_v_rels`. **Delete every `icon_name`
   `DROP TYPE`/`CREATE TYPE`** (prod carries ~2020 enum values); leave `pages_locales._status` untouched. The
   only enums stay `enum_projects_kind` and `_locales` — a tag must never become an enum (§10).
4. `npx payload migrate` → `npm run generate:types` → `npm run generate:importmap`.
5. `src/migrations/<ts+1>_seed_project_showcase_copy.ts` — `INSERT … SELECT … WHERE NOT EXISTS` for all §7 keys,
   `en`+`de` in one statement, `gen_random_uuid()`, ascending `_order`; no backticks in SQL comments.
6. Content via the `payload-prod` MCP: page `projects` (hero + `projectShowcase`), `audit-scanner`,
   `halloween-counter`, `home-assistant`, nav links — each with `draft:false` + `_status:'published'`, then
   re-read.

Pitfalls: localized text = columns in `projects_locales` (~11, far below the 100-arg limit); `hasMany`
text = join **table**, not jsonb; `versions.drafts` adds `_status` + `_projects_v` (empty → no backfill);
the block type alone is DDL; commit the snapshot `*.json` consistent with the trimmed TS.

---

## 9. Verification

```bash
npm run lint:fix && node node_modules/typescript/bin/tsc --noEmit && npm run typecheck && npm run test:int
npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
node .next/standalone/server.js   # dev never hydrates here; use cache-busters (?cb=$RANDOM)
U=http://127.0.0.1:3000

curl -sI "$U/de/projects?cb=1"           # 200
curl -sI "$U/de/projects?page=2&cb=1"    # 200 while it exists, else 404
curl -sI "$U/de/projects/audit-scanner"  # 200
curl -sI "$U/de/projects/gibtsnicht"     # 404 + localized not-found body
curl -s "$U/de/projects?page=1" | grep -o '<link rel="canonical"[^>]*>'  # → …/de/projects
curl -s "$U/de/projects?page=1" | grep -o 'name="robots"[^>]*'           # → noindex, follow
curl -s "$U/de/projects?page=2" | grep -o '<link rel="canonical"[^>]*>'  # → …?page=2 (self)
curl -s "$U/de/projects" | grep -c 'aria-current="page"'                 # 1
curl -sI "$U/de/projects?tag=developer-tooling&cb=1" | head -1    # 200
curl -s "$U/de/projects?tag=developer-tooling" | grep -o '<link rel="canonical"[^>]*>'  # bare listing
curl -s "$U/de/projects?tag=developer-tooling" | grep -o 'name="robots"[^>]*'           # noindex, follow
curl -s "$U/sitemap.xml" | grep -c 'projects'                            # pages + projects, 0× "page="
curl -s "$U/llms.txt" | grep -c 'projects'
curl -s "$U/api/projects?depth=2" | grep -c createdBy                   # 0 (no user leak)

curl -sI https://mostheimer.de/de/projects | grep -iE 'cache-control|cf-cache-status|age'  # MISS→HIT
curl -sI 'https://mostheimer.de/de/projects?page=2' | grep -i cf-cache-status   # HIT, not BYPASS
curl -sI https://mostheimer.de/de/projects/audit-scanner | grep -i cf-cache-status   # HIT
curl -sI https://mostheimer.de/de/projects/gibtsnicht | grep -iE 'cf-cache-status|cache-control'
ssh coolify "docker history <image> | grep -iE 'SECRET|DATABASE'"   # presence only
```

Tests: `tests/int/projectPagination.int.spec.ts` (`parsePageRequest` non-canonical cases, `projectPageHref` page 1 =
bare URL); extend `tests/int/cloudflare-purge.int.spec.ts` (`projectShowcase` yields `/de/projects?page=2`
after `registerProjectShowcasePageCount`, `cms:projects:<slug>` → exactly 2 detail URLs, new tags in the
"never an asset path" loop); `tests/int/projects.int.spec.ts` (anonymous `access.read` published
constraint, slug hook, `pickProjectImage` fallback); `tests/e2e/projects.spec.ts` (tab order, `aria-current` is
not a link, nav landmark label, five detail sections, unknown slug 404); wording seeds stay clean.

**Files** (under `/home/devagent/.local/share/opencode/worktree/f0fd50/projects/`) — NEW:
`src/cms/collections/Projects.ts`, `src/cms/blocks/ProjectShowcase.ts`,
`src/app/(frontend)/[locale]/projects/[project]/{page,not-found}.tsx`,
`src/app/(frontend)/[locale]/preview/project/page.tsx`, `src/components/blocks/ProjectShowcaseBlock.tsx`,
`src/components/blocks/projectPagination.ts`, `src/components/projects/{pickImage,projectView}.ts`,
`src/components/preview/PreviewProject.tsx`, two migrations + `migrations/index.ts`. EDIT:
`src/cms/blocks/index.ts`, `src/payload.config.ts`, `src/cms/cache/frontend/{constants,queries,revalidate}.ts`,
`src/proxy.ts`, `src/proxy-slug-cache.ts`, `src/app/sitemap.ts`, `src/cms/aeo/llmsTxt.ts`,
`src/components/{blocks,preview/PreviewBlocks,StructuredData}.tsx`, `src/components/ui/commandItems.ts`,
`src/lib/{translations,translationBundles.server}.ts`, `AGENTS.md` (new § "Project-Coding Showcase" + a
`Gelernte Fehler` entry: a `?page=N` variant is a separate edge object — enumerate it from `totalDocs`, never
exclude the query from the cache rule).

---

## 10. Tag filter (delta to §2/§3/§6/§7/§8)

**Decision: (b) a second small collection `projectTags`** (`slug` + localized `label`) referenced from
`projects.tags` via `relationship hasMany`.

- (a) array of `{label}` fails the URL contract: no stable slug per tag, no single place to rename, and the
  chip row would need a `distinct` scan over block arrays.
- (c) select/`hasMany` = enum → **migration + deploy per tag**; rejected, and it also hits the prod enum-churn
  trap (`AGENTS.md` § "Enum-Churn").
- (d) comma text: not localizable, no referential integrity, slug drift on rename.

With (b) an editor creates/renames a tag in the admin, both locales are edited on the same doc, and the URL
slug is stable and indexable. Rename of the **label** never changes URLs; renaming the **slug** is the one
breaking operation and it is covered by the prefix purge (§6).

```ts
// src/cms/collections/ProjectTags.ts  (admin group 'Content', useAsTitle 'label')
export const ProjectTags: CollectionConfig = {
  slug: 'projectTags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'slug', 'updatedAt'], group: 'Content' },
  access: { read: () => true },                       // public labels for the chips
  hooks: {
    beforeValidate: [wordingBeforeValidate],
    afterChange: [({ doc, previousDoc }) => revalidateProjectTagsCache(previousDoc?.slug ?? doc.slug)],
    afterDelete: [({ doc }) => revalidateProjectTagsCache(doc.slug)],
  },
  fields: [
    { name: 'label', type: 'text', required: true, localized: true },     // visible chip text
    { name: 'slug', type: 'text', required: true, unique: true, index: true,
      admin: { description: '?tag=<slug> — stabil halten, nicht übersetzen' },
      hooks: { beforeValidate: [({ value, data }) => (value || String(data?.label ?? ''))
        .toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')] } },
    { name: 'description', type: 'textarea', localized: true, admin: { description: 'Optional, nur Admin' } },
    ...protectedAuthorshipFields(),
  ],
};
```

Seeded tags (via MCP after the schema deploy): `developer-tooling`, `visualization`, `home-automation`,
`infrastructure`, `ai-assisted`.

### 10.1 URL scheme

```
/de/projects                     unfiltered, page 1        (canonical target)
/de/projects?page=2              unfiltered, page 2        (self-canonical)
/de/projects?tag=home-automation filtered, page 1           (non-canonical → base)
/de/projects?tag=home-automation&page=2  filtered, page 2   (non-canonical → base)
```

`?tag` and `?page` **do combine**: a tag with more matches than `pageSize` must still be browsable, otherwise
the chip is a dead end. Rules: changing the tag resets to page 1; pagination keeps the active tag. Canonical
for **every** `?tag` URL (with or without `page`) is the bare listing URL — a filtered view is a subset, not a
document.

```ts
// src/components/blocks/projectPagination.ts — same module as parsePageRequest
export function parseTagParam(raw: string | string[] | undefined): string | null;   // null = invalid → 'all'
/** THE URL builder. Page 1 = bare-ish URL (no `?page=1`); tag first, then page. */
export function buildListingHref(input: { basePath: string; tag?: string | null; page?: number }): string;
// buildListingHref({ basePath: '/de/projects', tag: null })                    → '/de/projects'
// buildListingHref({ basePath: '/de/projects', tag: 'ai-assisted' })            → '/de/projects?tag=ai-assisted'
// buildListingHref({ basePath: '/de/projects', tag: 'ai-assisted', page: 3 })   → '?tag=ai-assisted&page=3'
```

An unknown tag slug renders the **unfiltered** listing with `activeTag: null` (never an empty page, never a 404
that a dead chip could not recover from) — the URL still stays `noindex`.

### 10.2 SEO (Google's rule for faceted/filter URLs)

Google's faceted-navigation guidance: filtered/sorted/faceted URLs are *distinct URLs serving near-duplicate
content*; they should either be blocked, or — preferred when they are useful to humans — be **self-consistent
variants that declare a canonical to the clean version**. Here:

- filtered/unfiltered-page-2 → `robots: { index: false, follow: true }` **plus** `alternates.canonical` to the
  bare listing (`/{locale}/projects`, same locale, no `x-default` shift). `follow: true` so the detail pages
  remain reachable through the links.
- The bare listing is `index: true`, self-canonical.
- Links stay crawlable (`<a href>`) — `noindex, follow` passes equity, blocking via `robots.txt` would not.
- **Sitemap:** unfiltered listing + every project detail, nothing else (§6).

### 10.3 JSON-LD

Confirmed: the filtered/`noindex` page emits **no `ItemList`** (an ItemList on a page we ask Google to drop is
noise); only the unfiltered listing carries `WebPage` + `ItemList` + `BreadcrumbList`. Detail pages keep their
`CreativeWork` + `BreadcrumbList`.

### 10.4 Cache/purge + recommended tag cache tags

- `CACHE_TAGS.projectTags = 'cms:project-tags'` — **yes, tags need their own tag**, but only for the *chip row*
  (`getCachedProjectTags`). It never replaces the listing tag: `revalidateProjectTagsCache` flushes `projectTags`,
  `projectShowcase` **and** runs the listing prefix purge on both locales/hosts, because a rename/delete changes
  every `?tag=` variant (and a delete changes which chips exist at all). A project-level edit still flushes
  `projects` + `project(slug)` + `projectShowcase`; it does not touch `projectTags`.
- `?tag=` is an edge sub-object of the listing route → covered by the same prefix purge as `?page=N` (§6).
  No per-tag URL enumeration, no extra purge request — which is exactly why the tag model was not made into
  N separate routes.
- The tag **count** shown on a chip (`{count}`) is derived at render time from the filtered query, so it is
  correct by construction; the unfiltered chip row uses `totalDocs` of each tag query only where cheap, else
  it omits counts (rendering a count needs one extra aggregate per tag — with <15 tags one `find` per tag is
  still cheap and cached under `cms:project-showcase`). Decision: render counts, omit the number when the query
  times out (no stale hard-coded numbers).

### 10.5 Migration impact (tag model)

- `project_tags` (id, slug UNIQUE, created/updated, authored-by columns) + `project_tags_locales` (label,
  description, `_locale`, `_status` absent — no drafts on tags).
- `projects_rels` gains rows with `path = 'tags'` (Payload reuses the existing relationship table; no new
  join table) and `_projects_v_rels` the versioned twin. Nothing is added to `projects_locales`.
- **No enum is introduced for tags.** The only tag-related enum caveat is the pre-existing `icon_name` churn
  that `migrate:create` always drags in — strip it (§8).
- Tag seed order: schema migration (`add_project_tags` in the same run as `add_projects`) → copy seed →
  **content** (tags first, then projects referencing them) via MCP.
