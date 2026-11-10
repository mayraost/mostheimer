/**
 * Shared presentation for 404 and error screens: same card, same mono label,
 * same buttons (server component — `global-error.tsx` deliberately does NOT use
 * this, see src/app/global-error.tsx).
 *
 * Styling: Tailwind classes + design tokens from globals.css only.
 */

import { safeHrefOrNull } from '@/lib/safeHref';

export function StatusScreen({
  code,
  tone = 'error',
  title,
  message,
  primary,
  secondary,
  retry,
}: {
  /** Mono label row, e.g. "HTTP 404 · Not Found" / "HTTP 500 · Error". */
  code: string;
  tone?: 'error' | 'warning';
  title: string;
  message: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** React node for an error boundary's "retry" action (omitted on 404s). */
  retry?: React.ReactNode;
}) {
  const accent = tone === 'warning' ? 'text-warning' : 'text-error';
  // The href comes from the CMS `not-found` global; an unsafe value must never
  // become a clickable link, so the button degrades to a non-interactive span.
  const primaryHref = safeHrefOrNull(primary.href);
  const secondaryHref = secondary ? safeHrefOrNull(secondary.href) : null;
  const dot = tone === 'warning' ? 'bg-warning' : 'bg-error';

  return (
    <div className="dot-grid flex min-h-[50vh] w-full flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-lg rounded-[8px] border border-border bg-surface p-8">
        <p className={`mono-label mb-4 ${accent}`}>
          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${dot}`} />
          {code}
        </p>
        <h1 className="mb-3 font-heading text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mb-8 text-base text-muted-foreground">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryHref ? (
            <a
              href={primaryHref}
              className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {primary.label}
            </a>
          ) : (
            <span className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] bg-primary px-6 text-primary-foreground">
              {primary.label}
            </span>
          )}
          {secondary && secondaryHref ? (
            <a
              href={secondaryHref}
              className="mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] border border-border-strong bg-surface-raised px-6 text-foreground transition-colors hover:border-primary"
            >
              {secondary.label}
            </a>
          ) : null}
          {retry}
        </div>
      </div>
    </div>
  );
}
