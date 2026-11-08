/**
 * Geometry of the MO precision-ribbon monogram — the single source of truth.
 *
 * Four surfaces draw this same mark and MUST NOT drift:
 *   1. `LogoLockupMark.tsx` / `LogoLockup.tsx` – inline SVG (header, full lockup)
 *   2. `src/components/og/ogCard.tsx`          – Satori OG card (paths only)
 *   3. `scripts/brand-icons.mjs`               – favicon.ico / icon.svg /
 *                                                apple-icon.png / PWA PNGs
 *
 * The monogram is authored in a 440 x 300 box (see `MARK`); consumers place it
 * via `MARK_TRANSFORM`, so the artwork is never re-traced.
 *
 * Palette comes from the design tokens (`--color-primary` emerald,
 * `--color-secondary` cyan) rather than a bespoke gradient. Two palettes exist
 * — `MARK_PALETTE_DARK` (neon, matches `.dark`) and `MARK_PALETTE_LIGHT` (the
 * darker `.light` token pair) — that is the whole light/dark story.
 */

/** Monogram content box inside the source artwork. */
export const MARK = { x: 0, y: 0, width: 440, height: 300 } as const;

/** Vertical centre of the mark's ink, used to centre type against it. */
export const MARK_MID_Y = 154;

/** Path data of the monogram (coordinates relative to the 440 x 300 box). */
export const PATHS = {
  /** M — left ribbon half. */
  mLeft: 'M 34,232 L 54,252 L 68,252 L 68,120 L 126,184 L 126,134 L 56,56 L 34,56 Z',
  /** M — right ribbon half. */
  mRight: 'M 126,134 L 126,184 L 184,120 L 184,232 L 204,252 L 218,252 L 218,56 L 196,56 Z',
  /** M — 3D fold shadow in the centre valley. */
  mFold: '126,134 126,184 154,153',
  /** O — upper ribbon segment (sliced 45°). */
  oTop: 'M 248,230 L 230,212 L 230,96 L 270,56 L 346,56 L 368,78 L 344,102 L 332,90 L 284,90 L 264,110 L 264,198 L 272,206 Z',
  /** O — lower ribbon segment, separated by the 6px precision seam. */
  oBottom:
    'M 373,83 L 386,96 L 386,212 L 346,252 L 270,252 L 253,235 L 277,211 L 284,218 L 332,218 L 352,198 L 352,110 L 349,107 Z',
  /** Bridge M↔O — dark gap underlay. */
  bridgeGap: '204,146 244,146 238,162 198,162',
  /** Bridge M↔O — gradient link on top of the gap. */
  bridgeLink: '206,149 242,149 238,159 202,159',
  /** `</>` code tag in the M's top notch. */
  codeLeft: '105,48 93,60 105,72',
  codeSlash: { x1: 131, y1: 45, x2: 121, y2: 75 },
  codeRight: '147,48 159,60 147,72',
} as const;

/** Broken 4-corner architectural reticle drawn *around* the monogram. */
export const RETICLE = {
  strokes: [
    '12,52 12,20 44,20',
    '12,256 12,288 44,288',
    '376,20 408,20 408,52',
    '376,288 408,288 408,256',
  ],
  squares: [
    { x: 9, y: 17 },
    { x: 9, y: 285 },
    { x: 405, y: 17 },
    { x: 405, y: 285 },
  ],
} as const;

/**
 * Colour slots of the mark. The `*[0..2]` entries are gradient stops
 * (top-left → bottom-right); `bridgeGap` must match whatever sits behind the
 * emblem, because it is the notch that separates M from O.
 */
export type MarkPalette = {
  mLeft: readonly [string, string, string];
  mRight: readonly [string, string, string];
  oTop: readonly [string, string, string];
  oBottom: readonly [string, string, string];
  codeLeft: string;
  codeSlash: string;
  codeRight: string;
  /** Reticle: top-left pair (emerald) and bottom-right pair (cyan). */
  reticleA: string;
  reticleB: string;
  fold: string;
  bridgeGap: string;
  /** App-tile plate (static icons only). */
  tileFill: string;
  tileStroke: string;
};

