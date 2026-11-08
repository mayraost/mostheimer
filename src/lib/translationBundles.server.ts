import type { FrontendLocale } from '@/cms/cache/frontend/routes';
import {
  getCachedCommandItemCopy,
  getCachedTranslation,
  getCachedTranslationList,
} from './translations.server';
import type { HeroCopy } from '@/components/blocks/HeroBlock';
import type { BentoCopy } from '@/components/blocks/BentoGridBlock';
import type { SkillsetCopy } from '@/components/blocks/SkillsetBlock';
import type { CaseStudyCopy } from '@/components/blocks/CaseStudyBlock';
import type { TimelineCopy } from '@/components/blocks/TimelineBlock';
import type { TechRadarCopy } from '@/components/blocks/TechRadarBlock';
import type { CtaCopy } from '@/components/blocks/CallToActionBlock';
import type { ArchitectureCopy } from '@/components/blocks/ArchitectureDiagramBlock';
import type { PreviewCopy } from '@/components/preview/PreviewBlocks';

/**
 * Shell copy bundles.
 *
 * A page or layout mostly needs a WHOLE cluster of related labels at once
 * (the header/footer chrome, the hero shell, the preview's block copy). Reading
 * them one `await` at a time reads well but hides the grouping; these loaders
 * keep the key list in ONE place, so a page cannot forget a label and the
 * shape is typed for the consuming component.
 *
 * Every value is a cached read (translations tag), so calling a loader is cheap
 * and never touches the database while the cache is warm.
 */

/** Header/drawer/footer labels (translations `chrome.*`). */
export type ChromeCopy = {
  homeAria: string;
  languageName: string;
  languageSwitchAria: string;
  closeMenu: string;
  drawerStatus: string;
  currentPage: string;
  brandClaim: string;
  footerNavAria: string;
  footerCredits: string;
  roleBadge: string;
  levelBadge: string;
  modeBadge: string;
  locationBadge: string;
  portraitMonogram: string;
  notFoundCode: string;
  breadcrumbHome: string;
};

export async function loadChromeCopy(locale: FrontendLocale): Promise<ChromeCopy> {
  const [
    homeAria,
    languageName,
    languageSwitchAria,
    closeMenu,
    drawerStatus,
    currentPage,
    brandClaim,
    footerNavAria,
    footerCredits,
    roleBadge,
    levelBadge,
    modeBadge,
    locationBadge,
    portraitMonogram,
    notFoundCode,
    breadcrumbHome,
  ] = await Promise.all([
    getCachedTranslation(locale, 'chrome.homeAria'),
    getCachedTranslation(locale, 'chrome.languageName'),
    getCachedTranslation(locale, 'chrome.languageSwitchAria'),
    getCachedTranslation(locale, 'chrome.closeMenu'),
    getCachedTranslation(locale, 'chrome.drawerStatus'),
    getCachedTranslation(locale, 'chrome.currentPage'),
    getCachedTranslation(locale, 'chrome.brandClaim'),
    getCachedTranslation(locale, 'chrome.footerNavAria'),
    getCachedTranslation(locale, 'chrome.footerCredits'),
    getCachedTranslation(locale, 'chrome.roleBadge'),
    getCachedTranslation(locale, 'chrome.levelBadge'),
    getCachedTranslation(locale, 'chrome.modeBadge'),
    getCachedTranslation(locale, 'chrome.locationBadge'),
    getCachedTranslation(locale, 'chrome.portraitMonogram'),
    getCachedTranslation(locale, 'chrome.notFoundCode'),
    getCachedTranslation(locale, 'chrome.breadcrumbHome'),
  ]);
  return {
    homeAria,
    languageName,
    languageSwitchAria,
    closeMenu,
    drawerStatus,
    currentPage,
    brandClaim,
    footerNavAria,
    footerCredits,
    roleBadge,
    levelBadge,
    modeBadge,
    locationBadge,
    portraitMonogram,
    notFoundCode,
    breadcrumbHome,
  };
}

/**
 * Hero shell copy: identity badges (chrome) + stack row and metrics
 * (`blocks.hero.*` lists). `brandName` comes from `site-settings`, not from
 * copy — it is the same entity name the metadata uses.
 */
