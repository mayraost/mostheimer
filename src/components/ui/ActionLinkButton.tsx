import React from 'react';

/**
 * One presentational style shared by every small "action chip" in a content
 * card — the e-mail copy button, the phone `tel:` button and the outbound
 * profile buttons must look identical, so the Tailwind string lives here once.
 *
 * Spec:
 * - ≥ 44 px tall (`min-h-11`) → touch-target rule on mobile;
 * - `whitespace-nowrap` + `shrink-0` icons → labels never wrap mid-word;
 * - fixed border + transparent→surface colours only, so hover/focus never
 *   change the box (no CLS), and the focus ring is drawn as an outline;
 * - `mono-label` (uppercase mono) is the house style for chips.
 */
export const actionButtonClass =
  'mono-label inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border border-border bg-surface-raised px-3 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/**
 * Anchor variant of {@link actionButtonClass} for real navigations (`tel:`,
 * external profiles). `rel`/`target` are set by the caller so the security
 * attributes stay visible at the call site.
 */
export function ActionLinkButton({
  href,
  children,
  icon,
  className = '',
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'>) {
  return (
    <a href={href} className={[actionButtonClass, className].join(' ')} {...rest}>
      {icon}
      {children}
    </a>
  );
}
