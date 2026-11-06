import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, Chip, splitParagraphs } from '../ui/industrial';

type TimelineBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'timeline' }>;
type TimelineEntry = NonNullable<TimelineBlockData['entries']>[number];

/**
 * Timeline: vertical hairline rail with emerald nodes, mono periods in their own
 * column, and every station in its OWN card surface. The card per station is
 * what makes two adjacent entries read as two entries at all — without it the
 * period, company and highlights of neighbouring stations blend into one block
 * (QA iteration 2, EN career view).
 *
 * `locale` only formats the count chip ("5 Stationen" / "5 stations"); the
 * station copy itself comes from the CMS and is already localized there.
 */
export function TimelineBlock({ block, locale }: { block: TimelineBlockData; locale?: string }) {
  const entries = block.entries ?? [];
  const stationWord = locale === 'de' ? 'Stationen' : entries.length === 1 ? 'station' : 'stations';

  return (
    <section className="w-full border-t border-border pt-6 pb-14 lg:py-14">
      <div className="mx-auto w-full max-w-4xl">
        {block.heading && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
              {block.heading}
            </h2>
            <Chip variant="outline">
              {entries.length} {stationWord}
            </Chip>
          </div>
        )}

        <ol className="relative">
          {/* Rail */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border md:left-[147px]"
          />

          {entries.map((entry: TimelineEntry, index) => (
            <li
              key={entry.id ?? entry.company}
              className="relative pb-4 pl-7 last:pb-0 md:flex md:items-stretch md:gap-0 md:pl-0"
            >
              {/* Node */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-5 flex h-3.5 w-3.5 items-center justify-center md:left-[140px]"
              >
                <span className="h-3.5 w-3.5 rounded-full border border-primary/60 bg-background" />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </span>

              {/* Period column: fixed width, right-aligned, mono. */}
              <div className="hidden shrink-0 pt-4 pr-4 md:block md:w-[148px] md:text-right">
                <p className="mono-label leading-relaxed text-muted-foreground">
                  {entry.period || '—'}
                </p>
                <p className="mono-label mt-1 text-primary">{String(index + 1).padStart(2, '0')}</p>
              </div>

              {/* Station card: own surface + hairline, so consecutive entries
                  never read as one continuous paragraph block. */}
              <BentoTile className="min-w-0 flex-1 p-4 md:ml-4 lg:p-5">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:hidden">
                  <p className="mono-label text-muted-foreground">{entry.period || '—'}</p>
                  <p className="mono-label text-primary">{String(index + 1).padStart(2, '0')}</p>
                </div>
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
              </BentoTile>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