/**
 * Dark — the artwork's original neon pair, identical to the `.dark` design
 * tokens: `#10B981` (emerald) → `#06B6D4` (cyan).
 */
export const MARK_PALETTE_DARK: MarkPalette = {
  mLeft: ['#34D399', '#10B981', '#0D9488'],
  mRight: ['#10B981', '#0EA5E9', '#06B6D4'],
  oTop: ['#10B981', '#06B6D4', '#22D3EE'],
  oBottom: ['#22D3EE', '#06B6D4', '#0284C7'],
  codeLeft: '#10B981',
  codeSlash: '#22D3EE',
  codeRight: '#06B6D4',
  reticleA: '#10B981',
  reticleB: '#06B6D4',
  fold: '#071F29',
  bridgeGap: '#090A0D',
  tileFill: '#0B0D12',
  tileStroke: '#1E293B',
};

/**
 * Light — the `.light` token pair (`#059669` / `#0891b2`), with the neon end
 * stops pulled toward the mid tone. The neon set measures ~1.9:1 against
 * `#f8fafc`, which is a smear rather than a logo; these stay near 3.4:1 and
 * keep the ribbon seam readable on white.
 */
export const MARK_PALETTE_LIGHT: MarkPalette = {
  mLeft: ['#34D399', '#059669', '#047857'],
  mRight: ['#0891b2', '#0e7490', '#0369a1'],
  oTop: ['#059669', '#0891b2', '#22a3b8'],
  oBottom: ['#22a3b8', '#0e7490', '#0369a1'],
  codeLeft: '#059669',
  codeSlash: '#0e7490',
  codeRight: '#0891b2',
  reticleA: '#059669',
  reticleB: '#0891b2',
  fold: '#062B24',
  bridgeGap: '#F8FAFC',
  tileFill: '#F8FAFC',
  tileStroke: '#E2E8F0',
};

/**
 * Lockup typography and box math, in artwork units (mark height = 300).
 *
 * Three compositions exist because the subline is a *third* line and needs real
 * vertical room to stay legible:
 *
 *   compact  mark + wordmark                — small screens, header
 *   full     mark + wordmark + subline      — large screens, header
 *   display  the whole thing, large         — hero/footer/404 on wide layouts
 *
 * The header constraint drives every number here. Its bar is 64 px tall; a
 * 44 px type block inside it renders the subline at `subSize / boxHeight *
 * blockHeight` px. With a 21-unit subline in a 332-unit box that is ~2 px —
 * illegible. So `full` uses a *tight* box (no dead space under the mark) and a
 * proportionally larger subline, which lands around 8 px at 56–64 px.
 *
 * Wordmark metrics are measured against Space Grotesk 700, not guessed:
 * OSTHEIMER at 96 units + 4 tracking has an ink width of 542 units.
 */
export const LOCKUP = {
  wordSize: 96,
  /** Divider gap between mark and type. */
  gap: 56,
  /** MAYRA baseline → OSTHEIMER baseline. */
  lineGap: 100,
  /** OSTHEIMER baseline → subline baseline. Clears the wordmark descender. */
  subGap: 48,
  /** Wordmark tracking. */
  tracking: 4,
  subTracking: 2.5,
  /** Divider bar between mark and type. */
  divider: { gap: 28, width: 2 },
} as const;

/** Subline type size per composition. */
export const SUBLINE_SIZE = {
  /** In the 300-unit display box, where the whole lockup is large. */
  display: 24,
  /**
   * Header composition. Deliberately oversized relative to the wordmark: the
   * subline is the smallest element in a bar that is only 80 px tall, so it
   * gets the extra units to land near 9 px instead of 5 px.
   */
  header: 38,
} as const;

