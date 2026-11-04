'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsProvider';

function TypingHeadingEffect({ text, animationsOn }: { text: string; animationsOn: boolean }) {
  const [progress, setProgress] = useState(0);
  const isTyping = progress < text.length;

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      i++;
      if (i <= text.length) {
        setProgress(i);
        if (i === text.length) {
          clearInterval(typingInterval);
        }
      }
    }, 55);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <span className="inline-flex min-h-[1.1em] flex-wrap items-baseline">
      <span>{text.slice(0, progress)}</span>
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

  if (currentAnimations === 'off') {
    return <span className="inline-flex min-h-[1.1em] flex-wrap items-baseline">{text}</span>;
  }

  return (
    <TypingHeadingEffect
      key={currentAnimations}
      text={text}
      animationsOn={currentAnimations === 'on'}
    />
  );
}
