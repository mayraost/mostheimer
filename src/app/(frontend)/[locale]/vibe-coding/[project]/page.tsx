import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { envConfig } from '@/envConfig';
import { ogImageUrl } from '@/components/og/ogCard';
import { JsonLdScript, buildVibeProjectJsonLd } from '@/components/StructuredData';
import { VibeProjectDetail } from '@/components/vibe/VibeProjectDetail';
import { toProjectView } from '@/components/vibe/projectView';
import type { VibeProjectView } from '@/components/vibe/projectView';
import {
  getCachedPageBySlug,
  getCachedSiteSettings,
  getCachedVibeProjectBySlug,
} from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { VIBE_SHOWCASE_SLUG } from '@/cms/cache/frontend/routes';
import { loadVibeDetailCopy } from '@/lib/translationBundles.server';

/**
 * Vibe-coding project detail (`/[locale]/vibe-coding/<project>`, design § 5).
 *
 * A static literal segment beside `[[...slug]]` is legal (only `[locale]` is
 * dynamic) and wins over the catch-all, so a project URL never reaches the page
 * resolver.
 *
 * Routing contract:
 * - The Proxy decides the HTTP status (`publishedVibeProjectStatus`) — the page
 *   still calls `notFound()` so the segment's own `not-found.tsx` renders the
 *   localized body (`AGENTS.md` § 404-Handling: a streamed shell freezes the
 *   status at 200).
 * - `generateStaticParams` returns locales ONLY: the build container has no DB,
 *   every project page renders at runtime through the 'use cache' layer.
 * - `instant = false` allows the blocking `connection()` render.
 */

const LOCALES: readonly FrontendLocale[] = ['en', 'de'];

function toLocale(value: string | undefined): FrontendLocale {
  return value === 'de' ? 'de' : 'en';
}

/** Requires a root param at build time; locales are build-static. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Allows the blocking render: connection() runs without a route-level Suspense
// boundary.
export const instant = false;

/** Reads the published project through the cached layer and maps it. */
async function resolveProject(
  params: Promise<{ locale?: string; project?: string }>,
): Promise<{ locale: FrontendLocale; project: VibeProjectView | null }> {
  const resolved = await params;
  const locale = toLocale(resolved.locale);
  const slug = resolved.project ?? '';
  if (!slug) return { locale, project: null };
  const doc = await getCachedVibeProjectBySlug(slug, locale);
  return { locale, project: doc ? toProjectView(doc, locale) : null };
}

/**
 * Metadata resolves BEFORE the stream flushes (htmlLimitedBots disables
 * streaming metadata), so a missing project throws a real 404 here — the same
 * mechanism the page route uses.
 *
 * DB-less build guard: metadata runs before `connection()`, so the CMS reads are
 * skipped during the prerender attempt and only the seed values are used.
 */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/vibe-coding/[project]'>): Promise<Metadata> {
  const { locale, project } = await resolveProject(params);
  if (!project) notFound();

  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { title: project.title };
  }

  const [siteSettings, listingPage] = await Promise.all([
    getCachedSiteSettings(locale),
    getCachedPageBySlug(VIBE_SHOWCASE_SLUG, locale),
  ]);
  const siteName = siteSettings.siteName ?? '';
  const baseUrl = envConfig.serverUrl;
  const canonical = baseUrl + project.path;
  const description = project.teaser;
  const listingName = listingPage?.title ?? '';
  const ogTitle = [project.title, listingName].filter(Boolean).join(' · ');

  return {
    // `absolute`: the detail title is already specific, no brand suffix needed
    // on top of the section name.
    title: siteName ? { absolute: `${ogTitle} - ${siteName}` } : ogTitle,
    ...(description ? { description } : {}),
    openGraph: {
      title: ogTitle,
      type: 'article',
      siteName,
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      ...(description ? { description } : {}),
      images: [ogImageUrl(project.title, locale, listingName || siteName)],
    },
    twitter: { card: 'summary_large_image', ...(description ? { description } : {}) },
    // Both locales are the same document; x-default → German (primary audience).
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en/${VIBE_SHOWCASE_SLUG}/${project.slug}`,
        de: `${baseUrl}/de/${VIBE_SHOWCASE_SLUG}/${project.slug}`,
        'x-default': `${baseUrl}/de/${VIBE_SHOWCASE_SLUG}/${project.slug}`,
      },
    },
    // A project page is always indexable: it is a full document, never a facet.
    robots: { index: true, follow: true },
  };
}

export default async function VibeProjectPage({
  params,
}: PageProps<'/[locale]/vibe-coding/[project]'>) {
  // Aborts the build-time prerender attempt (no DB in the build container).
  await connection();

  const { locale, project } = await resolveProject(params);
  // Reached when metadata was skipped (cached RSC request): the Proxy already
  // set the 404 status, this only renders the localized body.
  if (!project) notFound();

  const [copy, listingPage] = await Promise.all([
    loadVibeDetailCopy(locale),
    getCachedPageBySlug(VIBE_SHOWCASE_SLUG, locale),
  ]);

  const jsonLd = buildVibeProjectJsonLd({
    locale,
    project,
    listingName: listingPage?.title ?? '',
  });

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <VibeProjectDetail project={project} copy={copy} />
    </>
  );
}
