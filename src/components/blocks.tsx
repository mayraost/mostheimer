import React from 'react';
import type { Page } from '../payload-types';
import { HeroBlock } from './blocks/HeroBlock';
import { CallToActionBlock } from './blocks/CallToActionBlock';
import { FeatureGridBlock } from './blocks/FeatureGridBlock';
import { ImageTextBlock } from './blocks/ImageTextBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { BentoGridBlock } from './blocks/BentoGridBlock';
import { StatusBlock } from './blocks/StatusBlock';
import { TechSectionBlock } from './blocks/TechSectionBlock';
import { SkillsetBlock } from './blocks/SkillsetBlock';
import { CaseStudyBlock } from './blocks/CaseStudyBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { TestimonialBlock } from './blocks/TestimonialBlock';
import { TechRadarBlock } from './blocks/TechRadarBlock';
import { ArchitectureDiagramBlock } from './blocks/ArchitectureDiagramBlock';

export type PageBlock = NonNullable<Page['layout']>[number];

export function BlockRenderer({ block, locale }: { block: PageBlock; locale?: string }) {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlock block={block} />;
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

export {
  HeroBlock,
  CallToActionBlock,
  FeatureGridBlock,
  ImageTextBlock,
  RichTextBlock,
  BentoGridBlock,
  StatusBlock,
  TechSectionBlock,
  SkillsetBlock,
  CaseStudyBlock,
  TimelineBlock,
  TestimonialBlock,
  TechRadarBlock,
  ArchitectureDiagramBlock,
};
