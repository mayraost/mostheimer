import { describe, expect, it } from 'vitest';
import { mediaSrc } from '@/lib/mediaSrc';
import { pickProjectImage } from '@/components/projects/pickImage';

/**
 * Contract of the media URL normalizer — pure, no DB, no React.
 *
 * Why this exists: Payload builds upload URLs from `serverURL`, so `media.url`
 * and all variant URLs arrive ABSOLUTE. `next/image` classifies an absolute URL
 * as remote, and without `images.remotePatterns` the optimizer answers
 * `400 "url" parameter is not allowed` — every CMS image stayed blank
 * (measured on `/de/projects`, 11.11.2026). The helper turns our own upload
 * URLs back into the path the app actually serves.
 *
 * The assertions below are the promises the renderers rely on:
 * - same-origin media (any host, any scheme) → path, query preserved;
 * - everything else (external, relative, empty) is returned unchanged;
 * - no throw on garbage input (it runs during render).
 */

describe('mediaSrc', () => {
  it('reduces absolute Payload upload URLs to their served path', () => {
    expect(mediaSrc('https://mostheimer.de/api/media/file/tile-768x432.png')).toBe(
      '/api/media/file/tile-768x432.png',
    );
    expect(mediaSrc('https://www.mostheimer.de/api/media/file/tile.png')).toBe(
      '/api/media/file/tile.png',
    );
    // Host-agnostic by construction: dev and preview hosts work too.
    expect(mediaSrc('http://localhost:3000/api/media/file/tile.png')).toBe(
      '/api/media/file/tile.png',
    );
    expect(mediaSrc('https://mosthi.de/media/tile.png')).toBe('/media/tile.png');
  });

  it('preserves query and hash (Payload cache-busters)', () => {
    expect(mediaSrc('https://mostheimer.de/api/media/file/tile.png?v=2')).toBe(
      '/api/media/file/tile.png?v=2',
    );
  });

  it('passes relative paths, external URLs and non-media paths through', () => {
    expect(mediaSrc('/api/media/file/tile.png')).toBe('/api/media/file/tile.png');
    expect(mediaSrc('https://cdn.example.com/tile.png')).toBe('https://cdn.example.com/tile.png');
    expect(mediaSrc('https://mostheimer.de/og?t=x')).toBe('https://mostheimer.de/og?t=x');
  });

  it('returns null for empty input instead of an empty src', () => {
    expect(mediaSrc(null)).toBeNull();
    expect(mediaSrc(undefined)).toBeNull();
    expect(mediaSrc('')).toBeNull();
    expect(mediaSrc('   ')).toBeNull();
  });

  it('does not throw on garbage', () => {
    expect(mediaSrc('http://[::1')).toBe('http://[::1');
  });
});

describe('pickProjectImage', () => {
  it('hands `next/image` a path, not the absolute Payload URL', () => {
    const media = {
      url: 'https://mostheimer.de/api/media/file/cover.png',
      width: 1280,
      height: 720,
      alt: 'cover',
      variants: {
        tile: {
          url: 'https://mostheimer.de/api/media/file/cover-768x432.png',
          width: 768,
          height: 432,
        },
      },
    } as unknown as Parameters<typeof pickProjectImage>[0];

    expect(pickProjectImage(media, 'tile')).toEqual({
      url: '/api/media/file/cover-768x432.png',
      width: 768,
      height: 432,
      alt: 'cover',
    });
    // No variant → original, still a path.
    expect(pickProjectImage(media, 'hero')?.url).toBe('/api/media/file/cover.png');
  });
});
