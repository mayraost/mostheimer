import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

// Locales sind build-statisch (kein DB-Lookup noetig) — ohne diese
// generateStaticParams bricht der Build-Prerender-Versuch ab (Root-Param).
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

// Haertung (ensureStatic, docs .../route-segment-config/ensureStatic.md):
// 'shell' = App Shell des default-Link-Prefetchs muss statisch bleiben
// (Partial Prefetching ist aktiv). 'navigation' scheidet aus: das
// [locale]-Layout enthaelt den NotFoundGate als bewussten Blocking-Render
// (connection()/headers() Outside-Suspense, Pre-Flush-404) — vollstaetige
// statische Output-Validation schlaegt dort an (empirisch am Build
// verifiziert, Message static-route-dynamic). 'shell' ist der engste
// Level, der mit dem Gate und instant=false am Layout kompatibel bleibt
// (instant=false deaktiviert nur die Instant-Navigation-Validation).
export const ensureStatic = 'shell';

export default function SettingsPage() {
  return <SettingsPageClient />;
}
