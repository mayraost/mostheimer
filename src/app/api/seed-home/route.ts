import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Helper to delete a page by slug if it already exists
// ---------------------------------------------------------------------------
async function deletePage(payload: Awaited<ReturnType<typeof getPayload>>, slug: string) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
  });
  if (existing.totalDocs > 0) {
    await payload.delete({ collection: 'pages', id: existing.docs[0].id });
  }
}

export async function GET() {
  const payload = await getPayload({ config: configPromise });

  try {
    // -----------------------------------------------------------------------
    // 1. HOME PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'home');

    const home = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Home',
        slug: 'home',

        layout: [
          // --- Hero ---
          {
            blockType: 'hero',
            heading: 'Mayra Ostheimer – Senior Full Stack Engineer & Team Lead',
            subheading:
              'I build scalable architectures, not throwaway prototypes. State-of-the-art web engineering, deep legacy expertise, and zero tolerance for technical debt.',
            showStackBadge: true,
            ctaLabel: 'View Tech Stack',
            ctaLink: '/en/tech-stack',
            ctaLabel2: 'Check Track Record',
            ctaLink2: '/en/track-record',
          },
          // --- Status ---
          {
            blockType: 'statusBlock',
            badgeLabel: 'Current Status',
            title: "I'm not on the market – but I'm always listening.",
            description:
              "Right now I'm fully focused on my role as Team Manager and Senior Lead at valantic DXA. Not actively looking. But if you want to talk about modern JS architectures, accessibility at scale, or Smart Home hacking over a decent coffee – my calendar has gaps.",
            networkTopics: [
              { topic: 'Modern JS Architectures' },
              { topic: 'Accessibility' },
              { topic: 'Performance Engineering' },
              { topic: 'Smart Home Hacking' },
              { topic: 'Team Leadership' },
            ],
          },
          // --- Bento Grid ---
          {
            blockType: 'bentoGrid',
            heading: 'What actually matters.',
            items: [
              {
                highlight: 'Millions of requests. Live data.',
                title: 'Engineering & Impact',
                description:
                  'ZDF 2025 relaunch: latency does not die by accident. It dies by strategy. Granular caching layers, selective hydration, and brutal measurement discipline.',
                ctaLabel: 'Case Studies',
                ctaLink: '/en/track-record',
                iconName: 'Zap',
                featured: true,
              },
              {
                highlight: 'Flat hierarchies. Radical transparency.',
                title: 'Leadership & Mindset',
                description:
                  "Growing junior devs into engineers is not a side quest – it's the job. My philosophy on code reviews, ownership, and why I hate knowledge silos.",
                ctaLabel: 'My Leadership Philosophy',
                ctaLink: '/en/leadership',
                iconName: 'Users',
                featured: false,
              },
              {
                highlight: 'Next.js · TypeScript · Cloudflare · PHP',
                title: 'The Tech Stack',
                description:
                  'Current weapons of choice and why. Including the legacy systems that still earn money and deserve respect.',
                ctaLabel: 'Full Stack',
                ctaLink: '/en/tech-stack',
                iconName: 'Layers',
                featured: false,
              },
              {
                highlight: 'Mila & Nele. Schleswig-Holstein.',
                title: 'Off-Screen',
                description:
                  'Smart Home hardware hacking, the finest Trash-TV Germany produces, and two dogs with very strong opinions.',
                ctaLabel: 'The human behind the code',
                ctaLink: '/en/about',
                iconName: 'Heart',
                featured: false,
              },
            ],
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'de',
      data: {
        title: 'Startseite',
        layout: [
          // --- Hero ---
          {
            blockType: 'hero',
            heading: 'Mayra Ostheimer – Senior Full Stack Entwicklerin & Teammanagerin',
            subheading:
              'Ich baue skalierbare Architekturen, keine Wegwerf-Prototypen. State-of-the-Art Web-Engineering, tiefes Verständnis für Legacy und kompromisslose Performance.',
            showStackBadge: true,
            ctaLabel: 'Tech-Stack ansehen',
            ctaLink: '/de/tech-stack',
            ctaLabel2: 'Track Record prüfen',
            ctaLink2: '/de/track-record',
          },
          // --- Status ---
          {
            blockType: 'statusBlock',
            badgeLabel: 'Aktuell',
            title: 'Ich suche keinen Job – aber ich höre zu.',
            description:
              'Aktuell fokussiere ich mich voll auf meine Rolle als Teammanagerin und Senior Lead bei valantic DXA. Ich bin nicht auf Jobsuche, halte mein Netzwerk für Diskussionen über moderne JS-Architekturen, Accessibility oder Smart-Home-Hacks aber immer offen.',
            networkTopics: [
              { topic: 'Moderne JS-Architekturen' },
              { topic: 'Accessibility' },
              { topic: 'Performance Engineering' },
              { topic: 'Smart-Home-Hacking' },
              { topic: 'Team Leadership' },
            ],
          },
          // --- Bento Grid ---
          {
            blockType: 'bentoGrid',
            heading: 'Was wirklich zählt.',
            items: [
              {
                highlight: 'Millionen Requests. Live-Daten.',
                title: 'Engineering & Impact',
                description:
                  'ZDF 2025 Relaunch: Latenz stirbt nicht durch Zufall. Sie stirbt durch Strategie. Granulare Caching-Layer, selektive Hydration und brutale Mess-Disziplin.',
                ctaLabel: 'Zu den Case Studies',
                ctaLink: '/de/track-record',
                iconName: 'Zap',
                featured: true,
              },
              {
                highlight: 'Flache Hierarchien. Radikale Transparenz.',
                title: 'Leadership & Mindset',
                description:
                  'Junior-Devs zu echten Engineers zu machen ist kein Side-Quest – das ist der Job. Meine Philosophie zu Code Reviews, Ownership und warum ich Wissenssilos hasse.',
                ctaLabel: 'Meine Führungsphilosophie',
                ctaLink: '/de/leadership',
                iconName: 'Users',
                featured: false,
              },
              {
                highlight: 'Next.js · TypeScript · Cloudflare · PHP',
                title: 'Der Tech-Stack',
                description:
                  'Aktuelle Lieblingswaffen und warum. Inklusive der Legacy-Systeme, die noch Geld verdienen und Respekt verdienen.',
                ctaLabel: 'Zum kompletten Stack',
                ctaLink: '/de/tech-stack',
                iconName: 'Layers',
                featured: false,
              },
              {
                highlight: 'Mila & Nele. Schleswig-Holstein.',
                title: 'Off-Screen',
                description:
                  'Smart-Home-Hardware-Hacking, das beste Trash-TV des Landes und zwei Hunde mit sehr starken Meinungen.',
                ctaLabel: 'Mehr über den Menschen hinter dem Code',
                ctaLink: '/de/about',
                iconName: 'Heart',
                featured: false,
              },
            ],
          },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // 2. TECH-STACK PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'tech-stack');

    const techStack = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Tech Stack',
        slug: 'tech-stack',

        layout: [
          {
            blockType: 'hero',
            heading: 'The Stack.',
            subheading:
              'No skill bars. No percentage ratings. Either a technology has been in production at scale and I can debug it at 2am, or it is not on this page.',
            showStackBadge: true,
          },
          // --- Intro: End of skill bars ---
          {
            blockType: 'techSection',
            sectionLabel: 'Philosophy',
            heading: 'Skill bars are junior thinking.',
            body: `A progress bar on a portfolio tells you nothing. "JavaScript: 80%" – 80% of what? The spec? The ecosystem? The footguns? Percentage ratings are a UX pattern for people who have never had to explain a production incident to an angry client.

Here is the actual measure: everything on this page has been deployed to real systems serving real users or running critical B2B processes. I own it when it breaks. I have debugged it under load. I know the failure modes.

If a technology is not on this list, one of two things is true: I have not used it enough to take responsibility for it in production, or it does not deserve to be there. Both are honest answers.`,
            keyFacts: [
              { label: 'Principle', value: 'Production or nothing' },
              { label: 'Scope', value: 'Enterprise & high-traffic' },
              { label: 'Attitude', value: 'Own the failure modes' },
            ],
          },
          // --- Section 1: Core / Frontend ---
          {
            blockType: 'techSection',
            sectionLabel: 'Core Architecture & Frontend',
            heading: 'The sharp end.',
            body: `State-of-the-art is not a buzzword. It is a performance and developer-experience requirement. These are the tools I reach for first in 2025.

React & Next.js 14/16 – I work in the App Router, not around it. Server Components, Actions, streaming, granular caching per segment. I understand the hydration model and where it will betray you if you are not careful. Hooks, composition patterns, avoiding the stale closure trap – the fundamentals that junior tutorials skip.

TypeScript (ES6 through ES2023) – strict mode is not optional. Complex generics, conditional types, mapped types, template literal types. I use the type system as a design tool, not as a checkbox. If the types lie, the code lies.

JS Performance – memory leak identification, virtualization for large lists, Web Workers for CPU-heavy tasks, avoiding layout thrash. Performance is not a final pass, it is a constraint from the start.

Progressive Web Apps & Hybrid – Ionic and Capacitor for cross-platform delivery when a native shell is required. Not always the right answer; often the pragmatic one.`,
            keyFacts: [
              { label: 'Framework', value: 'React · Next.js 14/16' },
              { label: 'Language', value: 'TypeScript strict · ES2023' },
              { label: 'Cross-platform', value: 'Ionic · Capacitor' },
              { label: 'Performance', value: 'Workers · Virtualization' },
            ],
          },
          // --- Section 2: Legacy Bridge ---
          {
            blockType: 'techSection',
            sectionLabel: 'The Legacy Bridge',
            heading: 'Backend & PHP pragmatism. Because the real world is not a greenfield.',
            body: `Enterprise means legacy. Anyone who tells you otherwise has not worked at enterprise scale. The correct response to a mature PHP codebase is not contempt – it is a migration strategy and the patience to execute it without killing the business in the process.

PHP & Symfony – I know the framework, the Composer ecosystem, the event dispatcher, the DI container. I can onboard, extend, and incrementally modernize without a big-bang rewrite that gets cancelled six months in.

Pimcore – CMS, DAM, MDM, eCommerce. I have built and maintained Pimcore implementations for clients with complex content models. Twig, Mustache, Smarty – the templating layer is not glamorous, and it works.

Node.js – for high-performance server-side JS where the event loop model is genuinely advantageous: real-time services, BFF layers, stream processing. Not as a replacement for everything.`,
            keyFacts: [
              { label: 'PHP', value: 'Symfony · Composer' },
              { label: 'CMS', value: 'Pimcore · Twig · Smarty' },
              { label: 'Runtime', value: 'Node.js' },
              { label: 'Strategy', value: 'Strangler Fig · Incremental' },
            ],
          },
          // --- Section 3: Data / State / Communication ---
          {
            blockType: 'techSection',
            sectionLabel: 'Data, State & Communication',
            heading: 'Data must flow – synchronous, asynchronous, and in real time.',
            body: `APIs – GraphQL for complex, interconnected data models where the client drives the query shape. REST with OpenAPI for the 80% of cases where GraphQL's overhead is not justified. End-to-end type safety via generated clients so the contract between frontend and backend is enforced by the compiler, not by hope.

Databases – SQL (MySQL, PostgreSQL) with a genuine understanding of indexes, query planning, and transaction isolation. ORMs as a tool, not as an abstraction that hides what the database is actually doing. NoSQL (MongoDB) for document-oriented use cases where it is genuinely the right fit. DBT for data transformation pipelines and analytics tracking.

Real-time – WebSockets for persistent bidirectional communication. WebRTC for peer-to-peer audio and video where latency is a product requirement, not a nice-to-have.`,
            keyFacts: [
              { label: 'APIs', value: 'GraphQL · REST · OpenAPI' },
              { label: 'SQL', value: 'MySQL · PostgreSQL · ORMs' },
              { label: 'NoSQL', value: 'MongoDB · DBT' },
              { label: 'Real-time', value: 'WebSockets · WebRTC' },
            ],
          },
          // --- Section 4: Infrastructure / DevOps ---
          {
            blockType: 'techSection',
            sectionLabel: 'Infrastructure, Performance & DevOps',
            heading: 'Code is worthless if it is not delivered performantly. Latency is the enemy.',
            body: `Caching – Varnish for reverse proxy caching in PHP environments. Cloudflare for edge caching, Workers, KV, R2, and the full programmable layer. The difference between a CDN and a programmable edge is the difference between a cache and an architecture decision.

CI/CD – Jenkins, GitLab CI, GitHub Actions. Pipeline design, parallelization, caching dependencies, deployment strategies (blue-green, canary). Automation is not about speed alone; it is about making the correct thing the easy thing.

Hosting & protocols – Vercel for Next.js deployments where the platform aligns with the architecture. Linux server management, Apache and Nginx configuration, SSL/TLS, HTTP headers (security headers, cache-control, CORS). The protocol layer is not someone else's problem.`,
            keyFacts: [
              { label: 'Edge', value: 'Cloudflare Workers · KV · R2' },
              { label: 'Cache', value: 'Varnish · Cloudflare' },
              { label: 'CI/CD', value: 'Jenkins · GitLab · GitHub Actions' },
              { label: 'Hosting', value: 'Vercel · Linux · Nginx' },
            ],
          },
          // --- Section 5: QA & Accessibility ---
          {
            blockType: 'techSection',
            sectionLabel: 'Quality Assurance & Accessibility',
            heading: "Code without tests is tomorrow's legacy code. Accessibility is not optional.",
            body: `Testing – Cypress for end-to-end test coverage of critical user paths. Jest for unit tests at the component and logic level. Visual regression testing to catch unintended UI changes before users do. Test coverage is a discipline, not a metric to game.

Accessibility is an architecture standard, not a last-mile checklist. I have delivered WCAG 2.0 AA and BITV AAA compliant systems for public-sector clients with legal obligations around non-compliance. Screen reader testing with NVDA, VoiceOver, and JAWS is part of the delivery process, not a QA afterthought.

The practical implication: accessible components are designed from the DOM up. Keyboard navigation, focus management, semantic structure, and ARIA contracts are established at component design time. A retrofitted accessibility pass always costs more and delivers less than getting it right from the start.`,
            keyFacts: [
              { label: 'E2E', value: 'Cypress' },
              { label: 'Unit', value: 'Jest' },
              { label: 'Visual', value: 'Regression testing' },
              { label: 'A11y', value: 'WCAG 2.0 AA · BITV AAA' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'See it running.',
            text: 'This site is built on the stack I stand behind. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4. Source code is public. Not for show – because open code is the only honest proof of work.',
            buttonLabel: 'GitHub Repository',
            buttonLink: 'https://github.com/mayraost/mostheimer',
            style: 'primary',
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: techStack.id,
      locale: 'de',
      data: {
        title: 'Tech-Stack',
        layout: [
          {
            blockType: 'hero',
            heading: 'Der Stack.',
            subheading:
              'Keine Skill-Balken. Keine Prozentangaben. Entweder eine Technologie war im Produktionsbetrieb im großen Maßstab und ich kann sie um 2 Uhr nachts debuggen – oder sie ist nicht auf dieser Seite.',
            showStackBadge: true,
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Philosophie',
            heading: 'Skill-Balken sind Junior-Denken.',
            body: `Ein Progress-Bar auf einem Portfolio sagt nichts aus. "JavaScript: 80%" – 80% von was? Der Spec? Dem Ökosystem? Den Footguns? Prozentwertungen sind ein UX-Pattern für Menschen, die noch nie einem wütenden Kunden einen Produktionsvorfall erklären mussten.

Das ist die echte Messgröße: Alles auf dieser Seite wurde auf echten Systemen für echte Nutzer oder kritische B2B-Prozesse eingesetzt. Ich besitze es, wenn es bricht. Ich habe es unter Last debuggt. Ich kenne die Failure-Modes.

Wenn eine Technologie nicht auf dieser Liste steht, trifft eines von zwei Dingen zu: Ich habe sie nicht genug eingesetzt, um die Verantwortung dafür in Produktion zu übernehmen – oder sie verdient es nicht, hier zu stehen. Beide Antworten sind ehrlich.`,
            keyFacts: [
              { label: 'Prinzip', value: 'Produktion oder gar nicht' },
              { label: 'Scope', value: 'Enterprise & High-Traffic' },
              { label: 'Haltung', value: 'Failure-Modes kennen' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Core Architecture & Frontend',
            heading: 'Die scharfe Seite.',
            body: `State-of-the-Art ist kein Buzzword. Es ist eine Performance- und Developer-Experience-Anforderung. Das sind die Tools, zu denen ich 2025 zuerst greife.

React & Next.js 14/16 – Ich arbeite im App Router, nicht um ihn herum. Server Components, Actions, Streaming, granulares Caching pro Segment. Ich verstehe das Hydration-Modell und wo es dich verrät, wenn du nicht aufpasst. Hooks, Composition-Patterns, stale-Closure-Falle vermeiden – die Grundlagen, die Junior-Tutorials überspringen.

TypeScript (ES6 bis ES2023) – Strict Mode ist nicht optional. Komplexe Generics, Conditional Types, Mapped Types, Template-Literal-Types. Ich nutze das Typsystem als Designwerkzeug, nicht als Checkbox. Wenn die Typen lügen, lügt der Code.

JS Performance – Memory-Leak-Identifikation, Virtualisierung für große Listen, Web Worker für CPU-intensive Tasks, Layout Thrash vermeiden. Performance ist kein finaler Durchgang, es ist eine Anforderung von Anfang an.

Progressive Web Apps & Hybrid – Ionic und Capacitor für Cross-Platform-Delivery, wenn eine native Shell benötigt wird. Nicht immer die richtige Antwort; oft die pragmatische.`,
            keyFacts: [
              { label: 'Framework', value: 'React · Next.js 14/16' },
              { label: 'Sprache', value: 'TypeScript strict · ES2023' },
              { label: 'Cross-Platform', value: 'Ionic · Capacitor' },
              { label: 'Performance', value: 'Workers · Virtualisierung' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'The Legacy Bridge',
            heading: 'Backend & PHP-Pragmatismus. Weil die echte Welt kein Greenfield ist.',
            body: `Enterprise bedeutet Legacy. Wer das Gegenteil behauptet, hat nicht auf Enterprise-Ebene gearbeitet. Die korrekte Reaktion auf eine ausgereifte PHP-Codebasis ist kein Verachtung – es ist eine Migrationsstrategie und die Geduld, sie auszuführen, ohne das Geschäft im Prozess zu zerstören.

PHP & Symfony – Ich kenne das Framework, das Composer-Ökosystem, den Event Dispatcher, den DI-Container. Ich kann onboarden, erweitern und inkrementell modernisieren – ohne einen Big-Bang-Rewrite, der sechs Monate später gecancelt wird.

Pimcore – CMS, DAM, MDM, eCommerce. Ich habe Pimcore-Implementierungen für Kunden mit komplexen Content-Modellen gebaut und gewartet. Twig, Mustache, Smarty – die Templating-Schicht ist nicht glamourös, und sie funktioniert.

Node.js – für hochperformantes serverseitiges JS, wo das Event-Loop-Modell genuinen Vorteil bietet: Echtzeit-Services, BFF-Layer, Stream-Processing. Nicht als Ersatz für alles.`,
            keyFacts: [
              { label: 'PHP', value: 'Symfony · Composer' },
              { label: 'CMS', value: 'Pimcore · Twig · Smarty' },
              { label: 'Runtime', value: 'Node.js' },
              { label: 'Strategie', value: 'Strangler Fig · Inkrementell' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Daten, State & Kommunikation',
            heading: 'Daten müssen fließen – synchron, asynchron und in Echtzeit.',
            body: `APIs – GraphQL für komplexe, vernetzte Datenmodelle, bei denen der Client die Query-Form vorgibt. REST mit OpenAPI für die 80% der Fälle, bei denen der Overhead von GraphQL nicht gerechtfertigt ist. End-to-End-Typsicherheit über generierte Clients, damit der Vertrag zwischen Frontend und Backend vom Compiler erzwungen wird, nicht durch Hoffnung.

Datenbanken – SQL (MySQL, PostgreSQL) mit echtem Verständnis von Indexen, Query-Planning und Transaktions-Isolation. ORMs als Werkzeug, nicht als Abstraktion, die versteckt, was die Datenbank tatsächlich tut. NoSQL (MongoDB) für dokumentenorientierte Anwendungsfälle. DBT für Datentransformations-Pipelines und Analytics-Tracking.

Echtzeit – WebSockets für persistente bidirektionale Kommunikation. WebRTC für Peer-to-Peer-Audio und -Video, wo Latenz eine Produktanforderung ist, kein Nice-to-have.`,
            keyFacts: [
              { label: 'APIs', value: 'GraphQL · REST · OpenAPI' },
              { label: 'SQL', value: 'MySQL · PostgreSQL · ORMs' },
              { label: 'NoSQL', value: 'MongoDB · DBT' },
              { label: 'Echtzeit', value: 'WebSockets · WebRTC' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Infrastructure, Performance & DevOps',
            heading:
              'Code ist wertlos, wenn er nicht performant ausgeliefert wird. Latenz ist der Feind.',
            body: `Caching – Varnish für Reverse-Proxy-Caching in PHP-Umgebungen. Cloudflare für Edge-Caching, Workers, KV, R2 und die vollständige programmierbare Schicht. Der Unterschied zwischen einem CDN und einem programmierbaren Edge ist der Unterschied zwischen einem Cache und einer Architekturentscheidung.

CI/CD – Jenkins, GitLab CI, GitHub Actions. Pipeline-Design, Parallelisierung, Dependency-Caching, Deployment-Strategien (Blue-Green, Canary). Automatisierung geht nicht nur um Geschwindigkeit – es geht darum, das Richtige zur einfachen Option zu machen.

Hosting & Protokolle – Vercel für Next.js-Deployments, wo die Plattform mit der Architektur übereinstimmt. Linux-Server-Management, Apache- und Nginx-Konfiguration, SSL/TLS, HTTP-Header (Security-Header, Cache-Control, CORS). Die Protokollschicht ist nicht jemand anderes Problem.`,
            keyFacts: [
              { label: 'Edge', value: 'Cloudflare Workers · KV · R2' },
              { label: 'Cache', value: 'Varnish · Cloudflare' },
              { label: 'CI/CD', value: 'Jenkins · GitLab · GitHub Actions' },
              { label: 'Hosting', value: 'Vercel · Linux · Nginx' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Quality Assurance & Accessibility',
            heading:
              'Code ohne Tests ist Legacy-Code von morgen. Barrierefreiheit ist kein Opt-in.',
            body: `Testing – Cypress für End-to-End-Testabdeckung kritischer User Paths. Jest für Unit-Tests auf Komponenten- und Logik-Ebene. Visual-Regression-Testing, um unbeabsichtigte UI-Änderungen zu erkennen, bevor es Nutzer tun. Test-Coverage ist eine Disziplin, keine Metrik zum Optimieren.

Barrierefreiheit ist ein Architekturstandard, keine Last-Mile-Checkliste. Ich habe WCAG 2.0 AA und BITV AAA konforme Systeme für Auftraggeber im öffentlichen Sektor mit gesetzlichen Verpflichtungen bei Nicht-Konformität geliefert. Screen-Reader-Tests mit NVDA, VoiceOver und JAWS sind Teil des Lieferprozesses, kein QA-Nachgedanke.

Die praktische Implikation: Accessible Components werden vom DOM aufwärts designed. Tastaturnavigation, Fokus-Management, semantische Struktur und ARIA-Kontrakte werden beim Komponenten-Design festgelegt. Ein nachträglicher Accessibility-Pass kostet immer mehr und liefert immer weniger als es von Anfang an richtig zu machen.`,
            keyFacts: [
              { label: 'E2E', value: 'Cypress' },
              { label: 'Unit', value: 'Jest' },
              { label: 'Visual', value: 'Regression Testing' },
              { label: 'A11y', value: 'WCAG 2.0 AA · BITV AAA' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Im Einsatz sehen.',
            text: 'Diese Seite läuft auf dem Stack, für den ich einstehe. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4. Source-Code ist öffentlich. Nicht zur Schau – weil offener Code der einzige ehrliche Proof of Work ist.',
            buttonLabel: 'GitHub Repository',
            buttonLink: 'https://github.com/mayraost/mostheimer',
            style: 'primary',
          },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // 3. TRACK RECORD PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'track-record');

    const trackRecord = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Track Record',
        slug: 'track-record',

        layout: [
          {
            blockType: 'hero',
            heading: 'Track Record.',
            subheading:
              'This is not a CV. It is an honest account of the contexts where I carried real responsibility – for architecture, team, and outcome.',
            showStackBadge: false,
          },
          // --- Intro ---
          {
            blockType: 'techSection',
            sectionLabel: 'The Short Version',
            heading: 'Impact over attendance.',
            body: `15+ years of professional web development. Starting from a Beepworld site at age 10. Almost lost the joy of it during a computer science degree that cared more about algorithms on paper than software that runs in production.

Then came Costa Rica. A deliberate reset. Followed by an apprenticeship I passed with a 1.0 grade. Followed by 4.5 years of enterprise frontend architecture. Followed by a year owning a SaaS product from conception to rollout. Followed by where I am now.

This is not a timeline of 3-month stints and certificate collections. These are the contexts where I carried end responsibility – for the architecture, for the team, for the outcome.`,
            keyFacts: [
              { label: 'Started', value: 'Beepworld, ~2002' },
              { label: 'Professional', value: '15+ years' },
              { label: 'Current', value: 'valantic DXA' },
            ],
          },
          // --- valantic DXA ---
          {
            blockType: 'techSection',
            sectionLabel: 'Aug 2024 – Present',
            heading: 'valantic DXA – Senior Full Stack Engineer & Team Manager',
            body: `Leading a cross-functional engineering team while staying hands-on in the code. That duality is intentional. I don't believe in managers who stopped being engineers two years into leadership.

Active projects: ZDFheute as a hybrid PWA (iOS & Android delivery on a single Next.js codebase), Hörzu (high-traffic media and TV guide portal), BORA (premium kitchen manufacturer), and Allianz insurance portal. Plus DBT-based data tracking pipelines for analytics teams who need reliable event data to make product decisions.

The management layer adds: hiring screens, sprint planning, technical decisions that land on me, escalation ownership, and making sure the team actually grows rather than just ships.`,
            keyFacts: [
              { label: 'Role', value: 'Senior FSE · Team Manager' },
              { label: 'Clients', value: 'ZDF · Hörzu · BORA · Allianz' },
              { label: 'Stack', value: 'Next.js · Node · DBT · Payload' },
              { label: 'Also', value: 'Hiring · Sprint Planning' },
            ],
          },
          // --- Lehnert & Wieners / New Digitals ---
          {
            blockType: 'techSection',
            sectionLabel: 'Aug 2023 – Jul 2024',
            heading: 'Lehnert & Wieners / New Digitals – SaaS from Zero',
            body: `One year. Complete ownership of a SaaS product from inception to rollout.

Aduardo is a marketing automation and CRM platform – campaign management, contact segmentation, automated workflows. Built on Next.js, GraphQL, and NestJS. I made the architecture calls, wrote the core, and shipped it.

One year is short. Full product ownership is not. The architecture has to survive without you. The decisions have to hold. This is what separates owning a product from being embedded in one.`,
            keyFacts: [
              { label: 'Product', value: 'Aduardo SaaS' },
              { label: 'Stack', value: 'Next.js · GraphQL · NestJS' },
              { label: 'Scope', value: 'CRM · Marketing Automation' },
              { label: 'Ownership', value: '100% – concept to rollout' },
            ],
          },
          // --- FFW Germany / Cellular ---
          {
            blockType: 'techSection',
            sectionLabel: 'Dec 2018 – May 2023',
            heading: 'FFW Germany / Cellular – 4.5 Years of Enterprise Frontend',
            body: `This is where junior became senior. Four and a half years of enterprise-scale projects with real production consequences.

ZDF / ZDFheute – The flagship project. Full migration from a Pimcore monolith to a Next.js frontend with a GraphQL BFF. Went live in 2022. Millions of daily users. ZDF is Germany's second-largest public broadcaster. You don't get to have a bad day.

TUI Cruises, TV Spielfilm, Budni – Three very different clients, three very different problems. Cruise booking flows under real booking pressure. TV guide with live schedule data and editorial CMS workflows. A Hamburg retail chain migrating away from legacy infrastructure.

Cotype – An internal CMS system built in-house. I was part of the team that built it and used it in client projects. Owning a tool you also rely on creates a useful feedback loop.

2020: Promoted to Senior Full Stack Engineer. Not because of tenure. Because of output and ownership.`,
            keyFacts: [
              { label: 'Anchor project', value: 'ZDF/ZDFheute Relaunch' },
              { label: 'Other clients', value: 'TUI · TV Spielfilm · Budni' },
              { label: 'Senior from', value: '2020' },
              { label: 'Stack', value: 'React · Next.js · GraphQL · Pimcore' },
            ],
          },
          // --- Foundation ---
          {
            blockType: 'techSection',
            sectionLabel: '2012 – 2018',
            heading: 'The Long Way Around Was the Right Way.',
            body: `University of Hamburg, Computer Science, 2012–2014. I enrolled because it seemed like the logical path. I left because lecture halls that never touched a running system nearly killed my interest in the craft.

Costa Rica was not a gap year. It was a recalibration. Coming back with a clear decision: learn to build things by actually building things, not by passing exams about theoretical models.

Satzmedia, 2016–2018. Apprenticeship as a Media Designer for Digital and Print. Final grade: 1.0. Written exam: 94 out of 100. This wasn't a consolation prize for dropping out of university. This was proof that the right environment changes everything. Satzmedia gave me a foundation in craft: typography, visual communication, production workflows. Understanding design from the production side makes you a better frontend engineer than four years of algorithms.

What Beepworld started in 2002, the apprenticeship made into a profession. Everything after that was execution.`,
            keyFacts: [
              { label: 'Uni Hamburg', value: '2012–2014, dropped out' },
              { label: 'Costa Rica', value: '2014, reset' },
              { label: 'Satzmedia', value: '2016–2018, grade 1.0' },
              { label: 'Exam score', value: '94 / 100' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Want to talk specifics?',
            text: "I can elaborate on any of this in a 30-minute conversation. No pitch deck, no sales process. Technical peer review, if you're into that.",
            buttonLabel: 'Send a message',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: trackRecord.id,
      locale: 'de',
      data: {
        title: 'Track Record',
        layout: [
          {
            blockType: 'hero',
            heading: 'Track Record.',
            subheading:
              'Das ist kein Lebenslauf. Es ist eine ehrliche Darstellung der Kontexte, in denen ich echte Verantwortung getragen habe – für Architektur, Team und Ergebnis.',
            showStackBadge: false,
          },
          // --- Intro ---
          {
            blockType: 'techSection',
            sectionLabel: 'Die Kurzversion',
            heading: 'Impact statt Anwesenheit.',
            body: `15+ Jahre professionelle Webentwicklung. Angefangen mit einer Beepworld-Seite mit 10 Jahren. Fast die Freude daran verloren während eines Informatikstudiums, das sich mehr für Algorithmen auf Papier interessierte als für Software, die in Produktion läuft.

Dann Costa Rica. Ein bewusster Reset. Gefolgt von einer Ausbildung mit 1,0. Gefolgt von 4,5 Jahren Enterprise-Frontend-Architektur. Gefolgt von einem Jahr vollständiger SaaS-Produktverantwortung von der Konzeption bis zum Rollout. Gefolgt von der aktuellen Position.

Das ist keine Timeline von 3-Monats-Engagements und Zertifikatsammlungen. Das sind die Kontexte, in denen ich Endverantwortung getragen habe – für die Architektur, das Team, das Ergebnis.`,
            keyFacts: [
              { label: 'Start', value: 'Beepworld, ~2002' },
              { label: 'Professionell', value: '15+ Jahre' },
              { label: 'Aktuell', value: 'valantic DXA' },
            ],
          },
          // --- valantic DXA ---
          {
            blockType: 'techSection',
            sectionLabel: 'Aug 2024 – heute',
            heading: 'valantic DXA – Senior Full Stack Engineer & Team Manager',
            body: `Leitung eines cross-funktionalen Engineering-Teams bei gleichzeitigem Hands-on-Einsatz im Code. Diese Dualität ist absichtlich. Ich glaube nicht an Manager, die zwei Jahre nach dem Einstieg ins Leadership aufgehört haben, Engineers zu sein.

Aktuelle Projekte: ZDFheute als Hybrid-PWA (iOS & Android Auslieferung auf einer einzigen Next.js-Codebasis), Hörzu (hochfrequentiertes Medien- und TV-Guide-Portal), BORA (Premium-Küchenhersteller) und Allianz Insurance Portal. Dazu DBT-basierte Data-Tracking-Pipelines für Analytics-Teams, die verlässliche Event-Daten für Produktentscheidungen brauchen.

Die Management-Ebene ergänzt: Hiring-Screens, Sprint-Planning, technische Entscheidungen, die an mir landen, Eskalationsverantwortung und dafür sorgen, dass das Team wirklich wächst statt nur shippt.`,
            keyFacts: [
              { label: 'Rolle', value: 'Senior FSE · Team Manager' },
              { label: 'Kunden', value: 'ZDF · Hörzu · BORA · Allianz' },
              { label: 'Stack', value: 'Next.js · Node · DBT · Payload' },
              { label: 'Auch', value: 'Hiring · Sprint Planning' },
            ],
          },
          // --- Lehnert & Wieners / New Digitals ---
          {
            blockType: 'techSection',
            sectionLabel: 'Aug 2023 – Jul 2024',
            heading: 'Lehnert & Wieners / New Digitals – SaaS von null',
            body: `Ein Jahr. Vollständige Ownership eines SaaS-Produkts von der Konzeption bis zum Rollout.

Aduardo ist eine Marketing-Automation- und CRM-Plattform – Kampagnen-Management, Kontaktsegmentierung, automatisierte Workflows. Gebaut auf Next.js, GraphQL und NestJS. Ich habe die Architekturentscheidungen getroffen, den Core geschrieben und das Produkt ausgeliefert.

Ein Jahr ist kurz. Vollständige Produktverantwortung ist es nicht. Die Architektur muss ohne einen selbst funktionieren. Die Entscheidungen müssen Bestand haben. Das ist der Unterschied zwischen einem Produkt besitzen und in einem eingebettet sein.`,
            keyFacts: [
              { label: 'Produkt', value: 'Aduardo SaaS' },
              { label: 'Stack', value: 'Next.js · GraphQL · NestJS' },
              { label: 'Scope', value: 'CRM · Marketing Automation' },
              { label: 'Ownership', value: '100% – Konzept bis Rollout' },
            ],
          },
          // --- FFW Germany / Cellular ---
          {
            blockType: 'techSection',
            sectionLabel: 'Dez 2018 – Mai 2023',
            heading: 'FFW Germany / Cellular – 4,5 Jahre Enterprise Frontend',
            body: `Hier wurde Junior zu Senior. Viereinhalb Jahre Enterprise-Projekte mit echten Produktionskonsequenzen.

ZDF / ZDFheute – Das Anker-Projekt. Vollständige Migration von einem Pimcore-Monolithen zu einem Next.js-Frontend mit GraphQL-BFF. Live gegangen 2022. Millionen tägliche Nutzer. ZDF ist Deutschlands zweitgrößter öffentlich-rechtlicher Sender. Einen schlechten Tag hatte man nicht.

TUI Cruises, TV Spielfilm, Budni – Drei sehr unterschiedliche Kunden, drei sehr unterschiedliche Probleme. Kreuzfahrtbuchungsflows unter echtem Buchungsdruck. TV-Guide mit Live-Sendungsdaten und redaktionellen CMS-Workflows. Hamburgische Einzelhandelskette im Abkopplungsprozess von Legacy-Infrastruktur.

Cotype – Ein intern entwickeltes CMS-System. Ich war Teil des Teams, das es baute und in Kundenprojekten einsetzte. Ein Tool zu besitzen, auf das man selbst angewiesen ist, schafft eine nützliche Feedbackschleife.

2020: Beförderung zum Senior Full Stack Engineer. Nicht wegen Betriebszugehörigkeit. Wegen Output und Ownership.`,
            keyFacts: [
              { label: 'Ankerprojekt', value: 'ZDF/ZDFheute Relaunch' },
              { label: 'Weitere Kunden', value: 'TUI · TV Spielfilm · Budni' },
              { label: 'Senior ab', value: '2020' },
              { label: 'Stack', value: 'React · Next.js · GraphQL · Pimcore' },
            ],
          },
          // --- Foundation ---
          {
            blockType: 'techSection',
            sectionLabel: '2012 – 2018',
            heading: 'Der lange Weg war der richtige.',
            body: `Universität Hamburg, Informatik, 2012–2014. Eingeschrieben, weil es der logische Weg schien. Abgebrochen, weil Hörsäle, die nie ein laufendes System anfassten, fast das Interesse am Handwerk zerstört hätten.

Costa Rica war kein Gap Year. Es war eine Rekalibrierung. Mit einer klaren Entscheidung zurückgekommen: Bauen durch wirklich bauen lernen, nicht durch Klausuren über theoretische Modelle bestehen.

Satzmedia, 2016–2018. Ausbildung zur Mediengestalterin Digital und Print. Abschlussnote: 1,0. Schriftliche Prüfung: 94 von 100. Das war kein Trostpflaster für den Studiumsabbruch. Das war der Beweis, dass das richtige Umfeld alles verändert. Satzmedia hat mir eine Grundlage im Handwerk gegeben: Typografie, visuelle Kommunikation, Produktionsworkflows. Design von der Produktionsseite zu verstehen macht einen besseren Frontend-Engineer als vier Jahre Algorithmen.

Was Beepworld 2002 gestartet hat, hat die Ausbildung zum Beruf gemacht. Alles danach war Ausführung.`,
            keyFacts: [
              { label: 'Uni Hamburg', value: '2012–2014, abgebrochen' },
              { label: 'Costa Rica', value: '2014, Reset' },
              { label: 'Satzmedia', value: '2016–2018, Note 1,0' },
              { label: 'Prüfungsergebnis', value: '94 / 100' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Konkret werden?',
            text: 'Ich kann über jeden dieser Punkte in einem 30-minütigen Gespräch ausführlicher sprechen. Kein Pitch-Deck, kein Sales-Prozess. Technisches Peer-Review, wenn du das magst.',
            buttonLabel: 'Nachricht schreiben',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // 4. LEADERSHIP PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'leadership');

    const leadership = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Leadership Philosophy',
        slug: 'leadership',

        layout: [
          {
            blockType: 'hero',
            heading: 'Leadership.',
            subheading:
              'Flat hierarchies, radical transparency, and the uncomfortable obligation to make junior developers into actual engineers.',
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'How I lead.',
            features: [
              {
                title: 'Ownership over Assignment',
                description:
                  'I do not micro-manage. I set context, explain the why, and then get out of the way. Engineers who understand the problem solve it better than engineers following a checklist.',
                iconName: 'Target',
              },
              {
                title: 'Radical Transparency',
                description:
                  'No hidden agendas. No softened feedback in 1:1s followed by surprises in performance reviews. Direct, evidence-based, respectful – in that order.',
                iconName: 'Eye',
              },
              {
                title: 'Code Review as Teaching',
                description:
                  'A code review that only says "LGTM" is a wasted opportunity. A review that explains *why* a pattern is problematic creates a better engineer for the next PR.',
                iconName: 'MessageSquare',
              },
              {
                title: 'No Knowledge Silos',
                description:
                  'Bus factor of 1 is a systemic risk. Documentation, pair programming, and rotating ownership are not nice-to-haves – they are engineering discipline.',
                iconName: 'Share2',
              },
              {
                title: 'Technical Debt Honesty',
                description:
                  'Every shortcut has a cost. I track it, name it, and make sure it appears in roadmap conversations – not just in post-mortems.',
                iconName: 'TriangleAlert',
              },
              {
                title: 'Junior Growth as KPI',
                description:
                  "If the juniors on my team aren't growing into seniors, I'm not doing my job. Their progression is a measure of leadership effectiveness, not a side effect.",
                iconName: 'TrendingUp',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Want to exchange notes?',
            text: "Leadership in tech is a craft, not a title. If you're thinking about team structure, technical culture, or how to scale engineering without losing quality – I'm genuinely interested in the conversation.",
            buttonLabel: 'Reach out',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: leadership.id,
      locale: 'de',
      data: {
        title: 'Führungsphilosophie',
        layout: [
          {
            blockType: 'hero',
            heading: 'Leadership.',
            subheading:
              'Flache Hierarchien, radikale Transparenz und die unbequeme Pflicht, Junior-Entwickler zu echten Engineers zu machen.',
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'Wie ich führe.',
            features: [
              {
                title: 'Ownership statt Zuweisung',
                description:
                  'Ich micro-manage nicht. Ich liefere Kontext, erkläre das Warum und trete dann zurück. Engineers, die das Problem verstehen, lösen es besser als Engineers, die einer Checkliste folgen.',
                iconName: 'Target',
              },
              {
                title: 'Radikale Transparenz',
                description:
                  'Keine versteckten Agenden. Kein abgemildertes Feedback im 1:1, gefolgt von Überraschungen im Performance-Review. Direkt, evidenzbasiert, respektvoll – in dieser Reihenfolge.',
                iconName: 'Eye',
              },
              {
                title: 'Code Review als Lehrmoment',
                description:
                  'Ein Code Review, der nur "LGTM" sagt, ist eine verpasste Gelegenheit. Ein Review, der erklärt *warum* ein Muster problematisch ist, schafft einen besseren Engineer für den nächsten PR.',
                iconName: 'MessageSquare',
              },
              {
                title: 'Keine Wissenssilos',
                description:
                  'Ein Bus-Faktor von 1 ist ein systemisches Risiko. Dokumentation, Pair Programming und rotierende Ownership sind kein Nice-to-have – das ist Engineering-Disziplin.',
                iconName: 'Share2',
              },
              {
                title: 'Technische Schulden ehrlich benennen',
                description:
                  'Jede Abkürzung hat einen Preis. Ich tracke ihn, benenne ihn und sorge dafür, dass er in Roadmap-Gesprächen auftaucht – nicht nur in Post-Mortems.',
                iconName: 'TriangleAlert',
              },
              {
                title: 'Junior-Wachstum als KPI',
                description:
                  'Wenn die Juniors in meinem Team nicht zu Seniors wachsen, mache ich meinen Job nicht. Ihre Entwicklung ist ein Maß für Leadership-Effektivität, kein Nebeneffekt.',
                iconName: 'TrendingUp',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Notizen austauschen?',
            text: 'Leadership in Tech ist ein Handwerk, kein Titel. Wenn du über Team-Struktur, technische Kultur oder das Skalieren von Engineering ohne Qualitätsverlust nachdenkst – ich bin wirklich interessiert an dem Gespräch.',
            buttonLabel: 'Schreib mir',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // 5. ABOUT PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'about');

    const about = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'About',
        slug: 'about',

        layout: [
          {
            blockType: 'hero',
            heading: 'The human behind the code.',
            subheading:
              'Senior engineer. Team lead. Dog person. Smart Home tinkerer. Occasional Trash-TV connoisseur.',
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'Beyond the IDE.',
            features: [
              {
                title: 'Mila & Nele',
                description:
                  'Two dogs with strong opinions on walk scheduling and very little respect for sprint planning. Best pair programmers I have ever had.',
                iconName: 'Heart',
              },
              {
                title: 'Rural Schleswig-Holstein',
                description:
                  'Not Berlin. Intentionally. Good internet, bad coffee selection, excellent noise-to-signal ratio for actual work.',
                iconName: 'MapPin',
              },
              {
                title: 'Smart Home Hacking',
                description:
                  'Custom Zigbee adapters, Home Assistant automations, self-hosted infrastructure. If it has a network interface, it gets automated. If it does not, I find a way.',
                iconName: 'Cpu',
              },
              {
                title: 'Trash-TV, Unironically',
                description:
                  '"Sommerhaus der Stars" is high-stakes social dynamics research. "Temptation Island" is behavioral economics in the wild. I stand by this.',
                iconName: 'Tv',
              },
              {
                title: 'Costa Rica Chapter',
                description:
                  'Dropped out of university. Moved to Costa Rica for a year. Came back with better Spanish, a deep appreciation for working remotely, and zero regrets.',
                iconName: 'Plane',
              },
              {
                title: 'Political Clarity',
                description:
                  'Pro-democracy. Pro-diversity. Anti-bullshit. Technology without ethics is just expensive infrastructure for the wrong people.',
                iconName: 'Shield',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Still here?',
            text: 'If you have read this far, we are probably compatible. Whether that means a technical conversation, a networking coffee, or just following the GitHub repo – welcome.',
            buttonLabel: 'Get in touch',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: about.id,
      locale: 'de',
      data: {
        title: 'Über mich',
        layout: [
          {
            blockType: 'hero',
            heading: 'Der Mensch hinter dem Code.',
            subheading:
              'Senior Engineer. Team Lead. Hunde-Mensch. Smart-Home-Bastelerin. Gelegentliche Trash-TV-Kennerin.',
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'Jenseits der IDE.',
            features: [
              {
                title: 'Mila & Nele',
                description:
                  'Zwei Hunde mit starken Meinungen zur Spaziergang-Planung und wenig Respekt vor Sprint-Planning. Beste Pair-Programmierer, die ich je hatte.',
                iconName: 'Heart',
              },
              {
                title: 'Ländliches Schleswig-Holstein',
                description:
                  'Nicht Berlin. Bewusst. Gutes Internet, schlechte Kaffee-Auswahl, ausgezeichnetes Signal-zu-Rauschen-Verhältnis für echte Arbeit.',
                iconName: 'MapPin',
              },
              {
                title: 'Smart-Home-Hacking',
                description:
                  'Eigene Zigbee-Adapter, Home-Assistant-Automatisierungen, selbst gehostete Infrastruktur. Wenn es ein Netzwerk-Interface hat, wird es automatisiert. Wenn nicht, finde ich einen Weg.',
                iconName: 'Cpu',
              },
              {
                title: 'Trash-TV, ernsthaft',
                description:
                  '"Sommerhaus der Stars" ist Hochrisiko-Sozialdynamik-Forschung. "Temptation Island" ist Verhaltensökonomik in freier Wildbahn. Ich stehe dazu.',
                iconName: 'Tv',
              },
              {
                title: 'Das Costa-Rica-Kapitel',
                description:
                  'Studium abgebrochen. Ein Jahr nach Costa Rica gezogen. Mit besserem Spanisch, einer tiefen Wertschätzung für Remote-Arbeit und null Reue zurückgekommen.',
                iconName: 'Plane',
              },
              {
                title: 'Politische Klarheit',
                description:
                  'Pro-Demokratie. Pro-Diversität. Anti-Bullshit. Technologie ohne Ethik ist nur teure Infrastruktur für die falschen Menschen.',
                iconName: 'Shield',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Immer noch da?',
            text: 'Wenn du bis hier gelesen hast, sind wir wahrscheinlich kompatibel. Ob das ein technisches Gespräch, einen Networking-Kaffee oder einfach dem GitHub-Repo folgen bedeutet – willkommen.',
            buttonLabel: 'Schreib mir',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    // -----------------------------------------------------------------------
    // 6. ENGINEERING PAGE
    // -----------------------------------------------------------------------
    await deletePage(payload, 'engineering');

    const engineering = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Engineering',
        slug: 'engineering',
        layout: [
          {
            blockType: 'hero',
            heading: 'Engineering.',
            subheading:
              'Architecture decisions, performance trade-offs, and why VibeCoding without fundamentals is just expensive tech debt with a better name.',
            showStackBadge: false,
          },
          // --- Section 1: Philosophy ---
          {
            blockType: 'techSection',
            sectionLabel: 'Philosophy',
            heading: 'Pragmatism over hype. Performance over narrative.',
            body: `I have been writing code since I was 8 years old. I have watched Server-Side Rendering become a four-letter word, then get reinvented as RSC. I have seen NoSQL eat the world, then get blamed for every consistency bug in production. The fundamentals have not changed: code must perform, scale, and be maintainable by someone who is not you in eighteen months.

I work with Next.js 16 and Node 24 because they are the correct tools for the problems I solve today. I also work with PHP, Pimcore, and Symfony because the client's revenue stream runs on them and "rewrite it in Next.js" is a business case, not a reflex. Framework wars are for engineers who have never shipped at scale.

The correct question is never "which framework is best?" It is "what does this system need to do, who needs to maintain it, and what are the actual failure modes?" Everything else is conference talk.`,
            keyFacts: [
              { label: 'Years coding', value: '20+' },
              { label: 'Production languages', value: '8+' },
              { label: 'Legacy migrations', value: 'Incremental, always' },
            ],
          },
          // --- Section 2: ZDF Case Study ---
          {
            blockType: 'techSection',
            sectionLabel: 'Case Study',
            heading: 'ZDFheute: Millions of requests, zero tolerance for latency.',
            body: `The problem is deceptively simple: a news portal that cannot go down during breaking news, but also cannot pay for origin compute on every page view. Add live sports data, editorial updates and concurrent traffic spikes from TV broadcast cuts, and the naive architecture falls apart at exactly the wrong moment.

The solution: Next.js with a purpose-built Cloudflare caching layer and granular separation of data sources by update frequency. Static article content is cached aggressively at the edge. Live ticker data is routed through a separate pipeline with sub-second invalidation. Responses are kept surgically lean – the dynamic payload is isolated to the exact DOM nodes that need it, never the full page.

The hard part was not the implementation. It was aligning stakeholders on the idea that "cached but stale" and "live but slow" are both wrong answers, and that the correct architecture requires accepting that different parts of the same page operate under fundamentally different caching contracts.

Latency does not die by accident. It dies by strategy, measurement, and the willingness to reject elegant-looking solutions that do not survive a traffic spike.`,
            keyFacts: [
              { label: 'Edge layer', value: 'Cloudflare' },
              { label: 'Framework', value: 'Next.js App Router' },
              { label: 'Live data', value: 'Isolated pipeline' },
              { label: 'Cache strategy', value: 'Per-component granularity' },
            ],
          },
          // --- Section 3: Accessibility ---
          {
            blockType: 'techSection',
            sectionLabel: 'Deep Dive',
            heading: 'Accessibility is not a CSS add-on. It is an architecture decision.',
            body: `A green Lighthouse score does not make a site accessible. A passing axe-core audit does not mean a screen reader user can actually complete a task without losing context. Anyone who has shipped a "compliant" product without testing it with an actual screen reader knows exactly what I mean.

Accessibility starts at the DOM and at the data model. It means semantic HTML that carries meaning without CSS. It means keyboard navigation that does not break when JavaScript is slow to hydrate. It means ARIA roles that are correct, not decorative. It means focus management that survives route transitions and async state updates.

I have implemented WCAG 2.0 AA and BITV-compliant systems for public-sector clients where non-compliance has direct legal consequences. My testing stack includes NVDA, VoiceOver, and JAWS – not just automated tooling. The gap between what axe-core catches and what an actual user encounters is substantial and cannot be closed by a linter alone.

The architecture implication: accessibility constraints must be visible in the component contract. A component that cannot communicate its interactive state without visual CSS is a component that will fail an audit and a real user simultaneously.`,
            keyFacts: [
              { label: 'Standards', value: 'WCAG 2.0 AA · BITV' },
              { label: 'Screen readers', value: 'NVDA · VoiceOver · JAWS' },
              { label: 'Approach', value: 'Architecture-first, not retrofit' },
            ],
          },
          // --- Section 4: AI Edge ---
          {
            blockType: 'techSection',
            sectionLabel: 'The AI Edge',
            heading: 'VibeCoding without fundamentals is just fast-forward to legacy code.',
            body: `I use AI tooling heavily. Mastra for agent and workflow orchestration, CopilotKit for in-app AI integration, Cursor for development velocity. These are genuine force multipliers when the engineer operating them understands what is happening beneath the abstraction layer.

The current pattern I observe – shipping features by prompting without understanding the output – produces code that works until it encounters an edge case, fails in ways that are opaque to the engineer who shipped it, and creates architectural debt that a junior cannot diagnose and a senior should not have to clean up. The model does not understand your system. You do.

My position is not anti-AI. My position is that AI tools belong in the hands of engineers who can read, critique, and refactor the output. I use them to accelerate decisions I already know how to make. I do not use them to make decisions I do not understand. That distinction compounds over time.

I also work with WebRTC and WebSocket solutions where real-time communication is a genuine technical requirement rather than a feature that sounded interesting in sprint planning. The combination of AI-assisted development and real-time architecture is genuinely interesting territory when the fundamentals are solid.`,
            keyFacts: [
              { label: 'AI tools', value: 'Mastra · CopilotKit · Cursor' },
              { label: 'Real-time', value: 'WebRTC · WebSockets' },
              { label: 'Rule', value: 'Understand the output' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Want to go deeper?',
            text: 'If you have specific architecture questions about any of these topics, I am genuinely interested in the conversation. Bring a real problem, not a job description.',
            buttonLabel: 'Get in touch',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    await payload.update({
      collection: 'pages',
      id: engineering.id,
      locale: 'de',
      data: {
        title: 'Engineering',
        layout: [
          {
            blockType: 'hero',
            heading: 'Engineering.',
            subheading:
              'Architekturentscheidungen, Performance-Trade-offs und warum VibeCoding ohne Grundlagen nur teurer Tech-Debt mit besserem Namen ist.',
            showStackBadge: false,
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Philosophie',
            heading: 'Pragmatismus über Hype. Performance über Narrativ.',
            body: `Ich schreibe Code seit meinem 8. Lebensjahr. Ich habe erlebt, wie Server-Side Rendering zum Schimpfwort wurde – und dann als RSC neu erfunden wurde. Ich habe gesehen, wie NoSQL die Welt fraß und dann für jeden Consistency-Bug in Produktion verantwortlich gemacht wurde. Die Grundlagen haben sich nicht geändert: Code muss performen, skalieren und von jemandem gewartet werden können, der nicht du bist – in 18 Monaten.

Ich arbeite mit Next.js 16 und Node 24, weil sie die richtigen Werkzeuge für die Probleme sind, die ich heute löse. Ich arbeite auch mit PHP, Pimcore und Symfony, weil der Umsatzstrom des Kunden darauf läuft und "in Next.js neu schreiben" ein Business Case ist, kein Reflex. Framework-Kriege sind für Engineers, die noch nie im großen Maßstab geshippt haben.

Die richtige Frage ist nie "welches Framework ist das beste?" Sie ist "was muss dieses System leisten, wer muss es warten, und was sind die echten Failure-Modes?" Alles andere ist Conference-Talk.`,
            keyFacts: [
              { label: 'Jahre Coding', value: '20+' },
              { label: 'Produktionssprachen', value: '8+' },
              { label: 'Legacy-Migrationen', value: 'Inkrementell, immer' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Case Study',
            heading: 'ZDFheute: Millionen Requests, null Toleranz für Latenz.',
            body: `Das Problem klingt deceptively einfach: ein Nachrichtenportal, das bei Breaking News nicht ausfallen darf, aber auch nicht für jeden einzelnen Page View Origin-Compute bezahlen kann. Dazu Live-Sportdaten, redaktionelle Updates und gleichzeitige Traffic-Spitzen durch TV-Abspannmomente – und die naive Architektur kollabiert genau im falschen Moment.

Die Lösung: Next.js mit einem eigens gebautem Cloudflare-Caching-Layer und granularer Trennung der Datenquellen nach Update-Frequenz. Statische Artikel-Inhalte werden aggressiv am Edge gecacht. Live-Ticker-Daten werden durch eine separate Pipeline mit Sub-Sekunden-Invalidierung geleitet. Responses bleiben chirurgisch schlank – der dynamische Payload ist auf exakt die DOM-Nodes isoliert, die ihn brauchen, nie auf die gesamte Seite.

Das Schwierige war nicht die Implementierung. Es war, Stakeholder davon zu überzeugen, dass "gecacht, aber veraltet" und "live, aber langsam" beide falsche Antworten sind – und dass die korrekte Architektur akzeptiert, dass verschiedene Teile derselben Seite fundamental unterschiedliche Caching-Kontrakte haben.

Latenz stirbt nicht durch Zufall. Sie stirbt durch Strategie, Messung und die Bereitschaft, elegant aussehende Lösungen abzulehnen, die einen Traffic-Spike nicht überleben.`,
            keyFacts: [
              { label: 'Edge-Layer', value: 'Cloudflare' },
              { label: 'Framework', value: 'Next.js App Router' },
              { label: 'Live-Daten', value: 'Isolierte Pipeline' },
              { label: 'Cache-Strategie', value: 'Per-Komponente granular' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'Deep Dive',
            heading: 'Barrierefreiheit ist kein CSS-Add-on. Es ist eine Architekturentscheidung.',
            body: `Ein grüner Lighthouse-Score macht eine Seite nicht barrierefrei. Ein bestandenes axe-core-Audit bedeutet nicht, dass ein Screen-Reader-Nutzer eine Aufgabe tatsächlich abschließen kann, ohne den Kontext zu verlieren. Jeder, der ein "konformes" Produkt geshippt hat, ohne es mit einem echten Screen Reader zu testen, weiß genau, was ich meine.

Barrierefreiheit beginnt am DOM und am Datenmodell. Es bedeutet semantisches HTML, das Bedeutung ohne CSS trägt. Es bedeutet Tastaturnavigation, die nicht bricht, wenn JavaScript langsam hydratiert. Es bedeutet ARIA-Rollen, die korrekt sind, nicht dekorativ. Es bedeutet Fokus-Management, das Route-Transitions und asynchrone State-Updates überlebt.

Ich habe WCAG 2.0 AA und BITV-konforme Systeme für Auftraggeber im öffentlichen Sektor implementiert, bei denen Nicht-Konformität direkte rechtliche Konsequenzen hat. Mein Test-Stack umfasst NVDA, VoiceOver und JAWS – nicht nur automatisierte Tooling. Die Lücke zwischen dem, was axe-core findet, und dem, was ein echter Nutzer erlebt, ist erheblich und kann kein Linter schließen.

Die Architektur-Implikation: Accessibility-Constraints müssen im Komponenten-Kontrakt sichtbar sein. Eine Komponente, die ihren interaktiven Zustand ohne visuelles CSS nicht kommunizieren kann, wird gleichzeitig ein Audit und einen echten Nutzer scheitern lassen.`,
            keyFacts: [
              { label: 'Standards', value: 'WCAG 2.0 AA · BITV' },
              { label: 'Screen Reader', value: 'NVDA · VoiceOver · JAWS' },
              { label: 'Ansatz', value: 'Architecture-first, kein Retrofit' },
            ],
          },
          {
            blockType: 'techSection',
            sectionLabel: 'The AI Edge',
            heading: 'VibeCoding ohne Grundlagen ist nur Tech-Debt im Zeitraffer.',
            body: `Ich nutze AI-Tooling intensiv. Mastra für Agent- und Workflow-Orchestrierung, CopilotKit für In-App-KI-Integration, Cursor für Entwicklungsgeschwindigkeit. Das sind echte Force-Multiplier – wenn der Engineer, der sie bedient, versteht, was unterhalb der Abstraktionsschicht passiert.

Das aktuelle Muster, das ich beobachte – Features durch Prompting shippen, ohne den Output zu verstehen – produziert Code, der funktioniert, bis er auf einen Edge Case trifft, der auf undurchsichtige Weise scheitert und architektonischen Debt erzeugt, den ein Junior nicht diagnostizieren kann und ein Senior nicht aufräumen sollte. Das Modell versteht dein System nicht. Du tust es.

Meine Position ist nicht Anti-KI. Meine Position ist, dass KI-Tools in die Hände von Engineers gehören, die den Output lesen, kritisieren und refaktorieren können. Ich nutze sie, um Entscheidungen zu beschleunigen, die ich bereits treffen kann. Ich nutze sie nicht, um Entscheidungen zu treffen, die ich nicht verstehe. Diese Unterscheidung wirkt sich über Zeit aus.

Ich arbeite auch mit WebRTC- und WebSocket-Lösungen dort, wo Echtzeit-Kommunikation eine echte technische Anforderung ist – und nicht ein Feature, das im Sprint-Planning interessant klang. Die Kombination aus KI-gestützter Entwicklung und Echtzeit-Architektur ist genuines interessantes Terrain, wenn die Grundlagen solid sind.`,
            keyFacts: [
              { label: 'AI-Tools', value: 'Mastra · CopilotKit · Cursor' },
              { label: 'Echtzeit', value: 'WebRTC · WebSockets' },
              { label: 'Regel', value: 'Den Output verstehen' },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Tiefer gehen?',
            text: 'Wenn du konkrete Architektur-Fragen zu einem dieser Themen hast, bin ich wirklich interessiert an dem Gespräch. Bring ein echtes Problem, keine Stellenbeschreibung.',
            buttonLabel: 'Schreib mir',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    return Response.json({
      message: 'All pages seeded successfully!',
      pages: {
        home: home.id,
        techStack: techStack.id,
        trackRecord: trackRecord.id,
        leadership: leadership.id,
        about: about.id,
        engineering: engineering.id,
      },
    });
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error occurred' },
      { status: 500 },
    );
  }
}
