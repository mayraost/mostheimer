import type { ReactElement } from 'react';

import {
  MARK,
  MARK_PALETTE_DARK,
  MARK_PALETTE_LIGHT,
  PATHS,
  RETICLE,
  type MarkPalette,
} from './markGeometry';

/**
 * CSS custom properties that make the inline mark follow the theme.
 *
 * The SVG cannot read Tailwind tokens by itself (its `fill` attributes are not
 * Tailwind classes), so the two palettes are exposed as custom properties on
 * `:root`/`.light` in `globals.css` (`--mark-*`) and referenced from the
 * artwork. Values mirror `MARK_PALETTE_DARK` / `MARK_PALETTE_LIGHT` exactly —
 * `tests/int/brand.int.spec.ts` keeps them in sync.
 */
export const MARK_CSS_VARS = {
  dark: MARK_PALETTE_DARK,
  light: MARK_PALETTE_LIGHT,
} as const;

type MarkPaint = { type: 'palette'; palette: MarkPalette } | { type: 'css-vars' };

/** Gradient id factory, so several marks on one page never collide. */
type IdFactory = (slot: string) => string;

function paint(mode: MarkPaint, cssVar: string, slot: keyof MarkPalette, index: number): string {
  if (mode.type === 'palette') {
    const value = mode.palette[slot];
    return Array.isArray(value) ? (value as readonly string[])[index] : (value as string);
  }
  return `var(--mark-${cssVar}${index === 0 ? '' : `-${index}`})`;
}

/**
 * Gradients used by the monogram. `mode.palette` emits literal colours (icon
 * rasterisation, OG cards); `mode.css-vars` emits `var(--mark-*)` so a single
 * inline SVG flips with `.dark` / `.light`.
 */
export function MarkDefs({ id, mode }: { id: IdFactory; mode: MarkPaint }) {
  const grads = [
    { slot: 'mLeft', cssVar: 'm-left' },
    { slot: 'mRight', cssVar: 'm-right' },
    { slot: 'oTop', cssVar: 'o-top' },
    { slot: 'oBottom', cssVar: 'o-bottom' },
  ] as const;

  return (
    <defs>
      {grads.map(({ slot, cssVar }) => (
        <linearGradient key={slot} id={id(slot)} x1="0%" y1="0%" x2="100%" y2="100%">
          {[0, 1, 2].map((index) => (
            <stop
              key={index}
              offset={index === 0 ? '0%' : index === 1 ? '48%' : '100%'}
              stopColor={paint(mode, cssVar, slot, index)}
            />
          ))}
        </linearGradient>
      ))}
    </defs>
  );
}

/**
 * The monogram itself: reticle, M, `</>` accent, O and the M↔O bridge.
 *
 * Purely presentational — the surrounding component owns sizing, the accessible
 * name and the transform that places the 440 x 300 box.
 */
export function MarkPaths({ id, mode }: { id: IdFactory; mode: MarkPaint }): ReactElement {
  const reticleA = paint(mode, 'reticle-a', 'reticleA', 0);
  const reticleB = paint(mode, 'reticle-b', 'reticleB', 0);

  return (
    <>
      {/* architectural reticle */}
      <g fill="none" strokeWidth="2">
        {RETICLE.strokes.map((points, index) => (
          <polyline
            key={points}
            points={points}
            stroke={index < 2 ? reticleA : reticleB}
            strokeOpacity="0.55"
          />
        ))}
      </g>
      {RETICLE.squares.map((square, index) => (
        <rect
          key={`${square.x}-${square.y}`}
          x={square.x}
          y={square.y}
          width="6"
          height="6"
          fill={index < 2 ? reticleA : reticleB}
        />
      ))}

      {/* M */}
      <path d={PATHS.mLeft} fill={`url(#${id('mLeft')})`} />
      <path d={PATHS.mRight} fill={`url(#${id('mRight')})`} />
      <polygon points={PATHS.mFold} fill={paint(mode, 'fold', 'fold', 0)} fillOpacity="0.45" />

      {/* </> code tag in the M's top notch */}
      <g fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={PATHS.codeLeft} stroke={paint(mode, 'code-left', 'codeLeft', 0)} />
        <line
          x1={PATHS.codeSlash.x1}
          y1={PATHS.codeSlash.y1}
          x2={PATHS.codeSlash.x2}
          y2={PATHS.codeSlash.y2}
          stroke={paint(mode, 'code-slash', 'codeSlash', 0)}
        />
        <polyline points={PATHS.codeRight} stroke={paint(mode, 'code-right', 'codeRight', 0)} />
      </g>

      {/* O */}
      <path d={PATHS.oTop} fill={`url(#${id('oTop')})`} />
      <path d={PATHS.oBottom} fill={`url(#${id('oBottom')})`} />

      {/* M↔O bridge */}
      <polygon points={PATHS.bridgeGap} fill={paint(mode, 'bridge-gap', 'bridgeGap', 0)} />
      <polygon points={PATHS.bridgeLink} fill={`url(#${id('oTop')})`} />
    </>
  );
}

/** Bounding box of the mark, for consumers that centre it. */
export { MARK };
