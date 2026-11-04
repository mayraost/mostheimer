import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, CardHeader, Chip, splitParagraphs } from '../ui/industrial';

type CaseStudyBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'caseStudy' }>;

const SECTION_LABELS = {
  context: '01 · Kontext & Herausforderung',
  solution: '02 · Architektur & Lösung',
  contribution: '03 · Beitrag & Impact',
} as const;

function CaseStudySection({
  label,
  tone,
  body,
}: {
  label: string;
  tone: 'primary' | 'secondary' | 'muted';
  body?: string | null;
}) {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0) return null;

  const borderClass = {
    primary: 'border-t-primary',
    secondary: 'border-t-secondary',
    muted: 'border-t-border-strong',
  }[tone];

  return (
    <div
      className={`rounded-[6px] border border-border border-t-2 ${borderClass} bg-surface-raised/40 p-4`}
    >
      <h4 className="mono-label mb-3 text-muted-foreground">{label}</h4>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/90">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyBlock({ block }: { block: CaseStudyBlockData }) {
  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-6xl">
        <BentoTile as="article" className="p-5 lg:p-8">
          <CardHeader label="case study" meta={block.period || '—'} />

          <header className="mb-6 border-b border-border pb-6">
            <h3 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
              {block.client}
            </h3>

            {block.role && (
              <p className="mono-meta mt-2 flex items-center gap-2 text-primary">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                />
                {block.role}
              </p>
            )}

            {block.tags && block.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {block.tags.map((tag) => (
                  <Chip key={tag} variant="outline">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <CaseStudySection label={SECTION_LABELS.context} tone="primary" body={block.context} />
            <CaseStudySection
              label={SECTION_LABELS.solution}
              tone="secondary"
              body={block.solution}
            />
            <CaseStudySection
              label={SECTION_LABELS.contribution}
              tone="muted"
              body={block.contribution}
            />
          </div>

          {block.link && (
            <div className="mt-6 border-t border-border pt-4">
              <a
                href={block.link}
                className="mono-label inline-flex items-center gap-2 text-primary transition-colors hover:text-primary-hover"
              >
                {block.linkLabel || block.link} <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </BentoTile>
      </div>
    </section>
  );
}
