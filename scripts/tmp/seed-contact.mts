import { getPayload } from 'payload';
import config from '@payload-config';

const payload = await getPayload({ config });
const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'contact' } },
  limit: 1,
  draft: true,
  overrideAccess: true,
});
if (existing.docs.length > 0) {
  console.log('contact exists:', existing.docs[0].id);
  process.exit(0);
}

const page = await payload.create({
  collection: 'pages',
  locale: 'de',
  draft: false,
  overrideAccess: true,
  data: {
    title: 'Kontakt',
    slug: 'contact',
    _status: 'published',
    layout: [
      {
        blockType: 'hero',
        heading: 'Lassen Sie uns über skalierbare Architektur sprechen.',
        subheading:
          'Ob strategischer Austausch zu modernen Web-Stacks (Next.js, Payload, Edge-Infrastruktur), eine konkrete Enterprise-Herausforderung oder eine Führungsrolle im Bereich Web & Application Architecture — schreiben Sie mir, ich antworte in der Regel innerhalb eines Werktages.',
        ctaLabel: 'E-Mail schreiben',
        ctaLink: 'mailto:mayraostheimer@gmail.com',
        ctaLabel2: 'GitHub',
        ctaLink2: 'https://github.com/mayraost',
      },
      {
        blockType: 'techSection',
        sectionLabel: 'Kontakt',
        heading: 'Mayra Ostheimer (sie/ihr)',
        body: 'Metropolregion Hamburg, vollständig remote erprobt — Zusammenarbeit über Standorte und Zeitzonen hinweg ist für mich Normalbetrieb, nicht Ausnahme.\n\nFür ein Erstgespräch genügen ein paar Zeilen zum Vorhaben: Kontext, Zeitrahmen und die kritischste offene Frage.',
        keyFacts: [
          { label: 'E-Mail', value: 'mayraostheimer@gmail.com' },
          { label: 'Telefon', value: '(+49) 176 63 78 79 51' },
          { label: 'Standort', value: '25368 Kiebitzreihe · Metropolregion Hamburg' },
          { label: 'Arbeitsweise', value: '100 % Remote-Setup' },
          {
            label: 'Netzwerk',
            value: 'github.com/mayraost · linkedin.com/in/mayra-ostheimer-207355438',
          },
          {
            label: 'Verfügbarkeit',
            value:
              'Offen für Architektur- und Führungsrollen sowie ausgewählte Beratungsmandate · 100 % remote',
          },
        ],
      },
    ],
  },
});
console.log('created contact page id', page.id, page._status);
process.exit(0);
