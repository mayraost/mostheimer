import { API_BASE, SITE_BASE } from './developerDocs';

/**
 * OpenAPI 3.1 description of the public read API.
 *
 * Written by hand instead of generated: Payload's REST surface is small and
 * stable here, and the spec is also the input for LLM function calling. Every
 * operation therefore has a unique `operationId`, a description, typed
 * parameters and a response schema — the three things an agent tool loader
 * needs. Collection responses are described with a shared paginated envelope;
 * block layouts stay `additionalProperties: true` because they are a
 * discriminated union that changes with the CMS.
 */

type JsonSchema = Record<string, unknown>;

const errorSchema: JsonSchema = {
  type: 'object',
  required: ['message'],
  properties: { message: { type: 'string', description: 'Human-readable error message.' } },
  additionalProperties: true,
};

const paginationProperties: JsonSchema = {
  docs: { type: 'array', items: {} },
  totalDocs: { type: 'integer', minimum: 0 },
  limit: { type: 'integer', minimum: 1 },
  totalPages: { type: 'integer', minimum: 0 },
  page: { type: 'integer', minimum: 1 },
  pagingCounter: { type: 'integer', minimum: 1 },
  hasPrevPage: { type: 'boolean' },
  hasNextPage: { type: 'boolean' },
  prevPage: { type: ['integer', 'null'] },
  nextPage: { type: ['integer', 'null'] },
};

function paginated(itemRef: string): JsonSchema {
  return {
    type: 'object',
    required: ['docs', 'totalDocs', 'limit', 'totalPages', 'page'],
    properties: {
      ...paginationProperties,
      docs: { type: 'array', items: { $ref: itemRef } },
    },
    additionalProperties: true,
  };
}

function listParameters(extra: JsonSchema[] = []): JsonSchema[] {
  return [
    {
      name: 'locale',
      in: 'query',
      required: false,
      description: 'Response locale. Defaults to the Payload default locale (`en`).',
      schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      description: 'Maximum number of documents in this page.',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
    {
      name: 'page',
      in: 'query',
      required: false,
      description: '1-based page number.',
      schema: { type: 'integer', minimum: 1, default: 1 },
    },
    {
      name: 'depth',
      in: 'query',
      required: false,
      description: 'Relationship population depth. Use 0 for ids only.',
      schema: { type: 'integer', minimum: 0, maximum: 3, default: 2 },
    },
    {
      name: 'sort',
      in: 'query',
      required: false,
      description: 'Payload sort expression, for example `-updatedAt` or `order`.',
      schema: { type: 'string' },
    },
    {
      name: 'where',
      in: 'query',
      required: false,
      description: 'Payload where expression as JSON, for example `{"slug":{"equals":"home"}}`.',
      schema: { type: 'string' },
    },
    ...extra,
  ];
}

const idParameter: JsonSchema = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Numeric document id.',
  schema: { type: 'integer', minimum: 1 },
};

const jsonResponse = (schemaRef: string, description: string): JsonSchema => ({
  description,
  content: { 'application/json': { schema: { $ref: schemaRef } } },
});

const errorResponse: JsonSchema = {
  description: 'The requested document or route does not exist.',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};

const pageSchema: JsonSchema = {
  type: 'object',
  required: ['id', 'title', 'slug'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string', description: 'Stable page slug; `home` is the locale root.' },
    layout: {
      type: 'array',
      description:
        'Ordered content blocks. Each block has a `blockType` discriminator (hero, richText, caseStudy, …).',
      items: { type: 'object', additionalProperties: true },
    },
    updatedAt: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    _status: { type: 'string', enum: ['draft', 'published'] },
  },
  additionalProperties: true,
};

