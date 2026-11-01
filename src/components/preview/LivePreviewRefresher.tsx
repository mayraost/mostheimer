'use client';

/**
 * Live-Preview-Bridge (Variante B des nextjs-payload-caching-Skills):
 * Payload-Admin emittiert postMessage-Save-Events → router.refresh() →
 * RSC-Re-Render der /preview-Route mit frischen Draft-Daten.
 *
 * serverURL MUSS dem tatsaechlichen Request-Origin des Admin-Panels
 * entsprechen (postMessage-Origin-Check) — wird spaeder vom /preview-Page
 * aus Request-Headers abgeleitet (Cloudflare-Tunnel-Gotcha des Skills).
 */
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';

export function LivePreviewRefresher({ serverURL }: { serverURL: string }) {
  const router = useRouter();

  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={serverURL} />;
}
