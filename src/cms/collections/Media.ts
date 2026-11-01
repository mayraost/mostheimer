import type { CollectionConfig } from 'payload';
import { revalidateAllFrontendCmsCaches } from '../cache/frontend/frontendCache';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Media wird in Blocks/Globals (OG-Image) referenziert — hier ist der
    // Ziel-Cache nicht punktgenau ableitbar, deshalb breiter Flush.
    afterChange: [() => revalidateAllFrontendCmsCaches()],
    afterDelete: [() => revalidateAllFrontendCmsCaches()],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
};
