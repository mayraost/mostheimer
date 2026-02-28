import React from 'react';
import type { Page } from '@/payload-types';

type CallToActionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'callToAction' }
>;

export function CallToActionBlock({ block }: { block: CallToActionBlockData }) {
  const styleStr =
    block.style === 'secondary'
      ? 'bg-transparent border-2 border-primary text-text'
      : 'bg-primary text-white border-2 border-primary';

  return (
    <section className="w-full py-16 bg-header rounded-3xl p-8 lg:p-12 text-center my-10 border border-border">
      <h2 className="text-3xl lg:text-5xl font-averia font-bold mb-4">{block.heading}</h2>
      {block.text && (
        <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto font-geist-mono">{block.text}</p>
      )}
      <a
        href={block.buttonLink}
        className={`inline-block px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity font-geist-mono ${styleStr}`}
      >
        {block.buttonLabel}
      </a>
    </section>
  );
}
