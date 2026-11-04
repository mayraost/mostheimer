import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile, CardHeader } from '../ui/industrial';

type TestimonialBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'testimonial' }
>;
type TestimonialItem = NonNullable<TestimonialBlockData['items']>[number];

export function TestimonialBlock({ block }: { block: TestimonialBlockData }) {
  const items = block.items ?? [];

  return (
    <section className="w-full border-t border-border py-14">
      <div className="mx-auto w-full max-w-6xl">
        {block.heading && (
          <h2 className="mb-8 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
            {block.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {items.map((item: TestimonialItem, index) => (
            <BentoTile
              as="figure"
              key={item.id ?? item.author}
              className="h-full justify-between gap-5 p-5 transition-colors hover:border-primary/40"
            >
              <CardHeader
                label={`ref ${String(index + 1).padStart(2, '0')}`}
                meta="verified"
                tone={index % 2 === 0 ? 'primary' : 'secondary'}
              />
              <blockquote className="text-base leading-relaxed text-foreground/90">
                <span aria-hidden="true" className="mr-1 font-mono text-secondary">
                  &gt;
                </span>
                {item.quote}
              </blockquote>
              <figcaption className="border-t border-border pt-4">
                <div className="font-heading text-base font-semibold tracking-tight text-foreground">
                  {item.author}
                </div>
                {item.role && (
                  <div className="mono-label mt-1 text-muted-foreground">{item.role}</div>
                )}
              </figcaption>
            </BentoTile>
          ))}
        </div>
      </div>
    </section>
  );
}
