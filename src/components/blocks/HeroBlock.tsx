import React from 'react';
import Image from 'next/image';
import type { Page, Media } from '@/payload-types';
import { TypingHeading } from '../TypingHeading';

type HeroBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>;

const STACK_ITEMS = ['Node 24', 'Next.js 16', 'Tailwind 4', 'PayloadCMS 3'];

export function HeroBlock({ block }: { block: HeroBlockData }) {
  const bgImage =
    block.backgroundImage !== null &&
    block.backgroundImage !== undefined &&
    typeof block.backgroundImage === 'object'
      ? (block.backgroundImage as Media)
      : null;

  return (
    <section className="relative min-h-[70vh] w-full flex flex-col items-center justify-center text-center overflow-hidden py-32 lg:py-48">
      {/* Animated Blobs */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:2s] -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen dark:bg-blue-600/30" />
      <div className="absolute bottom-8 left-1/2 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:4s] -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen dark:bg-purple-600/30" />

      {bgImage?.url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bgImage.url}
            alt={bgImage.alt || 'Background'}
            fill
            className="object-cover opacity-10"
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        {block.showStackBadge !== false && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {STACK_ITEMS.map((item, i) => (
              <React.Fragment key={item}>
                <span className="font-geist-mono text-xs text-primary/80 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  {item}
                </span>
                {i < STACK_ITEMS.length - 1 && <span className="text-border select-none">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        <h1 className="text-5xl lg:text-7xl font-averia font-bold text-primary mb-6 drop-shadow-sm flex items-center justify-center w-full">
          <TypingHeading text={block.heading} />
        </h1>

        {block.subheading && (
          <p className="text-xl lg:text-2xl text-text mb-10 opacity-80 font-geist-mono max-w-3xl mx-auto leading-relaxed">
            {block.subheading}
          </p>
        )}

        {(block.ctaLabel || block.ctaLabel2) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {block.ctaLabel && block.ctaLink && (
              <a
                href={block.ctaLink}
                className="inline-block bg-primary text-white border-2 border-primary px-8 py-4 rounded-full font-semibold hover:bg-transparent hover:text-primary transition-all duration-300 font-geist-mono shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {block.ctaLabel}
              </a>
            )}
            {block.ctaLabel2 && block.ctaLink2 && (
              <a
                href={block.ctaLink2}
                className="inline-block bg-transparent text-primary border-2 border-primary px-8 py-4 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 font-geist-mono hover:shadow-lg transform hover:-translate-y-1"
              >
                {block.ctaLabel2}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
