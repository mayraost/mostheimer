'use client';

import { useSettings } from '@/components/SettingsProvider';
import { useTranslations } from '@/components/TranslationsProvider';

/**
 * Client settings UI, extracted from the settings route: under cacheComponents a
 * route file cannot export 'use client' and generateStaticParams at once.
 */
export function SettingsPageClient() {
  const { theme, setTheme, fontSize, setFontSize, animations, setAnimations } = useSettings();

  const t = useTranslations();
  const settings = t.settings;
  const common = t.common;

  const optionBase =
    'mono-label inline-flex min-h-11 items-center justify-center rounded-[6px] border px-4 transition-colors';
  const optionActive = 'border-primary bg-primary text-primary-foreground';
  const optionIdle =
    'border-border bg-surface-raised/50 text-muted-foreground hover:border-border-strong hover:text-foreground';

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <div className="mb-6 border-b border-border pb-4">
        <p className="mono-label mb-2 text-primary">&gt;_ settings</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {settings.title}
        </h1>
      </div>

      <div className="grid gap-2">
        {/* Theme Settings */}
        <section className="rounded-[6px] border border-border bg-surface p-6">
          <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
            {settings.themeHeading}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{settings.themeDescription}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(['dark', 'light', 'system'] as const).map((themeType) => (
              <button
                key={themeType}
                type="button"
                onClick={() => setTheme(themeType)}
                aria-pressed={theme === themeType}
                className={`${optionBase} ${theme === themeType ? optionActive : optionIdle}`}
              >
                {common[themeType as keyof typeof common]}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size Settings */}
        <section className="rounded-[6px] border border-border bg-surface p-6">
          <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
            {settings.fontSizeHeading}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{settings.fontSizeDescription}</p>
          <div className="flex gap-2">
            {(['normal', 'large'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                aria-pressed={fontSize === size}
                className={`${optionBase} ${fontSize === size ? optionActive : optionIdle}`}
              >
                {common[size as keyof typeof common]}
              </button>
            ))}
          </div>
        </section>

        {/* Animations Settings */}
        <section className="rounded-[6px] border border-border bg-surface p-6">
          <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
            {settings.animationsHeading}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{settings.animationsDescription}</p>
          <div className="flex flex-wrap gap-2">
            {(['system', 'on', 'off'] as const).map((anim) => (
              <button
                key={anim}
                type="button"
                onClick={() => setAnimations(anim)}
                aria-pressed={animations === anim}
                className={`${optionBase} ${animations === anim ? optionActive : optionIdle}`}
              >
                {common[anim as keyof typeof common]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