const projectSchema: JsonSchema = {
  type: 'object',
  required: ['id', 'title', 'slug'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
    teaser: { type: 'string' },
    kind: { type: 'string' },
    stack: { type: 'array', items: { type: 'string' } },
    tags: {
      type: 'array',
      items: { oneOf: [{ type: 'integer' }, { $ref: '#/components/schemas/ProjectTag' }] },
    },
    liveUrl: { type: ['string', 'null'], format: 'uri' },
    githubUrl: { type: ['string', 'null'], format: 'uri' },
    storybookUrl: { type: ['string', 'null'], format: 'uri' },
    context: { type: 'string' },
    approach: { type: 'object', additionalProperties: true },
    learnings: { type: 'string' },
    outcome: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
};

const projectTagSchema: JsonSchema = {
  type: 'object',
  required: ['id', 'label', 'slug'],
  properties: {
    id: { type: 'integer' },
    label: { type: 'string' },
    slug: { type: 'string', description: 'Stable filter slug used by `?tag=`.' },
    description: { type: ['string', 'null'] },
  },
  additionalProperties: true,
};

const mediaSchema: JsonSchema = {
  type: 'object',
  required: ['id', 'url', 'filename', 'mimeType'],
  properties: {
    id: { type: 'integer' },
    url: { type: 'string', description: 'Public file URL, usually absolute in production.' },
    filename: { type: 'string' },
    mimeType: { type: 'string' },
    width: { type: ['integer', 'null'] },
    height: { type: ['integer', 'null'] },
    alt: { type: ['string', 'null'] },
    sizes: { type: 'object', additionalProperties: true },
  },
  additionalProperties: true,
};

const siteSettingsSchema: JsonSchema = {
  type: 'object',
  required: ['id', 'siteName'],
  properties: {
    id: { type: 'integer' },
    siteName: { type: 'string' },
    siteDescription: { type: ['string', 'null'] },
    identity: {
      type: 'object',
      description: 'Person facts used for the JSON-LD Person/Organization nodes.',
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

const navigationSchema: JsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
    headerLinks: { type: 'array', items: { $ref: '#/components/schemas/NavLink' } },
    footerLinks: { type: 'array', items: { $ref: '#/components/schemas/NavLink' } },
  },
  additionalProperties: true,
};

const navLinkSchema: JsonSchema = {
  type: 'object',
  required: ['label', 'link'],
  properties: {
    label: { type: 'string' },
    link: { type: 'string' },
    newTab: { type: ['boolean', 'null'] },
  },
  additionalProperties: true,
};

const translationsSchema: JsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
    copy: {
      type: 'array',
      items: {
        type: 'object',
        required: ['key'],
        properties: {
          key: { type: 'string' },
          text: { type: ['string', 'null'] },
          values: { type: ['string', 'null'] },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
};

const healthSchema: JsonSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['ok'] },
    release: { type: ['string', 'null'], description: 'Running image release id.' },
  },
  additionalProperties: true,
};

const apiIndexSchema: JsonSchema = {
  type: 'object',
  required: ['name', 'version', 'documentation', 'openapi', 'endpoints'],
  properties: {
    name: { type: 'string' },
    version: { type: 'string' },
    description: { type: 'string' },
    documentation: { type: 'string', format: 'uri' },
    openapi: { type: 'string', format: 'uri' },
    llms: { type: 'string', format: 'uri' },
    mcp: { type: 'string', format: 'uri' },
    endpoints: {
      type: 'array',
      items: {
        type: 'object',
        required: ['method', 'path'],
        properties: {
          method: { type: 'string', enum: ['GET', 'POST'] },
          path: { type: 'string' },
          description: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
};

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Mayra Ostheimer — Public Content API',
    version: '1.0.0',
    summary: 'Read-only CMS content for mostheimer.de, plus health and MCP discovery.',
    description:
      'Public REST API of mostheimer.de. Anonymous callers can read published pages, projects, tags, media and CMS globals. Writes and the MCP server require a Payload user API key. The API is intentionally small: one content model, two locales (`en`, `de`), stable slugs.',
    contact: {
      name: 'Mayra Ostheimer',
      url: `${SITE_BASE}/en/contact`,
      email: 'mayraostheimer@gmail.com',
    },
    license: { name: 'Content: all rights reserved', identifier: 'LicenseRef-Proprietary' },
  },
  servers: [{ url: SITE_BASE, description: 'Production' }],
  tags: [
    { name: 'Pages', description: 'Published CMS pages and their block layout.' },
    { name: 'Projects', description: 'Project showcase entries and tags.' },
    { name: 'Globals', description: 'Site-wide settings, navigation and UI copy.' },
    { name: 'Media', description: 'Uploaded images and generated variants.' },
    { name: 'System', description: 'Health, API index and machine-readable entry points.' },
  ],
  paths: {
    '/api': {
      get: {
        tags: ['System'],
        operationId: 'getApiIndex',
        summary: 'API index and discovery links',
        description:
          'Returns the API name, version, documentation, OpenAPI and MCP URLs, plus the endpoint list. Use this as the first call when you do not know the surface.',
        responses: {
          200: jsonResponse('#/components/schemas/ApiIndex', 'API index.'),
        },
      },
    },
    '/api/pages': {
      get: {
        tags: ['Pages'],
        operationId: 'listPages',
        summary: 'List published CMS pages',
        description:
          'Returns a paginated list of published pages. Use `where` to filter by slug, for example `{"slug":{"equals":"home"}}`.',
        parameters: listParameters(),
        responses: {
          200: jsonResponse('#/components/schemas/PaginatedPages', 'A page of documents.'),
          400: errorResponse,
        },
      },
    },
    '/api/pages/{id}': {
      get: {
        tags: ['Pages'],
        operationId: 'getPage',
        summary: 'Get one CMS page by id',
        description: 'Returns a single page document including its ordered layout blocks.',
        parameters: [
          idParameter,
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
          {
            name: 'depth',
            in: 'query',
            required: false,
            description: 'Relationship population depth.',
            schema: { type: 'integer', minimum: 0, maximum: 3, default: 2 },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/Page', 'The page document.'),
          404: errorResponse,
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        operationId: 'listProjects',
        summary: 'List project showcase entries',
        description:
          'Returns published projects with title, teaser, stack, tags and case-study fields. Featured projects sort first in the website listing.',
        parameters: listParameters(),
        responses: {
          200: jsonResponse('#/components/schemas/PaginatedProjects', 'A page of projects.'),
          400: errorResponse,
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        operationId: 'getProject',
        summary: 'Get one project by id',
        description: 'Returns a single project document with its case-study narrative fields.',
        parameters: [
          idParameter,
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/Project', 'The project document.'),
          404: errorResponse,
        },
      },
    },
    '/api/projectTags': {
      get: {
        tags: ['Projects'],
        operationId: 'listProjectTags',
        summary: 'List project tags',
        description:
          'Returns the tag vocabulary used by the project listing filter. `slug` is the stable value for `?tag=<slug>`.',
        parameters: [
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale for the label.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of tags.',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/PaginatedProjectTags', 'A page of tags.'),
        },
      },
    },
    '/api/media': {
      get: {
        tags: ['Media'],
        operationId: 'listMedia',
        summary: 'List uploaded media',
        description: 'Returns media documents with public URLs and generated image variants.',
        parameters: listParameters(),
        responses: {
          200: jsonResponse('#/components/schemas/PaginatedMedia', 'A page of media documents.'),
        },
      },
    },
    '/api/globals/site-settings': {
      get: {
        tags: ['Globals'],
        operationId: 'getSiteSettings',
        summary: 'Get site settings',
        description: 'Brand name, site description and the identity facts used by JSON-LD.',
        parameters: [
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/SiteSettings', 'The site-settings global.'),
        },
      },
    },
    '/api/globals/navigation': {
      get: {
        tags: ['Globals'],
        operationId: 'getNavigation',
        summary: 'Get navigation links',
        description: 'Header and footer navigation links for one locale.',
        parameters: [
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/Navigation', 'The navigation global.'),
        },
      },
    },
    '/api/globals/translations': {
      get: {
        tags: ['Globals'],
        operationId: 'getTranslations',
        summary: 'Get the UI copy registry',
        description:
          'Returns the key/value copy rows used by the website. Useful when you need the exact visible label for a locale.',
        parameters: [
          {
            name: 'locale',
            in: 'query',
            required: false,
            description: 'Response locale.',
            schema: { type: 'string', enum: ['en', 'de'], default: 'en' },
          },
        ],
        responses: {
          200: jsonResponse('#/components/schemas/Translations', 'The translations global.'),
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        operationId: 'getHealth',
        summary: 'Liveness probe',
        description: 'Returns `{ status: "ok" }` and the running release id. Never cached.',
        responses: {
          200: jsonResponse('#/components/schemas/Health', 'Service is healthy.'),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: errorSchema,
      Page: pageSchema,
      Project: projectSchema,
      ProjectTag: projectTagSchema,
      Media: mediaSchema,
      SiteSettings: siteSettingsSchema,
      Navigation: navigationSchema,
      NavLink: navLinkSchema,
      Translations: translationsSchema,
      Health: healthSchema,
      ApiIndex: apiIndexSchema,
      PaginatedPages: paginated('#/components/schemas/Page'),
      PaginatedProjects: paginated('#/components/schemas/Project'),
      PaginatedProjectTags: paginated('#/components/schemas/ProjectTag'),
      PaginatedMedia: paginated('#/components/schemas/Media'),
    },
    securitySchemes: {
      payloadApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description:
          'Payload user API key, sent as `Authorization: users API-Key <key>`. Only required for writes and MCP; the documented GET endpoints are public.',
      },
    },
  },
  security: [],
  externalDocs: {
    description: 'Human-readable developer documentation',
    url: `${SITE_BASE}/docs`,
  },
} as const;

/** Public API index served at `/api` (and referenced by the OpenAPI spec). */
export function apiIndex() {
  return {
    name: 'Mayra Ostheimer — Public Content API',
    version: '1.0.0',
    description: DEVELOPER_DESCRIPTION,
    documentation: `${SITE_BASE}/docs`,
    openapi: `${SITE_BASE}/openapi.json`,
    llms: `${SITE_BASE}/llms.txt`,
    mcp: `${SITE_BASE}/mcp`,
    endpoints: [
      { method: 'GET', path: '/api/pages', description: 'Published CMS pages' },
      { method: 'GET', path: '/api/pages/{id}', description: 'One CMS page' },
      { method: 'GET', path: '/api/projects', description: 'Project showcase entries' },
      { method: 'GET', path: '/api/projects/{id}', description: 'One project' },
      { method: 'GET', path: '/api/projectTags', description: 'Project tags' },
      { method: 'GET', path: '/api/media', description: 'Uploaded media' },
      { method: 'GET', path: '/api/globals/site-settings', description: 'Site settings' },
      { method: 'GET', path: '/api/globals/navigation', description: 'Navigation' },
      { method: 'GET', path: '/api/globals/translations', description: 'UI copy' },
      { method: 'GET', path: '/api/health', description: 'Liveness probe' },
      { method: 'POST', path: '/api/mcp', description: 'MCP Streamable HTTP endpoint' },
    ],
  };
}

const DEVELOPER_DESCRIPTION =
  'Read-only CMS content for mostheimer.de, plus health and MCP discovery. Anonymous GET requests need no API key.';

export { API_BASE };
