'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { motionEnabled } from './useScrollReveal';

/**
 * Cursor-proximity spotlight for a bento grid (Linear style, spec §3.1).
 *
 * Performance contract — this is the whole point of the hook:
 * - ONE throttled `pointermove` listener on the grid wrapper, not one per card.
 * - Coordinates are written as CSS custom properties (`--mouse-x` / `--mouse-y`)
 *   directly on the hovered card, coalesced through `requestAnimationFrame`.
 *   NO React state and therefore NO re-render on mouse movement.
 * - Registered only for devices with a real hover-capable pointer
 *   (`matchMedia('(hover: hover) and (pointer: fine)')`); touch devices never
 *   attach the listener at all.
 * - Inert when animations are off (`no-animations` / reduce-motion), because
 *   the CSS that paints the highlight lives behind the same guardrail.
 *
 * The card marks the coordinate space: `position: relative` + `overflow:
 * hidden` on a `.spotlight-card` (the grid itself carries `.spotlight-grid`).
 */
export function useBentoSpotlight<T extends HTMLElement = HTMLDivElement>(): RefObject<T | null> {
  const gridRef = useRef<T | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (!motionEnabled()) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const flush = () => {
      frame = 0;
      const event = lastEvent;
      if (!event) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>('.spotlight-card');
      if (!target || !grid.contains(target)) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      lastEvent = event;
      if (frame) return;
      frame = window.requestAnimationFrame(flush);
    };

    grid.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      grid.removeEventListener('pointermove', onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return gridRef;
}
