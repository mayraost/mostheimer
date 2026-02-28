'use client';

import { useSettings } from '@/components/SettingsProvider';
import { useTranslations } from '@/components/TranslationsProvider';

export default function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize, animations, setAnimations } = useSettings();

  const t = useTranslations() || {};
  const settings = t.settings || {};
  const common = t.common || {};

  return (
    <div className="max-w-2xl mx-auto py-8 font-geist-mono">
      <h1 className="font-averia text-4xl font-bold mb-8 text-primary">
        {settings.title || 'Settings'}
      </h1>

      <div className="space-y-8 bg-header p-6 rounded-lg border border-border">
        {/* Theme Settings */}
        <div className="space-y-4">
          <h2 className="font-averia text-2xl font-bold">{settings.themeHeading || 'Theme'}</h2>
          <p className="text-gray-500 text-sm">
            {settings.themeDescription || 'Choose your preferred color scheme.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {(['system', 'light', 'dark'] as const).map((themeType) => (
              <button
                key={themeType}
                onClick={() => setTheme(themeType)}
                className={`py-2 px-4 rounded-md border text-sm font-semibold capitalize transition-colors
                  ${theme === themeType ? 'bg-primary text-white border-primary' : 'bg-transparent border-border hover:bg-background'}`}
              >
                {common[themeType] || themeType}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Font Size Settings */}
        <div className="space-y-4">
          <h2 className="font-averia text-2xl font-bold">
            {settings.fontSizeHeading || 'Font Size'}
          </h2>
          <p className="text-gray-500 text-sm">
            {settings.fontSizeDescription || 'Adjust the base text size.'}
          </p>
          <div className="flex gap-4">
            {(['normal', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`py-2 px-4 rounded-md border text-sm font-semibold capitalize transition-colors
                  ${fontSize === size ? 'bg-primary text-white border-primary' : 'bg-transparent border-border hover:bg-background'}`}
              >
                {common[size] || size}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Animations Settings */}
        <div className="space-y-4">
          <h2 className="font-averia text-2xl font-bold">
            {settings.animationsHeading || 'Animations'}
          </h2>
          <p className="text-gray-500 text-sm">
            {settings.animationsDescription || 'Enable or disable smooth transitions.'}
          </p>
          <div className="flex gap-4">
            {(['system', 'on', 'off'] as const).map((anim) => (
              <button
                key={anim}
                onClick={() => setAnimations(anim)}
                className={`py-2 px-4 rounded-md border text-sm font-semibold capitalize transition-colors
                  ${animations === anim ? 'bg-primary text-white border-primary' : 'bg-transparent border-border hover:bg-background'}`}
              >
                {common[anim] || anim}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
