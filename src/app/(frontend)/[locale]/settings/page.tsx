import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

// Locales sind build-statisch (kein DB-Lookup noetig) — ohne diese
// generateStaticParams bricht der Build-Prerender-Versuch ab (Root-Param).
export function generateStaticParams() {
  return ['en', 'de'].map((locale) => ({ locale }));
}

export default function SettingsPage() {
  return <SettingsPageClient />;
}
