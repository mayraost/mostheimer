import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowUpRight, ExternalLink, Mail, Phone } from 'lucide-react';
import { mockTranslations } from '@/stories/mockTranslations';
import { getLegacyCopy } from '@/lib/translations';
import {
  ActionLinkButton,
  actionButtonClass,
  ctaArrowClass,
  ctaArrowDiagonalHoverClass,
  ctaArrowHoverClass,
  ctaMotionClass,
} from './ActionLinkButton';

/**
 * Ein präsentationaler Chip und die Klassen-Konstanten, aus denen er besteht.
 *
 * Die Story zeigt beides getrennt, weil die Konstanten auch außerhalb der
 * Komponente verwendet werden (Hero-/CTA-Buttons mit `group`-Hover-Pfeil).
 */

const ICON = 'h-3.5 w-3.5 shrink-0';

const meta = {
  title: 'UI/ActionLinkButton',
  component: ActionLinkButton,
  tags: ['autodocs'],
  parameters: {
    appShell: { maxWidth: '4xl' },
    docs: {
      description: {
        component:
          'Aktions-Chip für echte Navigationen (`mailto:`, `tel:`, externe Profile). `actionButtonClass` hält alle Chips identisch: ≥ 44 px Höhe, `whitespace-nowrap`, Fokus als Outline — Hover und Fokus ändern nur Farben, nie die Box (kein CLS). `rel`/`target` setzt bewusst der Aufrufer, damit die Security-Attribute an der Aufrufstelle sichtbar bleiben.',
      },
    },
  },
} satisfies Meta<typeof ActionLinkButton>;

export default meta;

export const Default: StoryObj<{ href: string; label: string; showIcon: boolean }> = {
  args: { href: 'mailto:mail@example.com', label: 'mail@example.com', showIcon: true },
  argTypes: {
    href: { control: 'text' },
    label: { control: 'text' },
    showIcon: { control: 'boolean' },
  },
  render: ({ href, label, showIcon }) => (
    <ActionLinkButton
      href={href}
      icon={showIcon ? <Mail className={ICON} aria-hidden="true" /> : undefined}
    >
      {label}
    </ActionLinkButton>
  ),
};

export const Variants: StoryObj = {
  name: 'Varianten — mailto / tel / extern',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ActionLinkButton
        href="mailto:mail@example.com"
        icon={<Mail className={ICON} aria-hidden="true" />}
      >
        mail@example.com
      </ActionLinkButton>
      <ActionLinkButton
        href="tel:+4917663787951"
        icon={<Phone className={ICON} aria-hidden="true" />}
      >
        {getLegacyCopy(mockTranslations, 'contactActions.callLabel')}
      </ActionLinkButton>
      <ActionLinkButton
        href="https://github.com/mayraost"
        target="_blank"
        rel="noopener noreferrer nofollow"
        icon={<ExternalLink className={ICON} aria-hidden="true" />}
      >
        {getLegacyCopy(mockTranslations, 'contactActions.githubLabel')}
        <span className="sr-only">
          {' '}
          {getLegacyCopy(mockTranslations, 'contactActions.newTabHint')}
        </span>
      </ActionLinkButton>
    </div>
  ),
};

export const WithoutIcon: StoryObj = {
  name: 'Ohne Icon',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ActionLinkButton href="tel:+4917663787951">
        {getLegacyCopy(mockTranslations, 'contactActions.callLabel')}
      </ActionLinkButton>
      <ActionLinkButton href="/de/contact" className="border-primary text-primary">
        Kontaktseite
      </ActionLinkButton>
    </div>
  ),
};

export const LongLabel: StoryObj<{ label: string }> = {
  name: 'Langes Label (kein Umbruch)',
  args: { label: 'Profil auf einem sehr langen Hostnamen ansehen' },
  argTypes: { label: { control: 'text' } },
  render: ({ label }) => (
    <div className="flex max-w-xs flex-col gap-2 rounded-[6px] border border-border bg-surface p-3">
      <ActionLinkButton
        href="https://example.dev"
        icon={<ExternalLink className={ICON} aria-hidden="true" />}
      >
        {label}
      </ActionLinkButton>
      <p className="text-sm text-muted-foreground">
        <code>whitespace-nowrap</code> hält den Chip einzeilig; der Text darf über den Rahmen
        hinauslaufen, statt mitten im Wort zu brechen.
      </p>
    </div>
  ),
};

export const ClassConstants: StoryObj = {
  name: 'Klassen-Konstanten (CTA-Interaktion)',
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="mono-label text-muted-foreground">actionButtonClass</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="mailto:mail@example.com" className={actionButtonClass}>
            <Mail className={ICON} aria-hidden="true" />
            mail@example.com
          </a>
          <a href="tel:+4917663787951" className={actionButtonClass}>
            <Phone className={ICON} aria-hidden="true" />
            {getLegacyCopy(mockTranslations, 'contactActions.callLabel')}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="mono-label text-muted-foreground">
          ctaMotionClass + ctaArrowClass + ctaArrowHoverClass
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#architektur"
            className={`group inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-primary px-4 text-primary-foreground ${ctaMotionClass}`}
          >
            Horizontal
            <span className={`${ctaArrowClass} ${ctaArrowHoverClass}`}>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
          <a
            href="#architektur"
            className={`group inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-border px-4 text-foreground ${ctaMotionClass}`}
          >
            Diagonal
            <span className={`${ctaArrowClass} ${ctaArrowDiagonalHoverClass}`}>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Hover hebt den Button 1 px (<code>translate3d</code>) und schiebt den Pfeil 3 px bzw. 2/−2
          px; aktiv drückt er auf <code>scale(.985)</code>. Nur <code>transform</code>/
          <code>border-color</code>/<code>background-color</code> ändern sich — kein Layout, kein
          CLS.
        </p>
      </div>
    </div>
  ),
};

export const LightTheme: StoryObj = {
  name: 'Light-Theme',
  globals: { theme: 'light' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ActionLinkButton
        href="mailto:mail@example.com"
        icon={<Mail className={ICON} aria-hidden="true" />}
      >
        mail@example.com
      </ActionLinkButton>
      <ActionLinkButton
        href="https://github.com/mayraost"
        target="_blank"
        rel="noopener noreferrer"
      >
        {getLegacyCopy(mockTranslations, 'contactActions.githubLabel')}
      </ActionLinkButton>
    </div>
  ),
};
