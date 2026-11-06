import type { CommandItem } from '@/components/ui/CommandPalette';

/**
 * Command palette entries per locale.
 *
 * A static constant rather than CMS content on purpose: the palette mirrors the
 * site's information architecture, not editorial copy. Anchors (`#architektur`)
 * only exist on the home page, where they act as in-page jumps.
 */
const BASE_ITEMS: CommandItem[] = [
  {
    id: 'home',
    label: 'Home / Profil',
    href: '',
    group: 'pages',
    keywords: ['start', 'profil', 'about', 'über'],
  },
  {
    id: 'architektur',
    label: 'Architektur-Philosophie',
    href: '#architektur',
    group: 'sections',
    keywords: ['säulen', 'systemarchitektur', 'principles', 'architektur', 'philosophie'],
  },
  {
    id: 'schaubild',
    label: 'Interaktives Architektur-Schaubild',
    href: '#architektur-schaubild',
    group: 'sections',
    keywords: ['edge', 'bff', 'cms', 'data', 'diagramm', 'layer', 'schaubild'],
  },
  {
    id: 'case-studies',
    label: 'Case Studies',
    href: '/case-studies',
    group: 'pages',
    keywords: ['projekte', 'enterprise', 'impact', 'referenzen', 'schön klinik', 'hoerzu'],
  },
  {
    id: 'tech-radar',
    label: 'Tech-Radar',
    href: '/tech-radar',
    group: 'pages',
    keywords: ['skills', 'technologien', 'stack', 'capabilities', 'quadranten'],
  },
  {
    id: 'leadership',
    label: 'Leadership & Enablement',
    href: '/leadership',
    group: 'pages',
    keywords: ['führung', 'team', 'mentoring', 'enablement'],
  },
  {
    id: 'career',
    label: 'Werdegang',
    href: '/career',
    group: 'pages',
    keywords: ['lebenslauf', 'cv', 'stationen', 'referenzen', 'stimmen'],
  },
  {
    id: 'contact',
    label: 'Kontakt',
    href: '/contact',
    group: 'pages',
    keywords: ['email', 'mail', 'schreiben', 'anfrage', 'hire'],
  },
  {
    id: 'impressum',
    label: 'Impressum',
    href: '/impressum',
    group: 'pages',
    keywords: ['impressum', 'imprint', 'legal', 'rechtliches', 'anbieter', '§ 5 ddg'],
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    href: '/settings',
    group: 'pages',
    keywords: ['theme', 'dark', 'light', 'schriftgröße', 'animationen'],
  },
];

const EN_LABELS: Record<string, { label: string; keywords: string[]; group?: string }> = {
  home: { label: 'Home / Profile', keywords: ['start', 'about', 'profile'] },
  architektur: {
    label: 'Architecture philosophy',
    keywords: ['pillars', 'system architecture', 'principles', 'approach'],
  },
  schaubild: {
    label: 'Interactive architecture diagram',
    keywords: ['edge', 'bff', 'cms', 'data', 'layers', 'diagram'],
  },
  'case-studies': { label: 'Case Studies', keywords: ['projects', 'enterprise', 'impact'] },
  'tech-radar': { label: 'Tech Radar', keywords: ['skills', 'technologies', 'stack'] },
  leadership: { label: 'Leadership & Enablement', keywords: ['team', 'mentoring'] },
  career: { label: 'Career', keywords: ['cv', 'resume', 'stations', 'testimonials'] },
  contact: { label: 'Contact', keywords: ['email', 'mail', 'enquiry', 'hire'] },
  impressum: { label: 'Imprint', keywords: ['imprint', 'legal notice', 'provider', 'ddg'] },
  settings: { label: 'Settings', keywords: ['theme', 'dark', 'light', 'font size'] },
};

export function getCommandItems(locale: string): CommandItem[] {
  if (locale !== 'en') return BASE_ITEMS;

  return BASE_ITEMS.map((item) => {
    const override = EN_LABELS[item.id];
    return {
      ...item,
      label: override?.label ?? item.label,
      keywords: override?.keywords ?? item.keywords,
      group: item.group,
    };
  });
}
