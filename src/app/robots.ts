import type { MetadataRoute } from 'next';
import { envConfig } from '@/envConfig';

/**
 * AI-Crawler-Robots-Policy (AEO-Layer, Research aeo-discovery-layer
 * 03.11.2026 — OpenAI-Bot-Split verifiziert gegen platform.openai.com/docs/bots):
 *
 * - `OAI-SearchBot` — surfaces Sites in ChatGPT-Search → ALLOW (direkter
 *   AEO-Traffic-/Zitat-Kanal, ~24 h nach Robots-Update).
 * - `GPTBot` — Trainings-Crawl der Foundation-Models → ALLOW (⚠️ Bewertung,
 *   nicht Spec): öffentliches Profil mit kuratierten CV-Fakten, kein
 *   messbarer Nachteil für dieses Site-Konzept — die Site ist bewusst
 *   öffentlicher Content.
 * - `ChatGPT-User` — nutzer-initiierte, interaktive Abrufe; deckt die
 *   `*`-Regel (ALLOW) implicite ab, daher kein eigener Block nötig.
 *
 * Keine weitere User-Agent-Differenzierung über den OpenAI-Split hinaus
 * (Research „nicht tun": geringer Zusatzwert). Google-Extended/
 * Claude-/Meta-/Perplexity-Bots sind im Research nicht offiziell
 * verifiziert — bewusst KEINE expliziten Blocks für unverified Bots.
 *
 * `host` (top-level, non-standard, Yandex-Anweisung) ist gesetzt: der
 * kanonische Host wird ausgesagt; Engines ohne Host-Support ignorieren
 * die Zeile laut Doku. `other`-Direktiven (neu 16.3) bleiben ungenutzt —
 * Seznam/Yandex-Spezifika (Request-Rate, Clean-param) sind hier nicht
 * relevant.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = envConfig.serverUrl;
  const disallow = ['/admin/', '/api/', '/settings'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
