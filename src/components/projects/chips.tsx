import React from 'react';

/**
 * Pure presentation helpers shared by the projects LISTING block and the
 * detail route.
 *
 * They live in their own module because both surfaces render the same chrome
 * (tag chip, stack chip, external-link affordance) and a second copy is exactly
 * how the two drift apart. No React state, no client hooks — both callers are
 * Server Components.
 */

/** External link labels for the detail page (`routes.project.*`). */
export type ProjectExternalCopy = { live: string; github: string; newTabHint: string };

/**
 * Small "open in a new tab" link for `liveUrl` / `githubUrl`.
 *
 * The visible text is the CMS label; the "opens in a new tab" hint is `sr-only`
 * INSIDE the link, so a screen reader announces the behaviour as part of the
 * link and no visible copy is repeated. `rel="noopener noreferrer"` keeps the
 * external page out of `window.opener`.
 *
 * Returns `null` for an absent URL: halloween-counter has a private repo, so
 * `githubUrl` is legitimately empty there and an empty pill must never render.
 */
export function ProjectExternalLink({
  href,
  label,
  newTabHint,
  tone = 'primary',
}: {
  href: string | null | undefined;
  label: string;
  newTabHint: string;
  tone?: 'primary' | 'secondary';
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'mono-label inline-flex min-h-11 items-center gap-2 rounded-[6px] border px-4 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        tone === 'primary'
          ? 'border-primary/40 bg-primary-muted text-primary hover:border-primary'
          : 'border-border-strong bg-transparent text-foreground hover:border-secondary hover:text-secondary',
      ].join(' ')}
    >
      {label}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> {newTabHint}</span>
    </a>
  );
}

/**
 * One display value, never a bare token: a stack chip (`Next.js 16`) or a tag
 * chip (`Developer tooling`). Rendered as a `<span>`, so it can sit inside a
 * link without nesting interactive elements.
 */
export function ProjectChip({
  children,
  variant = 'outline',
}: {
  children: React.ReactNode;
  variant?: 'outline' | 'solid';
}) {
  return (
    <span
      className={[
        'mono-label inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1',
        variant === 'solid'
          ? 'border-primary/40 bg-primary-muted text-primary'
          : 'border-border-strong bg-transparent text-foreground',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
