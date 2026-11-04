import React from 'react';
import Image from 'next/image';
import type { Page, Media } from '@/payload-types';
import { TypingHeading } from '../TypingHeading';
import { Chip, StatusDot } from '../ui/industrial';

type HeroBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>;

const STACK_ITEMS = ['Node 24', 'Next.js 16', 'Tailwind 4', 'PayloadCMS 4'];

export function HeroBlock({ block }: { block: HeroBlockData }) {
  const bgImage =
    block.backgroundImage !== null &&
    block.backgroundImage !== undefined &&
    typeof block.backgroundImage === 'object'
      ? (block.backgroundImage as Media)
      : null;

  return (
    <section className="relative -mx-4 overflow-hidden border-b border-border md:-mx-8">
      {/* Textur-Layer: Grid-Matrix + Emerald/Cyan-Glow (kein Blob) */}
      <div className="grid-matrix absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden="true"
      />

      {bgImage?.url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bgImage.url}
            alt={bgImage.alt || ''}
            fill
            className="object-cover opacity-15"
          />
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-20 md:px-8 lg:py-32">
        {/* Status-Zeile */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="mono-label inline-flex items-center gap-2 rounded-[4px] border border-primary/50 bg-primary-muted px-2.5 py-1.5 text-primary">
            <StatusDot className="animate-status-pulse" />
            available for work
          </span>
          <span className="mono-label rounded-[4px] border border-secondary/50 bg-secondary/10 px-2.5 py-1.5 text-secondary">
            remote · DE
          </span>
          <span className="mono-label rounded-[4px] border border-border-strong px-2.5 py-1.5 text-muted-foreground">
            esper / schell
          </span>
        </div>

        <h1 className="mb-6 flex w-full justify-start font-heading text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-7xl">
          <TypingHeading text={block.heading} />
        </h1>

        {block.subheading && (
          <p className="mb-10 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {block.subheading}
          </p>
        )}

        {block.showStackBadge !== false && (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="mono-label mr-1 text-muted-foreground">stack</span>
            {STACK_ITEMS.map((item) => (
              <Chip key={item} variant="outline">
                {item}
              </Chip>
            ))}
          </div>
        )}

        {(block.ctaLabel || block.ctaLabel2) && (
          <div className="flex flex-wrap items-center gap-3">
            {block.ctaLabel && block.ctaLink && (
              <a
                href={block.ctaLink}
                className="mono-label inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-primary px-5 text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {block.ctaLabel}
                <span aria-hidden="true">→</span>
              </a>
            )}
            {block.ctaLabel2 && block.ctaLink2 && (
              <a
                href={block.ctaLink2}
                className="mono-label inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-border-strong px-5 text-foreground transition-colors hover:border-secondary hover:text-secondary"
              >
                {block.ctaLabel2}
              </a>
            )}
          </div>
        )}

        {/* Mono-Metrik-Zeile (Industrie-Anmutung, rein dekorativ) */}
        <dl className="mt-14 grid grid-cols-2 gap-2 border-t border-border pt-6 sm:grid-cols-4">
          {[
            ['Uptime', '99.98%'],
            ['Latency p95', '< 120ms'],
            ['Architektur', 'Composable'],
            ['Team', 'Lead-ready'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="mono-label text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
