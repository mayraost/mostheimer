import type { CollectionConfig } from 'payload';
import { revalidateAllFrontendCmsCaches } from '../cache/frontend/frontendCache';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    // Hart Beschraenkt auf Bitmap-Bildformate: SVG (aus der vorherigen
    // wildcard 'image/*'-Freigabe) kann skriptinhalt tragen (XSS via
    // Upload-Storage) und bleibt daher bewusst ausgeschlossen; alles
    // non-image ebenso. Größenlimit global in src/payload.config.ts
    // (upload.limits.fileSize — busboy, verifiziert in node_modules).
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
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
