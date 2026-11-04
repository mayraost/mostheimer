import React from 'react';
import Image from 'next/image';
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react';
import type { Page, Media } from '@/payload-types';
import { CardHeader } from '../ui/industrial';

type ImageTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'imageText' }>;

export function ImageTextBlock({ block }: { block: ImageTextBlockData }) {
  const isImageRight = block.imagePosition === 'right';
  const image = typeof block.image === 'object' ? (block.image as Media) : null;

  return (
    <section className="w-full py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-stretch">
          <div
            className={[
              'relative min-h-[240px] overflow-hidden rounded-[6px] border border-border bg-surface',
              isImageRight ? 'md:order-2' : 'md:order-1',
            ].join(' ')}
          >
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.alt || block.heading || ''}
                fill
                className="object-cover"
              />
            ) : (
              <div className="dot-grid flex h-full min-h-[240px] items-center justify-center">
                <span className="mono-label text-muted-foreground">[ image ]</span>
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
            <CardHeader label="content" tone="secondary" />
            <h2 className="mb-4 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-3xl">
              {block.heading}
            </h2>
            {block.text && (
              // Lexical-Renderer (kein dangerouslySetInnerHTML — Stored-XSS-Fix)
              <LexicalRichText data={block.text} className="prose-industrial" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
