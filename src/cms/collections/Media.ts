import type { CollectionConfig } from 'payload';
import { revalidateAllFrontendCmsCaches } from '../cache/frontend/frontendCache';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    // Bitmap formats only, no wildcard: SVG can carry script (stored XSS via
    // upload storage) and is deliberately excluded, as is anything non-image.
    // The size limit lives in src/payload.config.ts (upload.limits.fileSize).
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Media is referenced from blocks and globals (OG images), so the affected
    // cache target cannot be pinpointed — flush broadly.
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
