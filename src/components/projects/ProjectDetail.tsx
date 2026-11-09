import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react';
import { BentoTile, CardHeader, Chip, CornerTicks, Eyebrow } from '../ui/industrial';
import { ProjectChip, ProjectExternalLink } from './chips';
import type { ProjectSectionKey, ProjectView } from './projectView';
import { hasSection } from './projectView';
import type { ProjectKind } from './showcaseView';

/**
 * Copy of the detail route (`routes.project.*`).
 *
 * `kindLabels` and `newTabHint` are shared with the listing
 * (`blocks.projectShowcase.*`): the same project is shown on both surfaces, so the
 * label of a `tool` must not differ between the tile and the detail page.
 */
export type ProjectDetailCopy = {
  eyebrow: string;
  contextLabel: string;
  approachLabel: string;
  learningsLabel: string;
  outcomeLabel: string;
  stackLabel: string;
  tagsLabel: string;
  liveCta: string;
  githubCta: string;
  backToList: string;
  noCover: string;
  empty: string;
  newTabHint: string;
  kindLabels: Record<ProjectKind, string>;
};

/** Section order of the case study (§ 5: context → approach → learnings → outcome). */
type SectionLabelKey = 'contextLabel' | 'approachLabel' | 'learningsLabel' | 'outcomeLabel';

const SECTIONS: readonly { key: ProjectSectionKey; labelKey: SectionLabelKey }[] = [
  { key: 'context', labelKey: 'contextLabel' },
  { key: 'approach', labelKey: 'approachLabel' },
  { key: 'learnings', labelKey: 'learningsLabel' },
  { key: 'outcome', labelKey: 'outcomeLabel' },
];

/**
 * Narrative row: mono label + number on the left, prose on the right.
 *
 * A section with no content renders NOTHING (no empty heading): the CMS fields
 * are optional except `context`, and an "Approach" heading over an empty box
 * reads as a broken page. `h2` because the detail hero owns the only `h1`.
 */
function SectionCard({
  index,
  label,
  children,
  tone = 'muted',
}: {
  index: number;
  label: string;
  children: React.ReactNode;
  tone?: 'muted' | 'primary';
}) {
  return (
    <BentoTile as="section" className="p-5 lg:p-6">
      <h2 className="mono-label mb-4 flex items-baseline gap-2">
        <span className={tone === 'primary' ? 'text-primary' : 'text-secondary'}>
          {String(index).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">{label}</span>
      </h2>
      <div className="space-y-3 text-base leading-relaxed text-foreground">{children}</div>
    </BentoTile>
  );
}

/** Paragraph list of a `\n\n`-separated textarea. */
function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
}

/**
 * Project detail (design § 5).
 *
 * Pure prop renderer (server component, synchronous): the route resolves the
 * document through the cached reader, maps it with `toProjectView`, and hands
 * the view + copy in. Same shape the live preview renders.
 *
 * Hero: the `hero` crop with explicit width/height (`next/image`, no
 * `fill`), so the reserved box cannot cause CLS. External links are omitted
 * when absent — `githubUrl` is legitimately `null` for a private repo.
 */
export function ProjectDetail({
  project,
  copy,
}: {
  project: ProjectView;
  copy: ProjectDetailCopy;
}) {
  const sections = SECTIONS.filter((section) => hasSection(project, section.key));
  const hasLinks = Boolean(project.liveUrl || project.githubUrl);

  return (
    <article className="mx-auto w-full max-w-6xl pb-16">
      <header className="border-b border-border pb-8 pt-2 lg:pt-6">
        <nav aria-label={copy.eyebrow} className="mb-4">
          <Link
            href={project.listingPath}
            className="mono-label inline-flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span aria-hidden="true">←</span>
            {copy.backToList}
          </Link>
        </nav>

        <Eyebrow>
          {[copy.eyebrow, copy.kindLabels[project.kind]].filter(Boolean).join(' // ')}
        </Eyebrow>

        <h1 className="mb-4 mt-3 font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
          {project.title}
        </h1>

        {project.teaser && (
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {project.teaser}
          </p>
        )}

        {(project.stack.length > 0 || hasLinks) && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ul className="flex flex-wrap items-center gap-1.5" aria-label={copy.stackLabel}>
              {project.stack.map((tech) => (
                <li key={tech}>
                  <Chip variant="outline">{tech}</Chip>
                </li>
              ))}
            </ul>
            {hasLinks && (
              <div className="flex flex-wrap gap-2">
                <ProjectExternalLink
                  href={project.liveUrl}
                  label={copy.liveCta}
                  newTabHint={copy.newTabHint}
                />
                <ProjectExternalLink
                  href={project.githubUrl}
                  label={copy.githubCta}
                  newTabHint={copy.newTabHint}
                  tone="secondary"
                />
              </div>
            )}
          </div>
        )}
      </header>

      <div className="mt-6">
        {project.hero ? (
          <BentoTile className="p-0">
            <Image
              src={project.hero.url}
              alt={project.hero.alt}
              width={project.hero.width}
              height={project.hero.height}
              sizes="(min-width: 1024px) 1000px, 100vw"
              priority
              className="h-auto w-full object-cover"
            />
          </BentoTile>
        ) : (
          <BentoTile className="flex aspect-[12/5] items-center justify-center">
            <span className="mono-label text-muted-foreground">{copy.noCover}</span>
          </BentoTile>
        )}
      </div>

      {sections.length === 0 ? (
        <BentoTile className="mt-2 p-5 lg:p-8">
          <p className="text-base leading-relaxed text-foreground">{copy.empty}</p>
        </BentoTile>
      ) : (
        <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-w-0 flex-col gap-2">
            {sections.map((section, index) => (
              <SectionCard
                key={section.key}
                index={index + 1}
                label={copy[section.labelKey]}
                tone={section.key === 'outcome' ? 'primary' : 'muted'}
              >
                {section.key === 'approach' && project.approach ? (
                  <LexicalRichText data={project.approach} className="prose-industrial" />
                ) : section.key === 'context' ? (
                  <Paragraphs paragraphs={project.context} />
                ) : section.key === 'learnings' ? (
                  <Paragraphs paragraphs={project.learnings} />
                ) : (
                  <Paragraphs paragraphs={project.outcome} />
                )}
              </SectionCard>
            ))}
          </div>

          <aside className="flex flex-col gap-2">
            {project.tags.length > 0 && (
              <BentoTile className="p-4">
                <CardHeader label={copy.tagsLabel} />
                <ul className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <li key={tag.slug}>
                      <ProjectChip variant="solid">{tag.label}</ProjectChip>
                    </li>
                  ))}
                </ul>
              </BentoTile>
            )}
            {project.stack.length > 0 && (
              <BentoTile className="relative p-4">
                <CornerTicks />
                <CardHeader label={copy.stackLabel} tone="secondary" />
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <ProjectChip>{tech}</ProjectChip>
                    </li>
                  ))}
                </ul>
              </BentoTile>
            )}
            {hasLinks && (
              <BentoTile className="flex flex-col gap-2 p-4">
                <ProjectExternalLink
                  href={project.liveUrl}
                  label={copy.liveCta}
                  newTabHint={copy.newTabHint}
                />
                <ProjectExternalLink
                  href={project.githubUrl}
                  label={copy.githubCta}
                  newTabHint={copy.newTabHint}
                  tone="secondary"
                />
              </BentoTile>
            )}
          </aside>
        </div>
      )}
    </article>
  );
}
