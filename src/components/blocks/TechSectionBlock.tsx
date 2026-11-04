import React from 'react';
import type { Page } from '@/payload-types';
import { BentoTile, CardHeader, splitParagraphs } from '../ui/industrial';
import { CopyButton } from '../ui/CopyButton';

type TechSectionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'techSection' }
>;

export function TechSectionBlock({ block }: { block: TechSectionBlockData }) {
  // CMS-Textarea: Absätze via doppelte Newlines
  const paragraphs = splitParagraphs(block.body);

  return (
    <section className="w-full border-t border-border py-14">
      <div className="mx-auto w-full max-w-4xl">
        <BentoTile className="p-5 lg:p-8">
          {block.sectionLabel && <CardHeader label={block.sectionLabel} meta="tech section" />}

          <h2 className="mb-6 font-heading text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground lg:text-3xl">
            {block.heading}
          </h2>

          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground/85">
                {para}
              </p>
            ))}
          </div>

          {block.keyFacts && block.keyFacts.length > 0 && (
            <dl className="mt-8 grid grid-cols-1 gap-2 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {block.keyFacts.map((fact) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fact.value.trim());
                return (
                  <div
                    key={fact.id ?? fact.label}
                    className="flex flex-col justify-between gap-2 rounded-[6px] border border-border bg-surface-raised/50 p-3"
                  >
                    <div>
                      <dt className="mono-label mb-1 text-muted-foreground">{fact.label}</dt>
                      <dd className="font-mono text-sm font-semibold text-primary">{fact.value}</dd>
                    </div>
                    {isEmail && (
                      <CopyButton
                        value={fact.value.trim()}
                        label="E-Mail kopieren"
                        copiedLabel="Kopiert"
                        className="w-full justify-center"
                      />
                    )}
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
