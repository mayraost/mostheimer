import React from 'react';
import type { Page } from '@/payload-types';
import { GaugeRing, StatusDot, stableGaugeValue } from '../ui/industrial';

type StatusBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'statusBlock' }>;

/**
 * Status strip: a flat horizontal bar (deliberately no card panel, unlike the
 * other blocks) with emerald dots, mono metrics, hairline separators and a gauge
 * ring anchored on the right.
 */
export function StatusBlock({
  block,
  copy,
}: {
  block: StatusBlockData;
  /** Shell copy (`blocks.status`): gauge label. */
  copy: { gaugeLabel: string };
}) {
  const topics = block.networkTopics ?? [];

  return (
    <section className="w-full pt-6 pb-10 lg:py-10" aria-label={block.title}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-[6px] border border-border bg-surface">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary via-secondary to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:gap-8 lg:p-6">
            <div className="flex items-center gap-3 lg:border-r lg:border-border lg:pr-8">
              <GaugeRing
                value={stableGaugeValue(block.title ?? 'status', 74, 98)}
                label={copy.gaugeLabel || undefined}
                size={72}
              />
              <div className="min-w-0">
                {block.badgeLabel && (
                  <p className="mono-label flex items-center gap-2 text-primary">
                    <StatusDot className="animate-status-pulse" />
                    {block.badgeLabel}
                  </p>
                )}
                <p className="mt-1 font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
                  {block.title}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-muted-foreground">{block.description}</p>

              {topics.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {topics.map((item) => (
                    <li
                      key={item.id ?? item.topic}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <StatusDot className="mt-[0.45rem]" />
                      <span className="min-w-0">{item.topic}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
