import React from 'react';
import { icons } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Lucide-Icon-Lookup über den CMS-Select-Wert.
 *
 * Leerer/ungesetzter `iconName` → KEIN Icon (null). Die Blocks rendern
 * dann dekorativen Platzhalter statt eines irreführenden CircleHelp-
 * Fallbacks (Findings v2 #9: 6 Säulen / 5 Icons).
 */
export function Icon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;

  const IconComponent = (icons as Record<string, LucideIcon | undefined>)[name];
  if (!IconComponent) return null;

  return <IconComponent className={className} aria-hidden="true" />;
}
