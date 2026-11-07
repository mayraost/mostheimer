import { headers } from 'next/headers';

/**
 * Pathname for SERVER components (the footer is one).
 *
 * `usePathname()` is a client hook, and making the footer a client component
 * would pull the whole footer + `ConsentSettingsLink` into the browser bundle
 * just for an active state. The Proxy already forwards the pathname as
 * `x-pathname` (same source the not-found boundaries use).
 *
 * Reads `headers()` → the caller renders per request. That is acceptable for
 * the footer (it lives inside the already streamed shell); do NOT use this in
 * a `'use cache'` scope.
 */
export async function getPathname(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get('x-pathname');
}
