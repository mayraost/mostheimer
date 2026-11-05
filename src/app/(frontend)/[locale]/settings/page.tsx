import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

// Required because `locale` is a root dynamic segment: without it the build's
// prerender attempt aborts. Locales are build-static, so no DB lookup is needed.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// 'shell' is the narrowest level that works here: it only requires the app
// shell of the default link prefetch to be static (partial prefetching is on).
// 'navigation' additionally demands a fully static route, which the dynamic
// [locale] shell (streamed, connection()-guarded) does not provide — the build
// fails with `static-route-dynamic`. Measured 05.11.2026; don't raise this
// without re-verifying the whole tree.
export const ensureStatic = 'shell';

export default function SettingsPage() {
  return <SettingsPageClient />;
}
