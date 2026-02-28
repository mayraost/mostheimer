/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Image from 'next/image';
import { TypingHeading } from '../TypingHeading';

export function HeroBlock({ block }: { block: any }) {
  return (
    <section className="relative min-h-[70vh] w-full flex flex-col items-center justify-center text-center overflow-hidden py-32 lg:py-48">
      {/* Animated Blobs */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:2s] -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen dark:bg-blue-600/30" />
      <div className="absolute bottom-8 left-1/2 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:4s] -translate-x-1/2 -translate-y-1/2 dark:mix-blend-screen dark:bg-purple-600/30" />

      {block.backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={block.backgroundImage.url}
            alt={block.backgroundImage.alt || 'Background'}
            fill
            className="object-cover opacity-10"
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        <h1 className="text-5xl lg:text-7xl font-averia font-bold text-primary mb-6 drop-shadow-sm flex items-center justify-center w-full">
          <TypingHeading text={block.heading} />
        </h1>

        {block.subheading && (
          <p className="text-xl lg:text-2xl text-text mb-10 opacity-80 font-geist-mono max-w-3xl mx-auto leading-relaxed">
            {block.subheading}
          </p>
        )}

        {block.ctaLabel && block.ctaLink && (
          <div className="mt-8">
            <a
              href={block.ctaLink}
              className="inline-block bg-primary text-white border-2 border-primary px-8 py-4 rounded-full font-semibold hover:bg-transparent hover:text-primary transition-all duration-300 font-geist-mono shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {block.ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
