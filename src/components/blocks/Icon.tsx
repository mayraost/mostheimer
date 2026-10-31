import React from 'react';
import * as LucideIcons from 'lucide-react';
import { icons } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const IconComponent: LucideIcon | undefined = name
    ? ((icons as Record<string, LucideIcon | undefined>)[name] ?? LucideIcons.CircleHelp)
    : LucideIcons.CircleHelp;
  return <IconComponent className={className} />;
}
