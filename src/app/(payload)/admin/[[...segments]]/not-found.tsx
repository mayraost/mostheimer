import configPromise from '@payload-config';
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '../../importMap.js';

import type { Metadata } from 'next';

type Args = {
  params: Promise<{
    [key: string]: string | string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config: configPromise, params, searchParams });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function NotFound({ params, searchParams }: any) {
  return NotFoundPage({ config: configPromise, params, searchParams, importMap });
}
