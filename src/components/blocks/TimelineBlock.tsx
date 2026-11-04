import React from 'react';

import type { Page } from '@/payload-types';
import { Chip, splitParagraphs } from '../ui/industrial';

type TimelineBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'timeline' }>;
type TimelineEntry = NonNullable<TimelineBlockData['entries']>[number];

/**
 * Timeline: vertikale Hairline-Rail mit Emerald-Nodes, Mono-Perioden in
 * eigener Spalte, dichte Company/Role-Typografie. Bewusst OHNE Karten-Rahmen
 * pro Eintrag — die Rail ist der Rhythmus.
 */
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

        <ol className="relative">
          {/* Rail */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border md:left-[171px]"
          />

          {entries.map((entry: TimelineEntry, index) => (
            <li
              key={entry.id ?? entry.company}
              className="relative grid grid-cols-1 gap-x-8 gap-y-1 pb-8 pl-7 last:pb-0 md:grid-cols-[148px_minmax(0,1fr)] md:pl-0"
            >
              {/* Node */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 flex h-3.5 w-3.5 items-center justify-center md:left-[164px]"
              >
                <span className="h-3.5 w-3.5 rounded-full border border-primary/60 bg-background" />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </span>

              <div className="md:pr-4 md:text-right">
                <p className="mono-label leading-relaxed text-muted-foreground">
                  {entry.period || '—'}
                </p>
                <p className="mono-label mt-1 text-primary/70">
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>

              <div className="min-w-0 md:pl-4">
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {entry.company}
                </h3>
                {entry.role && <p className="mono-meta mt-1 text-secondary">{entry.role}</p>}
                {entry.highlights && (
                  <div className="mt-3 space-y-2">
                    {splitParagraphs(entry.highlights).map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
