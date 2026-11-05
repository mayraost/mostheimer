import type { Metadata } from 'next';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { BlockRenderer } from '@/components/blocks';
import { LivePreviewRefresher } from '@/components/preview/LivePreviewRefresher';
import { normalizeSlug } from '@/cms/cache/frontend/utils';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';

export const metadata: Metadata = {
  title: 'Live Preview – Mostheimer',
  robots: {
    index: false,
    follow: false,
  },
};

// depth must stay consistent with the public reads (mixing depths loses
// relationships). Renders server-side only, no client state.
// Requires a root param at build time; locales are build-static. The prerender
// itself aborts at connection(), so only the static shell is produced.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

const PREVIEW_DEPTH = 2;

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

async function PreviewNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full px-4">
      <h1 className="text-3xl font-averia font-bold text-primary mb-3">{title}</h1>
      <p className="text-lg opacity-80 max-w-xl mx-auto font-geist-mono">{message}</p>
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
    return (
      <PreviewNotice
        title="Kein Zugang"
        message="Live Preview erfordert eine Payload-Admin-Anmeldung (payload-token-Cookie)."
      />
    );
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
    return (
      <PreviewNotice
        title="Vorschau nicht verfuegbar"
        message="Der Draft-Fetch ist fehlgeschlagen — bitte Logs pruefen und erneut speichern."
      />
    );
  }

  if (!page) {
    return (
      <PreviewNotice
        title="Keine Seite gefunden"
        message={`Keine Page mit Slug "${slug}" (Locale: ${locale}). Speichere zuerst oder nutze einen gueltigen Slug.`}
      />
    );
  }

  const serverURL = await getRequestServerURL();

  return (
    <>
      <LivePreviewRefresher serverURL={serverURL} />
      <div className="text-center mb-2 text-xs text-muted-foreground font-geist-mono">
        Live Preview – Draft {slug} ({locale})
      </div>
      <article className="max-w-6xl mx-auto w-full">
        {page.layout?.map((block, index: number) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </article>
    </>
  );
}
