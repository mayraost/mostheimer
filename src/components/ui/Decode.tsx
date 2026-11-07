'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motionEnabled } from '@/hooks/useScrollReveal';

/**
 * Monospace telemetry decode (spec §2.6).
 *
 * Once its section first enters the viewport, a mono label scrambles through
 * technical characters for exactly 280ms and settles on the final text.
 * Numeric content is NOT scrambled (that would read as a data error) but
 * counts up over 350ms with `font-variant-numeric: tabular-nums`, so digits
 * never shift the layout horizontally.
 *
 * Server output is always the final text — the scramble is a client-only
 * overlay, so:
 * - no hydration mismatch (the server text is the truth, also for crawlers),
 * - nothing to see when JS is off,
 * - reduced motion / `no-animations` render the static text.
 */

const GLYPHS = '01/_#><[]{}%$*+=-';
const SCRAMBLE_MS = 280;
const COUNT_UP_MS = 350;
const TICK_MS = 40;

/** Split "99.4%" into prefix / number / suffix so only the number animates. */
function parseNumeric(text: string): { prefix: string; value: number; suffix: string } | null {
  const match = text.match(/^([^\d-]*)(-?\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const numeric = Number(match[2].replace(',', '.'));
  if (!Number.isFinite(numeric)) return null;
  return { prefix: match[1], value: numeric, suffix: match[3] };
}

/** Format an intermediate value with the same decimals as the source. */
function formatLike(source: string, target: number): string {
  const fractional = source.split(/[.,]/)[1];
  const decimals = fractional ? fractional.replace(/\D/g, '').length : 0;
  const fixed = target.toFixed(Math.min(decimals, 3));
  return source.includes(',') && decimals > 0 ? fixed.replace('.', ',') : fixed;
}

export function Decode({
  text,
  children,
  as: Tag = 'span',
  className = '',
}: {
  /** Final text. Required so the server render and the animation agree. */
  text: string;
  /** Optional rendered content that replaces `text` (e.g. a composed row). */
  children?: ReactNode;
  as?: 'span' | 'p' | 'h2' | 'h3';
  className?: string;
}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (!motionEnabled() || typeof IntersectionObserver === 'undefined') return;

    const numeric = parseNumeric(text);
    let timer = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;

      if (numeric) {
        const frames = Math.max(1, Math.round(COUNT_UP_MS / TICK_MS));
        let step = 0;
        timer = window.setInterval(() => {
          step += 1;
          if (step >= frames) {
            window.clearInterval(timer);
            setDisplay(null); // back to the authoritative text
            return;
          }
          const eased = 1 - Math.pow(1 - step / frames, 2);
          setDisplay(
            `${numeric.prefix}${formatLike(text, numeric.value * eased)}${numeric.suffix}`,
          );
        }, TICK_MS);
        return;
      }

      // Text: scramble, then settle left-to-right so it reads as a decode.
      const totalTicks = Math.max(1, Math.round(SCRAMBLE_MS / TICK_MS));
      let tick = 0;
      timer = window.setInterval(() => {
        tick += 1;
        if (tick >= totalTicks) {
          window.clearInterval(timer);
          setDisplay(null);
          return;
        }
        const settled = Math.floor((tick / totalTicks) * text.length);
        setDisplay(
          text
            .split('')
            .map((char, index) => {
              if (index < settled || char === ' ') return char;
              return GLYPHS[(index * 7 + tick * 3) % GLYPHS.length];
            })
            .join(''),
        );
      }, TICK_MS);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          run();
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -20px 0px' },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [text]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        elementRef.current = node;
      }}
      className={className}
      data-decode={display === null ? 'idle' : 'running'}
    >
      {children ?? display ?? text}
    </Tag>
  );
}
