import React from 'react';
import type { Page } from '@/payload-types';
import { Icon } from './Icon';

type BentoGridBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'bentoGrid' }>;
type BentoItem = NonNullable<BentoGridBlockData['items']>[number];

function BentoCard({ item, isLarge }: { item: BentoItem; isLarge: boolean }) {
  const content = (
    <div
      className={[
        'group relative flex flex-col justify-between h-full min-h-[200px] p-6 rounded-2xl border border-border bg-header',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        item.ctaLink ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/[0.03] transition-colors duration-300 pointer-events-none" />

      <div className="relative z-10">
        {item.iconName && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Icon name={item.iconName} className="w-5 h-5" />
          </div>
        )}

        {item.highlight && (
          <p className="font-geist-mono text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
            {item.highlight}
          </p>
        )}

        <h3 className="text-lg lg:text-xl font-averia font-bold text-text mb-3">{item.title}</h3>

        {item.description && (
          <p className="font-geist-mono text-sm opacity-70 leading-relaxed">{item.description}</p>
        )}
      </div>

      {item.ctaLabel && (
        <div className="relative z-10 mt-4 pt-4 border-t border-border/50">
          <span className="font-geist-mono text-xs font-semibold text-primary group-hover:underline">
            {item.ctaLabel} →
          </span>
        </div>
      )}
    </div>
  );

  const spanClass = isLarge ? 'md:col-span-2 lg:col-span-2' : 'col-span-1';

  if (item.ctaLink) {
    return (
      <a href={item.ctaLink} className={spanClass}>
        {content}
      </a>
    );
  }

  return <div className={spanClass}>{content}</div>;
}

export function BentoGridBlock({ block }: { block: BentoGridBlockData }) {
  const total = block.items?.length || 0;

  return (
    <section className="w-full py-16 my-4">
      <div className="max-w-5xl mx-auto px-4">
        {block.heading && (
          <h2 className="text-3xl lg:text-4xl font-averia font-bold text-text mb-10">
            {block.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {block.items?.map((item, index) => {
            // Smart spanning: if it's explicitly featured, or it's the last item and we need to fill the row
            let isLarge = !!item.featured;
            if (!item.featured && index === total - 1 && total % 3 === 1) {
              isLarge = true; // fill the last partial row in a 3-col layout
            } else if (!item.featured && total === 4 && index === 3) {
              isLarge = true; // for 4 items, make 1st (if featured) and 4th large to balance it!
            }
            return <BentoCard key={item.id ?? item.title} item={item} isLarge={isLarge} />;
          })}
        </div>
      </div>
    </section>
  );
}
