import { headers } from 'next/headers';
import { getCachedNotFound } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { NotFound } from '@/payload-types';

/**
 * 404-Boundary auf Route-Group-Level, ÜBER dem [locale]-Layout.
 *
 * Wirft das NotFoundGate im [locale]-Layout ([locale]/layout.tsx) einen
 * unbekannten Slug via notFound(), faengt diese Boundary das Error und
 * rendert im Error-Document-Shell von Next (__next_error__) — das
 * [locale]-Layout ist zu dem Zeitpunkt bereits verworfen. In dem Shell
 * gibt es kein <link rel="stylesheet">, daher arbeitet diese Komponente
 * bewusst mit Inline-Styles (kein Tailwind) und liefert die konfigurierten
 * NotFound-Texte aus dem CMS (Fallback bei Datenfehler).
 *
 * Ergänzt die [locale]/not-found.tsx — diese bleibt fuer in-tree
 * notFound() der Page-Komponenten zustaendig (rendert innerhalb des
 * vollstaendigen App-Layouts mit Styles).
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
    // Error-/Build-Kontext ohne DB-Cache: Fallback-Texte reichen.
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
