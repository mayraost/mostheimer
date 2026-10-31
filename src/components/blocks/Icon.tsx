import React from 'react';
import * as LucideIcons from 'lucide-react';
import { icons } from 'lucide-react';

export function Icon({
  name,
  className,
}: {
  name?: keyof typeof icons | null;
  className?: string;
}) {
  if (!name) {
    return;
  }
  const IconComponent = icons[name] ?? LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
}
