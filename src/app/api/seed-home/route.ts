import configPromise from '@payload-config';
import { getPayload } from 'payload';
import type { Page } from '@/payload-types';

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Helper: Kapselt Delete, Create (EN) und Update (DE) in einem sauberen Flow
// ---------------------------------------------------------------------------
async function seedLocalizedPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  enData: { title: string; layout: NonNullable<Page['layout']> },
  deData: { title: string; layout: NonNullable<Page['layout']> },
) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
  });

  if (existing.totalDocs > 0) {
    await payload.delete({ collection: 'pages', id: existing.docs[0].id });
  }

  const page = await payload.create({
    collection: 'pages',
    locale: 'en',
    data: {
      title: enData.title,
      slug: slug,
      layout: enData.layout,
    },
  });

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    data: {
      title: deData.title,
      layout: deData.layout,
    },
  });

  return page.id;
}

export async function GET() {
  const payload = await getPayload({ config: configPromise });

  try {
    // -----------------------------------------------------------------------
    // PARALLEL EXECUTION: Volle Ladung für alle 9 Seiten
    // -----------------------------------------------------------------------
    await Promise.all([
      // --- 1. HOME ---
      seedLocalizedPage(
        payload,
        'home',
        {
          title: 'Home',
          layout: [
            {
              blockType: 'hero',
              heading: 'Mayra Ostheimer – Senior Full Stack Engineer',
              subheading:
                'I build scalable architectures, not throwaway prototypes. State-of-the-art web engineering, deep legacy expertise, and zero tolerance for technical debt.',
              showStackBadge: true,
              ctaLabel: 'View Tech Stack',
              ctaLink: '/en/tech-stack',
              ctaLabel2: 'Check Track Record',
              ctaLink2: '/en/track-record',
            },
            {
              blockType: 'statusBlock',
              badgeLabel: 'Current Status',
              title: "I'm not on the market – but I'm always listening.",
              description:
                "Right now I'm fully focused on my role as Senior Lead at valantic DXA. Not actively looking. But if you want to talk about modern JS architectures, AI integration vs. VibeCoding, or Smart Home hacking over a decent coffee – my calendar has gaps.",
              networkTopics: [
                { topic: 'Modern JS Architectures' },
                { topic: 'AI Integration (Vercel SDK)' },
                { topic: 'DevOps & CI/CD Pipelines' },
                { topic: 'Performance Engineering' },
                { topic: 'Technical Leadership' },
              ],
            },
            {
              blockType: 'bentoGrid',
              heading: 'What actually matters.',
              items: [
                {
                  highlight: 'Millions of requests. Live data.',
                  title: 'Engineering & Impact',
                  description:
                    'ZDF 2025 relaunch: latency does not die by accident. It dies by strategy. Granular Cloudflare caching layers, isolated data sources, and brutal measurement discipline.',
                  ctaLabel: 'Deep Dive Engineering',
                  ctaLink: '/en/engineering',
                  iconName: 'Zap',
                  featured: true,
                },
                {
                  highlight: 'Force multiplier. Not an autopilot.',
                  title: 'AI & Vibe Coding',
                  description:
                    'I build chat software with Vercel AI SDK and diffy, and write code with Antigravity & Claude Code. Why engineering fundamentals matter more than ever in the age of LLMs.',
                  ctaLabel: 'My AI Stance',
                  ctaLink: '/en/ai-vibe-coding',
                  iconName: 'Bot',
                  featured: false,
                },
                {
                  highlight: 'Flat hierarchies. Radical transparency.',
                  title: 'Leadership & Mindset',
                  description:
                    "Growing junior devs into engineers is not a side quest – it's the job. My philosophy on dailys, conflict resolution, and why I hate knowledge silos.",
                  ctaLabel: 'Leadership Philosophy',
                  ctaLink: '/en/leadership',
                  iconName: 'Users',
                  featured: false,
                },
                {
                  highlight: 'Node 24 · Next.js 16 · AWS',
                  title: 'The Tech Stack',
                  description:
                    'Current weapons of choice and why. From bleeding-edge frameworks down to bare-metal Ubuntu servers and legacy PHP systems that still earn money.',
                  ctaLabel: 'Full Stack',
                  ctaLink: '/en/tech-stack',
                  iconName: 'Layers',
                  featured: false,
                },
                {
                  highlight: 'Kiebitzreihe. Dogs. Trash TV.',
                  title: 'Off-Screen',
                  description:
                    'Smart Home hardware hacking with Zigbee2MQTT, the finest Reality TV Germany produces, and two dogs with very strong opinions.',
                  ctaLabel: 'The human behind the code',
                  ctaLink: '/en/off-screen',
                  iconName: 'Heart',
                  featured: false,
                },
              ],
            },
          ],
        },
        {
          title: 'Startseite',
          layout: [
            {
              blockType: 'hero',
              heading: 'Mayra Ostheimer – Senior Full Stack Entwicklerin',
              subheading:
                'Ich baue skalierbare Architekturen, keine Wegwerf-Prototypen. State-of-the-Art Web-Engineering, tiefes Verständnis für Legacy und kompromisslose Performance.',
              showStackBadge: true,
              ctaLabel: 'Tech-Stack ansehen',
              ctaLink: '/de/tech-stack',
              ctaLabel2: 'Track Record prüfen',
              ctaLink2: '/de/track-record',
            },
            {
              blockType: 'statusBlock',
              badgeLabel: 'Aktuell',
              title: 'Ich suche keinen Job – aber ich höre zu.',
              description:
                'Aktuell fokussiere ich mich voll auf meine Rolle als Senior Lead bei valantic DXA. Ich bin nicht auf Jobsuche, halte mein Netzwerk für Diskussionen über moderne JS-Architekturen, echte KI-Integration vs. blindes VibeCoding oder komplexe Smart-Home-Hacks aber immer offen.',
              networkTopics: [
                { topic: 'Moderne JS-Architekturen' },
                { topic: 'KI-Integration (Vercel SDK)' },
                { topic: 'DevOps & CI/CD Pipelines' },
                { topic: 'Performance Engineering' },
                { topic: 'Technical Leadership' },
              ],
            },
            {
              blockType: 'bentoGrid',
              heading: 'Was wirklich zählt.',
              items: [
                {
                  highlight: 'Millionen Requests. Live-Daten.',
                  title: 'Engineering & Impact',
                  description:
                    'ZDF 2025 Relaunch: Latenz stirbt nicht durch Zufall. Sie stirbt durch Strategie. Granulare Cloudflare-Caching-Layer, separierte Datenquellen und brutale Mess-Disziplin.',
                  ctaLabel: 'Deep Dive Engineering',
                  ctaLink: '/de/engineering',
                  iconName: 'Zap',
                  featured: true,
                },
                {
                  highlight: 'Hebelwirkung. Kein Autopilot.',
                  title: 'AI & Vibe Coding',
                  description:
                    'Chat-Software mit Vercel AI SDK und diffy. Coding mit Antigravity & Claude Code. Warum echte Architektur-Grundlagen jetzt wichtiger sind denn je.',
                  ctaLabel: 'Meine Haltung zu KI',
                  ctaLink: '/de/ai-vibe-coding',
                  iconName: 'Bot',
                  featured: false,
                },
                {
                  highlight: 'Flache Hierarchien. Transparenz.',
                  title: 'Leadership & Mindset',
                  description:
                    'Junior-Devs zu echten Engineers zu machen ist kein Side-Quest – das ist der Job. Meine Philosophie zu Konfliktlösung, Dailys und dem Aufbrechen von Wissenssilos.',
                  ctaLabel: 'Führungsphilosophie',
                  ctaLink: '/de/leadership',
                  iconName: 'Users',
                  featured: false,
                },
                {
                  highlight: 'Node 24 · Next.js 16 · AWS',
                  title: 'Der Tech-Stack',
                  description:
                    'Aktuelle Lieblingswaffen und warum. Vom modernsten Framework über Bare-Metal-Ubuntu-Server bis zum Legacy-PHP-System, das den Umsatz sichert.',
                  ctaLabel: 'Zum kompletten Stack',
                  ctaLink: '/de/tech-stack',
                  iconName: 'Layers',
                  featured: false,
                },
                {
                  highlight: 'Kiebitzreihe. Hunde. Trash TV.',
                  title: 'Off-Screen',
                  description:
                    'Smart-Home-Hacking mit eigenen Zigbee-Adaptern, das beste Trash-TV des Landes und zwei Hunde mit sehr starken Meinungen.',
                  ctaLabel: 'Mehr über den Menschen',
                  ctaLink: '/de/off-screen',
                  iconName: 'Heart',
                  featured: false,
                },
              ],
            },
          ],
        },
      ),

      // --- 2. TECH STACK ---
      seedLocalizedPage(
        payload,
        'tech-stack',
        {
          title: 'Tech Stack',
          layout: [
            {
              blockType: 'hero',
              heading: 'The Stack.',
              subheading:
                'No skill bars. No percentage ratings. Either a technology has been in production at scale and I can debug it at 2am, or it is not on this page.',
              showStackBadge: true,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Core Architecture & Frontend',
              heading: 'The sharp end of modern web delivery.',
              body: 'State-of-the-art is not a buzzword. It is a performance and developer-experience requirement. These are the tools I reach for to build resilient systems.\n\nReact & Next.js 16 – I work deeply within the App Router paradigm. Server Components, Server Actions, streaming, and granular segment caching. I understand the React hydration model intimately and know exactly where context boundaries create performance bottlenecks.\n\nTypeScript (ES2023) – Strict mode is the baseline. I utilize complex generics, conditional types, and end-to-end type safety. If the types lie, the architecture fails.\n\nJS Performance – Memory leak profiling, list virtualization for massive DOM nodes, and Web Workers for offloading CPU-heavy tasks. Performance is a constraint applied at project zero, not a refactoring ticket added before launch.',
              keyFacts: [
                { label: 'Framework', value: 'React · Next.js 16' },
                { label: 'Language', value: 'TypeScript strict · ES2023' },
                { label: 'Styling', value: 'Tailwind CSS 4' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'The Legacy Bridge',
              heading: 'Backend & PHP pragmatism.',
              body: 'Enterprise means legacy. The correct response to a mature PHP codebase is not contempt – it is a pragmatic migration strategy like the Strangler Fig pattern.\n\nPHP & Symfony – I know the framework, the Composer ecosystem, and the event dispatcher. I can onboard quickly and modernize incrementally without disrupting existing revenue streams.\n\nPimcore – I have architected and maintained large Pimcore implementations (MDM, PIM, CMS) utilizing Twig for clients with highly complex content models.\n\nNode.js (v24) – My go-to for high-performance server-side logic where the non-blocking event loop model is genuinely advantageous for BFF (Backend-for-Frontend) layers and stream processing.',
              keyFacts: [
                { label: 'PHP', value: 'Symfony · Composer' },
                { label: 'CMS', value: 'Pimcore · Twig' },
                { label: 'Runtime', value: 'Node.js 24' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'DevOps & Hosting',
              heading: 'Code only matters when it ships.',
              body: "I don't just write code and throw it over the fence. The deployment lifecycle is a core part of the architecture, not an afterthought.\n\nI have hands-on experience managing everything from highly automated, serverless deployments on Vercel and scalable infrastructure on AWS, down to raw, manual deployments on bare-metal Ubuntu servers via SSH.\n\nCI/CD Pipelines – I build and maintain automated deployment pipelines in GitLab CI, ensuring that code goes from commit to production securely, repeatedly, and without manual friction. Whether it's configuring Nginx, wrestling with Linux permissions, or orchestrating a modern cloud deployment – I own the delivery.",
              keyFacts: [
                { label: 'Hosting', value: 'AWS · Vercel · Bare-Metal' },
                { label: 'CI/CD', value: 'GitLab CI · Automations' },
                { label: 'OS & Servers', value: 'Linux (Ubuntu) · Nginx' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Data, State & Real-time',
              heading: 'Data must flow securely, synchronously, and asynchronously.',
              body: 'APIs – GraphQL for flexible client-driven data fetching, and REST (OpenAPI) where strict resource contracts make more sense. I enforce end-to-end type safety via auto-generated clients.\n\nDatabases – SQL (MySQL, PostgreSQL) for relational integrity, NoSQL (MongoDB) for document stores. I have deep, hands-on experience managing DBT tracking databases to provide analytics teams at valantic with clean, reliable data pipelines.\n\nReal-time – WebSockets for persistent bidirectional communication. I have architected custom learning and chat software utilizing WebRTC for peer-to-peer audio and video sharing.',
              keyFacts: [
                { label: 'APIs', value: 'GraphQL · REST · OpenAPI' },
                { label: 'Databases', value: 'MySQL · Postgres · DBT' },
                { label: 'Real-time', value: 'WebSockets · WebRTC' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Infrastructure & Quality',
              heading: 'Latency is the enemy. Tests are the safety net.',
              body: 'Edge & Cache – Varnish for PHP environments, and complex Cloudflare configurations (Workers, KV) for edge caching. At ZDFheute, granular Cloudflare caching was the backbone of our latency mitigation during high-traffic news events.\n\nAccessibility (A11y) – Accessibility is an architecture standard, not a CSS afterthought. Deep expertise in delivering WCAG 2.0 and BITV AAA compliant applications. I test with actual screen readers (NVDA, VoiceOver), ensuring ARIA contracts are mathematically sound.\n\nQuality Assurance – Cypress for E2E user-path testing, Jest for logic, and visual regression tools to catch UI shifts. Code without tests is just future technical debt.',
              keyFacts: [
                { label: 'Cache', value: 'Cloudflare · Varnish' },
                { label: 'A11y', value: 'WCAG 2.0 · BITV AAA' },
                { label: 'Testing', value: 'Cypress · Jest' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'See it running.',
              text: 'This site is built on the exact stack I advocate for. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4. The source code is public.',
              buttonLabel: 'GitHub Repository',
              buttonLink: 'https://github.com/mayraost/mostheimer',
              style: 'primary',
            },
          ],
        },
        {
          title: 'Tech-Stack',
          layout: [
            {
              blockType: 'hero',
              heading: 'Der Stack.',
              subheading:
                'Keine Skill-Balken. Entweder eine Technologie war im Produktionsbetrieb im großen Maßstab und ich kann sie um 2 Uhr nachts debuggen – oder sie ist nicht hier.',
              showStackBadge: true,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Core Architecture & Frontend',
              heading: 'Die scharfe Seite moderner Web-Entwicklung.',
              body: 'State-of-the-Art ist kein Buzzword. Es ist eine harte Performance-Anforderung. Das sind die Tools, mit denen ich resiliente Systeme baue.\n\nReact & Next.js 16 – Ich arbeite tief im App Router-Paradigma. Server Components, Server Actions, Streaming und granulares Segment-Caching. Ich verstehe das Hydration-Modell im Detail und weiß genau, wo Context-Boundaries zu Performance-Flaschenhälsen werden.\n\nTypeScript (ES2023) – Strict Mode ist die absolute Basis. Ich nutze komplexe Generics und End-to-End-Typsicherheit. Wenn die Typen lügen, fällt die Architektur in sich zusammen.\n\nJS Performance – Memory-Leak-Profiling, DOM-Virtualisierung für riesige Listen und Web Worker für CPU-intensive Tasks. Performance wird bei Projektstart als Constraint festgelegt, nicht als Refactoring-Ticket kurz vor dem Launch.',
              keyFacts: [
                { label: 'Framework', value: 'React · Next.js 16' },
                { label: 'Sprache', value: 'TypeScript strict · ES2023' },
                { label: 'Styling', value: 'Tailwind CSS 4' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'The Legacy Bridge',
              heading: 'Backend & PHP-Pragmatismus.',
              body: 'Enterprise bedeutet Legacy. Die korrekte Reaktion auf eine ausgereifte PHP-Codebasis ist keine Verachtung – es ist eine pragmatische Migrationsstrategie (z.B. Strangler Fig).\n\nPHP & Symfony – Ich kenne das Framework, das Composer-Ökosystem und den Event Dispatcher. Ich kann Teams schnell onboarden und Systeme inkrementell modernisieren, ohne den laufenden Umsatz zu gefährden.\n\nPimcore – Ich habe große Pimcore-Implementierungen (MDM, PIM, CMS) mit Twig für komplexe Content-Modelle entworfen und gewartet.\n\nNode.js (v24) – Meine erste Wahl für hochperformante serverseitige Logik, wo das Non-Blocking Event-Loop-Modell für BFF-Layer (Backend-for-Frontend) echte Vorteile bietet.',
              keyFacts: [
                { label: 'PHP', value: 'Symfony · Composer' },
                { label: 'CMS', value: 'Pimcore · Twig' },
                { label: 'Runtime', value: 'Node.js 24' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'DevOps & Hosting',
              heading: 'Code zählt erst, wenn er shippt.',
              body: 'Ich schreibe nicht einfach nur Code, um ihn dann über den Zaun zu werfen. Der Deployment-Lebenszyklus ist Teil der Architektur, kein lästiger Nachgedanke.\n\nIch habe Hands-on-Erfahrung mit allem – von vollautomatisierten Serverless-Deployments auf Vercel und skalierbarer Infrastruktur auf AWS bis hin zu manuellen Deployments auf nackten Linux-Ubuntu-Servern via SSH.\n\nCI/CD Pipelines – Ich baue und pflege automatisierte Pipelines in GitLab CI, um sicherzustellen, dass Code sicher, wiederholbar und ohne manuelle Reibungsverluste in die Produktion gelangt. Ob Nginx-Konfiguration, Linux-Rechteverwaltung oder Cloud-Orchestrierung: Ich übernehme das Delivery.',
              keyFacts: [
                { label: 'Hosting', value: 'AWS · Vercel · Bare-Metal' },
                { label: 'CI/CD', value: 'GitLab CI · Pipelines' },
                { label: 'OS & Server', value: 'Linux (Ubuntu) · Nginx' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Daten, State & Echtzeit',
              heading: 'Daten müssen sicher, synchron und asynchron fließen.',
              body: 'APIs – GraphQL für flexibles, client-getriebenes Data-Fetching und REST (OpenAPI), wo strikte Ressourcen-Verträge mehr Sinn machen. Typsicherheit wird über generierte Clients vom Compiler erzwungen.\n\nDatenbanken – SQL (MySQL, PostgreSQL) für relationale Integrität, NoSQL (MongoDB) für Dokumentenspeicher. Ich habe tiefe, praktische Erfahrung in der Verwaltung von DBT-Tracking-Datenbanken, um Analytics-Teams bei valantic saubere Datenpipelines zu liefern.\n\nEchtzeit – WebSockets für persistente Kommunikation. Ich habe interaktive Lern- und Chat-Software entwickelt, die WebRTC für natives Peer-to-Peer Audio- und Video-Sharing nutzt.',
              keyFacts: [
                { label: 'APIs', value: 'GraphQL · REST · OpenAPI' },
                { label: 'Datenbanken', value: 'MySQL · Postgres · DBT' },
                { label: 'Echtzeit', value: 'WebSockets · WebRTC' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Infrastruktur & Qualität',
              heading: 'Latenz ist der Feind. Tests sind das Sicherheitsnetz.',
              body: 'Edge & Cache – Varnish für PHP-Umgebungen und komplexe Cloudflare-Setups (Workers, KV) für Edge-Caching. Beim ZDFheute-Relaunch war Cloudflare das Rückgrat unserer Latenz-Minimierung bei massiven News-Spikes.\n\nAccessibility (A11y) – Barrierefreiheit ist ein strikter Architekturstandard. Tiefe Expertise in der Umsetzung von WCAG 2.0 und BITV AAA Vorgaben. Ich teste nativ mit Screenreadern (NVDA, VoiceOver) und sorge dafür, dass ARIA-Kontrakte logisch wasserdicht sind.\n\nQuality Assurance – Cypress für e2e-Tests, Jest für Logik und Visual Regression, um UI-Shifts abzufangen. Code ohne Tests ist schlichtweg zukünftiger Tech-Debt.',
              keyFacts: [
                { label: 'Cache', value: 'Cloudflare · Varnish' },
                { label: 'A11y', value: 'WCAG 2.0 · BITV AAA' },
                { label: 'Testing', value: 'Cypress · Jest' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Im Einsatz sehen.',
              text: 'Diese Seite läuft exakt auf dem Stack, für den ich einstehe. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4. Der Code ist öffentlich.',
              buttonLabel: 'GitHub Repository',
              buttonLink: 'https://github.com/mayraost/mostheimer',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 3. TRACK RECORD ---
      seedLocalizedPage(
        payload,
        'track-record',
        {
          title: 'Track Record',
          layout: [
            {
              blockType: 'hero',
              heading: 'Track Record.',
              subheading:
                'This is not a CV. It is an honest account of the contexts where I carried real architectural and team responsibility.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Aug 2024 – Present',
              heading: 'valantic DXA – Senior Full Stack Engineer & Team Manager',
              body: "Leading a cross-functional engineering team. Key enterprise projects include Hörzu, BORA, and standalone module leadership for the Allianz portal. Additionally, I am primarily responsible for the DBT tracking databases, ensuring analytics teams receive untampered, highly structured data.\n\nMy dual role means I plan sprints, eliminate blockers, and clear internal conflicts, all while staying deeply hands-on in the codebase. I don't manage from an ivory tower; I review the PRs.",
              keyFacts: [
                { label: 'Role', value: 'Senior FSE · Team Manager' },
                { label: 'Clients', value: 'Hörzu · BORA · Allianz' },
                { label: 'Data', value: 'DBT Tracking Owner' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Aug 2023 – Jul 2024',
              heading: 'Lehnert & Wieners / New Digitals – SaaS from Zero',
              body: 'Took full project lead and technical implementation ownership of a new SaaS product: Aduardo. Building a CRM and marketing automation platform from scratch requires rigid architectural decisions (Next.js, GraphQL, NestJS) that must scale and survive long after the initial rollout phase.',
              keyFacts: [
                { label: 'Product', value: 'Aduardo SaaS' },
                { label: 'Scope', value: 'Lead Architecture & Dev' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Dec 2018 – May 2023',
              heading: 'FFW Germany (formerly Cellular) – The Enterprise Proof',
              body: 'Four and a half years surviving and thriving in high-profile enterprise environments. Promoted to Senior Level in 2020 based on output, not tenure.\n\nAnchor Project: ZDF 2025 Relaunch (ZDFheute). Migrated a massive legacy monolith to a highly performant Next.js frontend with a GraphQL BFF. Handled millions of daily users, implementing surgical caching strategies for breaking news live-tickers.\nOther high-pressure transactional clients included TUI Cruises, TV Spielfilm, and Budni. I also spearheaded the development of the internal React-based CMS "Cotype".',
              keyFacts: [
                { label: 'Anchor project', value: 'ZDF / ZDFheute Relaunch' },
                { label: 'Clients', value: 'TUI · TV Spielfilm · Budni' },
                { label: 'Internal Tool', value: 'Cotype CMS' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: '2012 – 2018',
              heading: 'The Long Way Around Was the Right Way.',
              body: '2012–2014: University of Hamburg (Software-System-Entwicklung). I dropped out. The purely theoretical approach and gray lecture halls actively killed my passion for writing code.\n\n2014: A necessary hard reset. Traveled to Costa Rica, worked in a Rescue Center with sloths and rescue dogs. Re-calibrated my mindset: I needed to build real things with my hands, not theorize about them.\n\n2016–2018: Apprenticeship as an IT Specialist at Satzmedia. Thrown straight into real client work. Graduated with a final grade of 1.0 (94/100). The ultimate proof that the right, practical environment changes absolutely everything.',
              keyFacts: [
                { label: 'Uni Hamburg', value: 'Dropped out (too theoretical)' },
                { label: 'Costa Rica', value: 'Rescue Center Reset' },
                { label: 'Satzmedia', value: 'Apprenticeship, Grade 1.0' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'How I lead teams.',
              text: 'Discover my approach to flat hierarchies and transparent conflict resolution.',
              buttonLabel: 'Read Leadership Philosophy',
              buttonLink: '/en/leadership',
              style: 'primary',
            },
          ],
        },
        {
          title: 'Track Record',
          layout: [
            {
              blockType: 'hero',
              heading: 'Track Record.',
              subheading:
                'Das ist kein Lebenslauf. Es ist eine ehrliche Darstellung der Kontexte, in denen ich echte Architektur- und Teamverantwortung getragen habe.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Aug 2024 – heute',
              heading: 'valantic DXA – Senior Full Stack Entwicklerin & Teammanagerin',
              body: 'Leitung eines cross-funktionalen Teams. Zu den Enterprise-Projekten gehören Hörzu, BORA und die alleinstehende Führung von Modulen für das Allianz-Portal. Darüber hinaus bin ich hauptverantwortlich für die DBT-Tracking-Datenbanken und sorge dafür, dass Analytics-Teams saubere Daten erhalten.\n\nMeine Doppelrolle bedeutet: Ich plane Sprints, räume Blocker aus dem Weg und kläre interne Konflikte, während ich weiterhin tief im Code stecke. Ich manage nicht aus dem Elfenbeinturm; ich reviewe die PRs.',
              keyFacts: [
                { label: 'Rolle', value: 'Senior FSE · Teammanagerin' },
                { label: 'Kunden', value: 'Hörzu · BORA · Allianz' },
                { label: 'Daten', value: 'DBT Tracking Owner' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Aug 2023 – Jul 2024',
              heading: 'Lehnert & Wieners / New Digitals – SaaS von null',
              body: 'Vollständige Projektleitung und technische Umsetzung eines neuen SaaS-Produkts: Aduardo. Der Aufbau einer CRM- und Marketing-Plattform von null erfordert rigide Architekturentscheidungen (Next.js, GraphQL, NestJS), die skalieren und auch nach dem Rollout Bestand haben müssen.',
              keyFacts: [
                { label: 'Produkt', value: 'Aduardo SaaS' },
                { label: 'Scope', value: 'Lead Architecture & Dev' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Dez 2018 – Mai 2023',
              heading: 'FFW Germany (ehem. Cellular) – Der Enterprise-Beweis',
              body: 'Viereinhalb Jahre High-Profile-Projekte. 2020 zum Senior Level befördert – basierend auf Output, nicht auf abgesessener Zeit.\n\nAnker-Projekt: ZDF 2025 Relaunch (ZDFheute). Migration eines massiven Monolithen zu einem extrem performanten Next.js-Frontend mit GraphQL-BFF. Bewältigung von Millionen täglicher Nutzer durch chirurgische Caching-Strategien für Live-Ticker.\nWeitere transaktionale Kunden: TUI Cruises, TV Spielfilm, Budni. Zudem maßgebliche Entwicklung des internen React-CMS "Cotype".',
              keyFacts: [
                { label: 'Ankerprojekt', value: 'ZDF / ZDFheute Relaunch' },
                { label: 'Kunden', value: 'TUI · TV Spielfilm · Budni' },
                { label: 'Internes Tool', value: 'Cotype CMS' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: '2012 – 2018',
              heading: 'Der lange Weg war der richtige.',
              body: '2012–2014: Uni Hamburg (Software-System-Entwicklung). Ich habe abgebrochen. Der rein theoretische Ansatz und die grauen Hörsäle haben mir die Leidenschaft fürs Programmieren geraubt.\n\n2014: Ein notwendiger Hard-Reset. Reise nach Costa Rica, Arbeit in einem Rescue Center mit Faultieren und Rettungshunden. Meine Erkenntnis: Ich muss Dinge mit meinen eigenen Händen bauen, statt nur darüber zu theoretisieren.\n\n2016–2018: Ausbildung zur Fachinformatikerin bei Satzmedia. Direkt an echte Kundenprojekte gesetzt. Abschlussnote: 1,0 (94/100). Der ultimative Beweis, dass das richtige, praxisorientierte Umfeld alles verändert.',
              keyFacts: [
                { label: 'Uni Hamburg', value: 'Abgebrochen (zu theoretisch)' },
                { label: 'Costa Rica', value: 'Rescue Center Reset' },
                { label: 'Satzmedia', value: 'Ausbildung, Note 1,0' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Wie ich Teams führe.',
              text: 'Entdecke meinen Ansatz für flache Hierarchien und transparente Konfliktlösung.',
              buttonLabel: 'Führungsphilosophie lesen',
              buttonLink: '/de/leadership',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 4. LEADERSHIP ---
      seedLocalizedPage(
        payload,
        'leadership',
        {
          title: 'Leadership Philosophy',
          layout: [
            {
              blockType: 'hero',
              heading: 'Leadership.',
              subheading:
                'Flat hierarchies, radical transparency, and the obligation to build engineers – not manage headcount.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Leadership Philosophy',
              heading: 'Authority is earned by unblocking the team.',
              body: 'I believe in radically flat hierarchies. Every single person on the team – from the newest apprentice to the battle-tested senior – is a thinking professional. They are included in architectural decisions, and their input matters.\n\nMy job as a Team Manager at valantic DXA is highly social, but rooted in technical reality: I run highly efficient Dailys, structure the sprint planning, and most importantly, I identify and clear internal conflicts before they metastasize into the code base. Unresolved tension leads to bad code reviews and technical debt.',
              keyFacts: [
                { label: 'Style', value: 'Flat · Transparent · Direct' },
                { label: 'Primary Focus', value: 'Conflict & Blocker Resolution' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Mentoring',
              heading: 'Hoarding knowledge is a junior trait.',
              body: 'I actively take apprentices and juniors by the hand. But I don\'t just teach them syntax or framework APIs – those are easily Googled. I teach them the "why" behind an architecture.\n\nI want them to understand memory allocation, component boundaries, and data flow. Code reviews are my primary mentoring tool. Every PR comment is an investment in their long-term engineering capability. I train them to critically evaluate solutions, so they don\'t blindly rely on AI-generated VibeCode.',
              keyFacts: [
                { label: 'Method', value: 'PRs as Teaching Tools' },
                { label: 'Goal', value: 'Deep Architecture Understanding' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Community of Practice',
              heading: 'Progress does not happen in a silo.',
              body: 'I am the Champion in the Community of Practice for Modern JS Frameworks at my company. I regularly hold internal DEV talks, breaking down complex frontend concepts into actionable patterns.\n\nSharing knowledge company-wide ensures our tech stack doesn’t stagnate and prevents individual teams from reinventing the wheel badly.',
              keyFacts: [
                { label: 'Role', value: 'Modern JS Champion' },
                { label: 'Action', value: 'Regular Company DEV Talks' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Dive into Engineering.',
              text: 'Read my thoughts on performance trade-offs, latency mitigation, and why fundamentals matter.',
              buttonLabel: 'Read Engineering Philosophy',
              buttonLink: '/en/engineering',
              style: 'primary',
            },
          ],
        },
        {
          title: 'Führungsphilosophie',
          layout: [
            {
              blockType: 'hero',
              heading: 'Leadership.',
              subheading:
                'Flache Hierarchien, radikale Transparenz und die Pflicht, Engineers zu formen – nicht Köpfe zu verwalten.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Führungsphilosophie',
              heading: 'Autorität entsteht durch das Entblocken des Teams.',
              body: 'Ich glaube an radikal flache Hierarchien. Jede Person im Team – vom frischen Azubi bis zum erfahrenen Senior – ist ein denkender Profi. Sie werden in Architekturentscheidungen einbezogen, und ihr Input hat Gewicht.\n\nMeine Rolle als Teammanagerin bei valantic DXA ist stark sozial, aber tief im Technischen verwurzelt: Ich leite extrem effiziente Dailys, strukturiere das Sprint-Planning und vor allem erkenne und kläre ich interne Konflikte, bevor sie in die Codebasis metastasieren. Ungelöste Spannungen führen zu schlechten Code-Reviews und Technical Debt.',
              keyFacts: [
                { label: 'Stil', value: 'Flach · Transparent · Direkt' },
                { label: 'Primärer Fokus', value: 'Konflikt- & Blockerlösung' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Mentoring',
              heading: 'Wissen zu horten, ist eine Junior-Eigenschaft.',
              body: 'Ich nehme Azubis und Juniors aktiv an die Hand. Aber ich bringe ihnen nicht nur Syntax oder Framework-APIs bei – das kann man googeln. Ich bringe ihnen das "Warum" hinter einer Architektur bei.\n\nIch will, dass sie Memory-Allokation, Component-Boundaries und Datenfluss verstehen. Code-Reviews sind mein primäres Mentoring-Tool. Jeder PR-Kommentar ist ein Investment in ihre langfristige Engineering-Fähigkeit. Ich trainiere sie darin, Lösungen kritisch zu hinterfragen, damit sie sich nicht blind auf KI-generierten VibeCode verlassen.',
              keyFacts: [
                { label: 'Methode', value: 'PRs als Lehrmittel' },
                { label: 'Ziel', value: 'Tiefes Architekturverständnis' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Community of Practice',
              heading: 'Fortschritt passiert nicht im Silo.',
              body: 'Ich bin Champion in der Community of Practice für Modern JS Frameworks in meiner Firma. Ich halte regelmäßig interne DEV-Vorträge und breche komplexe Frontend-Konzepte in anwendbare Patterns herunter.\n\nWissen unternehmensweit zu teilen, stellt sicher, dass unser Tech-Stack nicht stagniert und verhindert, dass einzelne Teams das Rad schlecht neu erfinden.',
              keyFacts: [
                { label: 'Rolle', value: 'Modern JS Champion' },
                { label: 'Aktion', value: 'Regelmäßige DEV-Vorträge' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Tiefer ins Engineering.',
              text: 'Lies meine Gedanken zu Performance-Trade-offs, Latenz-Minimierung und Grundlagen.',
              buttonLabel: 'Engineering lesen',
              buttonLink: '/de/engineering',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 5. ENGINEERING ---
      seedLocalizedPage(
        payload,
        'engineering',
        {
          title: 'Engineering',
          layout: [
            {
              blockType: 'hero',
              heading: 'Engineering.',
              subheading:
                'Architecture decisions, strict performance trade-offs, and building highly resilient frontend systems.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Case Study',
              heading: 'ZDFheute: Millions of requests, zero tolerance for latency.',
              body: 'At ZDFheute, the challenge was immense: deliver breaking news to millions simultaneously without the origin servers melting down. We architected the frontend with Next.js and utilized Cloudflare as a highly aggressive edge caching layer.\n\nThe real trick was the granular separation of data sources. Static editorial content was heavily cached, while urgent live-ticker data bypassed the primary cache via a separate pipeline. We kept DOM responses surgically small to prevent React hydration bottlenecks. This allowed breaking news to punch through instantly while the rest of the app remained heavily protected.',
              keyFacts: [
                { label: 'Project', value: 'ZDFheute Relaunch' },
                { label: 'Strategy', value: 'Granular Data Isolation' },
                { label: 'Architecture', value: 'Next.js · Cloudflare Edge' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Deep Dive',
              heading: 'Accessibility is a rigid architecture decision, not CSS.',
              body: 'Through the ZDF project and other public-sector work, I developed an uncompromising stance on accessibility. A green Lighthouse score is a delusion. I look much deeper than the classic focus state.\n\nI design components with strict ARIA contracts from the ground up and navigate my builds natively using Screenreaders (NVDA, VoiceOver) to feel the actual UX. For me, WCAG 2.0 and BITV AAA compliance are non-negotiable architectural standards, not post-launch chores.',
              keyFacts: [
                { label: 'Standards', value: 'WCAG 2.0 · BITV AAA' },
                { label: 'Testing', value: 'Native Screenreader Usage' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Beyond the code.',
              text: 'Who is the person behind the architecture? Explore my life off-screen.',
              buttonLabel: 'About the human',
              buttonLink: '/en/off-screen',
              style: 'primary',
            },
          ],
        },
        {
          title: 'Engineering',
          layout: [
            {
              blockType: 'hero',
              heading: 'Engineering.',
              subheading:
                'Architekturentscheidungen, strikte Performance-Trade-offs und der Bau hochgradig resilienter Frontend-Systeme.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Case Study',
              heading: 'ZDFheute: Millionen Requests, null Toleranz für Latenz.',
              body: 'Bei ZDFheute war die Herausforderung enorm: Breaking News zeitgleich an Millionen auszuliefern, ohne dass die Origin-Server einknicken. Wir haben das Frontend mit Next.js konzipiert und Cloudflare als massiven Edge-Caching-Layer genutzt.\n\nDer eigentliche Clou war die granulare Trennung der Datenquellen. Statische redaktionelle Inhalte wurden extrem hart gecacht, während dringende Live-Ticker-Daten über eine separate Pipeline den primären Cache umgingen. Wir hielten die DOM-Responses chirurgisch klein, um React-Hydration-Flaschenhälse zu vermeiden. So konnten Eilmeldungen sofort durchschlagen, während der Rest der App extrem stabil lief.',
              keyFacts: [
                { label: 'Projekt', value: 'ZDFheute Relaunch' },
                { label: 'Strategie', value: 'Granulare Daten-Isolation' },
                { label: 'Architektur', value: 'Next.js · Cloudflare Edge' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Deep Dive',
              heading: 'Barrierefreiheit ist harte Architektur, kein CSS.',
              body: 'Durch das ZDF-Projekt und andere Arbeiten im öffentlichen Sektor habe ich eine kompromisslose Haltung zur Barrierefreiheit entwickelt. Ein grüner Lighthouse-Score ist reine Illusion. Ich schaue wesentlich tiefer als auf den klassischen Focus-State.\n\nIch entwerfe Komponenten von Grund auf mit strikten ARIA-Kontrakten und navigiere meine Builds nativ mit Screenreadern (NVDA, VoiceOver), um die echte UX zu spüren. Für mich sind WCAG 2.0 und BITV AAA keine lästigen Aufgaben nach dem Launch, sondern nicht verhandelbare Architekturstandards.',
              keyFacts: [
                { label: 'Standards', value: 'WCAG 2.0 · BITV AAA' },
                { label: 'Testing', value: 'Nutzung echter Screenreader' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Hinter dem Code.',
              text: 'Wer ist die Person hinter der Architektur? Entdecke mein Leben off-screen.',
              buttonLabel: 'Zum Off-Screen',
              buttonLink: '/de/off-screen',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 6. OFF-SCREEN & ABOUT ---
      seedLocalizedPage(
        payload,
        'off-screen',
        {
          title: 'Off-Screen',
          layout: [
            {
              blockType: 'hero',
              heading: 'Off-Screen.',
              subheading:
                "I don't live for the code. I live off it. When the laptop closes, clean logic ends.",
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'The Contrast',
              heading: 'There is no API for muddy dog paws.',
              body: "My daily business consists of millisecond optimization, enterprise architecture, and abstract data streams. But my private life is the exact opposite: unapologetic, grounded, and wonderfully chaotic.\n\nIn 2024, my wife Lisa and I intentionally turned our backs on the noise of Hamburg. The move to the countryside in Kiebitzreihe wasn't a retreat, it was a massive upgrade. Better focus, zero city noise, and the perfect environment for our pack.\n\nSpeaking of the pack: Mila, our Ratonero Bodeguero (born ~2010), has been running the household since 2020. She's the senior architect of the family. Nele, a Greek street dog who joined us in the summer of 2025, brings the unpredictable chaos engineering. You can't spend 8 hours deep in Next.js caching layers without a hard reset afterward.",
              keyFacts: [
                { label: 'Base', value: 'Kiebitzreihe, Schleswig-Holstein' },
                { label: 'Family', value: 'Wife Lisa, Dogs Mila & Nele' },
                { label: 'Philosophy', value: 'Work hard, disconnect harder' },
              ],
            },
            {
              blockType: 'featureGrid',
              heading: 'The Reality.',
              features: [
                {
                  title: 'Smart Home Hacking',
                  description:
                    'I run a highly customized Zigbee network via Home Assistant. Google Home adds an extra control layer. If cheap AliExpress modules resist, I write my own Zigbee2MQTT adapters. Everything is logic-driven and administrable via my personal Telegram bot.',
                  iconName: 'Cpu',
                },
                {
                  title: 'Trash-TV, Unironically',
                  description:
                    'After a day of complex logical architecture, I watch Reality TV on RTL+. The trashier ("Sommerhaus der Stars"), the better. It’s the ultimate cognitive reset and I make absolutely zero apologies for it.',
                  iconName: 'Tv',
                },
                {
                  title: 'The Sloth Epiphany',
                  description:
                    'After dropping out of a overly theoretical CS degree, I spent time at a Rescue Center in Costa Rica working with sloths and rescue dogs. It taught me that building real things with my hands beats gray academic theory any day.',
                  iconName: 'Plane',
                },
                {
                  title: 'Political Clarity',
                  description:
                    'I am clearly left-leaning and hold strong opinions on important social topics. However, I possess the professional maturity to strictly separate my personal views from my objective consulting.',
                  iconName: 'Shield',
                },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Back to the roots.',
              text: 'Ready to see the actual code stack that builds this?',
              buttonLabel: 'View the Tech Stack',
              buttonLink: '/en/tech-stack',
              style: 'primary',
            },
          ],
        },
        {
          title: 'Off-Screen',
          layout: [
            {
              blockType: 'hero',
              heading: 'Off-Screen.',
              subheading:
                'Ich lebe nicht für den Code. Ich lebe von ihm. Wenn der Laptop zugeht, endet die saubere Logik.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Der Kontrast',
              heading: 'Es gibt keine API für dreckige Hundepfoten.',
              body: 'Mein Berufsalltag besteht aus Millisekunden-Optimierung, Enterprise-Architektur und abstrakten Datenströmen. Mein Privatleben ist das exakte Gegenteil: geerdet, ungeschönt und wunderbar chaotisch.\n\n2024 haben meine Frau Lisa und ich dem Lärm von Hamburg ganz bewusst den Rücken gekehrt. Der Umzug aufs Land nach Kiebitzreihe war kein Rückzug, sondern ein massives Upgrade. Besserer Fokus, kein Großstadtlärm und die perfekte Umgebung für unser Rudel.\n\nApropos Rudel: Mila, unser Ratonero Bodeguero (* ca. 2010), schmeißt den Haushalt seit 2020. Sie ist quasi die Senior-Architektin der Familie. Nele, eine griechische Straßenhündin, die im Sommer 2025 dazukam, ist für das unvorhersehbare Chaos-Engineering zuständig. Man kann nicht 8 Stunden tief in Next.js-Layern stecken, ohne danach einen harten Reset zu machen.',
              keyFacts: [
                { label: 'Basis', value: 'Kiebitzreihe, Schleswig-Holstein' },
                { label: 'Familie', value: 'Frau Lisa, Hunde Mila & Nele' },
                { label: 'Philosophie', value: 'Arbeit und harter Kontrast' },
              ],
            },
            {
              blockType: 'featureGrid',
              heading: 'Die Realität.',
              features: [
                {
                  title: 'Smart Home Labor',
                  description:
                    'Ich betreibe ein stark angepasstes Zigbee-Netzwerk via Home Assistant. Google Home bietet die Voice-Ebene. Wenn AliExpress-Module bocken, schreibe ich eigene Zigbee2MQTT-Adapter. Alles administrierbar über meinen Telegram-Bot.',
                  iconName: 'Cpu',
                },
                {
                  title: 'RTL Trash-TV',
                  description:
                    'Abends schalte ich am liebsten bei Trash-TV auf RTL+ ab. Desto trashiger ("Sommerhaus der Stars"), umso besser. Es ist der perfekte, anspruchslose Gegenpol zur analytischen Tech-Welt und ich stehe zu 100% dazu.',
                  iconName: 'Tv',
                },
                {
                  title: 'Die Faultier-Epiphanie',
                  description:
                    'Nach meinem theorie-lastigen Studienabbruch war ich in einem Rescue Center in Costa Rica und habe mit Faultieren und Rettungshunden gearbeitet. Dort habe ich gelernt, dass echtes Machen jede graue Theorie schlägt.',
                  iconName: 'Plane',
                },
                {
                  title: 'Politische Klarheit',
                  description:
                    'Ich bin links eingestellt und beziehe zu gesellschaftlichen Themen stark Position. Ich besitze jedoch die professionelle Reife, meine persönlichen Ansichten strikt von meiner objektiven Beratung zu trennen.',
                  iconName: 'Shield',
                },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Zurück zu den Wurzeln.',
              text: 'Bereit, den echten Code-Stack zu sehen, der das hier antreibt?',
              buttonLabel: 'Tech-Stack ansehen',
              buttonLink: '/de/tech-stack',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 7. AI & VIBE CODING ---
      seedLocalizedPage(
        payload,
        'ai-vibe-coding',
        {
          title: 'AI & Vibe Coding',
          layout: [
            {
              blockType: 'hero',
              heading: 'AI & Vibe Coding.',
              subheading:
                'AI is a force multiplier for engineers, not an autopilot for ignorance. VibeCoding without architectural knowledge is just tech debt at lightspeed.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'The Reality',
              heading: 'The VibeCoding Trap.',
              body: "Writing code with conversational prompts is deceptively easy. Debugging a hallucinated architecture at 2 AM under heavy production load is not. The industry is currently flooded with developers who can prompt a React component but have absolutely no idea how the DOM works, what the event loop is, or why their application leaks memory.\n\nThe LLM doesn't understand your overarching system architecture. You do. If you don't fundamentally understand the logic of the code you are committing, you do not own it. And if you don't own it, you are a walking liability to the codebase.",
              keyFacts: [
                { label: 'Rule #1', value: 'Understand the output' },
                { label: 'Risk', value: 'Accelerated Tech Debt' },
                { label: 'Requirement', value: 'Deep Engineering Fundamentals' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'My Stack',
              heading: 'How I actually utilize AI.',
              body: 'I am not an AI skeptic. I build with it actively. I have successfully implemented production-ready chat software utilizing the Vercel AI SDK and diffy. I understand how to bridge LLMs with custom frontends.\n\nWhen it comes to my own daily development velocity, my IDE setup relies heavily on Antigravity and Claude Code. I use these tools to automate tedious boilerplate and accelerate architectural decisions I already know how to make. AI is an incredibly powerful tool in my belt, but it is never a substitute for my brain.',
              keyFacts: [
                { label: 'Dev Stack', value: 'Antigravity · Claude Code' },
                { label: 'Chat Integration', value: 'Vercel AI SDK · diffy' },
                { label: 'Mindset', value: 'Tool, not autopilot' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'See the foundations.',
              text: 'If you rely on AI, your underlying stack needs to be flawless. See the tools I trust.',
              buttonLabel: 'View Tech Stack',
              buttonLink: '/en/tech-stack',
              style: 'primary',
            },
          ],
        },
        {
          title: 'AI & Vibe Coding',
          layout: [
            {
              blockType: 'hero',
              heading: 'AI & Vibe Coding.',
              subheading:
                'KI ist ein Hebel für Engineers, kein Autopilot für Ignoranz. VibeCoding ohne tiefes Architekturverständnis ist einfach nur Tech-Debt in Lichtgeschwindigkeit.',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Die Realität',
              heading: 'Die VibeCoding-Falle.',
              body: 'Code per Prompt zu generieren, ist trügerisch einfach. Eine halluzinierte Architektur um 2 Uhr nachts unter Produktionslast zu debuggen, ist es nicht. Die Branche wird gerade mit Developern geflutet, die zwar eine komplexe React-Komponente prompten können, aber absolut keine Ahnung haben, wie das DOM funktioniert, was der Event-Loop ist oder warum ihre App massive Memory-Leaks hat.\n\nDas LLM versteht deine übergreifende Systemarchitektur nicht. Du tust es. Wenn du die Logik des Codes, den du committest, nicht fundamental verstehst, übernimmst du keine Ownership. Und ohne Ownership bist du ein wandelndes Risiko für die Codebasis.',
              keyFacts: [
                { label: 'Regel #1', value: 'Den Output vollständig verstehen' },
                { label: 'Risiko', value: 'Beschleunigter Tech-Debt' },
                { label: 'Voraussetzung', value: 'Tiefe Engineering-Grundlagen' },
              ],
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Mein Stack',
              heading: 'Wie ich KI wirklich nutze.',
              body: 'Ich bin keine KI-Skeptikerin. Ich baue aktiv damit. Ich habe bereits funktionsfähige, produktionsreife Chat-Software mit dem Vercel AI SDK und diffy umgesetzt. Ich weiß, wie man LLMs mit eigenen Frontends verheiratet.\n\nWenn es um meine eigene tägliche Entwicklungsgeschwindigkeit geht, verlasse ich mich in meiner IDE voll auf Antigravity und Claude Code. Ich nutze diese Tools, um nerviges Boilerplate zu automatisieren und Entscheidungen zu beschleunigen, die ich sowieso treffen kann. KI ist ein extrem mächtiges Werkzeug, aber niemals ein Ersatz für mein Gehirn.',
              keyFacts: [
                { label: 'Dev-Stack', value: 'Antigravity · Claude Code' },
                { label: 'Chat-Integration', value: 'Vercel AI SDK · diffy' },
                { label: 'Mindset', value: 'Werkzeug, kein Autopilot' },
              ],
            },
            {
              blockType: 'callToAction',
              heading: 'Die Fundamente ansehen.',
              text: 'Wer sich auf KI verlässt, muss sein Handwerk beherrschen. Hier sind die Tools, denen ich vertraue.',
              buttonLabel: 'Zum Tech-Stack',
              buttonLink: '/de/tech-stack',
              style: 'primary',
            },
          ],
        },
      ),

      // --- 8. IMPRINT ---
      seedLocalizedPage(
        payload,
        'imprint',
        {
          title: 'Imprint',
          layout: [
            {
              blockType: 'hero',
              heading: 'Imprint.',
              subheading: 'Legal Information',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Legal',
              heading: 'Provider Identification.',
              body: 'Mayra Ostheimer\nKiebitzreihe\nSchleswig-Holstein\nE-Mail: mayraostheimer@gmail.com',
              keyFacts: [],
            },
          ],
        },
        {
          title: 'Impressum',
          layout: [
            {
              blockType: 'hero',
              heading: 'Impressum.',
              subheading: 'Rechtliche Angaben',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Legal',
              heading: 'Angaben gemäß § 5 TMG.',
              body: 'Mayra Ostheimer\nKiebitzreihe\nSchleswig-Holstein\nE-Mail: mayraostheimer@gmail.com',
              keyFacts: [],
            },
          ],
        },
      ),

      // --- 9. PRIVACY ---
      seedLocalizedPage(
        payload,
        'privacy',
        {
          title: 'Data Privacy',
          layout: [
            {
              blockType: 'hero',
              heading: 'Data Privacy.',
              subheading: 'Information about data collection',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Privacy',
              heading: 'Privacy Policy.',
              body: 'This portfolio is statically generated. No tracking, no analytical cookies, no data harvesting.',
              keyFacts: [],
            },
          ],
        },
        {
          title: 'Datenschutz',
          layout: [
            {
              blockType: 'hero',
              heading: 'Datenschutz.',
              subheading: 'Informationen zur Datenerhebung',
              showStackBadge: false,
            },
            {
              blockType: 'techSection',
              sectionLabel: 'Datenschutz',
              heading: 'Datenschutzerklärung.',
              body: 'Dieses Portfolio ist statisch generiert. Kein Tracking, keine Analyse-Cookies, kein Data-Harvesting.',
              keyFacts: [],
            },
          ],
        },
      ),
    ]);

    return Response.json({
      message: 'All localized pages seeded successfully with deep architectural content!',
    });
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error occurred' },
      { status: 500 },
    );
  }
}