export async function loadHeroCopy(locale: FrontendLocale, brandName: string): Promise<HeroCopy> {
  const [
    roleBadge,
    levelBadge,
    modeBadge,
    locationBadge,
    portraitMonogram,
    stackLabel,
    stackItems,
    metrics,
  ] = await Promise.all([
    getCachedTranslation(locale, 'chrome.roleBadge'),
    getCachedTranslation(locale, 'chrome.levelBadge'),
    getCachedTranslation(locale, 'chrome.modeBadge'),
    getCachedTranslation(locale, 'chrome.locationBadge'),
    getCachedTranslation(locale, 'chrome.portraitMonogram'),
    getCachedTranslation(locale, 'blocks.hero.stackLabel'),
    getCachedTranslationList(locale, 'blocks.hero.stackItems'),
    getCachedTranslationList(locale, 'blocks.hero.metrics'),
  ]);

  return {
    roleBadge,
    levelBadge,
    modeBadge,
    locationBadge,
    portraitName: brandName,
    portraitMonogram,
    stackLabel,
    stackItems: stackItems.map((item) => ({ item })),
    // Metrics are `label|value` per line; a malformed line is skipped instead of
    // rendering a label with an empty value.
    metrics: metrics
      .map((line) => line.split('|'))
      .filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
      .map(([label, value]) => ({ label: label.trim(), value: value.trim() })),
  };
}

/**
 * Error-card copy (`routes.error.*`), resolved for the client boundaries.
 *
 * The error boundaries cannot await the cache, so the layout resolves this once
 * and hands it to `TranslationsProvider`. Kept separate from the main bundle
 * because it must be available even when the rest of the read failed.
 */
export async function loadErrorCopy(locale: FrontendLocale) {
  const [code, title, message, home, retry] = await Promise.all([
    getCachedTranslation(locale, 'routes.error.code'),
    getCachedTranslation(locale, 'routes.error.title'),
    getCachedTranslation(locale, 'routes.error.message'),
    getCachedTranslation(locale, 'routes.error.home'),
    getCachedTranslation(locale, 'routes.error.retry'),
  ]);
  return { code, title, message, home, retry };
}

/** Bento grid shell copy (`blocks.bento.*`). */
export async function loadBentoCopy(locale: FrontendLocale): Promise<BentoCopy> {
  const [
    pillarPrefix,
    featuredLabel,
    eyebrow,
    pillarSingular,
    pillarPlural,
    architectureChip,
    composableChip,
  ] = await Promise.all([
    getCachedTranslation(locale, 'blocks.bento.pillarPrefix'),
    getCachedTranslation(locale, 'blocks.bento.featuredLabel'),
    getCachedTranslation(locale, 'blocks.bento.eyebrow'),
    getCachedTranslation(locale, 'blocks.bento.pillarSingular'),
    getCachedTranslation(locale, 'blocks.bento.pillarPlural'),
    getCachedTranslation(locale, 'blocks.bento.architectureChip'),
    getCachedTranslation(locale, 'blocks.bento.composableChip'),
  ]);
  return {
    pillarPrefix,
    featuredLabel,
    eyebrow,
    pillarSingular,
    pillarPlural,
    architectureChip,
    composableChip,
  };
}

/** Skillset shell copy (`blocks.skillset.*`). */
export async function loadSkillsetCopy(locale: FrontendLocale): Promise<SkillsetCopy> {
  const [eyebrow, itemPrefix] = await Promise.all([
    getCachedTranslation(locale, 'blocks.skillset.eyebrow'),
    getCachedTranslation(locale, 'blocks.skillset.itemPrefix'),
  ]);
  return { eyebrow, itemPrefix };
}

/** Case-study shell copy (`blocks.caseStudy.*`). */
export async function loadCaseStudyCopy(locale: FrontendLocale): Promise<CaseStudyCopy> {
  const [
    eyebrow,
    periodLabel,
    roleLabel,
    contextLabel,
    solutionLabel,
    impactLabel,
    tagsLabel,
    linkSrLabel,
    linkFallbackLabel,
    impactEyebrow,
  ] = await Promise.all([
    getCachedTranslation(locale, 'blocks.caseStudy.eyebrow'),
    getCachedTranslation(locale, 'blocks.caseStudy.periodLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.roleLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.contextLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.solutionLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.impactLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.tagsLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.linkSrLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.linkFallbackLabel'),
    getCachedTranslation(locale, 'blocks.caseStudy.impactEyebrow'),
  ]);
  return {
    eyebrow,
    periodLabel,
    roleLabel,
    contextLabel,
    solutionLabel,
    impactLabel,
    tagsLabel,
    linkSrLabel,
    linkFallbackLabel,
    impactEyebrow,
  };
}

