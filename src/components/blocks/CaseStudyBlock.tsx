import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, CardHeader, Chip, splitParagraphs } from '../ui/industrial';

type CaseStudyBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'caseStudy' }>;

type SectionKey = 'context' | 'solution' | 'contribution';

const SECTION_META: Record<SectionKey, { label: string; index: string; accent: string }> = {
  context: { label: 'Kontext', index: '01', accent: 'text-muted-foreground' },
  solution: { label: 'Architektur', index: '02', accent: 'text-secondary' },
  contribution: { label: 'Impact', index: '03', accent: 'text-primary' },
};

function NarrativeColumn({ sectionKey, body }: { sectionKey: SectionKey; body?: string | null }) {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0) return null;
  const meta = SECTION_META[sectionKey];

  return (
    <div className="relative min-w-0 border-t border-border pt-4 first:border-t-0 first:pt-0 md:border-t-0 md:border-l md:pl-6 md:pt-0 md:first:border-l-0 md:first:pl-0">
      <p className="mono-label mb-3 flex items-baseline gap-2">
        <span className={meta.accent}>{meta.index}</span>
        <span className="text-muted-foreground">{meta.label}</span>
      </p>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Case study in a split layout: mono meta column (period/role/tags as chips) on
 * the left, narrative columns (context / architecture / impact) on the right.
 *
 * A11y constraints that look redundant but are not:
 * - `<dt>`/`<dd>` must be DIRECT children of `<dl>`; a wrapper div breaks the
 *   list. Keep the pairs flat and let `display: grid` on the `<dl>` group them.
 * - The card heading is `h2`, not `h3`: it follows the page `h1` directly, so
 *   h3 would skip a heading level.
 * - Body text uses full `text-foreground`; reduced opacity drops below AA.
 */
export function CaseStudyBlock({ block }: { block: CaseStudyBlockData }) {
  return (
    <section className="w-full pt-6 pb-4 lg:py-4">
      <div className="mx-auto w-full max-w-6xl">
        <BentoTile as="article" className="p-5 lg:p-8">
          <CardHeader label="case study" meta={block.period || '—'} />

          <h2 className="mb-6 max-w-4xl font-heading text-2xl font-bold tracking-[-0.025em] text-foreground lg:text-3xl">
            {block.client}
          </h2>

          <div className="grid gap-2 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
            <dl className="grid gap-4 rounded-[6px] border border-border bg-surface-raised/40 p-4">
              {block.period && (
                <>
                  <dt className="mono-label text-muted-foreground">periode</dt>
                  <dd className="-mt-2 font-mono text-sm text-foreground">{block.period}</dd>
                </>
              )}
              {block.role && (
                <>
                  <dt className="mono-label text-muted-foreground">rolle</dt>
                  <dd className="-mt-2 text-sm leading-snug text-primary">{block.role}</dd>
                </>
              )}
              {block.tags && block.tags.length > 0 && (
                <>
                  <dt className="mono-label text-muted-foreground">kontext</dt>
                  <dd className="-mt-2 flex flex-wrap gap-1.5">
                    {block.tags.map((tag) => (
                      <Chip key={tag} variant="outline">
                        {tag}
                      </Chip>
                    ))}
                  </dd>
                </>
              )}
              {block.link && (
                <>
                  <dt className="sr-only">Referenz-Link</dt>
                  <dd className="border-t border-border pt-3">
                    <a
                      href={block.link}
                      className="mono-label inline-flex items-center gap-2 text-primary transition-colors hover:text-primary-hover"
                    >
                      {block.linkLabel || 'Link'} <span aria-hidden="true">→</span>
                    </a>
                  </dd>
                </>
              )}
            </dl>

            <div className="flex min-w-0 flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-border">
                <NarrativeColumn sectionKey="context" body={block.context} />
                <NarrativeColumn sectionKey="solution" body={block.solution} />
              </div>

              {splitParagraphs(block.contribution).length > 0 && (
                <div className="rounded-[6px] border border-primary/40 border-l-2 border-l-primary bg-primary-muted p-4">
                  <p className="mono-label mb-2 flex items-center gap-2 text-primary">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                    />
                    03 · impact
                  </p>
                  <div className="space-y-2">
                    {splitParagraphs(block.contribution).map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </BentoTile>
      </div>
    </section>
  );
}
