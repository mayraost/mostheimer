import type { GlobalConfig } from 'payload';
import { revalidateNotFoundCache } from '../cache/frontend/frontendCache';

export const NotFound: GlobalConfig = {
  slug: 'not-found',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidateNotFoundCache()],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: '/',
    },
  ],
};
