import type { Metadata } from 'next';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { PreviewLive } from '@/components/preview/PreviewLive';
import { loadPreviewCopy } from '@/lib/translationBundles.server';
import { normalizeSlug } from '@/cms/cache/frontend/utils';
import { PREVIEW_DEPTH } from '@/cms/preview/constants';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';

export const metadata: Metadata = {
  title: 'Live Preview – Mayra Ostheimer',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The preview MUST render per request: it is per-user, auth-gated draft data
 * and it is the only thing standing between "editor saves" and "editor sees".
 *
 * - `connection()` (below) aborts the build prerender and makes the route
 *   request-time only. `dynamic = 'force-dynamic'` no longer exists with
 *   `cacheComponents` (removed in v16) — `connection()` is its replacement.
 * - `Cache-Control: private, no-store` is enforced in `next.config.ts`
 *   (`/:locale(de|en)/:path(preview|settings)(.*)`), so the browser never
 *   reuses a previous preview document of this editor.
 * - There is intentionally no `'use cache'` / `cacheTag` / `cacheLife` in this
 *   route or its components: a cached preview entry would be shared by every
 *   visitor and would never be purged by a save.
 *
 * Responsibility split (server = gate + data, client = live merge):
 *
 * | Layer                                   | Where                                   |
 * | --------------------------------------- | --------------------------------------- |
 * | Auth gate (`payload.auth()` + cookie)   | here (server) — must never move to the client |
 * | Draft fetch (`draft: true`, depth)      | here (server) → `initialData`           |
 * | Rendering + live merge from the admin   | `PreviewLive` (`useLivePreview`, client) |
 *
 * The only data path into the browser is the `initialData` document passed to
 * `PreviewLive`; no Payload config, no session details, no secret.
 */

// depth must stay consistent with the public reads (mixing depths loses
// relationships) and is shared with the client hook — see
// src/cms/preview/constants.ts. Requires a root param at build time; locales
// are build-static. The prerender itself aborts at connection(), so only the
// static shell is produced.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

/**
 * Real server URL from request headers. Behind a proxy or tunnel the
 * postMessage origin must match the admin panel's actual origin, not
 * envConfig.serverUrl.
 */
async function getRequestServerURL(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = (headersList.get('x-forwarded-proto') ?? 'http').split(',')[0].trim();
  return `${proto}://${host}`;
}

/**
 * Notices of the preview shell (no access, draft fetch failed, unknown slug).
 *
 * All three are ADMIN-FACING diagnostics rendered inside the iframe, so unlike
 * the public site they are static operator copy, deliberately kept in code and
 * not in the editor-facing translations global (an editor must never be able
 * to blank out "no access"). They are typed as a union so a new state cannot
 * ship without copy.
 */
type PreviewNoticeState = 'unauthorized' | 'fetch-failed' | 'not-found';

const NOTICES: Record<PreviewNoticeState, { title: string; message: string }> = {
  unauthorized: {
    title: 'Kein Zugang',
    message: 'Live Preview erfordert eine Payload-Admin-Anmeldung (payload-token-Cookie).',
  },
  'fetch-failed': {
    title: 'Vorschau nicht verfuegbar',
    message: 'Der Draft-Fetch ist fehlgeschlagen — bitte Logs pruefen und erneut speichern.',
  },
  'not-found': {
    title: 'Keine Seite gefunden',
    message:
      'Keine Page mit diesem Slug in dieser Locale. Speichere zuerst oder nutze einen gueltigen Slug.',
  },
};

function PreviewNotice({ state, detail }: { state: PreviewNoticeState; detail?: string }) {
  const copy = NOTICES[state];
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full px-4">
      <h1 className="text-3xl font-averia font-bold text-primary mb-3">{copy.title}</h1>
      <p className="text-lg opacity-80 max-w-xl mx-auto font-geist-mono">
        {copy.message}
        {detail ? ` (${detail})` : ''}
      </p>
    </div>
  );
}

function getKey(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return undefined;
  return value;
}

type PreviewPageProps = {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Allows the blocking render that connection() requires without a route-level
// Suspense boundary.
export const instant = false;

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';

  const resolvedSearch = await searchParams;
  const slugParam = getKey(resolvedSearch.slug);
  const slug = slugParam ? normalizeSlug(slugParam) : 'home';

  // connection() must run BEFORE payload.auth, which reads Date.now() and
  // would otherwise be prerendered once and reused.
  await connection();

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({
    headers: await headers(),
  });

  if (!user) {
    return <PreviewNotice state="unauthorized" />;
  }

  let page = null;
  try {
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slug },
      },
      draft: true,
      depth: PREVIEW_DEPTH,
      limit: 1,
      locale,
      overrideAccess: false,
      user,
    });
    page = docs?.[0] ?? null;
  } catch (error) {
    console.warn(`[live-preview] Draft-Fetch fehlgeschlagen (slug: ${slug}).`, error);
    return <PreviewNotice state="fetch-failed" />;
  }

  if (!page) {
    return <PreviewNotice state="not-found" detail={`slug: ${slug}, locale: ${locale}`} />;
  }

  const serverURL = await getRequestServerURL();

  // Hero shell copy for the previewed blocks: same cached group reads the
  // public page uses (the client island cannot await them itself).
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', locale });
  const previewCopy = await loadPreviewCopy(locale, siteSettings.siteName ?? '');

  return (
    <>
      <div className="text-center mb-2 text-xs text-muted-foreground font-geist-mono">
        Live Preview – Draft {slug} ({locale})
      </div>
      {/* Client island: `useLivePreview` merges the admin's form values into
          `initialPage` (depth = PREVIEW_DEPTH, same as the fetch above). The
          server keeps the auth gate + draft fetch; nothing else crosses over. */}
      <PreviewLive
        initialPage={page}
        serverURL={serverURL}
        copy={previewCopy}
        variant={slug === 'home' ? 'home' : 'compact'}
      />
    </>
  );
}
