import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/nextjs-vite';

/**
 * Storybook 11 (Vite-Builder) für dieses Next-16-Projekt.
 *
 * Auslieferung: Der statische Build landet in `src/public/storybook` und wird
 * dadurch vom Next-Build mitgenommen (Dockerfile kopiert `src/public` nach
 * `/app/public`) — erreichbar unter `/storybook` (ohne trailing slash, siehe
 * `rewrites` in next.config.ts). Kein eigener Container.
 *
 * BEWUSST KEIN `staticDirs`: `src/public` ist gleichzeitig der Ausgabeordner
 * des Builds. Storybook würde den Ordner in sich selbst kopieren (rekursiv,
 * exponentiell wachsend). Stories brauchen keine statischen Assets aus
 * `src/public`; wer doch eins braucht, importiert es im Story-Modul.
 */
const config: StorybookConfig = {
  framework: { name: '@storybook/nextjs-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  docs: { defaultName: 'Docs' },
  /**
   * Sidebar-Reihenfolge. Seit Storybook 11 gehört sie hierher — das frühere
   * `parameters.options.storySort` im Preview ist veraltet (`story-sort-to-main`
   * Automigration) und wird nicht mehr ausgewertet.
   */
  storySorts: [{ order: ['UI', 'Blocks', 'Chrome', 'Features', 'Brand', 'Projects', 'Layout'] }],
  // KEIN `typescript.reactDocgen`: In Storybook 11 ist serverseitiges Docgen
  // (`features.docgenServer`) für `@storybook/nextjs-vite` der Default und
  // ERSETZT das Builder-Docgen. Es nutzt die TypeScript-Compiler-API, also das
  // Projekt-`typescript` (6.0.3) — nicht das Alias-Paket `@typescript/native`
  // (TS 7 hat keine Compiler-API und wird von Storybook abgelehnt).
  /**
   * Der Manager-HTML-Template von Storybook referenziert seine Bundles RELATIV
   * (`./sb-manager/runtime.js`), unabhängig von der Vite-`base`. Kanonische URL
   * ist hier `/storybook` (ohne Slash), dort würde `./sb-manager/…` auf
   * `/sb-manager/…` zeigen und 404 liefern. `<base>` löst alle relativen
   * Referenzen gegen `/storybook/` auf — die URL bleibt `/storybook`.
   * (Der Preview-iframe nutzt absolute Pfade aus `viteFinal.base`.)
   */
  managerHead: (head) => `<base href="/storybook/" />${head}`,
  viteFinal: async (viteConfig) => {
    // Absolute Asset-Pfade unter dem Auslieferungspfad: kanonische URL ist
    // `/storybook` (OHNE trailing slash, siehe next.config.ts), `./assets/…`
    // würde dort auf `/assets/…` zeigen und 404 liefern.
    viteConfig.base = '/storybook/';
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    /**
     * `src/envConfig.ts` validiert `process.env` beim Modul-Import und wirft im
     * Production-Runtime ohne `PAYLOAD_SECRET` (min. 32 Zeichen). Vite ersetzt
     * `process.env.*` im Build STATISCH — ein Runtime-Shim kann das nicht mehr
     * korrigieren (genau daran ist `Layout/SiteChrome` in der ausgelieferten
     * Storybook-Version gescheitert). Deshalb hier Build-Time-Werte setzen:
     * offensichtliche Attrappen, keine echten Secrets, keine DB-Verbindung.
     */
    const storybookEnv = {
      'process.env.PAYLOAD_SECRET': JSON.stringify(
        'storybook-static-build-not-a-real-secret-0123456789',
      ),
      'process.env.DATABASE_URL': JSON.stringify(
        'postgresql://storybook:storybook@127.0.0.1:5432/storybook',
      ),
      'process.env.NEXT_PUBLIC_SERVER_URL': JSON.stringify('https://mostheimer.de'),
      'process.env.NEXT_PUBLIC_GTM_ID': JSON.stringify(''),
      'process.env.CLOUDFLARE_ZONE_ID': JSON.stringify(''),
      'process.env.CLOUDFLARE_API_TOKEN': JSON.stringify(''),
      'process.env.CLOUDFLARE_PURGE_ZONES': JSON.stringify(''),
      'process.env.CLOUDFLARE_PURGE_ON_START': JSON.stringify('1'),
    } as const;
    viteConfig.define = { ...viteConfig.define, ...storybookEnv };
    return viteConfig;
  },
};

export default config;
