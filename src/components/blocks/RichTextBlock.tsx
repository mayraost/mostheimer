import React from 'react';
import type { Page } from '@/payload-types';

type RichTextBlockData = Extract<NonNullable<Page['layout']>[number], { blockType: 'richText' }>;

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  // In a real app we'd use @payloadcms/richtext-lexical parser to component
  // For simplicity we JSON stringify the Lexical content structure
  return (
    <section className="w-full py-16 max-w-3xl mx-auto my-10 prose prose-lg dark:prose-invert font-geist-mono">
      <div dangerouslySetInnerHTML={{ __html: JSON.stringify(block.content, null, 2) }} />
    </section>
  );
}
