import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Icon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  const IconComponent = icons[name] ?? LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
}
