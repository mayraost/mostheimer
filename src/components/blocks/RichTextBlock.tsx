import React from 'react';
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react';
import type { Page } from '@/payload-types';

type RichTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'richText' }>;

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  return (
    <section className="w-full py-16 max-w-3xl mx-auto my-10">
      <LexicalRichText
        data={block.content}
        className="prose prose-lg dark:prose-invert font-geist-mono"
      />
    </section>
  );
}
