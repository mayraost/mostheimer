'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsProvider';

/**
 * Typing effect for the hero display (client island).
 *
 * A11y: the full text is in the accessible name (aria-label on the wrapper) and
 * in an sr-only fallback from the start; the visible animation is aria-hidden.
 *
 * CLS: the hero heading is the homepage LCP text, so letting it grow line by
 * line pushed all the content below it (measured 0.25 layout shift on about a
 * third of the viewport). The wrapper therefore reserves the text's FINAL
 * height, measured on an invisible full-text copy (kept in sync via
 * ResizeObserver and font-ready), and the animation runs inside that fixed
 * frame as a pure paint effect with no reflow. Until measured it sits at
 * `min-height: 1em`.
 */
function useReservedHeight() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();

    // ResizeObserver instead of window listeners: covers width changes, font
    // swap and container resize (sidebar layout) in one place.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => observer.disconnect();
  }, []);

  return { ref, height };
}

function TypingHeadingEffect({
  text,
  animationsOn,
  height,
  measureRef,
}: {
  text: string;
  animationsOn: boolean;
  height: number | null;
  measureRef: (node: HTMLSpanElement | null) => void;
}) {
  const [progress, setProgress] = useState(0);
  const isTyping = progress < text.length;

  useLayoutEffect(() => {
    // Animations disabled: show nothing to reveal.
    if (!animationsOn) return;

    let i = 0;
    const typingInterval = setInterval(() => {
      i += 1;
      if (i <= text.length) {
        setProgress(i);
        if (i === text.length) clearInterval(typingInterval);
      }
    }, 18);

    return () => clearInterval(typingInterval);
  }, [text, animationsOn]);

  return (
    <>
      {/* Invisible full-text copy: defines the block's final height. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 -z-10 block w-full"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="block w-full"
        style={height !== null ? { minHeight: `${height}px` } : { minHeight: '1em' }}
      >
        {text.slice(0, progress)}
        {animationsOn && (
          <span
            aria-hidden="true"
            className={`ml-1 inline-block h-[0.8em] w-[0.5ch] bg-primary align-baseline ${
              isTyping ? '' : 'animate-blink'
            }`}
          />
        )}
      </span>
    </>
  );
}

export function TypingHeading({ text }: { text: string }) {
  const { currentAnimations } = useSettings();
  const { ref, height } = useReservedHeight();
  const setRef = useCallback(
    (node: HTMLSpanElement | null) => {
      ref.current = node;
    },
    [ref],
  );

  return (
    <span className="relative block w-full" aria-label={text}>
      <span className="sr-only">{text}</span>
      {currentAnimations === 'off' ? (
        <span ref={ref} aria-hidden="true" className="block w-full">
          {text}
        </span>
      ) : (
        <TypingHeadingEffect text={text} animationsOn height={height} measureRef={setRef} />
      )}
    </span>
  );
}
