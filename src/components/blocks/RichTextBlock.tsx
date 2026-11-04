import React from 'react';
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react';
import type { Page } from '@/payload-types';

type RichTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'richText' }>;

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  return (
    <section className="w-full pt-6 pb-12 lg:py-12">
      <div className="mx-auto w-full max-w-3xl rounded-[6px] border border-border bg-surface p-5 lg:p-8">
        <LexicalRichText data={block.content} className="prose-industrial" />
      </div>
    </section>
  );
}
