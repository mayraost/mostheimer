import React from 'react';
import type { Page } from '@/payload-types';

type StatusBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'statusBlock' }>;

export function StatusBlock({ block }: { block: StatusBlockData }) {
  return (
    <section className="w-full py-12 my-4">
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-8 relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {block.badgeLabel && (
              <span className="inline-block font-geist-mono text-xs font-semibold text-primary bg-primary/15 border border-primary/30 px-3 py-1 rounded-full mb-4">
                {block.badgeLabel}
              </span>
            )}

            <h2 className="text-xl lg:text-2xl font-averia font-bold text-text mb-3">
              {block.title}
            </h2>

            <p className="font-geist-mono text-sm lg:text-base opacity-80 leading-relaxed mb-5">
              {block.description}
            </p>

            {block.networkTopics && block.networkTopics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {block.networkTopics.map((item) => (
                  <span
                    key={item.id ?? item.topic}
                    className="font-geist-mono text-xs text-text/70 bg-header border border-border px-3 py-1 rounded-full"
                  >
                    {item.topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
