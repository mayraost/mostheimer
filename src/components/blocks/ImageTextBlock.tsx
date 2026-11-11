import React from 'react';
import Image from 'next/image';
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react';
import type { Page, Media } from '@/payload-types';
import { mediaSrc } from '@/lib/mediaSrc';
import { CardHeader } from '../ui/industrial';

type ImageTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'imageText' }>;

export function ImageTextBlock({
  block,
  copy,
}: {
  block: ImageTextBlockData;
  /** Shell copy (`blocks.imageText`): optional eyebrow + missing-image marker. */
  copy: { eyebrow: string; imagePlaceholder: string };
}) {
  const isImageRight = block.imagePosition === 'right';
  const image = typeof block.image === 'object' ? (block.image as Media) : null;
  // Payload reports absolute URLs; `next/image` rejects them as remote (no
  // remotePatterns) with 400. `mediaSrc` reduces them to the served path.
  const imageUrl = mediaSrc(image?.url);

  return (
    <section className="w-full pt-6 pb-12 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-stretch">
          <div
            className={[
              'relative min-h-[240px] overflow-hidden rounded-[6px] border border-border bg-surface',
              isImageRight ? 'md:order-2' : 'md:order-1',
            ].join(' ')}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={image?.alt || block.heading || ''}
                fill
                className="object-cover"
              />
            ) : (
              <div className="dot-grid flex h-full min-h-[240px] items-center justify-center">
                {copy.imagePlaceholder && (
                  <span className="mono-label text-muted-foreground">{copy.imagePlaceholder}</span>
                )}
              </div>
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[6px] ring-1 ring-inset ring-white/10"
            />
          </div>

          <div
            className={[
              'rounded-[6px] border border-border bg-surface p-5 lg:p-8',
              isImageRight ? 'md:order-1' : 'md:order-2',
            ].join(' ')}
          >
            <CardHeader label={copy.eyebrow || undefined} tone="secondary" />
            <h2 className="mb-4 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
              {block.heading}
            </h2>
            {block.text && (
              // Lexical renderer, never dangerouslySetInnerHTML (stored XSS).
              <LexicalRichText data={block.text} className="prose-industrial" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
