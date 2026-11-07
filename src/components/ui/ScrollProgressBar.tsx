'use client';

import { useEffect } from 'react';
import { motionEnabled } from '@/hooks/useScrollReveal';

/**
 * Reading-progress telemetry (spec §2.1).
 *
 * The bar sits at the very top edge of the sticky header and scales on the X
 * axis only — `transform`, never `width`, so the paint never triggers layout.
 *
 * Two paths, in this order:
 * 1. CSS scroll-driven animation (`animation-timeline: scroll(root)`), applied
 *    by `globals.css` inside `@supports`. Zero JS, runs on the compositor.
 * 2. Fallback: a single passive `scroll` listener writing `--scroll-progress`
 *    on `documentElement`, throttled with `requestAnimationFrame`.
 *
 * The fallback is skipped when the native timeline is available, so supporting
 * browsers pay nothing. Under reduce-motion / `no-animations` the listener is
 * never attached and the CSS guardrail freezes the bar at full width (a frozen
 * meter reads as decoration, not as a stalled page).
 */
function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()');
}

export function ScrollProgressBar() {
  useEffect(() => {
    if (!motionEnabled()) return;
    if (supportsScrollTimeline()) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      root.style.setProperty('--scroll-progress', String(progress));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1.5px] bg-transparent"
    >
      <div
        data-scroll-progress
        className="h-full w-full origin-left bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(16,185,129,0.35)]"
      />
    </div>
  );
}
