import type { NotFound } from '@/payload-types';

type NotFoundTexts = Pick<NotFound, 'title' | 'message' | 'buttonLabel' | 'buttonLink'>;

/**
 * Localized fallback copy for a locale's 404 screen, used when the CMS global
 * is empty or unreadable. The global 404 is English-only with its own literals,
 * so it does not depend on this module.
 */
export const NOT_FOUND_FALLBACK: Record<'de' | 'en', NotFoundTexts> = {
  de: {
    title: 'Seite nicht gefunden',
    message: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
    buttonLabel: 'Zur Startseite',
    buttonLink: '/de',
  },
  en: {
    title: 'Page not found',
    message: 'The page you are looking for does not exist or has moved.',
    buttonLabel: 'Back to home',
    buttonLink: '/en',
  },
};

/** Merges the CMS global with the fallback copy (empty fields keep the fallback). */
export function mergeNotFoundTexts(
  fromCms: NotFoundTexts | null,
  locale: 'de' | 'en',
): NotFoundTexts {
  const fallback = NOT_FOUND_FALLBACK[locale];
  if (!fromCms) return fallback;
  return {
    title: fromCms.title || fallback.title,
    message: fromCms.message || fallback.message,
    buttonLabel: fromCms.buttonLabel || fallback.buttonLabel,
    buttonLink: fromCms.buttonLink || fallback.buttonLink,
  };
}
