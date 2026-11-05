'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSettings } from './SettingsProvider';

/** No-op subscription: the store never changes after hydration. */
const subscribeNoop = () => () => undefined;

/**
 * Typing effect for the hero display (client island).
 *
 * A11y: the full text is the accessible name (aria-label on the wrapper) and an
 * sr-only copy; the visible animation is aria-hidden.
 *
 * CLS design (measured 05.11.2026 on the production standalone build):
 *
 * The server renders the heading text as the normal, visible element, so the
 * FIRST paint already has the final geometry — the `h1` is two lines tall
 * before any JavaScript runs. Only after mount does a client overlay take over
 * and replay the typing inside a box whose height is locked to the height the
 * server-rendered text occupied. Consequences:
 *
 * - hydration itself cannot shift anything (same text, same box);
 * - the animation cannot shift anything (the box height never changes);
 * - the Space Grotesk swap cannot shift anything that is below the heading
 *   (the box is measured from the same text it animates, and the overlay is
 *   clipped to it).
 *
 * Previous incarnations reserved `min-height: 1em` on the server and only
 * measured after hydration, which produced a ~200 ms reflow (69 px → 138 px at
 * 1280x900) as the typed text reached its second line. That is why the text is
 * now part of the server output instead of being typed into an empty box.
 */
const TYPING_STEP_MS = 18; // per character
const TYPING_FALLBACK_DELAY_MS = 1500; // never wait forever on a slow face

/** True once the heading's own weight face is usable (or after a safety delay). */
function useHeadingFontReady(element: HTMLElement | null): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!element || ready) return;
    let cancelled = false;
    const timer = setTimeout(() => setReady(true), TYPING_FALLBACK_DELAY_MS);

    const check = () => {
      if (cancelled || !document.fonts) return;
      const weight = getComputedStyle(element).fontWeight;
      const numeric = weight && weight !== 'normal' && weight !== 'bold' ? weight : '700';
      if (document.fonts.check(`${numeric} 1em "Space Grotesk"`)) {
        clearTimeout(timer);
        setReady(true);
      }
    };

    check();
    document.fonts?.ready.then(check).catch(() => undefined);
    document.fonts?.addEventListener?.('loadingdone', check);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.fonts?.removeEventListener?.('loadingdone', check);
    };
  }, [element, ready]);

  return ready;
}

export function TypingHeading({ text }: { text: string }) {
  const { currentAnimations } = useSettings();
  // Client-only flag without setState-in-effect: the server snapshot is
  // `false` (so SSR renders the static text), the client snapshot `true`.
  // `useSyncExternalStore` is the hydration-safe way to express this.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [progress, setProgress] = useState(0);
  const [overlay, setOverlay] = useState<HTMLSpanElement | null>(null);
  const staticRef = useRef<HTMLSpanElement | null>(null);
  const overlayBoxRef = useRef<HTMLSpanElement | null>(null);
  const fontReady = useHeadingFontReady(overlay);

  const animationsOn = currentAnimations !== 'off';
  const isTyping = progress < text.length;

  // Lock the box to the height the server-rendered text occupied BEFORE the
  // overlay replaces it, so swapping in the animation is geometry-neutral.
  // The height is applied via the DOM in the same layout pass that measures,
  // not through state: a `setState` renders one frame late, which painted the
  // overlay at its unclamped height first (measured live: h1 485 px → 346 px).
  useLayoutEffect(() => {
    if (!mounted || !animationsOn) return;
    const element = staticRef.current;
    const box = overlayBoxRef.current;
    if (!element || !box) return;

    const measure = () => {
      const next = element.getBoundingClientRect().height;
      if (next <= 0) return;
      const current = parseFloat(box.style.height) || 0;
      if (next > current) box.style.height = `${next}px`;
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted, animationsOn, text]);

  useEffect(() => {
    if (!mounted || !animationsOn || !fontReady) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setProgress(i);
      if (i >= text.length) clearInterval(timer);
    }, TYPING_STEP_MS);
    return () => clearInterval(timer);
  }, [mounted, animationsOn, fontReady, text]);

  const showTyping = mounted && animationsOn;

  return (
    <span className="relative block w-full" aria-label={text}>
      <span className="sr-only">{text}</span>

      {/* Measurement / non-animated text. Always rendered while the animation
          has not taken over, and kept (invisible) as the height source. */}
      <span
        ref={staticRef}
        aria-hidden="true"
        className={`block w-full ${showTyping ? 'invisible absolute left-0 top-0 -z-10' : ''}`}
      >
        {text}
      </span>

      {showTyping && (
        <span
          ref={(node) => {
            overlayBoxRef.current = node;
            // Synchronous, pre-paint clamp: a ref callback runs while React
            // attaches the DOM node, before the browser paints the overlay, so
            // the box never appears at its unclamped height.
            if (node && staticRef.current) {
              const h = staticRef.current.getBoundingClientRect().height;
              if (h > 0) node.style.height = `${h}px`;
            }
          }}
          aria-hidden="true"
          className="block w-full overflow-hidden"
        >
          <span ref={setOverlay} className="block w-full">
            {text.slice(0, progress)}
            <span
              aria-hidden="true"
              className={`ml-1 inline-block h-[0.8em] w-[0.5ch] bg-primary align-baseline ${
                isTyping ? '' : 'animate-blink'
              }`}
            />
          </span>
        </span>
      )}
    </span>
  );
}
