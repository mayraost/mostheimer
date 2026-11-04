import React from 'react';
import type { Page } from '@/payload-types';
import { Icon } from './Icon';
import { BentoTile, CardHeader, CornerTicks } from '../ui/industrial';

type FeatureGridBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'featureGrid' }
>;
type FeatureItem = NonNullable<FeatureGridBlockData['features']>[number];

export function FeatureGridBlock({ block }: { block: FeatureGridBlockData }) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto w-full max-w-6xl">
        {block.heading && (
          <div className="mb-8 border-b border-border pb-6">
            <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl">
              {block.heading}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {block.features?.map((feature: FeatureItem, index) => (
            <BentoTile
              key={feature.id ?? feature.title}
              className="group p-5 transition-colors hover:border-primary/60"
            >
              <CornerTicks />
              <div className="relative">
                <CardHeader
                  label={`0${index + 1}`}
                  meta="feature"
                  tone={index % 2 === 0 ? 'primary' : 'secondary'}
                />
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary-muted text-primary">
                  <Icon name={feature.iconName || undefined} className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </BentoTile>
          ))}
        </div>
      </div>
    </section>
  );
}
