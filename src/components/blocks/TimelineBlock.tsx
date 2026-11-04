import React from 'react';

import type { Page } from '@/payload-types';

type TimelineBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'timeline' }>;
type TimelineEntry = NonNullable<TimelineBlockData['entries']>[number];

export function TimelineBlock({ block }: { block: TimelineBlockData }) {
  return (
    <section className="w-full border-t border-border py-14 first:border-t-0">
      <div className="mx-auto max-w-3xl px-4">
        {block.heading && (
          <h2 className="mb-10 text-2xl font-averia font-bold text-text lg:text-3xl">
            {block.heading}
          </h2>
        )}

        <ol className="relative ml-3 space-y-10 border-l border-border">
          {block.entries?.map((entry: TimelineEntry) => (
            <li key={entry.id ?? entry.company} className="relative pl-8">
              <span
                className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg font-averia font-bold text-text">{entry.company}</h3>
                {entry.period && (
                  <span className="font-geist-mono text-xs text-muted-foreground">
                    {entry.period}
                  </span>
                )}
              </div>
              {entry.role && (
                <p className="mb-3 font-geist-mono text-sm font-semibold text-primary">
                  {entry.role}
                </p>
              )}
              {entry.highlights && (
                <p className="whitespace-pre-line font-geist-mono text-sm leading-relaxed opacity-80">
                  {entry.highlights}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
