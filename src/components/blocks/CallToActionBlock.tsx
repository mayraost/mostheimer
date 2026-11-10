import React from 'react';
import type { Page } from '@/payload-types';
import { Eyebrow, StatusDot } from '../ui/industrial';
import { ctaArrowClass, ctaArrowHoverClass, ctaMotionClass } from '../ui/ActionLinkButton';
import { safeHrefOrNull } from '@/lib/safeHref';

type CallToActionBlockData = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'callToAction' }
>;

/**
 * Shell copy of the CTA card (`blocks.callToAction`): the eyebrow and the
 * response-time note. `style` selects which eyebrow applies — that mapping is
 * structural, the words come from the CMS.
 */
export type CtaCopy = {
  eyebrowPrimary: string;
  eyebrowSecondary: string;
  responseNote: string;
};

export function CallToActionBlock({
  block,
  copy,
}: {
  block: CallToActionBlockData;
  /** Shell copy (`blocks.callToAction`), read by the dispatcher. */
  copy: CtaCopy;
}) {
  const isPrimary = block.style !== 'secondary';
  const buttonHref = safeHrefOrNull(block.buttonLink);
  const eyebrow = isPrimary ? copy.eyebrowPrimary : copy.eyebrowSecondary;

  return (
    <section className="w-full pt-6 pb-14 lg:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <div
          className={[
            'relative overflow-hidden rounded-[8px] border p-8 lg:p-12',
            isPrimary
              ? 'border-primary/40 bg-surface shadow-[0_0_50px_-20px_rgba(16,185,129,0.6)]'
              : 'border-secondary/40 bg-surface shadow-[0_0_50px_-20px_rgba(6,182,212,0.55)]',
          ].join(' ')}
        >
          <div className="grid-matrix absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className={[
              'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
              isPrimary ? 'via-primary' : 'via-secondary',
            ].join(' ')}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground lg:text-4xl">
                {block.heading}
              </h2>
              {block.text && (
                <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {block.text}
                </p>
              )}
            </div>

            {block.buttonLabel && buttonHref && (
              <a
                href={buttonHref}
                className={[
                  'group mono-label inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[6px] px-5',
                  isPrimary
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground',
                  ctaMotionClass,
                ].join(' ')}
              >
                {block.buttonLabel}
                <span aria-hidden="true" className={`${ctaArrowClass} ${ctaArrowHoverClass}`}>
                  →
                </span>
              </a>
            )}
          </div>

          {copy.responseNote && (
            <p className="mono-label relative mt-8 flex items-center gap-2 border-t border-border pt-4 text-muted-foreground">
              <StatusDot tone={isPrimary ? 'primary' : 'secondary'} />
              {copy.responseNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
