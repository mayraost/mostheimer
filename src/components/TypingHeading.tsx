'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsProvider';

/**
 * Typing-Effekt auf dem Hero-Display (Client-Insel).
 *
 * A11y: Der volle Text steht von Anfang an im Accessible-Name
 * (`aria-label` am Wrapper) und im sr-only-Fallback; die sichtbare
 * Tipp-Animation ist `aria-hidden`.
 *
 * Performance (04.11.2026): Der frühere Effekt rendert pro Zeichen ein
 * React-Update (18ms-Takt über einen langen Hero-Text) — auf dem Home trägt
 * das messbar zur Main-Thread-Arbeit bei (Lighthouse mobile 84 vs. 100 auf
 * allen anderen Seiten). Jetzt laufen die Zeichen in EINEM rAF-Loop mit
 * mehreren Zeichen pro Frame, das Tippen bleibt sichtbar.
 */
function TypingHeadingEffect({ text, animationsOn }: { text: string; animationsOn: boolean }) {
  const [progress, setProgress] = useState(0);
  const isTyping = progress < text.length;

  useEffect(() => {
    if (!animationsOn) return;

    let raf = 0;
    let shown = 0;
    let last = 0;
    const msPerChar = 9;

    const tick = (now: number) => {
      if (now - last >= msPerChar) {
        last = now;
        // 3 Zeichen pro Update statt 1 — dieselbe Lesbarkeit, 3x weniger
        // React-Renders über die gesamte Animation.
        shown = Math.min(text.length, shown + 3);
        setProgress(shown);
      }
      if (shown < text.length) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [text, animationsOn]);

  return (
    <span className="inline-flex flex-wrap items-baseline">
      <span aria-hidden="true">{text.slice(0, progress)}</span>
      {animationsOn && (
        <span
          aria-hidden="true"
          className={`ml-1 inline-block h-[0.8em] w-[0.5ch] bg-primary align-baseline ${
            isTyping ? '' : 'animate-blink'
          }`}
        />
      )}
    </span>
  );
}

export function TypingHeading({ text }: { text: string }) {
  const { currentAnimations } = useSettings();

  return (
    <span className="inline-flex flex-wrap items-baseline" aria-label={text}>
      <span className="sr-only">{text}</span>
      {currentAnimations === 'off' ? (
        <span aria-hidden="true">{text}</span>
      ) : (
        <TypingHeadingEffect text={text} animationsOn />
      )}
    </span>
  );
}
