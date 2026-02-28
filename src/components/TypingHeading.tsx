'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsProvider';

export function TypingHeading({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { currentAnimations } = useSettings();

  useEffect(() => {
    if (currentAnimations === 'off') {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let i = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [text, currentAnimations]);

  return (
    <span className="flex items-center justify-center min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem]">
      <span>{displayedText}</span>
      {currentAnimations === 'on' && (
        <span
          className={`inline-block w-[0.1em] h-[1em] ml-1 bg-primary ${isTyping ? '' : 'animate-[blink_1s_step-end_infinite]'}`}
        />
      )}
    </span>
  );
}
