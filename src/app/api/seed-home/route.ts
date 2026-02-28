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

    return Response.json({
      message: 'All pages seeded successfully!',
      pages: {
        home: home.id,
        techStack: techStack.id,
        trackRecord: trackRecord.id,
        leadership: leadership.id,
        about: about.id,
      },
    });
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error occurred' },
      { status: 500 },
    );
  }
}
