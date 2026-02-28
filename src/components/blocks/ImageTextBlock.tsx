import React from 'react';
import Image from 'next/image';
import type { Page, Media } from '@/payload-types';

type ImageTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'imageText' }>;

export function ImageTextBlock({ block }: { block: ImageTextBlockData }) {
  const isImageRight = block.imagePosition === 'right';
  const image = typeof block.image === 'object' ? (block.image as Media) : null;

  return (
    <section className="w-full py-16 my-10 flex flex-col md:flex-row items-center gap-12">
      <div className={`flex-1 ${isImageRight ? 'md:order-2' : 'md:order-1'}`}>
        {image?.url && (
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={image.url}
              alt={image.alt || block.heading || ''}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div className={`flex-1 ${isImageRight ? 'md:order-1' : 'md:order-2'}`}>
        <h2 className="text-3xl lg:text-5xl font-averia font-bold mb-6">{block.heading}</h2>
        {block.text && (
          <div
            className="text-lg opacity-80 font-geist-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block.text, null, 2) }}
          />
        )}
      </div>
    </section>
  );
}
