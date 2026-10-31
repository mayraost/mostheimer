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
    }, 100);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <span className="flex items-center justify-center min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem]">
      <span>{text.slice(0, progress)}</span>
      {animationsOn && (
        <span
          className={`inline-block w-[0.1em] h-[1em] ml-1 bg-primary ${isTyping ? '' : 'animate-[blink_1s_step-end_infinite]'}`}
        />
      )}
    </span>
  );
}

export function TypingHeading({ text }: { text: string }) {
  const { currentAnimations } = useSettings();

  if (currentAnimations === 'off') {
    return (
      <span className="flex items-center justify-center min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem]">
        <span>{text}</span>
      </span>
    );
  }

  return (
    <TypingHeadingEffect
      key={currentAnimations}
      text={text}
      animationsOn={currentAnimations === 'on'}
    />
  );
}
