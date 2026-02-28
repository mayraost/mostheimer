import configPromise from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
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

export default async function Page({ params, searchParams }: Args) {
  return RootPage({ config: configPromise, params, searchParams, importMap });
}
