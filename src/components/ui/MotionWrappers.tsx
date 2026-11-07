'use client';

import { useCallback } from 'react';
import { useBentoSpotlight } from '@/hooks/useBentoSpotlight';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * Thin client wrappers that add motion to SERVER-RENDERED children.
 *
 * The pages stay Server Components (spec §4.2): these wrappers only own a ref
 * and an observer, they never receive data and never re-render their children.
 * `children` arrive as a pre-rendered React tree, so no block markup moves into
 * the client bundle.
 *
 * Grid items carry `data-reveal` themselves, so staggering is per card rather
 * than per section. `--stagger-index` is set by the observer from the item's
 * DOM order (capped at 5 → 225ms in CSS).
 */

export function RevealGrid({
  children,
  className = '',
  itemSelector = '[data-reveal]',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  /** Semantic element (`dl` keeps `dt`/`dd` children valid). */
  as?: 'div' | 'dl' | 'ul';
}) {
  const ref = useScrollReveal<HTMLDivElement>(itemSelector);
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Bento grid with the pointer-proximity spotlight. Combines the reveal
 * observer (once per card) with the single rAF-throttled pointer listener.
 */
export function SpotlightGrid({
  children,
  className = '',
  itemSelector = '[data-reveal]',
}: {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
}) {
  const onRevealRef = useScrollReveal<HTMLDivElement>(itemSelector);
  const onSpotlightRef = useBentoSpotlight<HTMLDivElement>();

  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      onRevealRef.current = node;
      onSpotlightRef.current = node;
    },
    [onRevealRef, onSpotlightRef],
  );

  return (
    <div ref={attach} className={['spotlight-grid', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
