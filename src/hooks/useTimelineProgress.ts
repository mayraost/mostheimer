'use client';

import { useEffect, useRef } from 'react';
import { motionEnabled } from '@/hooks/useScrollReveal';

/**
 * Scroll-linked rail progress for the career timeline (spec §2.5).
 *
 * Writes ONE CSS variable (`--rail-progress`, 0 → 1) on the rail element while
 * the timeline crosses the viewport; the beam itself is a gradient strip that
 * scales on Y (transform only, compositor-friendly). Additionally marks the
 * station that sits in the upper reading third with `data-active`, so its node
 * can light up and its card can brighten its border.
 *
 * No React state and no per-frame DOM writes beyond two properties; the
 * listener is passive and rAF-coalesced. Off under reduce-motion /
 * `no-animations` (then every station simply renders in its resting state).
 */
export function useTimelineProgress<
  T extends HTMLElement = HTMLElement,
>(): React.RefObject<T | null> {
  const listRef = useRef<T | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (!motionEnabled()) return;

    const rail = list.querySelector<HTMLElement>('[data-rail-beam]');
    const stations = Array.from(list.querySelectorAll<HTMLElement>('[data-station]'));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();

      if (rail) {
        // Progress of the list's top edge through the viewport: 0 when the top
        // reaches the lower third, 1 when the bottom passes the upper third.
        const start = window.innerHeight * 0.85;
        const end = -rect.height + window.innerHeight * 0.35;
        const raw = (start - rect.top) / (start - end);
        rail.style.setProperty('--rail-progress', String(Math.min(1, Math.max(0, raw))));
      }

      // Active station: whose top is above the reading third and whose bottom
      // is still below it.
      const readingLine = window.innerHeight * 0.33;
      let current = -1;
      stations.forEach((station, index) => {
        const box = station.getBoundingClientRect();
        if (box.top <= readingLine && box.bottom > readingLine) current = index;
      });

      stations.forEach((station, index) => {
        if (index === current) station.dataset.active = 'true';
        else delete station.dataset.active;
      });
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

  return listRef;
}
