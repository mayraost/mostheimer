'use client';

import { useId } from 'react';

/** Props of {@link LogoLockupMark}. */
type LogoLockupMarkProps = {
  /** Extra classes on the root <svg>; sizing is the caller's job. */
  className?: string;
  /** Accessible name. The surrounding link usually supplies it, so pass `''` to hide. */
  title?: string;
};

/**
 * Header-sized lockup: the M/O glyph mark plus the MAYRA OSTHEIMER wordmark.
 *
 * The full lockup (`LogoLockup`) carries a third line —
 * `// WEB & APPLICATION ARCHITECT`. In a 56–64 px header bar that line scales
 * to roughly 6–7 px, so it is dropped here instead of shipped unreadably.
 * The subline still belongs to the full lockup on large surfaces.
 *
 * Cropped viewBox: the full artwork is 2303 x 645 (`253 420 2303 645`), but the
 * subline lives below y≈960 and the wordmark ends near x≈2400. Cropping to the
 * content keeps the glyphs as large as possible for a given CSS height — no
 * dead space padding the logo down to an illegible size.
 *
 * The wordmark uses `currentColor` (not a fixed near-white) so it stays legible
 * on both themes: the reference artwork is near-white, which disappears on the
 * light theme's white background.
 */
export function LogoLockupMark({ className, title = 'Mayra Ostheimer' }: LogoLockupMarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="268 443 2150 600"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={`${uid}gM`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#45E39C" />
          <stop offset="0.4" stopColor="#28CFAB" />
          <stop offset="0.75" stopColor="#1AC2BE" />
          <stop offset="1" stopColor="#16B2CE" />
        </linearGradient>
        <radialGradient id={`${uid}gO`} cx="0.18" cy="0.1" r="1.0">
          <stop offset="0" stopColor="#23D3B6" />
          <stop offset="0.4" stopColor="#23CDB2" />
          <stop offset="0.75" stopColor="#17BCD7" />
          <stop offset="1" stopColor="#1ABCD5" />
        </radialGradient>
        <linearGradient id={`${uid}gA`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3CEBAA" />
          <stop offset="1" stopColor="#2ED5B2" />
        </linearGradient>
        <linearGradient id={`${uid}gW`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8CFFD9" />
          <stop offset="0.45" stopColor="#5CFFE2" />
          <stop offset="1" stopColor="#79F0FF" />
        </linearGradient>

        {/*
         * Bloom. Two passes so the tight halo and the wide spill can differ;
         * `SourceGraphic` is merged last so the artwork stays crisp.
         */}
        <filter id={`${uid}bloom`} x="-12%" y="-12%" width="124%" height="124%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="glow1" />
          <feColorMatrix
            in="glow1"
            type="matrix"
            values="0.9 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0"
            result="glow1a"
          />
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="glow2" />
          <feColorMatrix
            in="glow2"
            type="matrix"
            values="0.6 0 0 0 0  0 0.9 0 0 0  0 0 1 0 0  0 0 0 0.8 0"
            result="glow2a"
          />
          <feMerge>
            <feMergeNode in="glow1a" />
            <feMergeNode in="glow2a" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`.wm { font-family: 'Space Grotesk', var(--font-heading, ''), 'Helvetica Neue', Arial, sans-serif; }
      .hair { fill: none; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; opacity: 0.9; }
      .wire { fill: none; stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
      .code { fill: none; stroke-width: 23; stroke-linejoin: miter; stroke-linecap: butt; }`}</style>
      </defs>

      {/* outer wire frame (outside the glyphs, as in the reference) */}
      <g className="wire" stroke={`url(#${uid}gW)`}>
        <path d="M287 493 L287 1000 L304 1000" />
        <path d="M287 493 L304 493" />
        <path d="M811 493 L811 1000 L794 1000" />
        <path d="M811 493 L794 493" />
      </g>

      {/* M / O mark */}
      <g filter={`url(#${uid}bloom)`}>
        <path
          fill={`url(#${uid}gM)`}
          d="M302 493L302 497L400 497L394 493ZM706 493L699 497L797 497L797 493ZM456 493L456 502L458 504L507 540L509 540L509 522L475 496L474 495L476 493ZM623 493L625 495L624 496L589 522L589 540L592 540L640 504L643 501L643 493ZM542 493L521 556L538 556L559 493ZM304 527L304 557L406 557L384 530L379 527ZM720 527L716 529L693 557L795 557L794 527ZM698 498L558 664L566 664L699 505L705 499L709 498ZM393 498L535 665L542 665L400 498ZM357 588L356 701L459 701L361 588ZM738 587L640 701L743 701L743 588L741 587ZM358 558L362 560L368 568L369 575L366 581L367 585L489 727L549 727L407 558ZM692 558L550 727L610 727L733 584L734 582L731 577L731 568L736 561L742 558ZM403 702L472 784L531 784L460 702ZM639 702L565 788L624 788L697 702ZM476 789L548 874L551 874L623 789ZM437 795L535 912L543 912L444 795ZM304 558L304 1000L350 1000L349 589L340 583L337 576L340 564L348 558ZM356 702L355 1000L401 1000L401 702ZM699 782L699 999L743 999L743 784L738 782ZM304 1001L304 1004L401 1004L401 1001Z"
        />
        <path
          fill={`url(#${uid}gO)`}
          fillRule="evenodd"
          d="M922 527H1214L1262 575V959L1214 1007H922L874 959V575ZM947 656H1189L1136 880H947Z"
        />
      </g>

      {/* wordmark — currentColor keeps it readable on light and dark */}
      <text
        className="wm"
        x="1423"
        y="716"
        fontSize="191.6"
        fontWeight="500"
        letterSpacing="2.6"
        fill="currentColor"
      >
        MAYRA
      </text>
      <text
        className="wm"
        x="1423"
        y="913"
        fontSize="202.5"
        fontWeight="700"
        letterSpacing="-8.9"
        fill="currentColor"
      >
        OSTHEIMER
      </text>
    </svg>
  );
}
