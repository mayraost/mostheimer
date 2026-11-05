import { headers } from 'next/headers';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { NotFound } from '@/payload-types';

/**
 * 404 boundary at route-group level, ABOVE the [locale] layout.
 *
 * When the NotFoundGate in [locale]/layout.tsx calls notFound() for an unknown
 * slug, this boundary catches it and renders inside Next's error document shell
 * (__next_error__) — by then the [locale] layout has already been discarded.
 * That shell has no <link rel="stylesheet">, so this component deliberately uses
 * inline styles (not Tailwind) and falls back to the configured CMS texts when
 * the data cannot be read.
 *
 * Complements [locale]/not-found.tsx, which still handles in-tree notFound()
 * from page components inside the full styled app layout.
 */

const FALLBACK_DE: Pick<NotFound, 'title' | 'message' | 'buttonLabel' | 'buttonLink'> = {
  title: 'Nicht gefunden',
  message: 'Die gesuchte Seite existiert nicht.',
  buttonLabel: 'Zur Startseite',
  buttonLink: '/de',
};

const FALLBACK_EN: Pick<NotFound, 'title' | 'message' | 'buttonLabel' | 'buttonLink'> = {
  title: 'Page not found',
  message: 'The page you are looking for does not exist.',
  buttonLabel: 'Go home',
  buttonLink: '/en',
};

export default async function GroupNotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname');
  const acceptLanguage = headersList.get('accept-language');

  const locale: FrontendLocale =
    pathname?.startsWith('/de/') || pathname === '/de'
      ? 'de'
      : acceptLanguage?.startsWith('de')
        ? 'de'
        : 'en';

  let data = locale === 'de' ? FALLBACK_DE : FALLBACK_EN;
  try {
    const fromCms = await getCachedNotFound(locale);
    if (fromCms) {
      data = {
        title: fromCms.title,
        message: fromCms.message,
        buttonLabel: fromCms.buttonLabel || data.buttonLabel,
        buttonLink: fromCms.buttonLink || data.buttonLink,
      };
    }
  } catch {
    // Build/error context without a DB-backed cache: the fallback texts suffice.
  }

  return (
    <div
      data-nf=""
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        padding: '0 1rem',
        background: '#FFFFFF',
        color: '#1A1A1A',
      }}
    >
      <style>
        {'@media (prefers-color-scheme: dark){div[data-nf]{background:#121212;color:#EDEDED}}'}
      </style>
      <h1
        style={{
          fontSize: 'clamp(2.25rem, 5vw, 3rem)',
          fontWeight: 700,
          marginTop: 0,
          marginBottom: '1rem',
          color: '#C2185B',
        }}
      >
        {data.title}
      </h1>
      <p style={{ fontSize: '1.125rem', opacity: 0.8, maxWidth: '36rem', marginBottom: '2rem' }}>
        {data.message}
      </p>
      <a
        href={data.buttonLink || `/${locale}`}
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: '#C2185B',
          color: '#FFFFFF',
          border: '2px solid #C2185B',
          borderRadius: '9999px',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        {data.buttonLabel}
      </a>
    </div>
  );
}
