'use client';

import { useId } from 'react';

/** Props of {@link LogoLockup}. */
type LogoLockupProps = {
  /** Extra classes on the root <svg>; sizing is the caller's job. */
  className?: string;
  /** Accessible name, used as aria-label and <title>. */
  title?: string;
};

/**
 * Full logo lockup (MAYRA OSTHEIMER wordmark plus the M/O glyph mark).
 *
 * Same artwork as `src/public/logo-lockup.svg` but inlined, so the gradients and
 * the bloom filter cost no extra request. Every `id` is prefixed with a
 * per-instance `uid` from `useId()`: two lockups on one page would otherwise
 * share the filter id and the second one would silently lose its bloom.
 *
 * The wordmark uses the app's own Space Grotesk stack (`--font-heading` /
 * `--font-body` from `globals.css`, filled by `next/font`), so no font is
 * embedded here. The standalone SVG embeds a base64 woff2 because it has no
 * access to the app CSS.
 */
export function LogoLockup({ className, title = 'Mayra Ostheimer' }: LogoLockupProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="253 420 2303 645"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* gradients + bloom */}
      <defs>
        <linearGradient
          id={`${uid}gM`}
          x1="304"
          y1="500"
          x2="794"
          y2="1000"
          gradientUnits="userSpaceOnUse"
        >
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
        <linearGradient
          id={`${uid}gA`}
          x1="455"
          y1="443"
          x2="682"
          y2="577"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3CEBAA" />
          <stop offset="1" stopColor="#2ED5B2" />
        </linearGradient>
        <linearGradient
          id={`${uid}gS`}
          x1="1423"
          y1="985"
          x2="2556"
          y2="985"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#27C7CE" />
          <stop offset="0.55" stopColor="#2BC9DC" />
          <stop offset="1" stopColor="#37CAD9" />
        </linearGradient>
        <linearGradient
          id={`${uid}gW`}
          x1="280"
          y1="440"
          x2="1300"
          y2="1060"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8CFFD9" />
          <stop offset="0.45" stopColor="#5CFFE2" />
          <stop offset="1" stopColor="#79F0FF" />
        </linearGradient>

        {/*
         * Bloom is deliberately TIGHT (2px wide / 6px mid, measured against the
         * reference). A soft 26px halo looked good in isolation but does not
         * exist in the source artwork: outside the glyphs the reference sits at
         * background luminance right up to the edge, and a wide pass bleeds
         * across the dark stem seams and washes out their structure.
         */}
        <filter
          id={`${uid}bloom`}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="2" result="wide" />
          <feColorMatrix
            in="wide"
            type="matrix"
            result="glow"
            values="0 0 0 0 0.12  0 0 0 0 0.88  0 0 0 0 0.74  0 0 0 0.5 0"
          />
          <feGaussianBlur stdDeviation="6" result="mid" />
          <feColorMatrix
            in="mid"
            type="matrix"
            result="glow2"
            values="0 0 0 0 0.28  0 0 0 0 0.97  0 0 0 0 0.88  0 0 0 0.28 0"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`.wm { font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif; }
      .hair { fill: none; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; opacity: 0.9; }
      .wire { fill: none; stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
      .trace { fill: none; stroke: #0a1216; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; opacity: 0.92; }
      .ring { fill: none; stroke: #0a1216; stroke-width: 6; stroke-linejoin: round; opacity: 0.6; }
      .code { fill: none; stroke-width: 23; stroke-linejoin: miter; stroke-linecap: butt; }`}</style>
      </defs>

      {/* outer wire frame (outside the glyphs, as in the reference) */}
      <g className="wire">
        <path d="M287 493 L287 1000 L304 1000" />
        <path d="M287 493 L304 493" />
        <path d="M811 493 L811 1000 L794 1000" />
        <path d="M811 493 L794 493" />
        <path d="M794 766 L860 766" />
      </g>

      {/* bloom layer */}
      <g filter={`url(#${uid}bloom)`}>
        <path
          fill={`url(#${uid}gM)`}
          d="M302 493L302 497L400 497L394 493ZM706 493L699 497L797 497L797 493ZM456 493L456 502L458 504L507 540L509 540L509 522L475 496L474 495L476 493ZM623 493L625 495L624 496L589 522L589 540L592 540L640 504L643 501L643 493ZM542 493L521 556L538 556L559 493ZM304 527L304 557L406 557L384 530L379 527ZM720 527L716 529L693 557L795 557L794 527ZM743 565L738 570L738 576L743 581L750 581L755 575L755 571L750 565ZM350 565L345 569L344 574L346 579L351 582L354 582L361 576L361 570L356 565ZM698 498L558 664L566 664L699 505L705 499L709 498ZM393 498L535 665L542 665L400 498ZM549 661L549 663L535 666L538 669L536 672L536 682L541 689L546 691L552 691L558 688L563 681L563 674L561 670L565 665L551 663L551 661ZM738 587L640 701L743 701L743 588L741 587ZM357 588L356 701L459 701L361 588ZM358 558L362 560L368 568L369 575L366 581L367 585L489 727L549 727L407 558ZM692 558L550 727L610 727L733 584L734 582L731 577L731 568L736 561L742 558ZM750 558L755 560L760 565L761 577L756 585L749 588L748 751L795 751L795 630L797 628L797 622L795 621L795 558ZM699 702L699 751L743 751L743 702ZM699 752L699 764L795 764L795 752ZM699 765L699 771L770 771L761 770L763 767L762 766L774 765ZM795 765L795 770L793 771L795 771L797 770L797 765ZM699 772L699 773L795 773L795 772ZM699 774L699 775L759 775L759 774ZM760 774L760 775L795 775L795 774ZM699 777L699 781L754 781L758 777ZM742 782L747 783L749 783L745 782ZM403 702L472 784L531 784L460 702ZM490 728L534 779L536 782L533 784L562 784L571 771L609 728ZM639 702L565 788L624 788L697 702ZM473 785L475 788L564 788L565 787L562 785ZM476 789L548 874L551 874L623 789ZM668 781L556 912L564 912L662 795L670 793L670 781ZM437 795L535 912L543 912L444 795ZM546 911L544 912L555 912L552 911ZM536 913L538 916L536 920L536 928L542 936L547 938L553 938L559 935L563 929L564 922L561 915L563 913ZM759 777L748 785L749 999L797 999L795 777ZM699 782L699 999L743 999L743 784L738 782ZM304 558L304 1000L350 1000L349 589L340 583L337 576L340 564L348 558ZM356 702L355 1000L401 1000L401 702ZM430 781L430 1004L435 1004L435 795L443 794L432 781ZM665 794L665 1004L670 1004L670 794ZM699 1000L698 1004L797 1004L797 1000ZM304 1001L304 1004L401 1004L401 1001Z"
        />
        <path
          fill={`url(#${uid}gO)`}
          fillRule="evenodd"
          d="M922 527 L1214 527 L1262 575 L1262 960 L1214 1008 L922 1008 L874 960 L874 575Z M980 659 L1103 659 L1136 692 L1136 845 L1103 878 L980 878 L947 845 L947 692Z"
        />
        <g className="code">
          <path d="M500 443 L455 486 L500 529" />
          <path d="M637 443 L682 486 L637 529" />
          <path d="M604 443 L571 577" />
        </g>
      </g>

      {/* M */}
      <path
        fill={`url(#${uid}gM)`}
        d="M302 493L302 497L400 497L394 493ZM706 493L699 497L797 497L797 493ZM456 493L456 502L458 504L507 540L509 540L509 522L475 496L474 495L476 493ZM623 493L625 495L624 496L589 522L589 540L592 540L640 504L643 501L643 493ZM542 493L521 556L538 556L559 493ZM304 527L304 557L406 557L384 530L379 527ZM720 527L716 529L693 557L795 557L794 527ZM743 565L738 570L738 576L743 581L750 581L755 575L755 571L750 565ZM350 565L345 569L344 574L346 579L351 582L354 582L361 576L361 570L356 565ZM698 498L558 664L566 664L699 505L705 499L709 498ZM393 498L535 665L542 665L400 498ZM549 661L549 663L535 666L538 669L536 672L536 682L541 689L546 691L552 691L558 688L563 681L563 674L561 670L565 665L551 663L551 661ZM738 587L640 701L743 701L743 588L741 587ZM357 588L356 701L459 701L361 588ZM358 558L362 560L368 568L369 575L366 581L367 585L489 727L549 727L407 558ZM692 558L550 727L610 727L733 584L734 582L731 577L731 568L736 561L742 558ZM750 558L755 560L760 565L761 577L756 585L749 588L748 751L795 751L795 630L797 628L797 622L795 621L795 558ZM699 702L699 751L743 751L743 702ZM699 752L699 764L795 764L795 752ZM699 765L699 771L770 771L761 770L763 767L762 766L774 765ZM795 765L795 770L793 771L795 771L797 770L797 765ZM699 772L699 773L795 773L795 772ZM699 774L699 775L759 775L759 774ZM760 774L760 775L795 775L795 774ZM699 777L699 781L754 781L758 777ZM742 782L747 783L749 783L745 782ZM403 702L472 784L531 784L460 702ZM490 728L534 779L536 782L533 784L562 784L571 771L609 728ZM639 702L565 788L624 788L697 702ZM473 785L475 788L564 788L565 787L562 785ZM476 789L548 874L551 874L623 789ZM668 781L556 912L564 912L662 795L670 793L670 781ZM437 795L535 912L543 912L444 795ZM546 911L544 912L555 912L552 911ZM536 913L538 916L536 920L536 928L542 936L547 938L553 938L559 935L563 929L564 922L561 915L563 913ZM759 777L748 785L749 999L797 999L795 777ZM699 782L699 999L743 999L743 784L738 782ZM304 558L304 1000L350 1000L349 589L340 583L337 576L340 564L348 558ZM356 702L355 1000L401 1000L401 702ZM430 781L430 1004L435 1004L435 795L443 794L432 781ZM665 794L665 1004L670 1004L670 794ZM699 1000L698 1004L797 1004L797 1000ZM304 1001L304 1004L401 1004L401 1001Z"
      />
      {/*
       * Bright 4px edge light along the OUTER stem edges only.
       *
       * The reference has NO highlight down the middle of each stem — there is
       * a DARK seam there (measured luminance ~30-43 at x=350..355 and
       * x=743..748). The former `M352 … / M746 …` entries painted a bright line
       * straight onto that seam and filled it, which was the dominant mismatch
       * across rows 600–900.
       */}
      <path className="hair" stroke={`url(#${uid}gW)`} d="M400 540 L400 996 M698 540 L698 996" />
      <path className="hair" stroke={`url(#${uid}gW)`} d="M420 646 L549 895 M678 646 L549 895" />
      <g className="trace">
        <path d="M326 560 L326 970" />
        <path d="M772 560 L772 766 L549 941" />
      </g>

      {/* O */}
      <path
        fill={`url(#${uid}gO)`}
        fillRule="evenodd"
        d="M922 527 L1214 527 L1262 575 L1262 960 L1214 1008 L922 1008 L874 960 L874 575Z M980 659 L1103 659 L1136 692 L1136 845 L1103 878 L980 878 L947 845 L947 692Z"
      />
      <path
        className="ring"
        d="M950 566 L1186 566 L1228 608 L1228 927 L1186 969 L950 969 L908 927 L908 608Z"
      />
      <path
        className="hair"
        stroke={`url(#${uid}gW)`}
        d="M977 601 L1159 601 L1195 637 L1195 898 L1159 934 L977 934 L941 898 L941 637Z"
      />

      {/* </> */}
      <g className="code">
        <path d="M500 443 L455 486 L500 529" />
        <path d="M637 443 L682 486 L637 529" />
        <path d="M604 443 L571 577" />
      </g>

      {/* circuit nodes */}
      <circle cx="287" cy="493" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="287" cy="493" r="7" fill="#A8FDF5" />
      <circle cx="811" cy="493" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="811" cy="493" r="7" fill="#A8FDF5" />
      <circle cx="287" cy="1000" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="287" cy="1000" r="7" fill="#A8FDF5" />
      <circle cx="794" cy="1000" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="794" cy="1000" r="7" fill="#A8FDF5" />
      <circle cx="326" cy="560" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="326" cy="560" r="7" fill="#A8FDF5" />
      <circle cx="772" cy="560" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="772" cy="560" r="7" fill="#A8FDF5" />
      <circle cx="549" cy="868" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="549" cy="868" r="7" fill="#A8FDF5" />
      <circle cx="749" cy="766" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="749" cy="766" r="7" fill="#A8FDF5" />
      <circle cx="1064" cy="590" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="1064" cy="590" r="7" fill="#A8FDF5" />
      <circle cx="1064" cy="930" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="1064" cy="930" r="7" fill="#A8FDF5" />
      <circle cx="860" cy="766" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="860" cy="766" r="7" fill="#A8FDF5" />
      <circle cx="1230" cy="766" r="11" fill="#0b1013" opacity="0.9" />
      <circle cx="1230" cy="766" r="7" fill="#A8FDF5" />

      {/* wordmark */}
      <text
        className="wm"
        x="1423"
        y="716"
        fontSize="191.6"
        fontWeight="500"
        letterSpacing="2.6"
        fill="#F2F4F5"
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
        fill="#F2F4F5"
      >
        OSTHEIMER
      </text>
      <text
        className="wm"
        x="1423"
        y="1018"
        fontSize="68.4"
        fontWeight="600"
        letterSpacing="-1.48"
        fill={`url(#${uid}gS)`}
      >{`// WEB & APPLICATION ARCHITECT`}</text>
    </svg>
  );
}
