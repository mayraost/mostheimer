import React from 'react';
import type { Page } from '@/payload-types';
import { Icon } from './Icon';
import { BentoTile, CardHeader, Chip } from '../ui/industrial';

type SkillsetBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'skillset' }>;
type SkillsetItem = NonNullable<SkillsetBlockData['items']>[number];

function SkillsetCard({ item, index }: { item: SkillsetItem; index: number }) {
  return (
    <BentoTile
      className={[
        'group h-full gap-3 p-5 transition-colors',
        item.highlight
          ? 'border-primary/50 bg-surface hover:border-primary'
          : 'border-border hover:border-secondary/60',
      ].join(' ')}
    >
      <CardHeader
        label={`skill ${String(index + 1).padStart(2, '0')}`}
        tone={item.highlight ? 'primary' : 'muted'}
      />

      <div className="flex items-start gap-3">
        {item.iconName ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted-foreground">
            <Icon name={item.iconName} className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
            {item.name}
          </h3>
          {item.level && (
            <div className="mt-2">
              <Chip variant={item.highlight ? 'fill' : 'outline'}>{item.level}</Chip>
            </div>
          )}
        </div>
      </div>

      {item.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
    </BentoTile>
  );
}

export function SkillsetBlock({ block }: { block: SkillsetBlockData }) {
  return (
    <section className="w-full border-t border-border py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <CardHeader label="skillset" meta={`${block.items?.length ?? 0} items`} />
          <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
            {block.heading}
          </h2>
          {block.description && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              {block.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {block.items?.map((item, index) => (
            <SkillsetCard key={item.id ?? item.name} item={item} index={index} />
          ))}
        </div>

        {block.ctaLabel && block.ctaLink && (
          <div className="mt-8">
            <a
              href={block.ctaLink}
              className="mono-label inline-flex items-center gap-2 text-primary transition-colors hover:text-primary-hover"
            >
              {block.ctaLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
