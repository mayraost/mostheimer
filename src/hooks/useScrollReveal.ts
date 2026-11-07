'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * One-shot viewport reveal for a whole grid.
 *
 * Contract (spec §2.3):
 * - Fires ONCE per element (`unobserve` after the first intersection), so
 *   scrolling back up never replays and the DOM is not observed forever.
 * - `threshold: 0.12`, `rootMargin: '0px 0px -40px 0px'` — a card must be
 *   properly inside the viewport, not just clipped by its bottom edge.
 * - Elements found in the FIRST viewport are shown immediately without a
 *   transition: revealing the hero cards would otherwise look like a loading
 *   delay rather than an entrance.
 * - No JS / no `IntersectionObserver` / animations off ⇒ nothing is hidden at
 *   all. The hidden start state is the `data-reveal="pending"` attribute this
 *   hook sets; the CSS default is visible (see globals.css).
 *
 * Written as attribute writes on refs, never as React state: a reveal is a
 * paint concern, and re-rendering 12 cards to toggle a class costs hydration
 * work for no DOM benefit.
 */

const STAGGER_CAP = 5; // 5 × 45ms = 225ms, the spec's maximum delay

function reducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Animations allowed? Reads the guardrail the bootstrap already applied. */
export function motionEnabled(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  // `no-animations` is written to <html> (and mirrored on <body>) by both the
  // pre-hydration bootstrap and SettingsProvider.
  if (root.classList.contains('no-animations')) return false;
  if (document.body.classList.contains('no-animations')) return false;
  // `motion-assets` is the opt-in the bootstrap sets; without it every reveal
  // start state stays inert (visible), which is exactly the safe default.
  if (!root.classList.contains('motion-assets')) return false;
  return !reducedMotion();
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  /** CSS selector of the reveal targets inside the grid. */
  targetSelector = '[data-reveal]',
): RefObject<T | null> {
  const rootRef = useRef<T | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(targetSelector));
    if (targets.length === 0) return;

    const show = (element: HTMLElement) => {
      element.dataset.reveal = 'shown';
    };

    // Off, unsupported, or no observer ⇒ make sure everything is visible and
    // never arm a hidden state.
    if (!motionEnabled() || typeof IntersectionObserver === 'undefined') {
      targets.forEach(show);
      return;
    }

    // Anything already in the first viewport is painted visible immediately.
    const viewportHeight = window.innerHeight;
    const pending: HTMLElement[] = [];
    targets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < viewportHeight) {
        show(element);
      } else {
        pending.push(element);
      }
    });

    if (pending.length === 0) return;

    pending.forEach((element) => {
      element.dataset.reveal = 'pending';
    });

    // Stagger index per card, capped so fast scrollers never wait. Order comes
    // from DOM position (the visual order of the grid), not from a prop, so a
    // server-rendered grid needs no extra wiring.
    pending.forEach((element, index) => {
      element.style.setProperty('--stagger-index', String(Math.min(index, STAGGER_CAP)));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          show(element);
          observer.unobserve(element);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    pending.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [targetSelector]);

  return rootRef;
}
