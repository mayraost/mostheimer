import React from 'react';

import type { Page } from '@/payload-types';
import { BentoTile } from '../ui/industrial';

type TestimonialBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'testimonial' }
>;
type TestimonialItem = NonNullable<TestimonialBlockData['items']>[number];

/**
 * Testimonial: Zitatkarten mit überdimensionalem Anführungszeichen,
 * Emerald-Left-Accent-Bar und Mono-Attribution. Bewusst andere Kanten-Sprache
 * als CaseStudy (Bars + große Typo statt Meta-Spalte).
 */
export function TestimonialBlock({ block }: { block: TestimonialBlockData }) {
  const items = block.items ?? [];

  return (
    <section className="w-full border-t border-border pt-6 pb-14 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        {block.heading && (
          <h2 className="mb-8 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
            {block.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {items.map((item: TestimonialItem) => (
            <BentoTile
              as="figure"
              key={item.id ?? item.author}
              className="relative h-full justify-between gap-6 border-l-2 border-l-primary p-5 lg:p-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-2 select-none font-heading text-6xl leading-none text-primary/15"
              >
                &rdquo;
              </span>

              <blockquote className="relative text-base leading-relaxed text-foreground">
                {item.quote}
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                <span
                  aria-hidden="true"
                  className="mono-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted-foreground"
                >
                  {item.author
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-sm font-semibold tracking-tight text-foreground">
                    {item.author}
                  </span>
                  {item.role && (
                    <span className="mono-label mt-0.5 block text-muted-foreground">
                      {item.role}
                    </span>
                  )}
                </span>
              </figcaption>
            </BentoTile>
          ))}
        </div>
      </div>
    </section>
  );
}
