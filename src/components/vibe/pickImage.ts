import type { Media } from '@/payload-types';

/**
 * Media variants of the vibe-coding showcase (design doc § 4), all 16:9-ish
 * crops declared in `payload.config.ts` `media.variants`.
 *
 * - `tile`     → grid tile (1 column)
 * - `tileWide` → featured tile (2 columns)
 * - `hero`     → detail page hero
 */
export type VibeImageSlot = 'tile' | 'tileWide' | 'hero';

const VARIANT_NAME: Record<VibeImageSlot, 'vibeTile' | 'vibeTileWide' | 'vibeHero'> = {
  tile: 'vibeTile',
  tileWide: 'vibeTileWide',
  hero: 'vibeHero',
};

/** A renderable image: absolute URL plus the intrinsic size `next/image` needs. */
export type VibeImage = { url: string; width: number; height: number; alt: string };

/** Fallback box when neither the variant nor the original reports a size. */
const FALLBACK_SIZE = { width: 1280, height: 720 } as const;

/**
 * Picks the showcase image of one slot.
 *
 * Pure and dependency-free so the public route AND the live preview can share
 * it (the preview merges raw form values, the route gets populated documents).
 *
 * Fallback chain: variant URL → original `url`. Uploads that predate the
 * variants (and every media document created before § 4) only carry the
 * original, and an empty tile is worse than a slightly oversized one.
 * Explicit width/height are passed to `next/image` (never `fill`) so the tile
 * reserves its box and cannot shift the layout.
 */
export function pickVibeImage(
  media: Media | number | string | null | undefined,
  slot: VibeImageSlot,
): VibeImage | null {
  if (!media || typeof media !== 'object') return null;
  const variant = media.variants?.[VARIANT_NAME[slot]];
  const url = variant?.url ?? media.url;
  if (!url) return null;
  return {
    url,
    width: variant?.width ?? media.width ?? FALLBACK_SIZE.width,
    height: variant?.height ?? media.height ?? FALLBACK_SIZE.height,
    alt: media.alt ?? '',
  };
}
