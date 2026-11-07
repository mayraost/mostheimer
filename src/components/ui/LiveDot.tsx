import React from 'react';

/**
 * Live system-status dot (spec §3.5).
 *
 * Two-step telemetry pulse: the solid core stays put while a second ring scales
 * from 1 → 2.2 and fades 0.5 → 0 in a 3.5s cycle. `transform`/`opacity` only,
 * so it never costs layout. The ring is a pseudo-element via a nested span, not
 * an `::after` on the dot itself, so callers keep `className` control of the
 * core.
 *
 * Purely decorative: `aria-hidden`, no text. Under `body.no-animations` /
 * reduce-motion the ring is simply static (the global guardrail removes the
 * animation; the core dot remains visible).
 */
export function LiveDot({
  className = '',
  tone = 'primary',
}: {
  className?: string;
  tone?: 'primary' | 'secondary';
}) {
  const color = tone === 'primary' ? 'bg-primary' : 'bg-secondary';
  return (
    <span aria-hidden="true" className={['relative inline-flex h-1.5 w-1.5', className].join(' ')}>
      <span
        className={`live-dot-ring absolute inset-0 rounded-full ${color} motion-safe:animate-[live-dot-pulse_3.5s_var(--ease-in-out-tech)_infinite]`}
      />
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`} />
    </span>
  );
}
