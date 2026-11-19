import { describe, expect, it } from 'vitest';
import type { Page } from '@/payload-types';
import {
  wantsMarkdown,
  markdownNotFound,
  markdownResponse,
  markdownRoutePath,
} from '@/lib/agentNegotiation';
import { pageToMarkdown, lexicalToMarkdown } from '@/cms/aeo/markdown';
import { docsMarkdown, mcpMarkdown, WHEN_TO_USE } from '@/cms/aeo/developerDocs';
import { OPENAPI_SPEC, apiIndex } from '@/cms/aeo/openapi';
import { wellKnownBody, MCP_MANIFEST, AGENT_SKILLS_INDEX } from '@/cms/aeo/agentFiles';
import { LLMS_TXT } from '@/cms/aeo/llmsTxt';
import {
  buildOrganization,
  buildPerson,
  buildSiteJsonLd,
  SITE_KEYWORDS,
} from '@/components/StructuredData';
import type { PersonIdentity } from '@/components/StructuredData';

const identity: PersonIdentity = {
  siteName: 'Mayra Ostheimer',
  personName: 'Mayra Ostheimer',
  email: 'mayraostheimer@gmail.com',
  telephone: '+49 176 63787951',
  streetAddress: 'Ringstraße 60',
  postalCode: '25368',
  addressLocality: 'Kiebitzreihe',
  addressCountry: 'DE',
  sameAs: ['https://github.com/mayraost'],
  knowsLanguage: ['de', 'en'],
  jobTitle: 'Senior Fullstack Developer',
  description: 'Web & Application Architect',
  worksFor: 'valiant',
  contactType: 'personal',
  localePath: '/en',
};

const page = {
  id: 1,
  title: 'Career',
  slug: 'career',
  layout: [
    {
      blockType: 'hero',
      heading: 'Career',
      subheading: 'Roles and employers.',
      id: 'hero',
    },
    {
      blockType: 'timeline',
      heading: 'Timeline',
      entries: [{ period: '2024 – today', company: 'valiant', role: 'Architect', id: 't1' }],
      id: 'timeline',
    },
  ],
  updatedAt: '2026-11-19T00:00:00.000Z',
  createdAt: '2026-11-01T00:00:00.000Z',
  _status: 'published',
} as unknown as Page;

describe('markdown negotiation', () => {
  it('only serves Markdown when the client asks for it', () => {
    expect(wantsMarkdown('text/markdown')).toBe(true);
    expect(wantsMarkdown('text/markdown;q=0.9, text/html;q=0.8')).toBe(true);
    expect(wantsMarkdown('text/html')).toBe(false);
    expect(wantsMarkdown('text/html, text/markdown;q=0.5')).toBe(false);
    expect(wantsMarkdown('text/markdown;q=0')).toBe(false);
    expect(wantsMarkdown(null)).toBe(false);
  });

  it('returns a Markdown 404 body with links to the machine entry points', () => {
    const body = markdownNotFound('/en/missing');
    expect(body).toContain('/en/missing');
    expect(body).toContain('/llms.txt');
    expect(body).toContain('/sitemap.xml');
    expect(body).toContain('/docs');
    expect(body.length).toBeGreaterThan(20);
  });

  it('sets Content-Type text/markdown and Vary: Accept', () => {
    const response = markdownResponse('# ok');
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(response.headers.get('Vary')).toContain('Accept');
  });

  it('maps a content path to the internal markdown route', () => {
    expect(markdownRoutePath('/en/career')).toBe('/api/agent/markdown/en/career');
    expect(markdownRoutePath('en')).toBe('/api/agent/markdown/en');
  });
});

describe('page markdown serializer', () => {
  it('keeps the page title, blocks and canonical URL', () => {
    const markdown = pageToMarkdown({
      page,
      locale: 'en',
      path: '/en/career',
      description: 'Roles and employers.',
    });
    expect(markdown).toContain('# Career');
    expect(markdown).toContain('## Timeline');
    expect(markdown).toContain('Architect — valiant');
    expect(markdown).toContain('Canonical: https://mostheimer.de/en/career');
    expect(markdown).toContain('/llms.txt');
  });

  it('extracts text from Lexical paragraphs', () => {
    const text = lexicalToMarkdown({
      root: {
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'First paragraph.' }] },
          { type: 'paragraph', children: [{ type: 'text', text: 'Second paragraph.' }] },
        ],
      },
    });
    expect(text).toContain('First paragraph.');
    expect(text).toContain('Second paragraph.');
  });
});

