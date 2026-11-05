import type { Navigation } from '@/payload-types';
import { getCachedNavigation, getCachedTranslations } from '@/cms/cache/frontend/frontendCache';
import type { FrontendLocale } from '@/cms/cache/frontend/frontendCache';
import type { Translation } from '@/payload-types';

/**
 * CMS copy for the 404 document rendered outside the [locale] layout.
 *
 * All-or-nothing by design: header/footer need the translations global for
 * their accessible labels and the consent copy. When any read fails (build
 * context without a DB, cold cache), the caller renders the bare, styled card
 * instead of chrome with invented labels.
 *
 * Deliberately no API-route fetch here: a self-fetch to `/api/mcp` or the
 * Payload REST API would crash on the first segment throw (the renderer's
 * `try/catch` would swallow the exception) or cost a full dyn-runtime restart.
 */
export type NotFoundCopy = {
  translations: Translation;
  navigation: Pick<Navigation, 'headerLinks' | 'footerLinks'> | null;
};

export async function loadNotFoundCopy(locale: FrontendLocale): Promise<NotFoundCopy | null> {
  try {
    const [translations, navigation] = await Promise.all([
      getCachedTranslations(locale),
      getCachedNavigation(locale),
    ]);
    // Header/Footer/CookieConsent need these groups; without them the chrome
    // would render empty labels.
    if (!translations?.common?.menu || !translations.cookies) return null;
    return { translations, navigation };
  } catch {
    return null;
  }
}
