import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/components/blocks';
import { envConfig } from '@/envConfig';
import { getCachedPageBySlug } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';

export default async function Page({ params }: PageProps<'/[locale]/[[...slug]]'>) {
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
