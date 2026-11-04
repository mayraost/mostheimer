import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, Chip, splitParagraphs } from '../ui/industrial';

type TimelineBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'timeline' }>;
type TimelineEntry = NonNullable<TimelineBlockData['entries']>[number];

export function TimelineBlock({ block }: { block: TimelineBlockData }) {
  const entries = block.entries ?? [];

  return (
    <section className="w-full border-t border-border py-14">
      <div className="mx-auto w-full max-w-4xl">
        {block.heading && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
              {block.heading}
            </h2>
            <Chip variant="outline">{entries.length} Stationen</Chip>
          </div>
        )}

        <ol className="relative space-y-2 border-l border-border pl-6">
          {entries.map((entry: TimelineEntry, index) => (
            <li key={entry.id ?? entry.company} className="relative">
              {/* Rail-Marker: emerald Dot mit Glow */}
              <span
                aria-hidden="true"
                className="absolute -left-[30px] top-6 flex h-2.5 w-2.5 items-center justify-center"
              >
                <span className="h-2.5 w-2.5 rounded-full border border-primary bg-primary shadow-[0_0_10px_rgba(16,185,129,0.65)]" />
              </span>

              <BentoTile className="p-5 transition-colors hover:border-primary/40">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="mono-label text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {entry.period && (
                    <span className="mono-label text-muted-foreground">{entry.period}</span>
                  )}
                </div>

                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {entry.company}
                </h3>

                {entry.role && <p className="mono-meta mt-1 text-secondary">{entry.role}</p>}

                {entry.highlights && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {splitParagraphs(entry.highlights).map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </BentoTile>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
