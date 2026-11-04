import React from 'react';

import type { Page } from '@/payload-types';

type CaseStudyBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'caseStudy' }>;

function CaseStudySection({ label, body }: { label: string; body?: string | null }) {
  if (!body) return null;

  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <h4 className="mb-2 font-geist-mono text-xs font-semibold uppercase tracking-widest text-primary/70">
        {label}
      </h4>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="font-geist-mono text-sm leading-relaxed opacity-80">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyBlock({ block }: { block: CaseStudyBlockData }) {
  return (
    <section className="w-full border-t border-border py-14 first:border-t-0">
      <div className="mx-auto max-w-5xl px-4">
        <article className="rounded-2xl border border-border bg-surface p-6 lg:p-10">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="text-xl font-averia font-bold text-text lg:text-2xl">
                {block.client}
              </h3>
              {block.period && (
                <span className="font-geist-mono text-xs text-muted-foreground">
                  {block.period}
                </span>
              )}
            </div>

            {block.role && (
              <p className="mb-4 font-geist-mono text-sm font-semibold text-primary">
                {block.role}
              </p>
            )}

            {block.tags && block.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {block.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-header px-3 py-1 font-geist-mono text-xs text-text/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <CaseStudySection label="Kontext & Herausforderung" body={block.context} />
            <CaseStudySection label="Architektur & Lösung" body={block.solution} />
            <CaseStudySection label="Beitrag & Impact" body={block.contribution} />
          </div>

          {block.link && (
            <div className="mt-8 border-t border-border/50 pt-6">
              <a
                href={block.link}
                className="font-geist-mono text-sm font-semibold text-primary hover:underline"
              >
                {block.linkLabel || block.link} →
              </a>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
