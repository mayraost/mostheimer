import React from 'react';
import type { Page } from '@/payload-types';
import { BentoTile, CardHeader, splitParagraphs } from '../ui/industrial';
import { KeyFactActionButton } from '../ui/KeyFactActionButton';

type TechSectionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'techSection' }
>;

export function TechSectionBlock({ block }: { block: TechSectionBlockData }) {
  // CMS textarea: paragraphs are separated by blank lines.
  const paragraphs = splitParagraphs(block.body);

  return (
    <section className="w-full border-t border-border pt-6 pb-14 lg:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <BentoTile className="p-5 lg:p-8">
          {/* Eyebrow only when the editor set a section label. The previous
              hardcoded `meta="tech section"` repeated the block type on every
              card — including the 20 legal sections of /privacy. */}
          <CardHeader label={block.sectionLabel} />

          <h2 className="mb-6 font-heading text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground lg:text-3xl">
            {block.heading}
          </h2>

          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground">
                {para}
              </p>
            ))}
          </div>

          {block.keyFacts && block.keyFacts.length > 0 && (
            <dl className="mt-8 grid grid-cols-1 gap-2 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {block.keyFacts.map((fact) => {
                // Contact values are often several targets in one line
                // ("github.com/mayraost · linkedin.com/in/…"): split them so each
                // profile gets its own button instead of one wrapping text row.
                const values = fact.value
                  .split(/\s+[·|]\s+|\n+/)
                  .map((v) => v.trim())
                  .filter(Boolean);
                const single = values.length <= 1;
                return (
                  <div
                    key={fact.id ?? fact.label}
                    className="flex flex-col justify-between gap-2 rounded-[6px] border border-border bg-surface-raised/50 p-3"
                  >
                    <div>
                      <dt className="mono-label mb-1 text-muted-foreground">{fact.label}</dt>
                      {single ? (
                        <dd className="break-words font-mono text-sm font-semibold text-primary">
                          {fact.value}
                        </dd>
                      ) : (
                        <dd className="flex flex-col gap-0.5">
                          {values.map((v) => (
                            <span
                              key={v}
                              className="break-all font-mono text-sm font-semibold leading-snug text-primary"
                            >
                              {v}
                            </span>
                          ))}
                        </dd>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 empty:hidden">
                      {values.map((v) => (
                        <KeyFactActionButton key={v} value={v} className="w-full justify-center" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </dl>
          )}
        </BentoTile>
      </div>
    </section>
  );
}
