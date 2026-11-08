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

/** Props of {@link LogoLockupMark}. */
type LogoLockupMarkProps = {
  /** Extra classes on the root wrapper. */
  className?: string;
  /** Accessible name. The surrounding link usually supplies it, so pass `''` to hide. */
  title?: string;
};

/**
 * Header lockup: MO monogram + MAYRA OSTHEIMER, subline from `lg` up.
 *
 * Why two SVGs instead of one with a CSS-hidden `<text>`: the subline sits
 * below the wordmark, so showing it needs a *taller* viewBox. A viewBox is an
 * attribute, not a style — no media query can swap it, and letting the subline
 * overflow the box would clip it. So the compact (mark + wordmark) and full
 * (+ subline) compositions both render, and `lg` decides which one is
 * displayed. Only one is ever in the layout, so there is no double tab-stop,
 * no duplicated accessible name, and no CLS.
 *
 * Both boxes are 300 units tall for the mark, so a fixed CSS height (`h-7`,
 * `h-8`) renders the mark at exactly the same size on every breakpoint. The
 * wide `full` box simply scales down; the compact box uses its width on the
 * wordmark alone.
 */
export function LogoLockupMark({ className, title = 'Mayra Ostheimer' }: LogoLockupMarkProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const idCompact = (slot: string) => `markc-${raw}-${slot}`;
  const idFull = (slot: string) => `markf-${raw}-${slot}`;
  const mode = { type: 'css-vars' } as const;

  const wordmark = (id: (slot: string) => string) => (
    <>
      <text
        x={LOCKUP_TEXT_X}
        y={LOCKUP_BASELINE_1}
        fontSize={LOCKUP.wordSize}
        fontWeight="700"
        letterSpacing={LOCKUP.tracking}
        fill="currentColor"
        className="mark-wm"
      >
        MAYRA
      </text>
      <text
        x={LOCKUP_TEXT_X}
        y={LOCKUP_BASELINE_2}
        fontSize={LOCKUP.wordSize}
        fontWeight="700"
        letterSpacing={LOCKUP.tracking}
        fill="currentColor"
        className="mark-wm"
      >
        OSTHEIMER
      </text>
      <line
        x1={LOCKUP_DIVIDER_X}
        y1={MARK.height / 2 - 96}
        x2={LOCKUP_DIVIDER_X}
        y2={MARK.height / 2 + 96}
        stroke="var(--mark-divider)"
        strokeWidth={LOCKUP.divider.width}
      />
      {/* gradient nub on the divider, mirrors the artwork */}
      <rect
        x={LOCKUP_DIVIDER_X - LOCKUP.divider.width + 1}
        y={MARK.height / 2 - 23}
        width={LOCKUP.divider.width + 2}
        height="46"
        fill={`url(#${id('mRight')})`}
      />
    </>
  );

  return (
    <span className={['inline-flex items-center', className].filter(Boolean).join(' ')}>
      {title ? <span className="sr-only">{title}</span> : null}

      {/* compact: mark + wordmark, `lg` and down */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${LOCKUP_BOX.compact.width} ${LOCKUP_BOX.compact.height}`}
        className="block h-full w-auto lg:hidden"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <style>{`.mark-wm { font-family: 'Space Grotesk', var(--font-heading, ''), 'Helvetica Neue', Arial, sans-serif; }`}</style>
        </defs>
        <MarkDefs id={idCompact} mode={mode} />
        <g transform={`translate(0, ${MARK_TOP_PAD})`}>
          <MarkPaths id={idCompact} mode={mode} />
        </g>
        {wordmark(idCompact)}
      </svg>

      {/* full: + subline, `lg` and up */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${LOCKUP_BOX.full.width} ${LOCKUP_BOX.full.height}`}
        className="hidden h-full w-auto lg:block"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <style>{`.mark-wm { font-family: 'Space Grotesk', var(--font-heading, ''), 'Helvetica Neue', Arial, sans-serif; }`}</style>
        </defs>
        <MarkDefs id={idFull} mode={mode} />
        <g transform={`translate(0, ${MARK_TOP_PAD})`}>
          <MarkPaths id={idFull} mode={mode} />
        </g>
        {wordmark(idFull)}
        <text
          x={LOCKUP_TEXT_X + 2}
          y={LOCKUP_SUBLINE_Y}
          fontSize={SUBLINE_SIZE.header}
          fontWeight="700"
          letterSpacing={LOCKUP.subTracking}
          fontFamily="'JetBrains Mono', var(--font-mono, ''), ui-monospace, monospace"
          className="mark-subline"
        >
          <tspan fill="var(--mark-reticle-a)">{SUBLINE.slash}</tspan>
          <tspan fill="var(--mark-reticle-b)">{SUBLINE.text}</tspan>
        </text>
      </svg>
    </span>
  );
}
