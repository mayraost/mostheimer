import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const maxDuration = 60;

export async function GET() {
  const payload = await getPayload({ config: configPromise });

  try {
    // Dann neu setzen
    await payload.updateGlobal({
      slug: 'navigation',
      locale: 'en',
      fallbackLocale: false,
      data: {
        headerLinks: [
          { label: 'Home', link: '/en' },
          { label: 'Tech Stack', link: '/en/tech-stack' },
          { label: 'Track Record', link: '/en/track-record' },
          { label: 'Engineering', link: '/en/engineering' },
          { label: 'Leadership', link: '/en/leadership' },
          { label: 'Off-Screen', link: '/en/off-screen' },
          { label: 'AI & Vibe Coding', link: '/en/ai-vibe-coding' },
        ],
        footerLinks: [
          { label: 'Imprint', link: '/en/imprint' },
          { label: 'Data Privacy', link: '/en/privacy' },
        ],
      },
    });
    await payload.updateGlobal({
      slug: 'navigation',
      locale: 'de',
      fallbackLocale: false,
      data: {
        headerLinks: [
          { label: 'Startseite', link: '/de' },
          { label: 'Tech-Stack', link: '/de/tech-stack' },
          { label: 'Track Record', link: '/de/track-record' },
          { label: 'Engineering', link: '/de/engineering' },
          { label: 'Leadership', link: '/de/leadership' },
          { label: 'Off-Screen', link: '/de/off-screen' },
          { label: 'AI & Vibe Coding', link: '/de/ai-vibe-coding' },
        ],
        footerLinks: [
          { label: 'Impressum', link: '/de/imprint' },
          { label: 'Datenschutz', link: '/de/privacy' },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // TRANSLATIONS SEEDING
    // -----------------------------------------------------------------------
    await payload.updateGlobal({
      slug: 'translations',
      locale: 'en',
      fallbackLocale: false,
      data: {
        settings: {
          title: 'Settings',
          themeHeading: 'Theme',
          themeDescription: 'Choose your preferred color scheme.',
          fontSizeHeading: 'Font Size',
          fontSizeDescription: 'Adjust the base text size.',
          animationsHeading: 'Animations',
          animationsDescription: 'Enable or disable smooth transitions.',
        },
        common: {
          system: 'System',
          light: 'Light',
          dark: 'Dark',
          normal: 'Normal',
          large: 'Large',
          on: 'Enabled',
          off: 'Disabled',
          theme: 'Theme',
          settingsButtonAria: 'Personalize your experience',
          menu: 'Menu',
        },
      },
    });
    await payload.updateGlobal({
      slug: 'translations',
      locale: 'de',
      fallbackLocale: false,
      data: {
        settings: {
          title: 'Einstellungen',
          themeHeading: 'Design',
          themeDescription: 'Wähle dein bevorzugtes Farbschema.',
          fontSizeHeading: 'Schriftgröße',
          fontSizeDescription: 'Passe die Grundtextgröße an.',
          animationsHeading: 'Animationen',
          animationsDescription: 'Fließende Übergänge an/ausschalten.',
        },
        common: {
          system: 'System',
          light: 'Hell',
          dark: 'Dunkel',
          normal: 'Normal',
          large: 'Groß',
          on: 'Aktiviert',
          off: 'Deaktiviert',
          theme: 'Design',
          settingsButtonAria: 'Personalisiere dein Erlebnis',
          menu: 'Menü',
        },
      },
    });

    // -----------------------------------------------------------------------
    // NOT FOUND SEEDING
    // -----------------------------------------------------------------------
    await payload.updateGlobal({
      slug: 'not-found',
      locale: 'en',
      fallbackLocale: false,
      data: {
        title: '404 - Page not found',
        message: "The page you are looking for doesn't exist or has been moved.",
        buttonLabel: 'Back to Home',
        buttonLink: '/en',
      },
    });
    await payload.updateGlobal({
      slug: 'not-found',
      locale: 'de',
      fallbackLocale: false,
      data: {
        title: '404 - Seite nicht gefunden',
        message: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
        buttonLabel: 'Zurück zur Startseite',
        buttonLink: '/de',
      },
    });

    return Response.json({
      message: 'Global settings (Navigation, Translations & NotFound) seeded successfully!',
    });
  } catch (err: unknown) {
    console.error('SEED ERROR:', err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : 'Error occurred',
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 },
    );
  }
}
