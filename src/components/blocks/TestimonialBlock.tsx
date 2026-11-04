import React from 'react';

import type { Page } from '@/payload-types';

type TestimonialBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'testimonial' }
>;
type TestimonialItem = NonNullable<TestimonialBlockData['items']>[number];

export function TestimonialBlock({ block }: { block: TestimonialBlockData }) {
  return (
    <section className="w-full border-t border-border py-14 first:border-t-0">
      <div className="mx-auto max-w-5xl px-4">
        {block.heading && (
          <h2 className="mb-10 text-2xl font-averia font-bold text-text lg:text-3xl">
            {block.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {block.items?.map((item: TestimonialItem) => (
            <figure
              key={item.id ?? item.author}
              className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-6"
            >
              <blockquote className="font-geist-mono text-sm leading-relaxed opacity-80 lg:text-base">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="border-t border-border/50 pt-4">
                <div className="text-base font-averia font-bold text-text">{item.author}</div>
                {item.role && (
                  <div className="mt-0.5 font-geist-mono text-xs text-muted-foreground">
                    {item.role}
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
