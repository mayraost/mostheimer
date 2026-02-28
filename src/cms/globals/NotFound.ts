import { GlobalConfig } from 'payload';

export const NotFound: GlobalConfig = {
  slug: 'not-found',
  access: {
    read: () => true,
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
