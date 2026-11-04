import React from 'react';
import type { Page } from '@/payload-types';
import { Chip, CornerTicks, GaugeRing, StatusDot, stableGaugeValue } from '../ui/industrial';

type StatusBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'statusBlock' }>;

export function StatusBlock({ block }: { block: StatusBlockData }) {
  const topics = block.networkTopics ?? [];

  return (
    <section className="w-full py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-[8px] border border-primary/40 bg-surface shadow-[0_0_40px_-16px_rgba(16,185,129,0.55)]">
          <div className="dot-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            aria-hidden="true"
          />
          <CornerTicks />

          <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:p-8">
            <div className="min-w-0 flex-1">
              {block.badgeLabel && (
                <p className="mono-label mb-4 inline-flex items-center gap-2 rounded-[4px] border border-primary bg-primary-muted px-2.5 py-1.5 text-primary">
                  <StatusDot className="animate-status-pulse" />
                  {block.badgeLabel}
                </p>
              )}

              <h2 className="mb-3 font-heading text-xl font-bold tracking-[-0.02em] text-foreground lg:text-2xl">
                {block.title}
              </h2>

              <p className="text-base leading-relaxed text-muted-foreground">{block.description}</p>

              {topics.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {topics.map((item) => (
                    <Chip key={item.id ?? item.topic} variant="outline">
                      {item.topic}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-center gap-4 lg:flex-col">
              <GaugeRing
                value={stableGaugeValue(block.title ?? 'status', 70, 98)}
                label="signal"
                size={96}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
