import React from 'react';
import Image from 'next/image';
import type { Page, Media } from '@/payload-types';
import { TypingHeading } from '../TypingHeading';
import { StatusDot } from '../ui/industrial';

type HeroBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>;

const STACK_ITEMS = ['Node 26', 'Next.js 16', 'Tailwind 4', 'PayloadCMS 4'];

const METRICS = [
  { label: 'Experience', value: '~10 yrs' },
  { label: 'Focus', value: 'composable' },
  { label: 'Mode', value: 'remote (DE)' },
  { label: 'Response', value: '< 24 h' },
];

/**
 * Hero: oversized Space Grotesk display, mono status chips (filled + outline),
 * a dense CTA row (primary + ghost) and an optional portrait slot. The portrait
 * is a typographic placeholder on purpose — no stock photo — until a real image
 * is uploaded in the CMS.
 */
export function HeroBlock({ block }: { block: HeroBlockData }) {
  const bgImage =
    block.backgroundImage !== null &&
    block.backgroundImage !== undefined &&
    typeof block.backgroundImage === 'object'
      ? (block.backgroundImage as Media)
      : null;

  return (
    <section className="relative -mx-4 mb-2 overflow-hidden border-b border-border md:-mx-8">
      <div className="grid-matrix absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_-10%,rgba(16,185,129,0.14),transparent_70%)]"
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

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 pt-6 pb-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:pt-16 lg:pb-20">
        <div className="min-w-0">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {/* KEIN "available for work"-Chip (Nutzerentscheid 04.11.2026):
                eine Verfügbarkeitsaussage kann gegenüber dem aktuellen
                Arbeitgeber falsch wirken. Der Hero behält nur neutrale
                Rollen-/Stack-Chips. */}
            <span className="mono-label rounded-[4px] border border-primary/50 bg-primary-muted px-2.5 py-1.5 text-primary">
              web &amp; application architect
            </span>
            <span className="mono-label rounded-[4px] border border-border-strong px-2.5 py-1.5 text-muted-foreground">
              Senior-Level FullStack
            </span>
            <span className="mono-label rounded-[4px] border border-secondary/60 px-2.5 py-1.5 text-secondary">
              remote · DE
            </span>
          </div>

          <h1 className="mb-6 font-heading text-[clamp(2rem,5.2vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
            <TypingHeading text={block.heading} />
          </h1>

          {block.subheading && (
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {block.subheading}
            </p>
          )}

          {(block.ctaLabel || block.ctaLabel2) && (
            <div className="flex flex-wrap items-center gap-2">
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

          {block.showStackBadge !== false && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="mono-label mr-1 text-muted-foreground">stack</span>
              {STACK_ITEMS.map((item) => (
                <span
                  key={item}
                  className="mono-label rounded-[4px] border border-border px-2 py-1 text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Portrait slot: typographic placeholder within the frame system */}
        <aside className="relative hidden self-start rounded-[8px] border border-border bg-surface p-4 lg:block">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary" />
          </span>
          <div className="dot-grid flex aspect-[3/4] items-center justify-center rounded-[6px] border border-border bg-background">
            <span className="font-heading text-5xl font-bold tracking-tighter text-primary/30">
              MO
            </span>
          </div>
          <p className="mono-label mt-3 text-foreground">Mayra Ostheimer</p>
          <p className="mono-meta mt-1 flex items-center gap-2 text-muted-foreground">
            <StatusDot />
            Kiebitzreihe · Hamburg area
          </p>
        </aside>
      </div>

      {/* Mono metric strip: hairline separators, no invented figures */}
      <dl className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-px border-t border-border bg-border px-0 md:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.label} className="bg-background px-4 py-3 md:px-8">
            <dt className="mono-label text-muted-foreground">{metric.label}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-foreground">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
