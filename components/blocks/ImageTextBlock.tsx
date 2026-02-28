/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Image from 'next/image';

export function ImageTextBlock({ block }: { block: any }) {
  const isImageRight = block.imagePosition === 'right';

  return (
    <section className="w-full py-16 my-10 flex flex-col md:flex-row items-center gap-12">
      <div className={`flex-1 ${isImageRight ? 'md:order-2' : 'md:order-1'}`}>
        {block.image && typeof block.image !== 'string' && (
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={block.image.url}
              alt={block.image.alt || block.heading}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div className={`flex-1 ${isImageRight ? 'md:order-1' : 'md:order-2'}`}>
        <h2 className="text-3xl lg:text-5xl font-averia font-bold mb-6">{block.heading}</h2>
        <p className="text-lg opacity-80 font-geist-mono leading-relaxed">{block.text}</p>
      </div>
    </section>
  );
}
