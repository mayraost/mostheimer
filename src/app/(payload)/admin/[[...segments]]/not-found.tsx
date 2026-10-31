import configPromise from '@payload-config';
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '../../importMap.js';

import type { Metadata } from 'next';

type PageProps = {
  readonly params: Promise<{
    segments: string[];
  }>;
  readonly searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: PageProps): Promise<Metadata> =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default async function NotFound({ params, searchParams }: PageProps) {
  return NotFoundPage({ config: configPromise, params, searchParams, importMap });
}
