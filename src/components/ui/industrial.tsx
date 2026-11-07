import React from 'react';

/**
 * Shared vocabulary of the dark-industrial design system (bento grid with 8px
 * gaps, hairline borders, emerald/cyan accents, mono labels). Purely
 * presentational — no state, server-renderable.
 */

/** Bento tile: the 8px gaps are part of the design language. */
export function BentoTile({
  children,
  className = '',
  as: Tag = 'div',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li' | 'figure' | 'header';
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={[
        'relative flex flex-col overflow-hidden rounded-[6px] border border-border bg-surface',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Status dot: small filled emerald circles next to labels. */
export function StatusDot({
  tone = 'primary',
  className = '',
}: {
  tone?: 'primary' | 'secondary' | 'warning' | 'error' | 'muted';
  className?: string;
}) {
  const toneClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    warning: 'bg-warning',
    error: 'bg-error',
    muted: 'bg-muted-foreground',
  }[tone];
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${toneClass} ${className}`}
    />
  );
}

/**
 * Chip/badge variants:
 * - `fill` = emerald filled pill with dark mono-uppercase text
 * - `outline` = hairline border, mono-uppercase, full-contrast text
 * - `cyan` = cyan pill (secondary emphasis)
 */
export function Chip({
  children,
  variant = 'outline',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'fill' | 'outline' | 'cyan' | 'solid';
  className?: string;
}) {
  const variants: Record<NonNullable<Parameters<typeof Chip>[0]['variant']>, string> = {
    fill: 'border border-primary bg-primary text-primary-foreground',
    outline: 'border border-border-strong bg-transparent text-foreground',
    cyan: 'border border-secondary bg-secondary text-secondary-foreground',
    solid: 'border border-primary/40 bg-primary-muted text-primary',
  };
  return (
    <span
      className={[
        'mono-label inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

/** Section rule with a short emerald→cyan underline. */
export function RuleAccent({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px w-full bg-border ${className}`}>
      <span className="absolute -top-px left-0 h-px w-14 bg-gradient-to-r from-primary to-secondary" />
    </div>
  );
}

/** Section eyebrow: emerald dot plus mono label. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono-label flex items-center gap-2 text-primary">
      <StatusDot />
      {children}
    </p>
  );
}

/** Corner crosshair ticks (optional industrial detail on cards). */
export function CornerTicks({ className = 'text-border-strong' }: { className?: string }) {
  // `border-current`: the caller tints the whole set via a text-* class; the
  // default keeps the neutral hairline the other cards expect.
  const tick = 'absolute h-2 w-2 border-current';
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${tick} left-0 top-0 border-l border-t`} />
      <span className={`${tick} right-0 top-0 border-r border-t`} />
      <span className={`${tick} bottom-0 left-0 border-b border-l`} />
      <span className={`${tick} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}

/**
 * Button classes: primary = solid accent with near-black text, outline =
 * transparent with hairline border, subtle = dark fill with emerald text.
 */
export function buttonClass(
  variant: 'primary' | 'secondary' | 'outline' | 'subtle' = 'primary',
  extra = '',
): string {
  const base =
    'mono-label inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-5 transition-colors';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
    outline: 'border border-border-strong bg-transparent text-foreground hover:border-primary',
    subtle: 'border border-border bg-surface-raised text-primary hover:border-primary',
  } as const;
  return [base, variants[variant], extra].filter(Boolean).join(' ');
}

/**
 * Gauge motif: circular progress ring in emerald→cyan with a mono percentage in
 * the middle. `value` is 0–100.
 */
export function GaugeRing({
  value,
  label,
  size = 88,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const ring = `conic-gradient(from -90deg, var(--color-primary) ${clamped}%, var(--color-secondary) ${clamped}%, color-mix(in srgb, var(--color-foreground) 10%, transparent) ${clamped}%)`;

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size, background: ring }}
      role="img"
      aria-label={label ? `${label}: ${clamped}%` : `${clamped}%`}
    >
      <div className="absolute inset-[3px] flex flex-col items-center justify-center rounded-full bg-surface">
        <span className="font-mono text-base font-semibold tabular-nums leading-none text-foreground">
          {clamped}
          <span className="text-[0.6em] text-muted-foreground">%</span>
        </span>
        {label && <span className="mono-label mt-1 text-[9px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

/** Deterministic gauge value from a string (purely decorative, static). */
export function stableGaugeValue(seed: string, min = 62, max = 96): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return min + (hash % (max - min + 1));
}

/**
 * Card header row: mono eyebrow plus optional meta text.
 *
 * `label` is optional on purpose: a card that has nothing meaningful to say in
 * its eyebrow (legal section, plain content card) renders no row at all instead
 * of falling back to a template placeholder. `meta` is purely additive and
 * never defaults to a product word — callers pass real context (period, count,
 * index).
 *
 * The rendered text is uppercased here, so CMS labels keep their normal casing
 * (`Anbieterkennzeichnung`, `Engineering Leadership 01`) in the admin while the
 * UI still reads as a mono eyebrow — no editor has to type in caps.
 */
export function CardHeader({
  label,
  meta,
  tone = 'primary',
}: {
  label?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: 'primary' | 'secondary' | 'muted';
}) {
  if (!label && !meta) return null;

  const toneClass = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
  }[tone];
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      {label ? (
        <span className={`mono-label flex items-center gap-2 uppercase ${toneClass}`}>
          {tone !== 'muted' && <StatusDot tone={tone === 'primary' ? 'primary' : 'secondary'} />}
          {label}
        </span>
      ) : (
        <span />
      )}
      {meta && <span className="mono-label text-muted-foreground">{meta}</span>}
    </div>
  );
}

/** Paragraphs from a `\n\n`-separated CMS textarea. */
export function splitParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
