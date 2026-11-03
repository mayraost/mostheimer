/**
 * llms.txt (llmstxt.org v2, kuratiert, AEO-Layer): statischer Inhalt der
 * /llms.txt-Route (src/app/llms.txt/route.ts).
 *
 * Warum Route-Handler statt public/llms.txt: Next served public-Assets
 * nur aus <root>/public — dieses Repo haellt statische Assets in
 * src/public (Dockerfile kopiert sie in den Runner), im Dev-Server ist
 * src/public aber NICHT reachable (Falling-Through in den [locale]-
 * Catch-All). Der Route-Handler greift in Dev UND Prod identisch,
 * ohne Dockerfile-Aenderung.
 */

export const LLMS_TXT =
  "# Mostheimer\n\n> Personal website of Mayra Ostheimer, published in English and German.\n> Curated machine-readable overview of the site's content for AI agents,\n> search surfaces and research assistants (llmstxt.org v2).\n\nThe site is a small, intentionally curated personal portfolio. Pages are\nmirrored in two locales — English (`/en/...`) and German (`/de/...`) — with\nper-page canonicals and hreflang alternates. Authors/agents wanting full\ncontext on the person should start with the home page, then follow\nnavigation links; CV/contact facts are also stated in the JSON-LD\n(`Person`/`WebSite`) embedded on the home page.\n\n## Pages\n\n- [Home (EN)](https://mosthi.de/en): Start page and introduction in English.\n- [Startseite (DE)](https://mosthi.de/de): Deutsche Startseite.\n- [Impressum (DE)](https://mosthi.de/de/impressum): Rechtliches — Angaben gemäß § 5 DDG, Kontakt, Adresse.\n- [Imprint (EN)](https://mosthi.de/en/impressum): Legal notice in English.\n\n## Indexes\n\n- [Sitemap](https://mosthi.de/sitemap.xml): machine-readable index of all pages, including per-locale `hreflang` alternates.\n- [Robots](https://mosthi.de/robots.txt): crawler access rules for search engines and AI crawlers (OpenAI search/train split documented there).\n\n## Contact\n\n- [E-Mail](mailto:mail@mostheimer.de): Primary contact channel.\n";
