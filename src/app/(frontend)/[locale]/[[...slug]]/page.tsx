import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
import { envConfig } from '@/envConfig';
import { getCachedPageBySlug, getCachedSiteSettings } from '@/cms/cache/frontend/frontendCache';
import { JsonLdScript, buildProfilePageJsonLd, buildSiteJsonLd } from '@/components/StructuredData';
import { ogImageUrl } from '@/components/og/ogCard';

/**
 * Über-Mich-artige Slugs → ProfilePage-JSON-LD (AEO-Layer, Research
 * aeo-discovery-layer: ProfilePage deckt die „About Me"-Page ab; die
 * Homepage selbst ist WebSite-Kandidat). Nicht-Profil-Seiten bekommen
 * bewusst kein Structured Data (kein erfundenes @type).
 */
const PROFILE_PAGE_SLUGS = new Set(['about', 'about-me', 'ueber-mich', 'ueber']);

// Locales sind build-statisch (kein DB-Lookup noetig) — ohne diese
// generateStaticParams bricht der Build-Prerender-Versuch ab (Root-Param).
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// Skill-Profil „Build ohne DB": Blockanteil des Route-Renders bewusst
// erlaubt (siehe page.tsx-Kommentar) — verhindert Dev-Nagging
// (connection() ohne Route-eigenes Suspense-Boundary).
export const instant = false;

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
  // ProfilePage mit mainEntity. Lässt sich rein serverseitig aus den
  // 'use cache'-Queries lösen (kein zusätzlicher Client-JS-Weight).
  let jsonLd: Record<string, unknown> | null = null;
  if (slug === 'home') {
    const siteSettings = await getCachedSiteSettings(locale);
    jsonLd = buildSiteJsonLd({
      locale,
      siteName: siteSettings.siteName || 'Mostheimer',
      description: siteSettings.siteDescription,
    });
  } else if (PROFILE_PAGE_SLUGS.has(slug)) {
    jsonLd = buildProfilePageJsonLd({
      locale,
      path: `${locale === 'de' ? '/de' : '/en'}/${slug}`,
      dateModified: page.updatedAt ?? null,
    });
  }

  // Semantic-<h1>-Garantie (Findings v2 B5): case-studies / tech-radar /
  // career hatten keinen h1, weil keiner ihrer Blocks einen emittiert.
  // Der Page-Title wird AUSSCHLIESSLICH dann als h1 gerendert, wenn kein
  // Hero-Block vorhanden ist (Hero emittiert bereits seinen eigenen h1 —
  // kein Duplikat, "one h1 per page" bleibt gewahrt).
  const layout = page.layout ?? [];
  const hasHeroBlock = layout.some((block) => block.blockType === 'hero');

  return (
    <>
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
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

export async function generateMetadata({ params }: PageProps<'/[locale]/[[...slug]]'>) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as FrontendLocale) || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPageBySlug(slug, locale);

  if (!page) return { title: 'Mostheimer 404' };

  const baseUrl = envConfig.serverUrl;
  const slugPath = slug === 'home' ? '' : `/${slug}`;

  return {
    title: `${page.title} - Mostheimer`,
    // AEO-Layer OG/Twitter-Parity (Research P2): per-Page-Karte via
    // /og-Route (opengraph-image-Dateikonvention ist im [[...slug]]-
    // Catch-All nicht möglich — siehe src/app/og/route.tsx).
    openGraph: {
      title: page.title,
      type: 'website',
      siteName: 'Mostheimer',
      url: `${baseUrl}/${locale}${slugPath}`,
      images: [ogImageUrl(page.title, locale)],
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `${baseUrl}/${locale}${slugPath}`,
      languages: {
        en: `${baseUrl}/en${slugPath}`,
        de: `${baseUrl}/de${slugPath}`,
      },
      // x-default bewusst HELD BACK (unverified-marker im Research: der
      // Key-Passthrough ist in der Next-16.4-Doku nicht dokumentiert).
      // Wird erst ergänzt, nachdem nach Deploy Rich Results Test +
      // URL-Inspection den Passthrough verifiziert haben.
    },
  };
}
