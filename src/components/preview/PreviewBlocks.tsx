'use client';

/**
 * Client variant of `BlockRenderer` for live preview.
 *
 * WHY A SEPARATE COMPONENT (and not `'use client'` on `components/blocks.tsx`):
 *
 * The block components are plain prop renderers — they take a block object plus
 * a resolved `copy` object and return JSX. No `server-only`, no Payload server
 * config, no Node APIs, no data reads (verified per block: only `next/image`,
 * `TypingHeading` and `ArchitectureDiagramBlock` are reactive/client islands,
 * the rest is pure markup). They are therefore safe to render on the client.
 *
 * Marking the shared dispatcher `'use client'` would ALSO put it in the client
 * graph (client boundary) of the public pages: every `/de/<slug>` renders it
 * inside a Server Component, so Next would ship its module graph and hydration
 * boundary for no benefit. Keeping the public path a Server-Component tree and
 * giving the preview its own client entry keeps `/de` byte-identical.
 *
 * COPY: the cache cannot be awaited here, so `PreviewCopy` arrives as a prop
 * resolved by `preview/page.tsx` from the same cached translation groups the
 * public route uses. That keeps preview and published page visually identical
 * and avoids a second copy table.
 *
 * Typing: this is a type-level mirror of `BlockRenderer`, not a behavioural
 * copy — if a block type is added, the switch below must grow with it.
 */
import React from 'react';
import type { Page } from '@/payload-types';
import { HeroBlock } from '@/components/blocks/HeroBlock';
import type { HeroCopy } from '@/components/blocks/HeroBlock';
import { CallToActionBlock } from '@/components/blocks/CallToActionBlock';
import type { CtaCopy } from '@/components/blocks/CallToActionBlock';
import { FeatureGridBlock } from '@/components/blocks/FeatureGridBlock';
import { ImageTextBlock } from '@/components/blocks/ImageTextBlock';
import { RichTextBlock } from '@/components/blocks/RichTextBlock';
import { BentoGridBlock } from '@/components/blocks/BentoGridBlock';
import type { BentoCopy } from '@/components/blocks/BentoGridBlock';
import { StatusBlock } from '@/components/blocks/StatusBlock';
import { TechSectionBlock } from '@/components/blocks/TechSectionBlock';
import { SkillsetBlock } from '@/components/blocks/SkillsetBlock';
import type { SkillsetCopy } from '@/components/blocks/SkillsetBlock';
import { CaseStudyBlock } from '@/components/blocks/CaseStudyBlock';
import type { CaseStudyCopy } from '@/components/blocks/CaseStudyBlock';
import { TimelineBlock } from '@/components/blocks/TimelineBlock';
import type { TimelineCopy } from '@/components/blocks/TimelineBlock';
import { TestimonialBlock } from '@/components/blocks/TestimonialBlock';
import { TechRadarBlock } from '@/components/blocks/TechRadarBlock';
import type { TechRadarCopy } from '@/components/blocks/TechRadarBlock';
import { ArchitectureDiagramBlock } from '@/components/blocks/ArchitectureDiagramBlock';
import type { ArchitectureCopy } from '@/components/blocks/ArchitectureDiagramBlock';
import { ProjectShowcaseBlock } from '@/components/blocks/ProjectShowcaseBlock';
import type {
  ProjectShowcaseCopy,
  ProjectShowcaseView,
} from '@/components/blocks/ProjectShowcaseBlock';
import type { ProjectDetailCopy } from '@/components/projects/ProjectDetail';
import { PROJECT_SHOWCASE_SLUG } from '@/cms/cache/frontend/routes';

export type PreviewBlock = NonNullable<Page['layout']>[number];

/** Every block copy group the dispatcher below can need. */
export type PreviewCopy = {
  hero: HeroCopy;
  bento: BentoCopy;
  skillset: SkillsetCopy;
  caseStudy: CaseStudyCopy;
  timeline: TimelineCopy;
  techRadar: TechRadarCopy;
  callToAction: CtaCopy;
  architecture: ArchitectureCopy;
  status: { gaugeLabel: string };
  imageText: { eyebrow: string; imagePlaceholder: string };
  projectShowcase: ProjectShowcaseCopy;
  projectDetail: ProjectDetailCopy;
};

export function PreviewBlockRenderer({
  block,
  locale,
  copy,
  projectListing,
}: {
  block: PreviewBlock;
  locale?: string;
  /** Resolved shell copy (`PreviewCopy`), from the server page. */
  copy: PreviewCopy;
  /**
   * Listing data for the `projectShowcase` block.
   *
   * The preview renders the FIRST page, unfiltered and without the pagination
   * chrome: `?page=`/`?tag=` are URL state of the published listing, the admin
   * iframe has its own query string (`?slug=`), and a preview must never show a
   * different slice than the editor's draft page. Without data the block
   * renders nothing at all (never an invented page).
   */
  projectListing?: ProjectShowcaseView;
}) {
  switch (block.blockType) {
    case 'hero':
      // The preview mirrors the public route: full hero only on the homepage.
      return (
        <HeroBlock
          block={block}
          variant={locale === 'home' ? 'home' : 'compact'}
          copy={copy.hero}
        />
      );
    case 'callToAction':
      return <CallToActionBlock block={block} copy={copy.callToAction} />;
    case 'featureGrid':
      return <FeatureGridBlock block={block} />;
    case 'imageText':
      return <ImageTextBlock block={block} copy={copy.imageText} />;
    case 'richText':
      return <RichTextBlock block={block} />;
    case 'bentoGrid':
      return <BentoGridBlock block={block} locale={locale} copy={copy.bento} />;
    case 'statusBlock':
      return <StatusBlock block={block} copy={copy.status} />;
    case 'techSection':
      return <TechSectionBlock block={block} />;
    case 'skillset':
      return <SkillsetBlock block={block} copy={copy.skillset} />;
    case 'caseStudy':
      return <CaseStudyBlock block={block} copy={copy.caseStudy} />;
    case 'timeline':
      return <TimelineBlock block={block} copy={copy.timeline} />;
    case 'testimonial':
      return <TestimonialBlock block={block} />;
    case 'techRadar':
      return <TechRadarBlock block={block} copy={copy.techRadar} />;
    case 'architectureDiagram':
      return <ArchitectureDiagramBlock block={block} copy={copy.architecture} />;
    case 'projectShowcase':
      // First page, no filter, no pagination (see the `projectListing` prop).
      return projectListing ? (
        <ProjectShowcaseBlock
          block={block}
          view={projectListing}
          basePath={`/${locale === 'de' ? 'de' : 'en'}/${PROJECT_SHOWCASE_SLUG}`}
          copy={copy.projectShowcase}
        />
      ) : null;
    default:
      return null;
  }
}
