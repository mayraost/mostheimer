'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Page } from '@/payload-types';
import { CardHeader, StatusDot } from '../ui/industrial';
import { motionEnabled } from '@/hooks/useScrollReveal';

type ArchitectureDiagramBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'architectureDiagram' }
>;
type ArchLayer = NonNullable<ArchitectureDiagramBlockData['layers']>[number];
type ArchPrinciple = NonNullable<ArchLayer['principles']>[number];

/**
 * Interactive system architecture diagram.
 *
 * Edge → App/BFF → Core/CMS → Data/State as clickable layer stations.
 * A11y contract:
 * - The layer nodes form a real `tablist` (aria-orientation="vertical"); each
 *   node is a `tab` with `aria-selected`/`aria-controls`.
 * - Arrow keys (↑/↓/←/→) move focus following the roving-tabindex pattern;
 *   Home/End jump to the ends; Enter/Space activates.
 * - The detail panel is a `tabpanel` labelled by the active tab and has
 *   `tabIndex={0}` so it can be scrolled by keyboard.
 * - Flow pulses animate transform/opacity only and stop under
 *   prefers-reduced-motion and body.no-animations.
 */
export function ArchitectureDiagramBlock({
  block,
  locale,
}: {
  block: ArchitectureDiagramBlockData;
  locale?: string;
}) {
  const layers = block.layers ?? [];
  const [active, setActive] = useState(0);
  /* Hover cross-highlighting (§3.2): which layer the pointer is over, or null.
     Non-participating layers dim to 0.45; the hovered one keeps full contrast. */
  const [hovered, setHovered] = useState<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistRef = useRef<HTMLDivElement | null>(null);

  /**
   * Scroll-linked pipeline (§2.4): the vertical connector between the layer
   * stations fills emerald→cyan as the section travels through the viewport,
   * and every layer whose marker the fill has passed switches its status dot
   * on. One CSS variable (`--pipeline-progress`) on the tablist; no state, no
   * re-render per frame.
   */
  useEffect(() => {
    const tablist = tablistRef.current;
    if (!tablist || !motionEnabled()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = tablist.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.35;
      const span = rect.height + (start - end);
      const raw = span > 0 ? (start - rect.top) / span : 1;
      tablist.style.setProperty('--pipeline-progress', String(Math.min(1, Math.max(0, raw))));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const count = layers.length;
  const activeLayer = layers[active];
  const panelId = 'architecture-detail-panel';
  const tabId = (index: number) => `architecture-layer-${index}-tab`;

  const focusTab = useCallback(
    (index: number) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      setActive(next);
      tabRefs.current[next]?.focus();
    },
    [count],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(count - 1);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        setActive(index);
        break;
      default:
        break;
    }
  };

  if (count === 0) return null;

  return (
    <section
      id="architektur-schaubild"
      className="w-full scroll-mt-24 pt-6 pb-16 lg:py-16"
      aria-labelledby="architecture-diagram-heading"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 border-b border-border pb-6">
          <CardHeader
            label={block.sectionLabel || (locale === 'de' ? 'Architektur' : 'Architecture')}
            meta={`${count} ${count === 1 ? 'layer' : 'layers'}`}
          />
          <h2
            id="architecture-diagram-heading"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl"
          >
            {block.heading}
          </h2>
          {block.description && (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {block.description}
            </p>
          )}
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ── Layer tabs (vertical pipeline) ────────────────────────── */}
          <div
            ref={tablistRef}
            role="tablist"
            aria-orientation="vertical"
            aria-label="Architektur-Layer"
            className="relative flex flex-col gap-2"
            onMouseLeave={() => setHovered(null)}
          >
            {/* Scroll-linked pipeline (§2.4): the spine between the stations,
                filled from layer 1 to layer N by scroll progress. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-8 top-4 bottom-4 w-px bg-border"
            >
              <span
                className="block w-px origin-top bg-gradient-to-b from-primary to-secondary"
                style={{
                  height: '100%',
                  transform: 'scaleY(var(--pipeline-progress, 0))',
                }}
              />
            </span>
            {layers.map((layer, index) => {
              const selected = index === active;
              const dimmed = hovered !== null && hovered !== index;
              return (
                <div
                  key={layer.id ?? layer.title}
                  className="relative transition-opacity duration-150"
                  style={{ opacity: dimmed ? 0.45 : 1 }}
                  onMouseEnter={() => setHovered(index)}
                >
                  {index < count - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-8 top-full z-10 h-2 w-px -translate-x-1/2 overflow-hidden bg-border"
                    >
                      <span
                        className={`block h-2 w-px ${
                          selected
                            ? 'bg-primary motion-safe:animate-[flow-pulse_1.8s_ease-in-out_infinite]'
                            : 'bg-transparent'
                        }`}
                      />
                    </span>
                  )}
                  <button
                    type="button"
                    role="tab"
                    id={tabId(index)}
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    onClick={() => setActive(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={[
                      'group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 rounded-[6px] border px-4 py-4 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary-muted shadow-[0_0_24px_-8px_rgba(16,185,129,0.6)]'
                        : 'border-border bg-surface hover:border-secondary/60',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'mono-label flex h-8 w-8 items-center justify-center rounded-full border',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border-strong text-muted-foreground',
                      ].join(' ')}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground">
                        {layer.title}
                        {selected && <StatusDot className="animate-status-pulse" />}
                      </span>
                      {layer.subtitle && (
                        <span className="mono-label mt-1 block text-muted-foreground">
                          {layer.subtitle}
                        </span>
                      )}
                    </span>

                    <span className="flex flex-col items-end gap-1 text-right">
                      {layer.metricValue && (
                        <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                          {layer.metricValue}
                        </span>
                      )}
                      {layer.metricLabel && (
                        <span className="mono-label text-[10px] text-muted-foreground">
                          {layer.metricLabel}
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Detail panel ──────────────────────────────────────────── */}
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId(active)}
            tabIndex={0}
            className="relative min-h-full overflow-hidden rounded-[6px] border border-border bg-surface focus-visible:border-primary"
          >
            <div className="dot-grid-dense absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative p-5 lg:p-6">
              {activeLayer && (
                <>
                  <p className="mono-label mb-3 flex items-center gap-2 text-primary">
                    <StatusDot />
                    layer {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </p>
                  <h3 className="font-heading text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                    {activeLayer.title}
                  </h3>
                  {activeLayer.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {activeLayer.summary}
                    </p>
                  )}

                  <ul className="mt-5 space-y-2">
                    {(activeLayer.principles ?? []).map((principle: ArchPrinciple) => (
                      <li
                        key={principle.id ?? principle.title}
                        className="rounded-[6px] border border-border bg-surface-raised/50 p-3"
                      >
                        <p className="mono-label mb-1 text-foreground">{principle.title}</p>
                        {principle.text && (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {principle.text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {activeLayer.stack && (
                    <p className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      <span className="mono-label text-muted-foreground">stack</span>
                      <span className="font-mono text-xs text-secondary">{activeLayer.stack}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
