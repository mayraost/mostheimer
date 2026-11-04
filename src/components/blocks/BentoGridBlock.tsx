import React from 'react';
import type { Page } from '@/payload-types';
import { Icon } from './Icon';
import { BentoTile, Chip, CornerTicks, Eyebrow, StatusDot } from '../ui/industrial';

type BentoGridBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'bentoGrid' }>;
type BentoItem = NonNullable<BentoGridBlockData['items']>[number];

/**
 * Bento-Mosaik der Architektur-Säulen (Home-Zentrepiece).
 *
 * Layout: 4-Spalten-Raster, 8px-Gaps. `featured`-Tiles spannen 2 Spalten auf
 * lg (1 Spalte mobile/tablet). Icon in kreisrundem Hairline-Rahmen,
 * Mono-"Säule 0X"-Label, Emerald/Cyan-Border-State je nach Position.
 *
 * OHNE Reifegrad-Vokabular (User-Entscheid 04.11.2026): kein
 * "featured/core"-Chip und kein Maturity-Gauge — die Hervorhebung ist rein
 * räumlich (Spanning) plus Beschreibungstiefe.
 */
function BentoCard({ item, index }: { item: BentoItem; index: number }) {
  const isEmphasis = Boolean(item.featured || item.highlight) || index % 3 === 0;

  const card = (
    <BentoTile
      className={[
        'group h-full transition-colors duration-200',
        isEmphasis
          ? 'border-primary/40 bg-surface hover:border-primary hover:shadow-[0_0_28px_-10px_rgba(16,185,129,0.55)]'
          : 'border-border bg-surface hover:border-secondary/60 hover:shadow-[0_0_28px_-10px_rgba(6,182,212,0.45)]',
      ].join(' ')}
    >
      <div className="dot-grid-dense absolute inset-0 opacity-[0.35]" aria-hidden="true" />
      <CornerTicks />

      <div className="relative flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className={`mono-label ${isEmphasis ? 'text-primary' : 'text-muted-foreground'}`}>
            Säule {String(index + 1).padStart(2, '0')}
          </span>
          <span className="mono-label flex items-center gap-1.5 text-muted-foreground">
            <StatusDot tone={isEmphasis ? 'primary' : 'secondary'} />
            {item.featured ? 'featured' : 'core'}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-3">
          {/* Icon nur bei gesetztem iconName (leere Slots dekorativ auffangen) */}
          {item.iconName ? (
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
          ) : (
            <span
              aria-hidden="true"
              className="mono-label flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-muted-foreground"
            >
              +
            </span>
          )}
        </div>

        {item.highlight && (
          <p className="mono-label mb-2 text-muted-foreground">{item.highlight}</p>
        )}

        <h3 className="mb-2 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground lg:text-xl">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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

export function BentoGridBlock({ block }: { block: BentoGridBlockData }) {
  const items = block.items ?? [];

  return (
    /* id="architektur": Ziel des Hero-CTAs "Architektur-Ansatz entdecken" */
    <section id="architektur" className="w-full scroll-mt-24 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 border-b border-border pb-6">
          <Eyebrow>Architektur-Ansatz</Eyebrow>
          {block.heading && (
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl">
              {block.heading}
            </h2>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip variant="fill">{items.length} Säulen</Chip>
            <Chip variant="outline">Systemarchitektur</Chip>
            <Chip variant="solid">composable</Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <BentoCard key={item.id ?? item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
