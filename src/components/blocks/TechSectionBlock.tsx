import React from 'react';
import type { Page } from '@/payload-types';

type TechSectionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'techSection' }
>;

export function TechSectionBlock({ block }: { block: TechSectionBlockData }) {
  // Split body on double newlines to create paragraphs
  const paragraphs = block.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="w-full py-14 border-t border-border first:border-t-0">
      <div className="max-w-3xl mx-auto px-4">
        {block.sectionLabel && (
          <span className="inline-block font-geist-mono text-xs font-semibold uppercase tracking-widest text-primary/70 mb-4">
            {block.sectionLabel}
          </span>
        )}

        <h2 className="text-2xl lg:text-3xl font-averia font-bold text-text mb-6 leading-snug">
          {block.heading}
        </h2>

        <div className="space-y-4 mb-8">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="font-geist-mono text-sm lg:text-base opacity-80 leading-relaxed"
            >
              {para}
            </p>
          ))}
        </div>

        {block.keyFacts && block.keyFacts.length > 0 && (
          <dl className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-border/50">
            {block.keyFacts.map((fact) => (
              <div key={fact.id ?? fact.label} className="min-w-[120px]">
                <dt className="font-geist-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {fact.label}
                </dt>
                <dd className="font-geist-mono text-sm font-semibold text-primary">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
