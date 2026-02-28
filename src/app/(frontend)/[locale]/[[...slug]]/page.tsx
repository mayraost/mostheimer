/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { BlockRenderer } from '@/components/blocks';

async function queryPageBySlug(slug: string, locale: 'en' | 'de') {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as 'en' | 'de') || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await queryPageBySlug(slug, locale);

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as 'en' | 'de') || 'en';
  const slug = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await queryPageBySlug(slug, locale);

  if (!page) return { title: 'Mostheimer 404' };

  // Generate alternate URLs mapping properly for the root ('home') avoiding duplication and regular slugs
  const slugPath = slug === 'home' ? '' : `/${slug}`;

  return {
    title: `${page.title} - Mostheimer`,
    alternates: {
      canonical: `/${locale}${slugPath}`,
      languages: {
        en: `/en${slugPath}`,
        de: `/de${slugPath}`,
      },
    },
  };
}
