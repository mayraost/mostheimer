import { connection } from 'next/server';
import { FRONTEND_LOCALES, pathnameToSlug } from '@/cms/cache/frontend/routes';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import { getCachedPageBySlug, getCachedProjectBySlug } from '@/cms/cache/frontend/frontendCache';
import { derivePageDescription } from '@/cms/aeo/pageMetadata';
import { pageToMarkdown, projectToMarkdown } from '@/cms/aeo/markdown';
import { docsMarkdown, mcpMarkdown } from '@/cms/aeo/developerDocs';
import { toProjectView } from '@/components/projects/projectView';
import { markdownNotFound, markdownResponse } from '@/lib/agentNegotiation';

/**
 * Markdown representation of a public content URL.
 *
 * The Proxy rewrites `Accept: text/markdown` content requests here, so the
 * response keeps the original page URL for the client but is rendered from the
 * SAME `'use cache'` data layer as the HTML page. No second content model, no
 * scraping, no DB query beyond the existing cached reads.
 *
 * Why an API route: the representation is a byte response selected by an
 * `Accept` header, which a Server Component cannot express. The Proxy owns the
 * negotiation, this route owns the serialization.
 *
 * `path` is a pathname (not a full URL) and is validated against the locale
 * route model before any read. Unknown paths return a Markdown 404 with the
 * status still 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  // Aborts the build-time prerender: the route reads the CMS cache.
  await connection();

  const { slug: segments } = await params;
  const pathname = `/${(segments ?? []).join('/')}`;

  const locale = FRONTEND_LOCALES.find(
    (candidate) => pathname === `/${candidate}` || pathname.startsWith(`/${candidate}/`),
  ) as FrontendLocale | undefined;

  if (!locale) {
    return markdownResponse(markdownNotFound(pathname), 404);
  }

  const slug = pathnameToSlug(locale, pathname);
  if (slug === null) {
    return markdownResponse(markdownNotFound(pathname), 404);
  }

  // Static developer routes have their own Markdown source.
  if (slug === 'docs') return markdownResponse(docsMarkdown());
  if (slug === 'mcp') return markdownResponse(mcpMarkdown());

  // Project details: one child below the listing route.
  const [head, child, ...rest] = slug.split('/');
  if (head === 'projects' && child !== undefined && rest.length === 0) {
    const project = await getCachedProjectBySlug(child, locale);
    const view = project ? toProjectView(project, locale) : null;
    return view
      ? markdownResponse(projectToMarkdown(view, locale))
      : markdownResponse(markdownNotFound(pathname), 404);
  }
  if (head === 'projects' && rest.length > 0) {
    return markdownResponse(markdownNotFound(pathname), 404);
  }

  const pageSlug =
    slug === '' ? 'home' : slug === 'about' ? 'career' : slug === 'impressum' ? 'imprint' : slug;
  const page = await getCachedPageBySlug(pageSlug, locale);
  if (!page) {
    return markdownResponse(markdownNotFound(pathname), 404);
  }

  return markdownResponse(
    pageToMarkdown({
      page,
      locale,
      path: slug === 'about' ? `/${locale}/career` : pathname,
      description: derivePageDescription(page),
    }),
  );
}
