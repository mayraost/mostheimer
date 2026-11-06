import { publishedSlugStatus, getPublishedSlugs } from '@/proxy-slug-cache';
const slugs = await getPublishedSlugs();
console.log('slugs:', slugs ? [...slugs] : null);
for (const s of ['contact', 'leadership', 'nope'])
  console.log(s, '->', await publishedSlugStatus(s));
process.exit(0);
