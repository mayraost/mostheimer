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
import { getCachedSiteSettings } from '@/cms/cache/frontend/queries';
import {
  loadArchitectureCopy,
  loadBentoCopy,
  loadCaseStudyCopy,
  loadCtaCopy,
  loadSkillsetCopy,
  loadHeroCopy,
  loadTechRadarCopy,
  loadTimelineCopy,
} from '@/lib/translationBundles.server';
import { getCachedTranslation } from '@/lib/translations.server';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import type { HeroCopy } from './blocks/HeroBlock';

export type PageBlock = NonNullable<Page['layout']>[number];

/**
 * Block dispatcher (server component).
 *
 * ASYNC on purpose: every block's shell copy (mono eyebrows, chips, count
 * labels) is CMS data, read here through the translations cache and passed
 * down. Two rules follow from that:
 *
 * 1. Blocks stay SYNCHRONOUS renderers — they receive `copy` as props. That
 *    keeps them usable from the live preview (`PreviewBlocks.tsx`), which is a
 *    client tree and cannot await the cache.
 * 2. Only the groups a block actually needs are read (group readers are cached
 *    per `(locale, group)`, so this is one entry per group, not one per block).
 *
 * If a block ever needs copy, add it to the matching `getCachedTranslationGroup`
 * call below — never as a literal in the component.
 */
export async function BlockRenderer({
  block,
  locale,
  heroCopy,
}: {
  block: PageBlock;
  locale: FrontendLocale;
  /** Hero shell copy, already resolved by the page (shared with the header). */
  heroCopy?: HeroCopy;
}) {
  switch (block.blockType) {
    case 'hero':
      // The page resolves the hero copy once and passes it in (it also feeds
      // the header). A standalone render falls back to its own cached read.
      return <HeroBlock block={block} copy={heroCopy ?? (await resolveHeroCopy(locale))} />;

    case 'bentoGrid':
      return <BentoGridBlock block={block} locale={locale} copy={await loadBentoCopy(locale)} />;

    case 'skillset':
      return <SkillsetBlock block={block} copy={await loadSkillsetCopy(locale)} />;

    case 'caseStudy':
      return <CaseStudyBlock block={block} copy={await loadCaseStudyCopy(locale)} />;

    case 'timeline':
      return <TimelineBlock block={block} copy={await loadTimelineCopy(locale)} />;

    case 'techRadar':
      return <TechRadarBlock block={block} copy={await loadTechRadarCopy(locale)} />;

    case 'callToAction':
      return <CallToActionBlock block={block} copy={await loadCtaCopy(locale)} />;

    case 'architectureDiagram':
      return <ArchitectureDiagramBlock block={block} copy={await loadArchitectureCopy(locale)} />;

    case 'statusBlock':
      return (
        <StatusBlock
          block={block}
          copy={{ gaugeLabel: await getCachedTranslation(locale, 'blocks.status.gaugeLabel') }}
        />
      );

    case 'imageText':
      return (
        <ImageTextBlock
          block={block}
          copy={{
            eyebrow: await getCachedTranslation(locale, 'blocks.imageText.eyebrow'),
            imagePlaceholder: await getCachedTranslation(
              locale,
              'blocks.imageText.imagePlaceholder',
            ),
          }}
        />
      );

    // Pure content blocks: everything they render is a CMS field of the block
    // itself, so no shell copy is involved.
    case 'featureGrid':
      return <FeatureGridBlock block={block} />;
    case 'richText':
      return <RichTextBlock block={block} />;
    case 'testimonial':
      return <TestimonialBlock block={block} />;

    default:
      return null;
  }
}

/**
 * Hero shell copy for pages that render a hero block directly (and the live
 * preview). Shared shape with the page route — see `HeroCopy`.
 */
export async function resolveHeroCopy(locale: FrontendLocale): Promise<HeroCopy> {
  const siteSettings = await getCachedSiteSettings(locale);
  return loadHeroCopy(locale, siteSettings.siteName ?? '');
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
