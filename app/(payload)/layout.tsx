import '@payloadcms/next/css';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import configPromise from '@payload-config';
import React from 'react';
import { importMap } from './importMap.js';
import type { ServerFunctionClient } from 'payload';

const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
