import React from 'react';
import type { Page } from '@/payload-types';
import { Icon, isKnownIcon } from './Icon';
import { BentoTile, Chip, CornerTicks, Eyebrow, StatusDot } from '../ui/industrial';

type BentoGridBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'bentoGrid' }>;
type BentoItem = NonNullable<BentoGridBlockData['items']>[number];

/**
 * Bento mosaic of the architecture pillars (homepage centrepiece).
 *
 * Layout: 4-column grid with 8px gaps; `featured` tiles span 2 columns on lg
 * (1 on mobile/tablet). Icon in a round hairline frame, mono "pillar 0X" label.
 * The featured tile carries an emerald hairline, the others a neutral one.
 *
 * No maturity vocabulary on purpose: no "core" chip and no maturity gauge —
 * emphasis is purely spatial (spanning) plus the featured hairline.
 *
 * Icon contract: the CMS select offers every Lucide name, the frontend only
 * renders the small `ICON_CATALOG`. When a stored name is outside that
 * catalog the frame must NOT render — an empty emerald/dashed ring reads as
 * broken ("Säule 02/03/05 look weird"), worse than having no icon at all.
 */
function BentoCard({ item, index, locale }: { item: BentoItem; index: number; locale?: string }) {
  /*
   * Emphasis is the CMS `featured` flag — nothing else. Two earlier sources of
   * noise are gone on purpose:
   * - `index % 3 === 0` promoted cards 01 and 04 without any content reason,
   * - `item.highlight` is a per-card teaser LINE ("Millions of requests.") that
   *   almost every pillar has; treating it as emphasis promoted all of them.
   *
   * Result before: five pillars showed one mixed set of emerald tiles, so the
   * non-featured ones read as half-loaded copies instead of a hierarchy.
   */
  const isEmphasis = Boolean(item.featured);
  const hasIcon = isKnownIcon(item.iconName);
  const de = locale === 'de';
  const pillarLabel = `${de ? 'Säule' : 'Pillar'} ${String(index + 1).padStart(2, '0')}`;

  const card = (
    <BentoTile
      className={[
        'group h-full transition-colors duration-200',
        isEmphasis
          ? // Featured pillar: emerald hairline + emerald corner ticks carry the
            // hierarchy (spans 2 columns). Only one tile should look like this.
            'border-primary/50 bg-surface hover:border-primary hover:shadow-[0_0_28px_-10px_rgba(16,185,129,0.55)]'
          : // Core pillars: neutral hairline that only lights up on hover.
            'border-border-strong/70 bg-surface/70 hover:border-secondary/60 hover:bg-surface hover:shadow-[0_0_28px_-10px_rgba(6,182,212,0.45)]',
      ].join(' ')}
    >
      <div className="dot-grid-dense absolute inset-0 opacity-[0.35]" aria-hidden="true" />
      <CornerTicks className={isEmphasis ? 'text-primary/40' : undefined} />

      <div className="relative flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className={`mono-label ${isEmphasis ? 'text-primary' : 'text-muted-foreground'}`}>
            {pillarLabel}
          </span>
          {item.featured && (
            <span className="mono-label flex items-center gap-1.5 text-primary">
              <StatusDot tone="primary" />
              Featured
            </span>
          )}
        </div>

        {hasIcon && (
          <div className="mb-4 flex items-center gap-3">
            <span
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border',
                isEmphasis
                  ? 'border-primary/50 bg-primary-muted text-primary'
                  : 'border-secondary/40 bg-secondary/10 text-secondary',
              ].join(' ')}
            >
              <Icon name={item.iconName} className="h-5 w-5" />
            </span>
          </div>
        )}

        {item.highlight && (
          <p className="mono-label mb-2 text-muted-foreground">{item.highlight}</p>
        )}

        <h3
          className={[
            'mb-2 font-heading font-semibold leading-snug tracking-tight text-foreground',
            isEmphasis ? 'text-lg lg:text-xl' : 'text-lg',
          ].join(' ')}
        >
          {item.title}
        </h3>

        {item.description && (
          <p
            className={[
              'text-sm leading-relaxed',
              isEmphasis ? 'text-muted-foreground' : 'text-muted-foreground/85',
            ].join(' ')}
          >
            {item.description}
          </p>
        )}

        {item.ctaLabel && (
          <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
            <span className="mono-label text-muted-foreground">{'->'}</span>
            <span
              className={[
                'mono-label transition-colors',
                isEmphasis ? 'text-primary' : 'text-secondary',
              ].join(' ')}
            >
              {item.ctaLabel}
            </span>
          </div>
        )}
      </div>
    </BentoTile>
  );

  const spanClass = item.featured ? 'lg:col-span-2' : '';

  if (item.ctaLink) {
    return (
      <a
        href={item.ctaLink}
        className={`${spanClass} block h-full rounded-[6px] focus-visible:outline-none`}
      >
        {card}
      </a>
    );
  }

  return <div className={spanClass}>{card}</div>;
}

export function BentoGridBlock({ block, locale }: { block: BentoGridBlockData; locale?: string }) {
  const items = block.items ?? [];
  const de = locale === 'de';

  return (
    /* id="architektur": anchor target of the hero CTA. */
    <section id="architektur" className="w-full scroll-mt-24 pt-6 pb-16 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 border-b border-border pb-6">
          <Eyebrow>{de ? 'Architektur-Ansatz' : 'Architecture approach'}</Eyebrow>
          {block.heading && (
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl">
              {block.heading}
            </h2>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip variant="fill">
              {items.length} {de ? 'Säulen' : items.length === 1 ? 'pillar' : 'pillars'}
            </Chip>
            <Chip variant="outline">{de ? 'Systemarchitektur' : 'System architecture'}</Chip>
            <Chip variant="solid">composable</Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <BentoCard key={item.id ?? item.title} item={item} index={index} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
