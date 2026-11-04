import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, Chip, CardHeader } from '../ui/industrial';

type TechRadarBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'techRadar' }>;
type Quadrant = NonNullable<TechRadarBlockData['quadrants']>[number];
type RadarItem = NonNullable<Quadrant['items']>[number];

/**
 * Tier-Vokabular (Spec):
 * - core   = emerald FILLED pill
 * - proven = emerald OUTLINE pill
 * - focus  = cyan OUTLINE pill
 */
const TIER_META: Record<
  'core' | 'proven' | 'focus',
  { short: string; className: string; tone: 'primary' | 'secondary' }
> = {
  core: {
    short: 'core',
    className: 'border border-primary bg-primary text-primary-foreground',
    tone: 'primary',
  },
  proven: {
    short: 'proven',
    className: 'border border-primary/60 bg-transparent text-primary',
    tone: 'primary',
  },
  focus: {
    short: 'focus',
    className: 'border border-secondary/60 bg-transparent text-secondary',
    tone: 'secondary',
  },
};

function TierChip({ tier }: { tier: 'core' | 'proven' | 'focus' }) {
  const meta = TIER_META[tier];
  return (
    <span className={`mono-label rounded-[4px] px-2 py-0.5 text-[10px] ${meta.className}`}>
      {meta.short}
    </span>
  );
}

export function TechRadarBlock({ block }: { block: TechRadarBlockData }) {
  const quadrants = block.quadrants ?? [];

  return (
    <section className="w-full border-t border-border pt-6 pb-14 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {block.heading && (
              <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
                {block.heading}
              </h2>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip variant="fill">core</Chip>
            <Chip variant="solid">proven</Chip>
            <Chip variant="cyan">focus</Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {quadrants.map((quadrant: Quadrant, qIndex) => {
            const items = quadrant.items ?? [];
            return (
              <BentoTile
                key={quadrant.id ?? quadrant.title}
                className={
                  qIndex % 2 === 0
                    ? 'border-border p-5 hover:border-primary/40'
                    : 'border-border p-5 hover:border-secondary/50'
                }
              >
                <CardHeader
                  label={`q${qIndex + 1}`}
                  meta={`${items.length} entries`}
                  tone={qIndex % 2 === 0 ? 'primary' : 'secondary'}
                />
                <h3 className="mb-4 font-heading text-lg font-semibold tracking-tight text-foreground">
                  {quadrant.title}
                </h3>

                <ul className="divide-y divide-border">
                  {items.map((item: RadarItem) => {
                    const meta = TIER_META[item.tier];

                    return (
                      <li key={item.id ?? item.name} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`inline-block h-1.5 w-1.5 rounded-full ${
                                meta.tone === 'primary' ? 'bg-primary' : 'bg-secondary'
                              }`}
                            />
                            <span className="font-mono text-sm font-medium text-foreground">
                              {item.name}
                            </span>
                          </span>
                          <TierChip tier={item.tier} />
                        </div>
                        {item.description && (
                          <p className="mt-1 pl-3.5 text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </BentoTile>
            );
          })}
        </div>
      </div>
    </section>
  );
}
