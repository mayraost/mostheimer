import type { Page } from '@/payload-types';
import type { ProjectView } from '@/components/projects/projectView';
import type { FrontendLocale } from '@/cms/cache/frontend/routes';

/**
 * Plain-Markdown renderers for the agent representation of a page/project.
 *
 * PURE: no `next/*`, no Payload runtime, no DB. The route handler resolves the
 * document from the existing `'use cache'` layer and hands it here, so the same
 * serializer can be unit-tested without a request context.
 *
 * The goal is a useful, linkable summary for an LLM — not a byte-exact clone of
 * the HTML. Every section keeps the CMS order and the source links, so an agent
 * can quote facts and follow the canonical URL.
 */

type PageBlock = NonNullable<Page['layout']>[number];

const BASE_URL = 'https://mostheimer.de';

/** Collects visible text from a Lexical document (headings, paragraphs, lists). */
export function lexicalToMarkdown(node: unknown): string {
  const lines: string[] = [];

  const visit = (current: unknown, listDepth = 0): void => {
    if (!current || typeof current !== 'object') return;
    const record = current as Record<string, unknown>;

    if (typeof record.text === 'string') {
      lines.push(record.text);
      return;
    }

    const type = typeof record.type === 'string' ? record.type : '';
    const children = Array.isArray(record.children) ? record.children : [];
    const isBlock =
      type === 'paragraph' ||
      type === 'heading' ||
      type === 'quote' ||
      type === 'listitem' ||
      type === 'list';

    if (isBlock && lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
    if (type === 'listitem') {
      const prefix = '  '.repeat(Math.max(0, listDepth - 1)) + '- ';
      const before = lines.length;
      for (const child of children) visit(child, listDepth);
      if (lines.length > before) lines[before] = `${prefix}${lines[before]}`;
      return;
    }

    const nextDepth = type === 'list' ? listDepth + 1 : listDepth;
    for (const child of children) visit(child, nextDepth);
  };

  const start =
    node && typeof node === 'object' && 'root' in (node as Record<string, unknown>)
      ? (node as Record<string, unknown>).root
      : node;
  visit(start);

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function paragraphs(value: string | null | undefined): string[] {
  return (
    value
      ?.split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean) ?? []
  );
}

function joinParts(parts: Array<string | null | undefined>, separator = ' · '): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(separator);
}

function link(label: string | null | undefined, href: string | null | undefined): string | null {
  const text = label?.trim();
  const url = href?.trim();
  if (!text || !url) return null;
  if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return null;
  return `[${text}](${url})`;
}

function heading(level: number, text: string): string {
  return `${'#'.repeat(Math.min(6, Math.max(1, level)))} ${text}`;
}

function section(title: string, lines: Array<string | null | undefined>): string[] {
  const body = lines.filter((line): line is string => Boolean(line?.trim()));
  if (body.length === 0) return [];
  return ['', heading(2, title), '', ...body];
}

