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
export function HeroBlock({
  block,
  variant = 'home',
  eyebrow,
}: {
  block: HeroBlockData;
  /**
   * `home` = full hero incl. the 4-metric strip below the fold edge.
   * `compact` = subpage header: same identity, but a one-line lead paragraph
   * clamp, inline metrics and a closed portrait slot (no second screen of
   * boilerplate before the real content).
   */
  variant?: 'home' | 'compact';
  /** Breadcrumb eyebrow for subpages (e.g. `Start // Impressum`); home has none. */
  eyebrow?: string;
}) {
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

      <div
        className={[
          'relative mx-auto grid w-full max-w-6xl gap-8 px-4 md:px-8',
          variant === 'compact'
            ? 'pt-5 pb-6 lg:grid-cols-[minmax(0,1fr)_180px] lg:pt-8 lg:pb-10'
            : 'pt-6 pb-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:pt-16 lg:pb-20',
        ].join(' ')}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="mono-label mb-4 flex items-center gap-2 text-muted-foreground">
              <StatusDot />
              {eyebrow}
            </p>
          )}
          <div
            className={[
              'flex flex-wrap items-center gap-2',
              variant === 'compact' ? 'mb-4' : 'mb-8',
            ].join(' ')}
          >
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
            {/* Subpages drop the badge row's third line by moving the location
                inline: the page header must not cost a second screen. */}
            {variant === 'compact' && (
              <span className="mono-label rounded-[4px] border border-border px-2.5 py-1.5 text-muted-foreground">
                Kiebitzreihe · Hamburg area
              </span>
            )}
          </div>

          <h1
            className={[
              'font-heading font-bold leading-[1.04] tracking-[-0.035em] text-foreground',
              variant === 'compact'
                ? 'mb-4 text-[clamp(1.75rem,3.4vw,2.75rem)]'
                : 'mb-6 text-[clamp(2rem,5.2vw,4.25rem)]',
            ].join(' ')}
          >
            <TypingHeading text={block.heading} />
          </h1>

          {block.subheading && (
            <p
              className={[
                'mb-8 max-w-2xl leading-relaxed text-muted-foreground',
                variant === 'compact' ? 'line-clamp-3 text-base' : 'text-base sm:text-lg',
              ].join(' ')}
            >
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

          {variant === 'compact' && (
            <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
              {METRICS.map((metric) => (
                <div key={metric.label} className="bg-background px-3 py-2.5">
                  <dt className="mono-label text-muted-foreground">{metric.label}</dt>
                  <dd className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {variant === 'home' && block.showStackBadge !== false && (
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
        <aside
          className={[
            'relative hidden self-start rounded-[8px] border border-border bg-surface p-4',
            variant === 'compact' ? '' : 'lg:block',
          ].join(' ')}
        >
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

      {/* Mono metric strip: hairline separators, no invented figures. Home
          only — the full-width strip is the page's own signature; subpages
          carry the same numbers inline (`compact`) so nobody scrolls past two
          screens of boilerplate before reaching the actual content. */}
      {variant === 'home' && (
        <dl className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-px border-t border-border bg-border px-0 md:grid-cols-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-background px-4 py-3 md:px-8">
              <dt className="mono-label text-muted-foreground">{metric.label}</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-foreground">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
