/**
 * Developer-facing copy and machine-readable facts shared by the human docs
 * pages (`/[locale]/docs`, `/[locale]/mcp`), the Markdown representation and
 * the agent instruction files.
 *
 * PURE module (no `next/*`, no Payload): the Markdown route and the tests can
 * import it without a request context.
 */

export const SITE_BASE = 'https://mostheimer.de';
export const API_BASE = `${SITE_BASE}/api`;
export const MCP_ENDPOINT = `${SITE_BASE}/api/mcp`;
export const OPENAPI_PATH = '/openapi.json';
export const LLMS_PATH = '/llms.txt';
export const DOCS_PATH = '/docs';
export const MCP_PAGE_PATH = '/mcp';

export const DEVELOPER_DOCS_TITLE = 'Mayra Ostheimer API & Developer Resources';
export const DEVELOPER_DOCS_DESCRIPTION =
  'Public read API, OpenAPI specification, MCP server and agent instructions for mostheimer.de. No API key is required for read-only content endpoints.';

export const MCP_PAGE_TITLE = 'Mayra Ostheimer MCP Server';
export const MCP_PAGE_DESCRIPTION =
  'Model Context Protocol (MCP) server for mostheimer.de. Streamable HTTP transport, Payload-backed CMS tools, authenticated with a Payload user API key.';

export type ApiEndpointDoc = {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  example: string;
};

/**
 * The public, unauthenticated read surface. These are Payload's REST endpoints,
 * exposed by the same deployment that serves the website.
 */
export const PUBLIC_API_ENDPOINTS: readonly ApiEndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/pages',
    description:
      'Published CMS pages with their block layout, both locales. Supports Payload query parameters (`locale`, `limit`, `page`, `depth`, `sort`, `where`).',
    example: `${API_BASE}/pages?locale=en&limit=10&depth=0`,
  },
  {
    method: 'GET',
    path: '/api/pages/{id}',
    description: 'One CMS page by numeric id, including its layout blocks.',
    example: `${API_BASE}/pages/16?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/projects',
    description:
      'Published project showcase entries (title, teaser, stack, tags, case-study fields).',
    example: `${API_BASE}/projects?locale=en&limit=10&depth=1`,
  },
  {
    method: 'GET',
    path: '/api/projects/{id}',
    description: 'One project by numeric id.',
    example: `${API_BASE}/projects/5?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/projectTags',
    description: 'Project tags (stable slug + localized label) used by the listing filter.',
    example: `${API_BASE}/projectTags?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/media',
    description: 'Uploaded media documents (image URLs, dimensions, alt text).',
    example: `${API_BASE}/media?limit=20&depth=0`,
  },
  {
    method: 'GET',
    path: '/api/globals/site-settings',
    description: 'Brand name, site description, identity facts and social profiles.',
    example: `${API_BASE}/globals/site-settings?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/globals/navigation',
    description: 'Header and footer navigation links per locale.',
    example: `${API_BASE}/globals/navigation?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/globals/translations',
    description: 'UI copy registry (key/value rows per locale).',
    example: `${API_BASE}/globals/translations?locale=en`,
  },
  {
    method: 'GET',
    path: '/api/health',
    description: 'Liveness probe with the running release id. Never cached.',
    example: `${API_BASE}/health`,
  },
];

export const MCP_TOOLS: readonly { name: string; description: string }[] = [
  {
    name: 'pages.find',
    description: 'Search and read CMS pages, including their block layout.',
  },
  {
    name: 'pages.create / pages.update',
    description: 'Create or update a page (authenticated Payload user with write access).',
  },
  {
    name: 'projects.find',
    description: 'Read the project showcase entries and their case-study fields.',
  },
  {
    name: 'projectTags.find',
    description: 'Read the tag vocabulary used by the project listing.',
  },
  {
    name: 'media.find',
    description: 'Read uploaded media documents and their generated variants.',
  },
  {
    name: 'globals.*',
    description: 'Read and update site-settings, navigation, translations and not-found content.',
  },
];

/** Best-fit jobs for an agent — specific, not marketing copy. */
export const WHEN_TO_USE: readonly string[] = [
  'You need the public CV facts of Mayra Ostheimer (roles, employers, dates, focus areas) as structured data instead of scraping HTML. Read `/api/pages?locale=en` or the `Person` JSON-LD on `/en`.',
  'You are looking for case studies or project details to cite. Start at `/en/projects`, then follow a project URL or query `/api/projects?locale=en`.',
  'You need contact or legal facts (imprint, privacy, address, email). Use `/en/contact`, `/en/impressum`, `/en/privacy` or `/api/globals/site-settings`.',
  'You are building a tool that edits this CMS. Connect to the MCP server at `/api/mcp` with a Payload user API key; do not scrape the admin panel.',
  'You need a Markdown representation of a page. Send `Accept: text/markdown` to the page URL (for example `/en` or `/en/career`).',
];

/** Human-readable docs page as Markdown (also served on `Accept: text/markdown`). */
export function docsMarkdown(): string {
  return [
    `# ${DEVELOPER_DOCS_TITLE}`,
    '',
    `> ${DEVELOPER_DOCS_DESCRIPTION}`,
    '',
    '## Base URL',
    '',
    `All endpoints are served from \`${SITE_BASE}\`. The API is read-only for anonymous callers; no API key is required for \`GET\` requests.`,
    '',
    '## Authentication',
    '',
    '- **Anonymous reads:** the endpoints below are public. Send no credentials.',
    '- **Writes and MCP:** authenticate with a Payload user API key in the `Authorization` header:',
    '',
    '```http',
    'Authorization: users API-Key <your-api-key>',
    '```',
    '',
    'API keys are created in the Payload admin under **Users → API Key**. Keys inherit the permissions of their owner.',
    '',
    '## Endpoints',
    '',
    ...PUBLIC_API_ENDPOINTS.flatMap((endpoint) => [
      `### \`${endpoint.method} ${endpoint.path}\``,
      '',
      endpoint.description,
      '',
      '```bash',
      `curl -sS '${endpoint.example}'`,
      '```',
      '',
    ]),
    '## OpenAPI',
    '',
    `The machine-readable specification is published at [\`${OPENAPI_PATH}\`](${SITE_BASE}${OPENAPI_PATH}) (OpenAPI 3.1). It includes every operation id, typed parameters and response schemas for function-calling clients.`,
    '',
    '## MCP server',
    '',
    `The Model Context Protocol server is documented at [\`${MCP_PAGE_PATH}\`](${SITE_BASE}${MCP_PAGE_PATH}) and served at \`${MCP_ENDPOINT}\` (Streamable HTTP).`,
    '',
    '## Rate limits and caching',
    '',
    '- Read endpoints are served from the CMS cache; responses are JSON and not edge-cached.',
    '- Be polite: use `limit` and `depth` instead of downloading the whole collection.',
    '- The Markdown representation (`Accept: text/markdown`) is `no-store` by design.',
    '',
    '## Sandbox / test access',
    '',
    'The public read API doubles as the test environment: it is read-only, needs no signup and serves the same published content as the website. There is no separate sandbox dataset. Writes and MCP tool calls require an API key and change the real CMS.',
    '',
    '## Agent entry points',
    '',
    `- [Agent instructions](${SITE_BASE}${LLMS_PATH})`,
    `- [Sitemap](${SITE_BASE}/sitemap.xml)`,
    `- [OpenAPI](${SITE_BASE}${OPENAPI_PATH})`,
    `- [MCP manifest](${SITE_BASE}/.well-known/mcp/manifest.json)`,
    '',
  ].join('\n');
}

