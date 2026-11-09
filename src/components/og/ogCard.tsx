/**
 * Building blocks for the `next/og` ImageResponse OG card.
 *
 * Satori constraints:
 * - Every container needs `display: 'flex'` plus explicit px or percentage
 *   sizes; Tailwind does not apply inside an ImageResponse render.
 * - Text renders without a `fonts` option because @vercel/og bundles
 *   Geist-Regular as its default font — no font asset or repo binary needed.
 * - No CSS custom properties: Satori resolves neither `var(--mark-*)` nor
 *   `currentColor` reliably, so the mark is painted from the literal palette
 *   (`MARK_PALETTE_DARK`) and the card is always the dark surface.
 * - The root size comes from the ImageResponse `size` option; inner layout is
 *   percentage-based.
 */

import { MARK_PALETTE_DARK, MARK, PATHS, RETICLE } from '@/components/brand/markGeometry';

export const OG_SIZE = { width: 1200, height: 630 } as const;

export type OgLocale = 'en' | 'de';

/**
 * Brand colours for the card.
 *
 * The card is dark on purpose: the mark is an emerald→cyan neon emblem and the
 * whole identity is dark-first. A light card would either wash the mark out or
 * need a second palette, so the OG surface matches the site's default theme.
 */
export const OG_BRAND = {
  background: '#090A0D',
  surface: '#0B0D12',
  text: '#F8FAFC',
  muted: '#94A3B8',
  emerald: '#10B981',
  cyan: '#06B6D4',
  border: '#1E293B',
} as const;

const OG_TITLE_MAX_LENGTH = 200;

const P = MARK_PALETTE_DARK;

/**
 * The MO monogram as a static <svg> for Satori.
 *
 * Satori has no `<defs>`-gradient support across all versions and ignores
 * `<style>`, so the ribbons are painted as flat fills (the mid stop of each
 * gradient). At 96 px the gradient is a few pixels wide — flat is visually
 * identical and cannot fail to render.
 */
export function OgMark({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * MARK.height) / MARK.width}
      viewBox={`0 0 ${MARK.width} ${MARK.height}`}
    >
      <g fill="none" strokeWidth="2">
        {RETICLE.strokes.map((points, index) => (
          <polyline
            key={points}
            points={points}
            stroke={index < 2 ? P.reticleA : P.reticleB}
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
          fill={index < 2 ? P.reticleA : P.reticleB}
        />
      ))}
      <path d={PATHS.mLeft} fill={P.mLeft[1]} />
      <path d={PATHS.mRight} fill={P.mRight[0]} />
      <polygon points={PATHS.mFold} fill={P.fold} fillOpacity="0.45" />
      <g fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={PATHS.codeLeft} stroke={P.codeLeft} />
        <line
          x1={PATHS.codeSlash.x1}
          y1={PATHS.codeSlash.y1}
          x2={PATHS.codeSlash.x2}
          y2={PATHS.codeSlash.y2}
          stroke={P.codeSlash}
        />
        <polyline points={PATHS.codeRight} stroke={P.codeRight} />
      </g>
      <path d={PATHS.oTop} fill={P.oTop[0]} />
      <path d={PATHS.oBottom} fill={P.oBottom[1]} />
      <polygon points={PATHS.bridgeGap} fill={OG_BRAND.background} />
      <polygon points={PATHS.bridgeLink} fill={P.oTop[0]} />
    </svg>
  );
}

/**
 * URL builder for the /og route: generateMetadata points here instead of using a
 * file convention, which the [[...slug]] catch-all does not allow (see the route
 * comment). The URL stays relative on purpose — `metadataBase` from the layout
 * resolves it to an absolute one.
 */
export function ogImageUrl(title: string, locale: OgLocale, subtitle = ''): string {
  const params = new URLSearchParams({
    t: title.slice(0, OG_TITLE_MAX_LENGTH),
    s: subtitle.slice(0, OG_TITLE_MAX_LENGTH),
    loc: locale,
  });
  return `/og?${params.toString()}`;
}

/** Strip control characters and cap the length (text-slot hygiene). */
export function sanitizeOgTitle(input: string): string {
  return input.replace(/[\u0000-\u001f]/g, ' ').slice(0, OG_TITLE_MAX_LENGTH);
}

export interface OgCardProps {
  /** Large title (per-page CMS title or site name). */
  title: string;
  /** Subtitle (site name or short byline). */
  subtitle?: string;
  /**
   * Brand wordmark, split into its lines (the card stacks them).
   *
   * Copy comes from the caller (`site-settings.siteName`), resolved in the /og
   * route: the card itself must stay a pure renderer because Satori runs
   * outside any React request context and cannot await the CMS.
   */
  wordmark: string[];
  /** Subline under the wordmark (`seo.ogSubtitle`, e.g. "Web & Application Architect"). */
  tagline?: string;
}

/**
 * Splits a brand name into display lines.
 *
 * Satori cannot wrap automatically and the card reserves a fixed two-line
 * block, so the caller passes the already-split result of this helper (shared
 * with the route, which owns the data).
 */
export function splitWordmark(siteName: string): string[] {
  const words = siteName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length === 1) return [words[0].toUpperCase()];
  // First word on line one, the rest on line two ("MAYRA" / "OSTHEIMER").
  return [words[0].toUpperCase(), words.slice(1).join(' ').toUpperCase()];
}

/**
 * The card itself: brand row (mark, wordmark, subline) on top, title
 * bottom-left, on the dark brand surface with an emerald→cyan hairline.
 */
export function OgCard({ title, subtitle, wordmark, tagline }: OgCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        background: `linear-gradient(140deg, ${OG_BRAND.surface} 0%, ${OG_BRAND.background} 55%, #06070A 100%)`,
        padding: '64px 72px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <OgMark size={96} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 28,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 34,
              lineHeight: 1.1,
              letterSpacing: 1,
              color: OG_BRAND.text,
            }}
          >
            {wordmark.map((line) => (
              <div key={line} style={{ display: 'flex' }}>
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 10,
              fontSize: 15,
              letterSpacing: 2,
              color: OG_BRAND.cyan,
            }}
          >
            {tagline ? `// ${tagline.toUpperCase()}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            width: 96,
            height: 4,
            marginBottom: 28,
            background: `linear-gradient(90deg, ${OG_BRAND.emerald} 0%, ${OG_BRAND.cyan} 100%)`,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            lineHeight: 1.15,
            color: OG_BRAND.text,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontSize: 36,
              color: OG_BRAND.muted,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
