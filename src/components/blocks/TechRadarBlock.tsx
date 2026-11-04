import React from 'react';

import type { Page } from '@/payload-types';

type TechRadarBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'techRadar' }>;
type Quadrant = NonNullable<TechRadarBlockData['quadrants']>[number];
type RadarItem = NonNullable<Quadrant['items']>[number];

const TIER_META: Record<'core' | 'proven' | 'focus', { label: string; className: string }> = {
  core: {
    label: 'Core Mastery',
    className: 'bg-primary text-primary-foreground',
  },
  proven: {
    label: 'Production Proven',
    className: 'bg-secondary text-secondary-foreground',
  },
  focus: {
    label: 'Strategic Focus',
    className: 'bg-accent text-accent-foreground',
  },
};

export function TechRadarBlock({ block }: { block: TechRadarBlockData }) {
  return (
    <section className="w-full border-t border-border py-14 first:border-t-0">
      <div className="mx-auto max-w-5xl px-4">
        {block.heading && (
          <h2 className="mb-10 text-2xl font-averia font-bold text-text lg:text-3xl">
            {block.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {block.quadrants?.map((quadrant: Quadrant) => (
            <div
              key={quadrant.id ?? quadrant.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="mb-5 text-lg font-averia font-bold text-text">{quadrant.title}</h3>

              <ul className="space-y-3">
                {quadrant.items?.map((item: RadarItem) => {
                  const meta = TIER_META[item.tier];

                  return (
                    <li
                      key={item.id ?? item.name}
                      className="border-t border-border/50 pt-3 first:border-t-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-geist-mono text-sm font-semibold text-text">
                          {item.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-geist-mono text-[10px] font-semibold uppercase tracking-wider ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1 font-geist-mono text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
