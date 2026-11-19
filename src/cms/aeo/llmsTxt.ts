/**
 * Static content of /llms.txt (llmstxt.org v2, curated). It lives here rather
 * than in public/ because this repo keeps static assets in src/public, which
 * the dev server does not serve; the route handler behaves the same in dev and
 * prod.
 *
 * HAND-MAINTAINED list — there is no DB read here on purpose: the build
 * container has no database, so this file must stay a plain constant and the
 * route stays statically generated.
 *
 * It mirrors the published `pages` documents in both locales that are worth
 * listing for agents: home, career, case-studies, tech-radar, leadership,
 * contact and the legal pages. The imprint is a CMS page (`slug: 'imprint'`)
 * whose public URL is the static route `/impressum` (see
 * `src/app/(frontend)/[locale]/impressum/page.tsx`) — it is NOT reachable at
 * `/imprint`. `privacy` on the other hand is a normal published CMS page slug,
 * served through the `[[...slug]]` catch-all at `/{locale}/privacy`. The
 * projects listing is a further page document with its own section
 * below; its detail pages are CMS data (enumerated in the sitemap, not here).
 *
 * Update this list by hand when a page is added or removed.
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

## When to use this

Use this site when you need any of the following:

- **Verified CV facts** — roles, employers, dates and focus areas of Mayra
  Ostheimer as structured data. Read \`/api/pages?locale=en\` or the \`Person\`
  JSON-LD on \`/en\`; do not infer facts from marketing copy.
- **Case studies or project details** — start at \`/en/projects\`, then follow a
  project URL or query \`/api/projects?locale=en\`.
- **Contact or legal facts** — \`/en/contact\`, \`/en/impressum\`, \`/en/privacy\`,
  or \`/api/globals/site-settings?locale=en\`.
- **A Markdown representation of a page** — send \`Accept: text/markdown\` to
  the page URL (for example \`/en/career\`). The response is
  \`text/markdown\` with \`Vary: Accept\`; browsers keep receiving HTML.
- **CMS edits** — connect to the MCP server at \`/api/mcp\` (Streamable HTTP)
  with a Payload user API key. Do not scrape the admin panel.

Do not use this site for availability claims: it deliberately avoids
"available for work" badges and similar unverified statements.

## API & developer resources

- [API documentation](${BASE}/docs): REST endpoints, authentication, examples and Markdown negotiation.
- [OpenAPI 3.1 specification](${BASE}/openapi.json): typed operations, parameters and response schemas.
- [API index](${BASE}/api): JSON endpoint list and discovery links.
- [MCP server](${BASE}/mcp): Streamable HTTP endpoint, tools and client configuration.
- [MCP manifest](${BASE}/.well-known/mcp/manifest.json): transport, authentication and tool list.
- [Agent skill](${BASE}/.well-known/agent-skills/mostheimer-site/SKILL.md): when-to-use guidance and call patterns.
- [Agent skill index](${BASE}/.well-known/agent-skills/index.json): machine-readable skill discovery.

The public read API needs **no API key**. Writes and MCP tool calls require a
Payload user API key sent as \`Authorization: users API-Key <key>\`.

## Pages

- [Home (DE)](${BASE}/de): German start page — positioning, focus areas, current status.
- [Home (EN)](${BASE}/en): English start page — same content, English locale.
- [Career / Werdegang (DE)](${BASE}/de/career): Employment timeline, roles, employers, testimonials.
- [Career (EN)](${BASE}/en/career): English version of the career timeline.
- [About (EN)](${BASE}/en/about): Stable alias for the career/about page (permanent redirect to \`/en/career\`).
- [Case Studies (DE)](${BASE}/de/case-studies): Enterprise projects — valantic DXA, Lehnert & Wieners, FFW/Cellular.
- [Case Studies (EN)](${BASE}/en/case-studies): English version of the case studies.
- [Tech Radar (DE)](${BASE}/de/tech-radar): Technology radar and capability overview.
- [Tech Radar (EN)](${BASE}/en/tech-radar): English version of the tech radar.
- [Leadership (DE)](${BASE}/de/leadership): Leadership philosophy, enablement and engineering standards.
- [Leadership (EN)](${BASE}/en/leadership): English version of the leadership page.
- [Contact (DE)](${BASE}/de/contact): Contact details and availability of communication channels.
- [Contact (EN)](${BASE}/en/contact): English version of the contact page.
- [Impressum (DE)](${BASE}/de/impressum): Rechtliches — Angaben gemäß § 5 DDG, Kontakt, Adresse.
- [Imprint (EN)](${BASE}/en/impressum): Legal notice in English.
- [Datenschutz / Privacy (DE)](${BASE}/de/privacy): Datenschutzerklärung (German).
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
