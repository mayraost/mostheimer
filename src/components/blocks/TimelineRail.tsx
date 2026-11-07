'use client';

/**
 * Career timeline rails (spec §2.5).
 *
 * Client island for the timeline `<ol>`: it attaches the scroll observer to the
 * server-rendered list and renders the two decorative overlays (base rail and
 * the emerald→cyan progress beam) itself, so the station markup stays a pure
 * Server Component.
 *
 * The beam grows via `transform: scaleY()` on a gradient strip — never `height`
 * — so scrolling the timeline costs no layout. Structure is identical on the
 * server and the client (only a CSS variable changes), so there is no
 * hydration mismatch.
 */
import React from 'react';
import { useTimelineProgress } from '@/hooks/useTimelineProgress';

export function TimelineRail({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useTimelineProgress<HTMLOListElement>();

  return (
    <ol ref={ref} className={['relative', className].filter(Boolean).join(' ')}>
      {/* Base rail */}
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-2 bottom-2 w-px bg-border md:left-[147px]"
      />

      {/* Progress beam: scaleY from the top, gradient emerald → cyan. */}
      <span
        aria-hidden="true"
        data-rail-beam
        className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-primary to-secondary"
        style={{ transform: 'scaleY(var(--rail-progress, 0))' }}
      />

      {children}
    </ol>
  );
}
