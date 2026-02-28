/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function RichTextBlock({ block }: { block: any }) {
  // In a real app we'd use @payloadcms/richtext-lexical parser to component
  // For simplicity we JSON stringify or assume simple text structure
  return (
    <section className="w-full py-16 max-w-3xl mx-auto my-10 prose prose-lg dark:prose-invert font-geist-mono">
      {/* Assuming we just render something basic for now, or if it is serialized HTML */}
      {block.content && typeof block.content === 'object' ? (
        <div dangerouslySetInnerHTML={{ __html: JSON.stringify(block.content, null, 2) }} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />
      )}
    </section>
  );
}
