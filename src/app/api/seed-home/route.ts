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
              'No hype-driven decisions. Every technology here is battle-tested, contextually chosen, and understood down to the runtime.',
            showStackBadge: true,
          },
          {
            blockType: 'featureGrid',
            heading: 'Current Weapons of Choice',
            features: [
              {
                title: 'Next.js 16 (App Router)',
                description:
                  'RSC, streaming, granular caching. The App Router is production-ready if you understand what you\'re doing with it.',
                iconName: 'Triangle',
              },
              {
                title: 'TypeScript – strict mode, always',
                description:
                  'Any is a code smell. Strict mode is the baseline. Type inference is your friend if you stop fighting it.',
                iconName: 'Code',
              },
              {
                title: 'Payload CMS v3',
                description:
                  'TypeScript-first, Local API, no headless tax. When the client needs a CMS, this is where I start in 2025.',
                iconName: 'Database',
              },
              {
                title: 'Cloudflare (Workers, KV, R2, Cache)',
                description:
                  'Granular caching at the edge. Not just a CDN – a programmable layer between your origin and the world.',
                iconName: 'Globe',
              },
              {
                title: 'PHP & Legacy Systems',
                description:
                  'Half the internet runs on PHP. Rewriting working legacy for sport is expensive. Strangler Fig pattern, incremental modernisation – that\'s the move.',
                iconName: 'Server',
              },
              {
                title: 'Tailwind CSS v4',
                description:
                  'CSS-first config, no PostCSS overhead. The logical successor. If you\'re still arguing about utility classes in 2025, I can\'t help you.',
                iconName: 'Paintbrush',
              },
            ],
          },
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                version: 1,
                children: [
                  {
                    type: 'heading',
                    tag: 'h2',
                    version: 1,
                    children: [{ type: 'text', version: 1, text: 'On choosing technology' }],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        version: 1,
                        text: 'The right tool for the right job. Not the trending tool. Not the tool that looks great on a conference slide. The tool that solves the actual problem, can be maintained by the team, and does not introduce hidden complexity you will be debugging at 2am in six months.',
                      },
                    ],
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
              },
            },
          },
          {
            blockType: 'callToAction',
            heading: 'See it in action.',
            text: "This site runs the stack I preach. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4 – and the source code is public on GitHub. Proof of work.",
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
              'Keine Hype-getriebenen Entscheidungen. Jede Technologie hier ist battle-tested, kontextuell gewählt und bis zum Runtime verstanden.',
            showStackBadge: true,
          },
          {
            blockType: 'featureGrid',
            heading: 'Aktuelle Lieblingswaffen',
            features: [
              {
                title: 'Next.js 16 (App Router)',
                description:
                  'RSC, Streaming, granulares Caching. Der App Router ist produktionsreif – wenn man weiß, was man damit macht.',
                iconName: 'Triangle',
              },
              {
                title: 'TypeScript – strict mode, immer',
                description:
                  'Any ist ein Code Smell. Strict Mode ist der Baseline. Type Inference ist dein Freund, wenn du aufhörst, gegen ihn anzukämpfen.',
                iconName: 'Code',
              },
              {
                title: 'Payload CMS v3',
                description:
                  'TypeScript-first, Local API, kein Headless-Aufschlag. Wenn ein Kunde ein CMS braucht, fange ich hier an.',
                iconName: 'Database',
              },
              {
                title: 'Cloudflare (Workers, KV, R2, Cache)',
                description:
                  'Granulares Caching am Edge. Kein reines CDN – eine programmierbare Schicht zwischen Origin und der Welt.',
                iconName: 'Globe',
              },
              {
                title: 'PHP & Legacy-Systeme',
                description:
                  'Die Hälfte des Internets läuft auf PHP. Funktionierendes Legacy-System aus Spaß neu schreiben ist teuer. Strangler-Fig-Pattern, inkrementelle Modernisierung – das ist der Move.',
                iconName: 'Server',
              },
              {
                title: 'Tailwind CSS v4',
                description:
                  'CSS-first-Konfiguration, kein PostCSS-Overhead. Der logische Nachfolger. Wenn du 2025 noch über Utility-Klassen diskutierst, kann ich dir nicht helfen.',
                iconName: 'Paintbrush',
              },
            ],
          },
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                version: 1,
                children: [
                  {
                    type: 'heading',
                    tag: 'h2',
                    version: 1,
                    children: [{ type: 'text', version: 1, text: 'Über Technologieauswahl' }],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        version: 1,
                        text: 'Das richtige Werkzeug für den richtigen Job. Nicht das trendige. Nicht das, das auf einer Conference-Folie toll aussieht. Das Werkzeug, das das eigentliche Problem löst, vom Team maintaint werden kann und keine versteckte Komplexität einführt, die man in sechs Monaten um 2 Uhr nachts debuggt.',
                      },
                    ],
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
              },
            },
          },
          {
            blockType: 'callToAction',
            heading: 'Im Einsatz sehen.',
            text: 'Diese Seite läuft auf dem Stack, den ich predige. Node 24, Next.js 16, PayloadCMS 3, Tailwind 4 – und der Source-Code ist öffentlich auf GitHub. Proof of Work.',
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
              "Numbers, decisions, outcomes. The unglamorous reality of shipping production software at scale.",
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'Selected Projects',
            features: [
              {
                title: 'ZDF Relaunch 2025',
                description:
                  'Frontend architecture for one of Germany\'s largest public broadcasting platforms. Millions of daily users. Live sports data, streaming, real-time updates. Latency is a product decision.',
                iconName: 'Tv',
              },
              {
                title: 'Team Lead @ valantic DXA',
                description:
                  'Leading a cross-functional team of engineers. Responsible for technical direction, code quality standards, and making sure juniors actually grow.',
                iconName: 'Users',
              },
              {
                title: 'Edge Caching Architecture',
                description:
                  'Designed and implemented Cloudflare-based caching strategies that reduced origin load by over 70% while keeping content fresh for editorial teams.',
                iconName: 'Zap',
              },
              {
                title: 'Legacy PHP Modernisation',
                description:
                  'Incremental migration of a decade-old PHP monolith to a modern, decoupled architecture. Zero downtime. Business continuity first.',
                iconName: 'RefreshCw',
              },
              {
                title: 'Accessibility Overhaul',
                description:
                  'WCAG 2.1 AA compliance for high-traffic editorial systems. Not checkbox compliance – actual usability for screen reader users.',
                iconName: 'Accessibility',
              },
              {
                title: 'CI/CD & Developer Experience',
                description:
                  'Reduced average PR-to-production cycle from 3 days to under 4 hours through pipeline automation, review tooling, and removing unnecessary gates.',
                iconName: 'GitBranch',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Want to talk specifics?',
            text: "I can elaborate on any of these in a 30-minute conversation. No pitch deck, no sales process. Technical peer review, if you're into that.",
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
              'Zahlen, Entscheidungen, Ergebnisse. Die unglamouröse Realität des Shippens von Produktionssoftware im großen Maßstab.',
            showStackBadge: false,
          },
          {
            blockType: 'featureGrid',
            heading: 'Ausgewählte Projekte',
            features: [
              {
                title: 'ZDF Relaunch 2025',
                description:
                  'Frontend-Architektur für eine der größten öffentlich-rechtlichen Rundfunkplattformen Deutschlands. Millionen täglicher Nutzer. Live-Sportdaten, Streaming, Echtzeit-Updates. Latenz ist eine Produktentscheidung.',
                iconName: 'Tv',
              },
              {
                title: 'Team Lead @ valantic DXA',
                description:
                  'Leitung eines cross-funktionalen Engineering-Teams. Verantwortlich für technische Ausrichtung, Code-Qualitätsstandards und dafür, dass Juniors wirklich wachsen.',
                iconName: 'Users',
              },
              {
                title: 'Edge Caching Architektur',
                description:
                  'Cloudflare-basierte Caching-Strategien entworfen und implementiert, die die Origin-Last um über 70% reduzierten und dabei Inhalte für Redaktionsteams frisch hielten.',
                iconName: 'Zap',
              },
              {
                title: 'Legacy PHP Modernisierung',
                description:
                  'Inkrementelle Migration eines jahrzehntealten PHP-Monolithen zu einer modernen, entkoppelten Architektur. Zero Downtime. Business Continuity first.',
                iconName: 'RefreshCw',
              },
              {
                title: 'Accessibility Overhaul',
                description:
                  'WCAG 2.1 AA Konformität für hochfrequentierte Redaktionssysteme. Kein Checkbox-Compliance – echte Nutzbarkeit für Screen-Reader-Nutzer.',
                iconName: 'Accessibility',
              },
              {
                title: 'CI/CD & Developer Experience',
                description:
                  'Durchschnittlichen PR-zu-Produktion-Zyklus von 3 Tagen auf unter 4 Stunden reduziert durch Pipeline-Automatisierung, Review-Tooling und Entfernung unnötiger Gates.',
                iconName: 'GitBranch',
              },
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
                  "Dropped out of university. Moved to Costa Rica for a year. Came back with better Spanish, a deep appreciation for working remotely, and zero regrets.",
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
            text: "If you have read this far, we are probably compatible. Whether that means a technical conversation, a networking coffee, or just following the GitHub repo – welcome.",
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
