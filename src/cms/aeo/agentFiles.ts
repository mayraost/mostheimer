import { MCP_ENDPOINT, SITE_BASE, WHEN_TO_USE } from './developerDocs';

/**
 * Machine-readable agent discovery files under `/.well-known/`.
 *
 * The site already has an llms.txt and a live MCP endpoint; these files make
 * both discoverable at the conventional well-known URLs. They are static
 * constants (no DB, no request context) so the routes stay cacheable and work
 * during a cold start.
 */

export const MCP_MANIFEST = {
  $schema: 'https://modelcontextprotocol.io/schema/manifest.json',
  name: 'mostheimer',
  displayName: 'Mayra Ostheimer',
  description:
    'CMS and content tools for mostheimer.de: read pages, projects, tags, media and globals; authenticated writes via Payload. Streamable HTTP transport.',
  version: '1.0.0',
  protocolVersion: '2025-06-18',
  homepage: SITE_BASE,
  documentation: `${SITE_BASE}/mcp`,
  transport: {
    type: 'streamable-http',
    url: MCP_ENDPOINT,
  },
  authentication: {
    type: 'apiKey',
    in: 'header',
    name: 'Authorization',
    scheme: 'users API-Key',
    description:
      'Payload user API key. Create it in the Payload admin under Users → API Key. Anonymous initialize is answered, tool calls require the key.',
  },
  capabilities: {
    tools: {},
  },
  tools: [
    { name: 'pages.find', description: 'Search and read CMS pages, including block layout.' },
    { name: 'pages.create', description: 'Create a CMS page (authenticated).' },
    { name: 'pages.update', description: 'Update a CMS page (authenticated).' },
    { name: 'projects.find', description: 'Read project showcase entries.' },
    { name: 'projectTags.find', description: 'Read the project tag vocabulary.' },
    { name: 'media.find', description: 'Read uploaded media documents.' },
    { name: 'globals.*', description: 'Read and update CMS globals (authenticated writes).' },
  ],
  // Common client configuration shape. The canonical transport description is
  // the `transport` object above; this block is what most MCP clients paste.
  mcpServers: {
    mostheimer: {
      type: 'streamable-http',
      url: MCP_ENDPOINT,
      headers: { Authorization: 'users API-Key <your-api-key>' },
    },
  },
} as const;

export const AGENT_SKILLS_INDEX = {
  $schema: 'https://schemas.agentskills.io/discovery/index.json',
  version: '0.1.0',
  skills: [
    {
      name: 'mostheimer-site',
      description:
        'How to answer questions about Mayra Ostheimer, cite her case studies, read the public content API and use the MCP server. Includes when-to-use guidance and canonical URLs.',
      url: `${SITE_BASE}/.well-known/agent-skills/mostheimer-site/SKILL.md`,
      type: 'skill',
    },
  ],
} as const;

export const AGENT_SKILL_MARKDOWN = `# mostheimer-site

Use this skill when a user asks about Mayra Ostheimer, her engineering work,
case studies, availability, contact details, or the technical implementation of
this website.

## When to use this

${WHEN_TO_USE.map((entry) => `- ${entry}`).join('\n')}

## Canonical sources

- Home (DE): ${SITE_BASE}/de
- Home (EN): ${SITE_BASE}/en
- Agent instructions: ${SITE_BASE}/llms.txt
- API documentation: ${SITE_BASE}/docs
- OpenAPI: ${SITE_BASE}/openapi.json
- Sitemap: ${SITE_BASE}/sitemap.xml

## How to call the site

1. Prefer the JSON API for facts: \`GET ${SITE_BASE}/api/pages?locale=en\`,
   \`GET ${SITE_BASE}/api/projects?locale=en\`, or
   \`GET ${SITE_BASE}/api/globals/site-settings?locale=en\`.
2. For a Markdown representation of a page, send \`Accept: text/markdown\` to
   the page URL (for example \`${SITE_BASE}/en/career\`). The response is
   \`text/markdown\` with \`Vary: Accept\`.
3. For CMS edits, connect to the MCP server at \`${MCP_ENDPOINT}\`
   (Streamable HTTP) with a Payload user API key.
4. Do not scrape the admin panel. Do not treat marketing copy as a verified
   availability claim; the site deliberately avoids those claims.

## Boundaries

- Content is published in German (\`/de\`) and English (\`/en\`); use the locale
  the user asked for.
- The imprint and privacy pages are the authoritative legal sources.
- The API is read-only for anonymous callers; writes require an API key.
`;

/** Resolve one well-known path to a response body, or `null` for a 404. */
export function wellKnownBody(slug: string[]): { body: string; contentType: string } | null {
  const path = slug.join('/');

  if (path === 'mcp/manifest.json' || path === 'mcp.json') {
    return {
      body: JSON.stringify(MCP_MANIFEST, null, 2),
      contentType: 'application/json; charset=utf-8',
    };
  }

  if (path === 'agent-skills/index.json' || path === 'agent-skills.json') {
    return {
      body: JSON.stringify(AGENT_SKILLS_INDEX, null, 2),
      contentType: 'application/json; charset=utf-8',
    };
  }

  if (path === 'agent-skills/mostheimer-site/SKILL.md') {
    return { body: AGENT_SKILL_MARKDOWN, contentType: 'text/markdown; charset=utf-8' };
  }

  return null;
}