function blockToMarkdown(block: PageBlock): string[] {
  switch (block.blockType) {
    case 'hero':
      return [
        heading(1, block.heading),
        '',
        block.subheading ?? '',
        '',
        ...[block.ctaLabel, block.ctaLabel2, block.ctaLabel3]
          .map((label, index) =>
            link(label, [block.ctaLink, block.ctaLink2, block.ctaLink3][index] ?? null),
          )
          .filter((entry): entry is string => Boolean(entry))
          .map((entry) => `- ${entry}`),
      ].filter((line) => line !== undefined);

    case 'statusBlock':
      return section(block.title, [
        block.badgeLabel ? `**${block.badgeLabel}**` : null,
        block.description,
        block.networkTopics?.length
          ? `Topics: ${block.networkTopics.map((topic) => topic.topic).join(', ')}`
          : null,
      ]);

    case 'techSection':
      return section(block.heading, [
        block.sectionLabel ? `*${block.sectionLabel}*` : null,
        ...paragraphs(block.body),
        block.keyFacts?.length
          ? `Key facts: ${block.keyFacts.map((fact) => `${fact.label}: ${fact.value}`).join(' · ')}`
          : null,
      ]);

    case 'caseStudy':
      return section(block.client, [
        joinParts([block.period, block.role], ' · ') || null,
        block.context,
        block.solution,
        block.contribution,
        block.tags?.length ? `Tags: ${block.tags.join(', ')}` : null,
        link(block.linkLabel || 'Reference', block.link),
      ]);

    case 'bentoGrid':
      return section(block.heading || 'Architecture approach', [
        ...(block.items ?? []).flatMap((item) => [
          `### ${item.title}`,
          item.highlight ? `**${item.highlight}**` : null,
          item.description,
          link(item.ctaLabel, item.ctaLink),
        ]),
      ]);

    case 'architectureDiagram':
      return section(block.heading, [
        block.description,
        ...(block.layers ?? []).flatMap((layer) => [
          `### ${layer.title}`,
          joinParts([layer.subtitle, layer.stack], ' · ') || null,
          layer.summary,
          ...(layer.principles ?? []).map(
            (principle) => `- ${principle.title}${principle.text ? `: ${principle.text}` : ''}`,
          ),
        ]),
      ]);

    case 'techRadar':
      return section(block.heading || 'Technology radar', [
        ...(block.quadrants ?? []).flatMap((quadrant) => [
          `### ${quadrant.title}`,
          ...(quadrant.items ?? []).map(
            (item) =>
              `- **${item.name}** (${item.tier})${item.description ? `: ${item.description}` : ''}`,
          ),
        ]),
      ]);

    case 'skillset':
      return section(block.heading, [
        block.description,
        ...(block.items ?? []).map(
          (item) =>
            `- **${item.name}**${item.level ? ` (${item.level})` : ''}${item.description ? `: ${item.description}` : ''}`,
        ),
        link(block.ctaLabel, block.ctaLink),
      ]);

    case 'timeline':
      return section(block.heading || 'Career timeline', [
        ...(block.entries ?? []).flatMap((entry) => [
          `### ${entry.role ? `${entry.role} — ${entry.company}` : entry.company}`,
          entry.period ? `*${entry.period}*` : null,
          entry.highlights,
        ]),
      ]);

    case 'testimonial':
      return section(block.heading || 'Testimonials', [
        ...(block.items ?? []).map(
          (item) => `> ${item.quote}\n>\n> — ${item.author}${item.role ? `, ${item.role}` : ''}`,
        ),
      ]);

    case 'featureGrid':
      return section(block.heading || 'Features', [
        ...(block.features ?? []).map(
          (feature) =>
            `- **${feature.title}**${feature.description ? `: ${feature.description}` : ''}`,
        ),
      ]);

    case 'imageText': {
      const image =
        block.image && typeof block.image === 'object' ? (block.image.url ?? null) : null;
      return section(block.heading || 'Image', [
        image ? `![${block.heading || 'Image'}](${image})` : null,
        lexicalToMarkdown(block.text),
      ]);
    }

    case 'richText':
      return lexicalToMarkdown(block.content) ? ['', lexicalToMarkdown(block.content)] : [];

    case 'callToAction':
      return section(block.heading, [block.text, link(block.buttonLabel, block.buttonLink)]);

    case 'projectShowcase':
      return section(block.heading || 'Projects', [
        block.intro,
        `Browse the project listing: ${BASE_URL}/projects`,
      ]);

    default:
      return [];
  }
}

export interface PageMarkdownInput {
  page: Page;
  locale: FrontendLocale;
  /** Locale-prefixed route (`/de`, `/de/career`). */
  path: string;
  description?: string | null;
}

/** Markdown representation of a CMS page, including canonical + alternates. */
export function pageToMarkdown(input: PageMarkdownInput): string {
  const { page, locale, path } = input;
  const url = `${BASE_URL}${path}`;
  const blocks = (page.layout ?? []).flatMap(blockToMarkdown);
  const hasHero = (page.layout ?? []).some((block) => block.blockType === 'hero');

  const lines: string[] = [
    ...(hasHero ? [] : [heading(1, page.title), '']),
    ...(input.description ? [`> ${input.description}`, ''] : []),
    ...blocks,
    '',
    '---',
    '',
    `Canonical: ${url}`,
    `Language: ${locale}`,
    `Updated: ${page.updatedAt}`,
    `HTML: ${url}`,
    `Site index: ${BASE_URL}/llms.txt`,
    `API documentation: ${BASE_URL}/docs`,
  ];

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n');
}

/** Markdown representation of a project detail page. */
export function projectToMarkdown(project: ProjectView, locale: FrontendLocale): string {
  const url = `${BASE_URL}${project.path}`;
  const lines: string[] = [
    heading(1, project.title),
    '',
    project.teaser ? `> ${project.teaser}` : '',
    '',
    joinParts([project.kind, ...project.tags.map((tag) => tag.label)], ' · '),
    '',
  ];

  const pushSection = (title: string, values: string[]) => {
    if (values.length === 0) return;
    lines.push('', heading(2, title), '', ...values);
  };

  pushSection('Context', project.context);
  pushSection('How it was built', project.approach ? [lexicalToMarkdown(project.approach)] : []);
  pushSection('What I learned', project.learnings);
  pushSection('Outcome', project.outcome);
  pushSection(
    'Stack',
    project.stack.map((entry) => `- ${entry}`),
  );

  const links = [
    project.liveUrl ? link('Live demo', project.liveUrl) : null,
    project.githubUrl ? link('Source on GitHub', project.githubUrl) : null,
    project.storybookUrl ? link('Component documentation', project.storybookUrl) : null,
  ].filter((entry): entry is string => Boolean(entry));
  pushSection(
    'Links',
    links.map((entry) => `- ${entry}`),
  );

  lines.push(
    '',
    '---',
    '',
    `Canonical: ${url}`,
    `Language: ${locale}`,
    `Listing: ${BASE_URL}${project.listingPath}`,
    `Updated: ${project.updatedAt ?? 'unknown'}`,
    `Site index: ${BASE_URL}/llms.txt`,
  );

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n');
}
