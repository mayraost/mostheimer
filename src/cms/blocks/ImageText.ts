import type { Block } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const ImageText: Block = {
  slug: 'imageText',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'text',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
};