/** Left edge of the mark's 440-unit box. */
const MARK_BOX_WIDTH = MARK.width;

/** Horizontal origin of the wordmark. */
export const LOCKUP_TEXT_X = MARK_BOX_WIDTH + LOCKUP.gap;

/** Vertical origin of the divider (centred on the mark). */
export const LOCKUP_DIVIDER_X = MARK_BOX_WIDTH + LOCKUP.divider.gap;

/** Vertical padding above the mark inside every lockup box (the reticle needs air). */
export const MARK_TOP_PAD = 12;

/** Wordmark baselines, derived so the two-line block is centred on the mark. */
const WORD_BLOCK_HEIGHT = LOCKUP.wordSize + LOCKUP.lineGap;
export const LOCKUP_BASELINE_1 =
  MARK_TOP_PAD + MARK_MID_Y - WORD_BLOCK_HEIGHT / 2 + LOCKUP.wordSize;
export const LOCKUP_BASELINE_2 = LOCKUP_BASELINE_1 + LOCKUP.lineGap;

/** Subline baseline, derived from the second wordmark line. */
export const LOCKUP_SUBLINE_Y = LOCKUP_BASELINE_2 + LOCKUP.subGap;

/**
 * ViewBox sizes.
 *
 * - `compact`: the mark box only (440 x 300) — mark + wordmark, small screens.
 * - `full`: mark box + the subline strip below it (header `lg` and up).
 * - `display`: the full lockup with the subline at its natural size, for large
 *   surfaces (404 chrome, OG, print).
 *
 * All three share the same 300-unit mark height, so a given box height renders
 * the mark at exactly the same size; only the type scales with the box.
 */
/**
 * Bootbox width, measured rather than assumed.
 *
 * The subline is the widest element in the lockup (JetBrains Mono 700 at
 * `SUBLINE_SIZE.header` is 676 units — it ends at x≈1238, far past the mark's
 * 440). A hardcoded 1000 clipped it to "WEB & APPLICATION A". These are the
 * measured ink widths (see `tests/int/brand.int.spec.ts`); the boxes add a
 * small right margin so a font fallback cannot clip either.
 */
const SUBLINE_INK = { header: 748, display: 472 } as const;
const BOX_RIGHT_PAD = 40;

/**
 * Vertical room below the subline baseline. A subline's descenders plus font
 * fallback need more than the nominal `0.35 × size` — the standalone SVG and
 * the in-app lockup both clipped the bottom of the text with the tighter value.
 */
const SUBLINE_BOTTOM_PAD = 1.6;

/** Widest content per composition. */
const CONTENT_RIGHT = LOCKUP_TEXT_X + 2 + SUBLINE_INK.header;

/** OSTHEIMER at `wordSize` plus tracking measures 542 units of ink. */
const WORDMARK_INK = 542;

export const LOCKUP_BOX = {
  /** No subline: the box ends where the wordmark ends, keeping the mark big. */
  compact: {
    width: LOCKUP_TEXT_X + WORDMARK_INK + BOX_RIGHT_PAD,
    height: MARK.height + MARK_TOP_PAD * 2,
  },
  full: {
    width: CONTENT_RIGHT + BOX_RIGHT_PAD,
    height: LOCKUP_SUBLINE_Y + SUBLINE_SIZE.header * SUBLINE_BOTTOM_PAD,
  },
  display: {
    width: LOCKUP_TEXT_X + 2 + SUBLINE_INK.display + BOX_RIGHT_PAD,
    height: LOCKUP_SUBLINE_Y + SUBLINE_SIZE.display * SUBLINE_BOTTOM_PAD,
  },
} as const;

/** Copy of the subline, split so the `//` can carry its own colour. */
export const SUBLINE = { slash: '// ', text: 'WEB & APPLICATION ARCHITECT' } as const;
