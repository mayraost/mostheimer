import React from 'react';

import type { Page } from '@/payload-types';

import { Icon } from './Icon';

type SkillsetBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'skillset' }>;
type SkillsetItem = NonNullable<SkillsetBlockData['items']>[number];

function SkillsetCard({ item }: { item: SkillsetItem }) {
  return (
    <div
      className={[
        'flex h-full flex-col gap-2 rounded-lg border p-5',
        item.highlight ? 'border-primary bg-primary-muted' : 'border-border bg-surface',
      ].join(' ')}
    >
      {item.iconName ? (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={item.iconName} className="h-5 w-5" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-averia text-base font-bold text-text">{item.name}</h3>
        {item.level && (
          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 font-geist-mono text-xs font-semibold text-primary-foreground">
            {item.level}
          </span>
        )}
      </div>

      {item.description && (
        <p className="font-geist-mono text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  );
}

export function SkillsetBlock({ block }: { block: SkillsetBlockData }) {
  return (
    <section className="w-full py-14 border-t border-border first:border-t-0">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-averia font-bold text-text mb-4">
          {block.heading}
        </h2>

        {block.description && (
          <p className="mb-8 max-w-3xl font-geist-mono text-sm lg:text-base leading-relaxed text-muted-foreground">
            {block.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {block.items?.map((item) => (
            <SkillsetCard key={item.id ?? item.name} item={item} />
          ))}
        </div>

        {block.ctaLabel && block.ctaLink && (
          <div className="mt-8">
            <a
              href={block.ctaLink}
              className="font-geist-mono text-sm font-semibold text-primary hover:underline"
            >
              {block.ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