describe('OpenAPI specification', () => {
  it('is OpenAPI 3.1 with unique operation ids and descriptions', () => {
    const spec = OPENAPI_SPEC as unknown as {
      openapi: string;
      paths: Record<
        string,
        Record<
          string,
          {
            operationId: string;
            description: string;
            responses: object;
            parameters?: Array<{ schema?: unknown }>;
          }
        >
      >;
    };
    expect(spec.openapi).toBe('3.1.0');
    const operations = Object.values(spec.paths).flatMap((path) => Object.values(path));
    expect(operations.length).toBeGreaterThanOrEqual(10);
    const ids = operations.map((operation) => operation.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const operation of operations) {
      expect(operation.description.length).toBeGreaterThan(20);
      expect(Object.keys(operation.responses).length).toBeGreaterThan(0);
      for (const parameter of operation.parameters ?? []) {
        expect(parameter.schema).toBeTruthy();
      }
    }
  });

  it('publishes an API index with the public endpoints', () => {
    const index = apiIndex();
    expect(index.openapi).toContain('/openapi.json');
    expect(index.documentation).toContain('/docs');
    expect(index.endpoints.some((endpoint) => endpoint.path === '/api/pages')).toBe(true);
    expect(index.endpoints.some((endpoint) => endpoint.path === '/api/mcp')).toBe(true);
  });
});

describe('agent discovery files', () => {
  it('serves an MCP manifest and skill discovery as JSON', () => {
    const manifest = wellKnownBody(['mcp', 'manifest.json']);
    expect(manifest?.contentType).toContain('application/json');
    expect(manifest?.body).toContain('streamable-http');
    expect(MCP_MANIFEST.transport.url).toContain('/api/mcp');

    const skills = wellKnownBody(['agent-skills', 'index.json']);
    expect(skills?.contentType).toContain('application/json');
    expect(skills?.body).toContain('mostheimer-site');
    expect(AGENT_SKILLS_INDEX.skills[0]?.url).toContain('SKILL.md');
  });

  it('serves the when-to-use skill as Markdown', () => {
    const skill = wellKnownBody(['agent-skills', 'mostheimer-site', 'SKILL.md']);
    expect(skill?.contentType).toContain('text/markdown');
    expect(skill?.body).toContain('## When to use this');
    expect(skill?.body).toContain('/api/mcp');
  });

  it('returns null for an unknown well-known path', () => {
    expect(wellKnownBody(['nope'])).toBeNull();
  });

  it('llms.txt names concrete use cases and developer resources', () => {
    expect(LLMS_TXT).toContain('## When to use this');
    expect(LLMS_TXT).toContain('/openapi.json');
    expect(LLMS_TXT).toContain('/docs');
    expect(LLMS_TXT).toContain('/.well-known/mcp/manifest.json');
    expect(WHEN_TO_USE.length).toBeGreaterThanOrEqual(4);
    expect(docsMarkdown()).toContain('## Endpoints');
    expect(mcpMarkdown()).toContain('## Tools');
  });
});

describe('organization JSON-LD', () => {
  it('carries contactPoint and postal address', () => {
    const organization = buildOrganization(identity) as Record<string, unknown>;
    expect(organization['@type']).toBe('Organization');
    expect(organization.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      email: identity.email,
      telephone: identity.telephone,
    });
    expect(organization.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: identity.streetAddress,
      postalCode: identity.postalCode,
    });
  });

  it('adds the organization and keywords to the homepage graph', () => {
    const person = buildPerson(identity);
    const graph = buildSiteJsonLd({
      locale: 'en',
      siteName: identity.siteName,
      person,
      organization: buildOrganization(identity),
    }) as { '@graph': Array<Record<string, unknown>> };
    expect(graph['@graph'].map((node) => node['@type'])).toEqual([
      'WebSite',
      'Person',
      'Organization',
    ]);
    expect(graph['@graph'][0]?.keywords).toEqual([...SITE_KEYWORDS]);
    expect((person as Record<string, unknown>).knowsAbout).toEqual([...SITE_KEYWORDS]);
  });
});
