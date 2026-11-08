import { useId } from 'react';

import { MarkDefs, MarkPaths } from './MarkArtwork';
import {
  LOCKUP,
  LOCKUP_BASELINE_1,
  LOCKUP_BASELINE_2,
  LOCKUP_BOX,
  LOCKUP_DIVIDER_X,
  LOCKUP_SUBLINE_Y,
  LOCKUP_TEXT_X,
  MARK,
  MARK_TOP_PAD,
  SUBLINE,
  SUBLINE_SIZE,
} from './markGeometry';

type FullLockupProps = {
  /** Extra classes on the root <svg>; sizing is the caller's job. */
  className?: string;
  /** Accessible name, used as aria-label and <title>. */
  title?: string;
  /**
   * Hide the subline while keeping the same box height — for tight surfaces
   * that still want the full lockup proportions.
   */
  hideSubline?: boolean;
};

/**
 * Full brand lockup: MO monogram + MAYRA OSTHEIMER + `// WEB & APPLICATION
 * ARCHITECT`, on large surfaces where all three lines stay readable.
 *
 * Colours are theme-aware via `var(--mark-*)` (see `globals.css`), the wordmark
 * follows `currentColor`, and every gradient/bloom id is namespaced with
 * `useId()` so two lockups on one page cannot steal each other's defs.
 */
export function LogoLockup({
  className,
  title = 'Mayra Ostheimer',
  hideSubline = false,
}: FullLockupProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (slot: string) => `mark-${raw}-${slot}`;
  const mode = { type: 'css-vars' } as const;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${LOCKUP_BOX.display.width} ${LOCKUP_BOX.display.height}`}
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <style>{`.mark-wm { font-family: 'Space Grotesk', var(--font-heading, ''), 'Helvetica Neue', Arial, sans-serif; }`}</style>
      </defs>
      <MarkDefs id={id} mode={mode} />
      <g transform={`translate(0, ${MARK_TOP_PAD})`}>
        <MarkPaths id={id} mode={mode} />
      </g>

      <line
        x1={LOCKUP_DIVIDER_X}
        y1={MARK.height / 2 - 96}
        x2={LOCKUP_DIVIDER_X}
        y2={MARK.height / 2 + 96}
        stroke="var(--mark-divider)"
        strokeWidth={LOCKUP.divider.width}
      />
      <rect
        x={LOCKUP_DIVIDER_X - LOCKUP.divider.width + 1}
        y={MARK.height / 2 - 23}
        width={LOCKUP.divider.width + 2}
        height="46"
        fill={`url(#${id('mRight')})`}
      />

      <text
        className="mark-wm"
        x={LOCKUP_TEXT_X}
        y={LOCKUP_BASELINE_1}
        fontSize={LOCKUP.wordSize}
        fontWeight="700"
        letterSpacing={LOCKUP.tracking}
        fill="currentColor"
      >
        MAYRA
      </text>
      <text
        className="mark-wm"
        x={LOCKUP_TEXT_X}
        y={LOCKUP_BASELINE_2}
        fontSize={LOCKUP.wordSize}
        fontWeight="700"
        letterSpacing={LOCKUP.tracking}
        fill="currentColor"
      >
        OSTHEIMER
      </text>

      {hideSubline ? null : (
        <text
          x={LOCKUP_TEXT_X + 2}
          y={LOCKUP_SUBLINE_Y}
          fontSize={SUBLINE_SIZE.display}
          fontWeight="700"
          letterSpacing={LOCKUP.subTracking}
          fontFamily="'JetBrains Mono', var(--font-mono, ''), ui-monospace, monospace"
        >
          <tspan fill="var(--mark-reticle-a)">{SUBLINE.slash}</tspan>
          <tspan fill="var(--mark-reticle-b)">{SUBLINE.text}</tspan>
        </text>
      )}
    </svg>
  );
}
