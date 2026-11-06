'use client';

/**
 * Client variant of `BlockRenderer` for live preview.
 *
 * WHY A SEPARATE COMPONENT (and not `'use client'` on `components/blocks.tsx`):
 *
 * The block components are plain prop renderers — they take a block object and
 * return JSX. No `server-only`, no Payload server config, no Node APIs, no data
 * reads (verified per block: only `next/image`, `TypingHeading` and
 * `ArchitectureDiagramBlock` are reactive/client islands, the rest is pure
 * markup). They are therefore safe to render on the client.
 *
 * Marking the shared dispatcher `'use client'` would ALSO put it in the client
 * graph (client boundary) of the public pages: every `/de/<slug>` renders it
 * inside a Server Component, so Next would ship its module graph and hydration
 * boundary for no benefit. Keeping the public path a Server-Component tree and
 * giving the preview its own client entry keeps `/de` byte-identical
 * (measured: 12 chunks / 531.1 KB before and after).
 *
 * Typing: this is a type-level mirror of `BlockRenderer`, not a behavioural
 * copy — if a block type is added, the switch below must grow with it (the
 * `default` branch renders the same "Unsupported block type" marker).
 */
import React from 'react';
import type { Page } from '@/payload-types';
import { HeroBlock } from '@/components/blocks/HeroBlock';
import { CallToActionBlock } from '@/components/blocks/CallToActionBlock';
import { FeatureGridBlock } from '@/components/blocks/FeatureGridBlock';
import { ImageTextBlock } from '@/components/blocks/ImageTextBlock';
import { RichTextBlock } from '@/components/blocks/RichTextBlock';
import { BentoGridBlock } from '@/components/blocks/BentoGridBlock';
import { StatusBlock } from '@/components/blocks/StatusBlock';
import { TechSectionBlock } from '@/components/blocks/TechSectionBlock';
import { SkillsetBlock } from '@/components/blocks/SkillsetBlock';
import { CaseStudyBlock } from '@/components/blocks/CaseStudyBlock';
import { TimelineBlock } from '@/components/blocks/TimelineBlock';
import { TestimonialBlock } from '@/components/blocks/TestimonialBlock';
import { TechRadarBlock } from '@/components/blocks/TechRadarBlock';
import { ArchitectureDiagramBlock } from '@/components/blocks/ArchitectureDiagramBlock';

export type PreviewBlock = NonNullable<Page['layout']>[number];

export function PreviewBlockRenderer({ block, locale }: { block: PreviewBlock; locale?: string }) {
  switch (block.blockType) {
    case 'hero':
      // The preview mirrors the public route: full hero only on the homepage.
      return <HeroBlock block={block} variant={locale === 'home' ? 'home' : 'compact'} />;
    case 'callToAction':
      return <CallToActionBlock block={block} />;
    case 'featureGrid':
      return <FeatureGridBlock block={block} />;
    case 'imageText':
      return <ImageTextBlock block={block} />;
    case 'richText':
      return <RichTextBlock block={block} />;
    case 'bentoGrid':
      return <BentoGridBlock block={block} locale={locale} />;
    case 'statusBlock':
      return <StatusBlock block={block} />;
    case 'techSection':
      return <TechSectionBlock block={block} />;
    case 'skillset':
      return <SkillsetBlock block={block} />;
    case 'caseStudy':
      return <CaseStudyBlock block={block} locale={locale} />;
    case 'timeline':
      return <TimelineBlock block={block} locale={locale} />;
    case 'testimonial':
      return <TestimonialBlock block={block} />;
    case 'techRadar':
      return <TechRadarBlock block={block} locale={locale} />;
    case 'architectureDiagram':
      return <ArchitectureDiagramBlock block={block} locale={locale} />;
    default:
      return (
        <div className="mono-label my-4 rounded-[6px] border border-error/50 bg-surface px-4 py-8 text-center text-error">
          Unsupported block type
        </div>
      );
  }
}
