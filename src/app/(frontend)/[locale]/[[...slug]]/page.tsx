import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { BlockRenderer } from '@/components/blocks';
import { envConfig } from '@/envConfig';
import { getCachedPageBySlug } from '@/cms/cache/frontend/frontendCache';

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

  return (
    <article className="max-w-6xl mx-auto w-full">
      {page.layout?.map((block, index: number) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </article>
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
    alternates: {
      canonical: `${baseUrl}/${locale}${slugPath}`,
      languages: {
        en: `${baseUrl}/en${slugPath}`,
        de: `${baseUrl}/de${slugPath}`,
      },
    },
  };
}
