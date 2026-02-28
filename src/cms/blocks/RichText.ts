import type { Block } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const RichText: Block = {
  slug: 'richText',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
    },
  ],
};