/** MCP page as Markdown. */
export function mcpMarkdown(): string {
  return [
    `# ${MCP_PAGE_TITLE}`,
    '',
    `> ${MCP_PAGE_DESCRIPTION}`,
    '',
    '## Endpoint',
    '',
    '```text',
    `${MCP_ENDPOINT} (Streamable HTTP)`,
    '```',
    '',
    'The endpoint answers `POST` JSON-RPC requests. `GET` without a session returns `405`, which is expected.',
    '',
    '## Authentication',
    '',
    '```http',
    'Authorization: users API-Key <your-api-key>',
    '```',
    '',
    'Create the key in the Payload admin (**Users → API Key**). The key inherits the permissions of its owner; the server never returns password hashes or salts.',
    '',
    '## Tools',
    '',
    ...MCP_TOOLS.map((tool) => `- **${tool.name}** — ${tool.description}`),
    '',
    '## Client configuration',
    '',
    '```json',
    JSON.stringify(
      {
        mcpServers: {
          mostheimer: {
            type: 'streamable-http',
            url: MCP_ENDPOINT,
            headers: { Authorization: 'users API-Key <your-api-key>' },
          },
        },
      },
      null,
      2,
    ),
    '```',
    '',
    '## Discovery',
    '',
    `- [MCP manifest](${SITE_BASE}/.well-known/mcp/manifest.json)`,
    `- [Agent instructions](${SITE_BASE}${LLMS_PATH})`,
    `- [API documentation](${SITE_BASE}${DOCS_PATH})`,
    '',
  ].join('\n');
}
