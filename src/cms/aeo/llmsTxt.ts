/**
 * Static content of /llms.txt (llmstxt.org v2, curated). It lives here rather
 * than in public/ because this repo keeps static assets in src/public, which
 * the dev server does not serve; the route handler behaves the same in dev and
 * prod.
 *
 * The page list mirrors the eight published `pages` documents (home, career,
 * case-studies, tech-radar, leadership, contact, imprint, privacy) in both
 * locales — keep it in sync when pages are added or removed. The projects
 * listing is a further page document with its own section below; its detail
 * pages are CMS data (enumerated in the sitemap, not here).
 */

const BASE = 'https://mostheimer.de';

export const LLMS_TXT = `# Mayra Ostheimer

> Personal website of Mayra Ostheimer — Senior Fullstack Developer — published in
> German (\`/de\`) and English (\`/en\`). Seven content pages plus the legal pages,
> mirrored per locale with per-page canonicals and hreflang alternates.

Mayra Ostheimer builds resilient web and application architectures: Next.js,
React and TypeScript on the frontend, Payload CMS, Pimcore and Node.js for
content and commerce, plus edge/CDN infrastructure that holds under load.
CV facts (roles, employers, dates), case studies and contact details are also
published as JSON-LD (\`Person\`, \`WebSite\`, \`ProfilePage\`, \`ItemList\`) on the
respective pages. Facts below are the same ones stated on the site itself.

## Pages

- [Home (DE)](${BASE}/de): German start page — positioning, focus areas, current status.
- [Home (EN)](${BASE}/en): English start page — same content, English locale.
- [Career / Werdegang (DE)](${BASE}/de/career): Employment timeline, roles, employers, testimonials.
- [Career (EN)](${BASE}/en/career): English version of the career timeline.
- [Case Studies (DE)](${BASE}/de/case-studies): Enterprise projects — valantic DXA, Lehnert & Wieners, FFW/Cellular.
- [Case Studies (EN)](${BASE}/en/case-studies): English version of the case studies.
- [Tech Radar (DE)](${BASE}/de/tech-radar): Technology radar and capability overview.
- [Tech Radar (EN)](${BASE}/en/tech-radar): English version of the tech radar.
- [Leadership (DE)](${BASE}/de/leadership): Leadership philosophy, enablement and engineering standards.
- [Leadership (EN)](${BASE}/en/leadership): English version of the leadership page.
- [Contact (DE)](${BASE}/de/contact): Contact details and availability of communication channels.
- [Contact (EN)](${BASE}/en/contact): English version of the contact page.
- [Impressum (DE)](${BASE}/de/impressum): Rechtliches — Angaben gemäß § 5 DDG, Kontakt, Adresse.
- [Imprint (EN)](${BASE}/en/imprint): Legal notice in English.
- [Datenschutz / Privacy (DE)](${BASE}/de/privacy): Privacy policy (German).
- [Privacy (EN)](${BASE}/en/privacy): Privacy policy (English).

## Projects

- [Projekte (DE)](${BASE}/de/projects): Showcase of own projects — what was built, how it was built, and the engineering standards it was held to.
- [Projects (EN)](${BASE}/en/projects): English version of the showcase.
- Each project has its own page under \`/{locale}/projects/<project>\` (context, approach, learnings, outcome, stack); every project page is listed in the sitemap.
- Filtered and paginated variants (\`?tag=\`, \`?page=\`) are deliberately \`noindex\` and are never enumerated: the listing is the crawl entry point, the details are reached through its links.

## Indexes

- [Sitemap](${BASE}/sitemap.xml): machine-readable index of all pages, including per-locale \`hreflang\` alternates.
- [Robots](${BASE}/robots.txt): crawler access rules for search engines and AI crawlers (OpenAI search/train split documented there).

## Contact

- [E-Mail](mailto:mayraostheimer@gmail.com): Primary contact channel.
- [GitHub](https://github.com/mayraost): Public code profile.
- [LinkedIn](https://de.linkedin.com/in/mayra-ostheimer-207355438): Professional profile.
`;
