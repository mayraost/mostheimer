import type { Metadata } from 'next';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Page as CmsPage } from '@/payload-types';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
import { envConfig } from '@/envConfig';
import { getCachedPageBySlug, getCachedSiteSettings } from '@/cms/cache/frontend/frontendCache';
import {
  JsonLdScript,
  buildCareerJsonLd,
  buildCaseStudiesJsonLd,
  buildProfilePageJsonLd,
  buildSiteJsonLd,
  buildWebPageJsonLd,
} from '@/components/StructuredData';
import type { JsonLdObject } from '@/components/StructuredData';
import { derivePageDescription } from '@/cms/aeo/pageMetadata';
import { ogImageUrl } from '@/components/og/ogCard';

/**
 * Über-Mich-artige Slugs → ProfilePage-JSON-LD (AEO-Layer, Research
 * aeo-discovery-layer: ProfilePage deckt die „About Me"-Page ab; die
 * Homepage selbst ist WebSite-Kandidat).
 *
 * Weitere Content-Slugs bekommen ihren Knoten in `buildPageJsonLd`:
 * Career → ProfilePage mit `hasOccupation` aus der Timeline,
 * Case-Studies → WebPage + ItemList aus den Case-Study-Blöcken,
 * Tech-Radar/Leadership/Contact → schlanke WebPage (Contact zusätzlich
 * mit den Person-Kontaktfakten).
 *
 * Unbekannte Slugs bekommen keinen erfundenen `@type` — nur einen
 * neutralen WebPage-Knoten über `buildWebPageJsonLd`.
 */
const PROFILE_PAGE_SLUGS = new Set(['about', 'about-me', 'ueber-mich', 'ueber']);

/** Kanonischer Pfad einer Seite (mit Locale-Präfix). */
function pagePath(locale: FrontendLocale, slug: string): string {
  return slug === 'home' ? `/${locale}` : `/${locale}/${slug}`;
}

// Locales sind build-statisch (kein DB-Lookup noetig) — ohne diese
// generateStaticParams bricht der Build-Prerender-Versuch ab (Root-Param).
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// Skill-Profil „Build ohne DB": Blockanteil des Route-Renders bewusst
// erlaubt (siehe page.tsx-Kommentar) — verhindert Dev-Nagging
// (connection() ohne Route-eigenes Suspense-Boundary).
export const instant = false;

/**
 * Page-Level-JSON-LD, rein serverseitig aus den bereits gecachten
 * Page-Daten (kein zusätzlicher DB-Read, kein Client-JS).
 */
function buildPageJsonLd(
  slug: string,
  locale: FrontendLocale,
  page: CmsPage,
  description: string | null,
  siteName: string,
): JsonLdObject {
  const path = pagePath(locale, slug);

  if (slug === 'home') {
    return buildSiteJsonLd({ locale, siteName, description });
  }

  if (PROFILE_PAGE_SLUGS.has(slug)) {
    return buildProfilePageJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
    });
  }

  if (slug === 'career') {
    return buildCareerJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
      layout: page.layout ?? [],
    });
  }

  if (slug === 'case-studies') {
    return buildCaseStudiesJsonLd({
      locale,
      path,
      name: page.title,
      description,
      dateModified: page.updatedAt ?? null,
      layout: page.layout ?? [],
    });
  }

  return buildWebPageJsonLd({
    locale,
    path,
    name: page.title,
    description,
    dateModified: page.updatedAt ?? null,
    includeContact: slug === 'contact',
  });
}

export default async function Page({ params }: PageProps<'/[locale]/[[...slug]]'>) {
  // connection() stoppt den Build-Prerender-Versuch (Coolify-Docker-Build
  // ohne DB): kein HTML-Prerender ohne DB-Zugriff → Runtime-Rendering mit
  // 'use cache'-Datenlayer + Hook-Invalidierung. instant=false erlaubt den
  // Blocking-Render (Skill-Profil „Build ohne DB"), sonst meckert Next
  // ueber connection() ohne eigenes Suspense-Boundary auf Route-Ebene.
  await connection();

  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) {
    return notFound();
  }

  // JSON-LD (AEO-Layer): Homepage → WebSite + Person; Profil-Slugs →
  // ProfilePage; career/case-studies/tech-radar/leadership/contact →
  // passende WebPage-Varianten. SiteSettings-Read ist gecacht und läuft
  // ohnehin im Layout (gleicher Cache-Entry).
  const siteSettings = await getCachedSiteSettings(locale);
  const jsonLd = buildPageJsonLd(
    slug,
    locale,
    page,
    derivePageDescription(page),
    siteSettings.siteName || 'Mostheimer',
  );

  // Semantic-<h1>-Garantie (Findings v2 B5): case-studies / tech-radar /
  // career hatten keinen h1, weil keiner ihrer Blocks einen emittiert.
  // Der Page-Title wird AUSSCHLIESSLICH dann als h1 gerendert, wenn kein
  // Hero-Block vorhanden ist (Hero emittiert bereits seinen eigenen h1 —
  // kein Duplikat, "one h1 per page" bleibt gewahrt).
  const layout = page.layout ?? [];
  const hasHeroBlock = layout.some((block) => block.blockType === 'hero');

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <article className="mx-auto w-full max-w-6xl">
        {!hasHeroBlock && (
          <header className="mb-8 border-b border-border pb-6 pt-6 lg:pt-10">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
              {page.title}
            </h1>
          </header>
        )}
        {layout.map((block, index: number) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </article>
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[[...slug]]'>): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) return { title: 'Mostheimer 404' };

  const baseUrl = envConfig.serverUrl;
  const canonical = `${baseUrl}${pagePath(locale, slug)}`;
  // Per-Page-Description aus dem CMS-Inhalt; Fallback = Layout-Default
  // (kein eigenes description-Feld am Node, damit Next den Layout-Wert
  // erbt statt ein leeres Tag zu rendern).
  const description = derivePageDescription(page);

  return {
    // `absolute`: der Layout-Titel trägt die Brand ohne Template — ohne
    // absolute würde Next das `%s`-Template (falls später ergänzt) doppelt
    // anwenden. Der Brand-Suffix bleibt pro Seite einheitlich.
    title: { absolute: `${page.title} - Mostheimer` },
    ...(description ? { description } : {}),
    // AEO-Layer OG/Twitter-Parity (Research P2): per-Page-Karte via
    // /og-Route (opengraph-image-Dateikonvention ist im [[...slug]]-
    // Catch-All nicht möglich — siehe src/app/og/route.tsx).
    openGraph: {
      title: page.title,
      type: 'website',
      siteName: 'Mostheimer',
      url: canonical,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      ...(description ? { description } : {}),
      images: [ogImageUrl(page.title, locale)],
    },
    twitter: {
      card: 'summary_large_image',
      ...(description ? { description } : {}),
    },
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en${slug === 'home' ? '' : `/${slug}`}`,
        de: `${baseUrl}/de${slug === 'home' ? '' : `/${slug}`}`,
        // x-default → deutsche Fassung (Primäraudienz ist de; die
        // Startseite unterscheidet sich sprachlich, die übrigen Seiten
        // haben identische Slugs).
        'x-default': `${baseUrl}/de${slug === 'home' ? '' : `/${slug}`}`,
      },
    },
  };
}
