import { getPayload } from 'payload';
import config from '@payload-config';

const payload = await getPayload({ config });
const found = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'contact' } },
  limit: 1,
  locale: 'de',
});
const doc = found.docs[0];
if (!doc) {
  console.log('no doc');
  process.exit(1);
}

// Copy the DE locales into EN (test data for the local render check only).
await payload.update({
  collection: 'pages',
  id: doc.id,
  locale: 'en',
  draft: false,
  overrideAccess: true,
  data: {
    title: 'Contact',
    slug: 'contact',
    _status: 'published',
    // Fresh block ids: reusing the DE ids collides on the locale insert.
    layout: (doc.layout ?? []).map((block) => {
      const {
        id: _blockId,
        keyFacts,
        ...rest
      } = block as typeof block & { id?: string; keyFacts?: { id?: string }[] };
      const next = keyFacts
        ? { ...rest, keyFacts: keyFacts.map(({ id: _factId, ...fact }) => fact) }
        : rest;
      return next;
    }),
  },
});
console.log('en locale written for', doc.id);
process.exit(0);
