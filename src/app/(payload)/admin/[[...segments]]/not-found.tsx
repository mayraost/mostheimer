import configPromise from '@payload-config';
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '../../importMap.js';

import type { Metadata } from 'next';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default async function NotFound({ params, searchParams }: Args) {
  return NotFoundPage({ config: configPromise, params, searchParams, importMap });
}
