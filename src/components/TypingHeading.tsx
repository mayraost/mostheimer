'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsProvider';

/**
 * Typing-Effekt auf dem Hero-Display (Client-Insel).
 *
 * A11y-Entscheidung (Findings-Driven): Der volle Text steht von Anfang an
 * im Accessible-Name (`aria-label` auf dem Wrapper) und im sr-only-Fallback;
 * die sichtbare Tipp-Animation ist `aria-hidden` und Layout-neutral
 * (fester 2-Zeilen-Rahmen im Display, damit kein CLS durch Zeilenumbruch
 * entsteht, während die Zeichen erscheinen).
 */
function TypingHeadingEffect({ text, animationsOn }: { text: string; animationsOn: boolean }) {
  const [progress, setProgress] = useState(0);
  const isTyping = progress < text.length;

  useEffect(() => {
    // Respect disabled animations inside the effect too: nothing to reveal.
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
