import { describe, expect, it } from 'vitest';

import {
  LOCKUP,
  LOCKUP_BASELINE_1,
  LOCKUP_BASELINE_2,
  LOCKUP_BOX,
  LOCKUP_SUBLINE_Y,
  MARK,
  MARK_PALETTE_DARK,
  MARK_PALETTE_LIGHT,
  MARK_TOP_PAD,
  SUBLINE_SIZE,
} from '../../src/components/brand/markGeometry';

/**
 * Brand invariants.
 *
 * These guard the bugs that actually happened while rebuilding the logo, not
 * hypothetical ones:
 *
 *  - the subline was clipped to "WEB & APPLICATION A" because the viewBox was
 *    narrower than the text;
 *  - the subline rendered at 2 px in the header because the box was wide and
 *    the height was fixed;
 *  - the mark flipped to the neon palette in light mode and vanished.
 *
 * They are pure data checks — no DOM, no DB, no build.
 */

/** Colour slots that must match between `globals.css` and the TS palettes. */
const PALETTE_SLOTS = [
  'mLeft',
  'mRight',
  'oTop',
  'oBottom',
  'codeLeft',
  'codeSlash',
  'codeRight',
  'reticleA',
  'reticleB',
  'fold',
  'bridgeGap',
] as const;

describe('brand mark geometry', () => {
  it('keeps the subline inside every box that renders it', () => {
    // Header composition: 34 units of JetBrains Mono 700 measure 676 units of
    // ink, which is the widest element in the lockup.
    const sublineRight = LOCKUP_TEXT_RIGHT + 676;
    expect(LOCKUP_BOX.full.width).toBeGreaterThanOrEqual(sublineRight);
    expect(LOCKUP_BOX.display.width).toBeGreaterThanOrEqual(LOCKUP_TEXT_RIGHT + 437);

    // Vertical: descenders must fit under the baseline.
    expect(LOCKUP_BOX.full.height).toBeGreaterThan(LOCKUP_SUBLINE_Y);
    expect(LOCKUP_BOX.display.height).toBeGreaterThan(LOCKUP_SUBLINE_Y);
  });

  it('leaves the wordmark enough room in the compact box', () => {
    // OSTHEIMER at wordSize + tracking is 404 units wide.
    expect(LOCKUP_BOX.compact.width).toBeGreaterThanOrEqual(LOCKUP_TEXT_RIGHT + 404);
  });

  it('reserves headroom so the reticle is never clipped', () => {
    expect(MARK_TOP_PAD).toBeGreaterThan(0);
    const markBottom = MARK_TOP_PAD + MARK.height;
    expect(LOCKUP_BOX.compact.height).toBeGreaterThanOrEqual(markBottom);
  });

  it('orders the type stack top to bottom', () => {
    expect(LOCKUP_BASELINE_1).toBeLessThan(LOCKUP_BASELINE_2);
    expect(LOCKUP_BASELINE_2).toBeLessThan(LOCKUP_SUBLINE_Y);
    // The subline must clear the wordmark descender, not sit on it.
    expect(LOCKUP_SUBLINE_Y - LOCKUP_BASELINE_2).toBeGreaterThan(LOCKUP.subGap - 1);
  });

  it('sizes the header subline above the legibility floor', () => {
    // Header block is ~72 px tall; anything under 7 px is unreadable.
    const rendered = (SUBLINE_SIZE.header / LOCKUP_BOX.full.height) * 72;
    expect(rendered).toBeGreaterThan(7);
  });

  it('uses a distinct palette per theme, never the same object', () => {
    expect(MARK_PALETTE_DARK).not.toBe(MARK_PALETTE_LIGHT);
    for (const slot of PALETTE_SLOTS) {
      // At least one slot must differ, otherwise the light mode is a no-op.
      const dark = JSON.stringify(MARK_PALETTE_DARK[slot]);
      const light = JSON.stringify(MARK_PALETTE_LIGHT[slot]);
      if (slot === 'bridgeGap') continue;
      if (dark !== light) return;
    }
    throw new Error('dark and light palettes are identical');
  });

  it('keeps the light palette darker than the dark one on white', () => {
    /** Relative luminance of a hex colour (WCAG). */
    function luminance(hex: string): number {
      const rgb = [1, 3, 5].map((offset) => {
        const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }

    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };

    // Dark-mode emerald on white is the worst case the light palette fixes:
    // measured 2.42:1, versus 3.4+:1 for the light-mode pair.
    expect(contrast(MARK_PALETTE_DARK.mLeft[1], '#F8FAFC')).toBeLessThan(3);
    expect(contrast(MARK_PALETTE_LIGHT.mLeft[1], '#F8FAFC')).toBeGreaterThan(3.4);
  });
});

/** Right edge of the wordmark origin, shared by the assertions above. */
const LOCKUP_TEXT_RIGHT = MARK.width + LOCKUP.gap + 2;
