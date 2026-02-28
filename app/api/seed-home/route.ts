import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const maxDuration = 60;

export async function GET() {
  const payload = await getPayload({ config: configPromise });

  try {
    // Check if the home page already exists
    const existingPages = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: 'home',
        },
      },
    });

    if (existingPages.totalDocs > 0) {
      await payload.delete({
        collection: 'pages',
        id: existingPages.docs[0].id,
      });
    }

    // Create the Home page in English
    const page = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Hi, I am Mayra Ostheimer',
            subheading:
              'A passionate Full-Stack Developer bridging design and technology to build modern web applications.',
            ctaLabel: 'View My Work',
            ctaLink: '#portfolio',
          },
          {
            blockType: 'featureGrid',
            heading: 'My Expertise',
            features: [
              {
                title: 'Frontend Development',
                description:
                  'Creating stunning and responsive UIs with React, Next.js, and modern CSS frameworks like Tailwind.',
                iconName: 'Monitor',
              },
              {
                title: 'Backend Systems',
                description:
                  'Designing scalable APIs, database schemas, and background jobs with Node.js and TypeScript.',
                iconName: 'Server',
              },
              {
                title: 'Cloud & DevOps',
                description:
                  'Deploying applications flawlessly on AWS, Vercel, or custom Docker infrastructure.',
                iconName: 'Cloud',
              },
              {
                title: 'UX/UI Design',
                description:
                  'Translating concepts into beautiful, user-centered designs before bringing them to life in code.',
                iconName: 'PenTool',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Ready to start a project?',
            text: 'I am currently available for freelance projects and full-time opportunities. Lets talk about how I can help you build your next big thing.',
            buttonLabel: 'Get in Touch',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
        _status: 'published',
      },
    });

    // Add German translations
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'de',
      data: {
        title: 'Startseite',
        layout: [
          {
            blockType: 'hero',
            heading: 'Hi, ich bin Mayra Ostheimer',
            subheading:
              'Eine leidenschaftliche Full-Stack Entwicklerin, die Design und Technologie verbindet, um moderne Web-Anwendungen zu bauen.',
            ctaLabel: 'Meine Arbeit ansehen',
            ctaLink: '#portfolio',
          },
          {
            blockType: 'featureGrid',
            heading: 'Meine Expertise',
            features: [
              {
                title: 'Frontend Entwicklung',
                description:
                  'Erstellung beeindruckender und responsiver UIs mit React, Next.js und modernen CSS-Frameworks wie Tailwind.',
                iconName: 'Monitor',
              },
              {
                title: 'Backend Systeme',
                description:
                  'Entwurf skalierbarer APIs, Datenbankschemata und Hintergrundjobs mit Node.js und TypeScript.',
                iconName: 'Server',
              },
              {
                title: 'Cloud & DevOps',
                description:
                  'Reibungslose Bereitstellung von Anwendungen auf AWS, Vercel oder benutzerdefinierter Docker-Infrastruktur.',
                iconName: 'Cloud',
              },
              {
                title: 'UX/UI Design',
                description:
                  'Übersetzung von Konzepten in schöne, nutzerorientierte Designs, bevor sie im Code zum Leben erweckt werden.',
                iconName: 'PenTool',
              },
            ],
          },
          {
            blockType: 'callToAction',
            heading: 'Bereit für ein Projekt?',
            text: 'Ich stehe derzeit für freiberufliche Projekte und Vollzeitanfragen zur Verfügung. Lassen Sie uns darüber sprechen, wie ich Ihnen helfen kann.',
            buttonLabel: 'Kontakt aufnehmen',
            buttonLink: 'mailto:mail@mostheimer.de',
            style: 'primary',
          },
        ],
      },
    });

    return Response.json({ message: 'Home page seeded successfully with translations!', page });
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error occurred' },
      { status: 500 },
    );
  }
}