/** Timeline shell copy (`blocks.timeline.*`). */
export async function loadTimelineCopy(locale: FrontendLocale): Promise<TimelineCopy> {
  const [stationSingular, stationPlural, emptyPeriod] = await Promise.all([
    getCachedTranslation(locale, 'blocks.timeline.stationSingular'),
    getCachedTranslation(locale, 'blocks.timeline.stationPlural'),
    getCachedTranslation(locale, 'blocks.timeline.emptyPeriod'),
  ]);
  return { stationSingular, stationPlural, emptyPeriod };
}

/** Tech-radar shell copy (`blocks.techRadar.*`). */
export async function loadTechRadarCopy(locale: FrontendLocale): Promise<TechRadarCopy> {
  const [tierCore, tierProven, tierFocus, entriesSingular, entriesPlural, quadrantPrefix] =
    await Promise.all([
      getCachedTranslation(locale, 'blocks.techRadar.tierCore'),
      getCachedTranslation(locale, 'blocks.techRadar.tierProven'),
      getCachedTranslation(locale, 'blocks.techRadar.tierFocus'),
      getCachedTranslation(locale, 'blocks.techRadar.entriesSingular'),
      getCachedTranslation(locale, 'blocks.techRadar.entriesPlural'),
      getCachedTranslation(locale, 'blocks.techRadar.quadrantPrefix'),
    ]);
  return { tierCore, tierProven, tierFocus, entriesSingular, entriesPlural, quadrantPrefix };
}

/** CTA shell copy (`blocks.callToAction.*`). */
export async function loadCtaCopy(locale: FrontendLocale): Promise<CtaCopy> {
  const [eyebrowPrimary, eyebrowSecondary, responseNote] = await Promise.all([
    getCachedTranslation(locale, 'blocks.callToAction.eyebrowPrimary'),
    getCachedTranslation(locale, 'blocks.callToAction.eyebrowSecondary'),
    getCachedTranslation(locale, 'blocks.callToAction.responseNote'),
  ]);
  return { eyebrowPrimary, eyebrowSecondary, responseNote };
}

/** Architecture-diagram shell copy (`blocks.architecture.*`). */
export async function loadArchitectureCopy(locale: FrontendLocale): Promise<ArchitectureCopy> {
  const [defaultSectionLabel, layerSingular, layerPlural, tablistAria, stackLabel] =
    await Promise.all([
      getCachedTranslation(locale, 'blocks.architecture.defaultSectionLabel'),
      getCachedTranslation(locale, 'blocks.architecture.layerSingular'),
      getCachedTranslation(locale, 'blocks.architecture.layerPlural'),
      getCachedTranslation(locale, 'blocks.architecture.tablistAria'),
      getCachedTranslation(locale, 'blocks.architecture.stackLabel'),
    ]);
  return { defaultSectionLabel, layerSingular, layerPlural, tablistAria, stackLabel };
}

/** Imprint frame copy (`routes.imprint.*`). */
export async function loadImprintCopy(locale: FrontendLocale) {
  const [title, eyebrow, empty, metaDescription] = await Promise.all([
    getCachedTranslation(locale, 'routes.imprint.title'),
    getCachedTranslation(locale, 'routes.imprint.eyebrow'),
    getCachedTranslation(locale, 'routes.imprint.empty'),
    getCachedTranslation(locale, 'routes.imprint.metaDescription'),
  ]);
  return { title, eyebrow, empty, metaDescription };
}

/**
 * Every block-shell copy group the live preview can render.
 *
 * The preview is a client tree, so this bundle is resolved on the server and
 * passed down — one object, typed by `PreviewCopy`.
 */
export async function loadPreviewCopy(
  locale: FrontendLocale,
  brandName: string,
): Promise<PreviewCopy> {
  return {
    hero: await loadHeroCopy(locale, brandName),
    bento: await loadBentoCopy(locale),
    skillset: await loadSkillsetCopy(locale),
    caseStudy: await loadCaseStudyCopy(locale),
    timeline: await loadTimelineCopy(locale),
    techRadar: await loadTechRadarCopy(locale),
    callToAction: await loadCtaCopy(locale),
    architecture: await loadArchitectureCopy(locale),
    status: { gaugeLabel: await getCachedTranslation(locale, 'blocks.status.gaugeLabel') },
    imageText: {
      eyebrow: await getCachedTranslation(locale, 'blocks.imageText.eyebrow'),
      imagePlaceholder: await getCachedTranslation(locale, 'blocks.imageText.imagePlaceholder'),
    },
  };
}

/** Re-exported for pages that only need a single command-palette label. */
export { getCachedCommandItemCopy };
