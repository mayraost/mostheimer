'use client';

/**
 * Live-preview bridge: the Payload admin emits postMessage save events →
 * router.refresh() → RSC re-render of the /preview route with fresh draft data.
 *
 * serverURL MUST match the admin panel's actual request origin (postMessage
 * origin check), which is why the /preview page derives it from request headers
 * instead of config — needed behind the Cloudflare tunnel.
 */
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';

export function LivePreviewRefresher({ serverURL }: { serverURL: string }) {
  const router = useRouter();

  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={serverURL} />;
}
