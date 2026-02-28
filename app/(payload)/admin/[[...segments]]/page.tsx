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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page({ params, searchParams }: any) {
  return RootPage({ config: configPromise, params, searchParams, importMap });
}
