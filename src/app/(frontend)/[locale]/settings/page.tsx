import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

// Required because `locale` is a root dynamic segment: without it the build's
// prerender attempt aborts. Locales are build-static, so no DB lookup is needed.
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// 'shell' is the narrowest level that works here: it only requires the app
// shell of the default link prefetch to be static (partial prefetching is on).
// 'navigation' rejects this tree because the [locale] layout's NotFoundGate is
// a deliberate blocking render — full static output validation fails with
// `static-route-dynamic`. Don't raise this without restructuring that gate.
export const ensureStatic = 'shell';

export default function SettingsPage() {
  return <SettingsPageClient />;
}
