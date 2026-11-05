import type { Metadata } from 'next';
import { envConfig } from '@/envConfig';

/**
 * Base metadata for every `[locale]` segment. Lives apart from `layout.tsx` so
 * the wording guardrail test can import it without pulling in the document
 * shell (next/font instances are not constructible outside the Next build).
 *
 * Positioning is **Senior** and the visible entity is the person — see
 * `src/cms/aeo/constraints.ts`.
 */
export const layoutMetadata: Metadata = {
  title: 'Mayra Ostheimer — Web & Application Architect',
  description:
    'Mayra Ostheimer — Web & Application Architect und Senior-Level FullStack Engineer. Composable Architekturen, Next.js/Payload, Team- & Projektleitung für produktionsreife Systeme.',
  metadataBase: new URL(envConfig.serverUrl),
  // Base OG/Twitter defaults for every segment; per-page cards come from the
  // /og route.
  openGraph: { siteName: 'Mayra Ostheimer', type: 'website' },
  twitter: { card: 'summary_large_image' },
};
