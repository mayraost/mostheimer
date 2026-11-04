'use client';

import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Page } from '@/payload-types';
import { CardHeader, StatusDot } from '../ui/industrial';

type ArchitectureDiagramBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'architectureDiagram' }
>;
type ArchLayer = NonNullable<ArchitectureDiagramBlockData['layers']>[number];
type ArchPrinciple = NonNullable<ArchLayer['principles']>[number];

/**
 * Interaktives System-Architektur-Schaubild (Spec-Highlight).
 *
 * Edge → App/BFF → Core/CMS → Data/State als klickbare Layer-Stationen.
 * A11y-Vertrag:
 * - Layer-Knoten bilden eine echte `tablist` (aria-orientation="vertical"),
 *   jeder Knoten ist ein `tab` mit `aria-selected`/`aria-controls`.
 * - Pfeiltasten (↑/↓/←/→) bewegen den Fokus nach dem Roving-Tabindex-
 *   Muster; Home/End springen an die Enden; Enter/Space aktiviert.
 * - Das Detail-Panel ist ein `tabpanel` mit `aria-labelledby` auf den
 *   aktiven Tab und `tabIndex={0}` (scrollbar per Tastatur).
 * - Fluss-Pulse laufen ausschließlich über transform/opacity und werden
 *   unter prefers-reduced-motion sowie bei body.no-animations deaktiviert.
 */
export function ArchitectureDiagramBlock({ block }: { block: ArchitectureDiagramBlockData }) {
  const layers = block.layers ?? [];
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
    <section className="w-full py-16" aria-labelledby="architecture-diagram-heading">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 border-b border-border pb-6">
          <CardHeader label={block.sectionLabel || 'Architektur'} meta={`${count} layer`} />
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
          {/* ── Layer-Tabs (vertikale Pipeline) ───────────────────────── */}
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Architektur-Layer"
            className="flex flex-col gap-2"
          >
            {layers.map((layer, index) => {
              const selected = index === active;
              return (
                <div key={layer.id ?? layer.title} className="relative">
                  {index < count - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-full z-10 h-2 w-px -translate-x-1/2 overflow-hidden bg-border"
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

          {/* ── Detail-Panel ──────────────────────────────────────────── */}
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
