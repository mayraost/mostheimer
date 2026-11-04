import React from 'react';

/**
 * Icons als statisches Inline-SVG (Server Component, kein Client-JS).
 *
 * Warum nicht `import { icons } from 'lucide-react'`: diese Map zieht ALLE
 * ~1600 Lucide-Icons in den Bundle und war der größte Einzelposten im
 * JS-Payload der Home (Perf-Fix 04.11.2026). Stattdessen ein bewusst
 * kleiner, expliziter Pfad-Katalog: der CMS-Select-Wert (PascalCase,
 * tolerant gegen kebab/lower-case) wird nachgeschlagen und als `<svg>`
 * gerendert. Unbekannte oder leere Werte rendern NICHTS — kein
 * irreführender Fragezeichen-Fallback (Findings v2 #9, 6 Säulen / 5 Icons).
 */

/**
 * Statischer Import-Katalog der im CMS waehlbaren Icons. Bewusst klein und
 * explizit: ein Select-Wert ausserhalb dieser Liste rendert keinen Icon
 * (statt die ganze Library zu importieren).
 */
export const ICON_CATALOG = {
  Globe:
    'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10',
  Cloud: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9',
  Layers:
    'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z',
  Hammer:
    'm15 12-8.373 8.373a1 1 0 1 1-3-3L12 9M18 15l4-4M21.5 11.5 20 13M3 21l4-4M17 3l4 4M14 6l7-7',
  ShieldCheck:
    'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4',
  Accessibility: 'M16 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2M8 8v7M16 8v7M12 8v13M12 12l-3-3M12 12l3-3',
  Database:
    'M12 3c-4.97 0-9 1.34-9 3s4.03 3 9 3 9-1.34 9-3-4.03-3-9-3M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6',
  Server:
    'M6 3h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1M6 15h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1M6 7h.01M6 19h.01',
  Zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8',
  Code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  Terminal: 'm4 17 6-6-6-6M12 19h8',
  Rocket:
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  Lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1M8 11V7a4 4 0 1 1 8 0v4',
  Gauge: 'm12 14 4-4M3.34 19a10 10 0 1 1 17.32 0',
  Network:
    'M9 2h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1M2 16h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1M16 16h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8',
  Box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Zm-9-6v20M3.3 7 12 12l8.7-5',
  Workflow: 'M3 3h6v6H3zM15 15h6v6h-6zM9 6h11M6 9v11',
  Cpu: 'M9 9h6v6H9zM4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3',
  GitBranch:
    'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 9a9 9 0 0 1-9 9',
} as const;

export type IconName = keyof typeof ICON_CATALOG;

function resolve(name?: string | null): string | null {
  if (!name) return null;
  const direct = ICON_CATALOG[name as IconName];
  if (direct) return direct;
  // CMS-Select-Werte sind Lucide-PascalCase; toleriere kebab/lower-case.
  const pascal = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
  return ICON_CATALOG[pascal as IconName] ?? null;
}

export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const d = resolve(name);
  if (!d) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

/** Fuer den CMS-Select: verfuegbare Icon-Werte (kein Client-Bundle-Ballast). */
export const ICON_NAMES: IconName[] = Object.keys(ICON_CATALOG) as IconName[];

export function isKnownIcon(name?: string | null): boolean {
  return resolve(name) !== null;
}
