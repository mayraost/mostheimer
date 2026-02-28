/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { CallToActionBlock } from './blocks/CallToActionBlock';
import { FeatureGridBlock } from './blocks/FeatureGridBlock';
import { ImageTextBlock } from './blocks/ImageTextBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { Page } from '../payload-types';

export function BlockRenderer({ block }: { block: any }) {
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
    default:
      return (
        <div className="py-8 text-center text-red-500 border border-red-500 rounded my-4">
          Unsupported block type: {block.blockType}
        </div>
      );
  }
}

export { HeroBlock, CallToActionBlock, FeatureGridBlock, ImageTextBlock, RichTextBlock };
