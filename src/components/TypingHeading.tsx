'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsProvider';

/**
 * Typing-Effekt auf dem Hero-Display (Client-Insel).
 *
 * A11y-Entscheidung (Findings-Driven): Der volle Text steht von Anfang an
 * im Accessible-Name (`aria-label` auf dem Wrapper) und im sr-only-Fallback;
 * die sichtbare Tipp-Animation ist `aria-hidden`.
 *
 * Layout-Entscheidung (CLS, Lighthouse 04.11.2026): Das Hero-Heading ist
 * der LCP-Text der Startseite. Eine einzeilig auslaufende Tipp-Animation
 * lässt die Überschrift zeilenweise wachsen und schiebt den kompletten
 * Content darunter — gemessen 0.25 Layout-Shift auf ~1/3 Viewport-Höhe
 * (Score-Einbruch Performance 85→99). Deshalb reserviert der Wrapper die
 * ENDHÖHE des Textes (an einer unsichtbaren, volltextigen Kopie gemessen,
 * per ResizeObserver auch bei Resize/Font-Swap nachgeführt) und die
 * Animation läuft in diesem festen Rahmen: reiner Paint-Effekt, kein
 * Reflow. Bis zur Messung steht der Platzhalter auf `min-height: 1em`.
 */
function useReservedHeight() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();

    // ResizeObserver statt reiner Fenster-Listener: deckt Width-Resize,
    // Font-Swap und Container-Resize (Sidebar-Layout) in einem ab.
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
    // Respect disabled animations: nothing to reveal.
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
      {/* Unsichtbare Volltext-Kopie: definiert die Endhöhe des Blocks. */}
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
