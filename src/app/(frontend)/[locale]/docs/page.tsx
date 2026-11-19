import type { Metadata } from 'next';
import Link from 'next/link';
import {
  API_BASE,
  DEVELOPER_DOCS_DESCRIPTION,
  DEVELOPER_DOCS_TITLE,
  LLMS_PATH,
  MCP_PAGE_PATH,
  OPENAPI_PATH,
  PUBLIC_API_ENDPOINTS,
  SITE_BASE,
} from '@/cms/aeo/developerDocs';
import { BentoTile, Chip, Eyebrow, RuleAccent } from '@/components/ui/industrial';

/**
 * Human-readable developer documentation at `/[locale]/docs`.
 *
 * Static server component: no CMS read, no client JS. The same content is
 * available as Markdown through the negotiation route, and the machine-readable
 * surface lives at `/openapi.json` + `/api`.
 *
 * The page exists so a search for "Mayra Ostheimer API" or "mostheimer API
 * docs" can land on this domain instead of a third-party index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = locale === 'de' ? 'de' : 'en';
  return {
    title: { absolute: DEVELOPER_DOCS_TITLE },
    description: DEVELOPER_DOCS_DESCRIPTION,
    alternates: { canonical: `${SITE_BASE}/${language}/docs` },
  };
}

// Required because the locale segment is dynamic (same rule as the catch-all
// page): without it the build cannot collect the route.
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

export default function DeveloperDocsPage() {
  return (
    <article className="mx-auto w-full max-w-6xl pb-16 pt-8 lg:pt-12">
      <header className="mb-10 border-b border-border pb-8">
        <Eyebrow>developer resources</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
          {DEVELOPER_DOCS_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          {DEVELOPER_DOCS_DESCRIPTION}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip variant="solid">REST</Chip>
          <Chip variant="outline">OpenAPI 3.1</Chip>
          <Chip variant="outline">MCP</Chip>
          <Chip variant="outline">EN / DE</Chip>
        </div>
      </header>

      <section className="mb-10 grid gap-3 md:grid-cols-3">
        <BentoTile className="p-5">
          <p className="mono-label text-primary">base url</p>
          <p className="mt-2 break-all font-mono text-sm text-foreground">{SITE_BASE}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Anonymous <code>GET</code> requests need no API key.
          </p>
        </BentoTile>
        <BentoTile className="p-5">
          <p className="mono-label text-primary">openapi</p>
          <Link
            href={OPENAPI_PATH}
            className="mt-2 block font-mono text-sm text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
          >
            {OPENAPI_PATH}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Typed operations, parameters and response schemas for tool loaders.
          </p>
        </BentoTile>
        <BentoTile className="p-5">
          <p className="mono-label text-primary">mcp server</p>
          <Link
            href={MCP_PAGE_PATH}
            className="mt-2 block font-mono text-sm text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
          >
            {MCP_PAGE_PATH}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Streamable HTTP at <code>{API_BASE}/mcp</code>.
          </p>
        </BentoTile>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Authentication</h2>
        <RuleAccent className="my-4" />
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The endpoints below are public and read-only. Send no credentials and respect the
            pagination parameters.
          </p>
          <p>
            Writes and the MCP server require a Payload user API key. Create it in the Payload admin
            under <strong className="text-foreground">Users → API Key</strong>; the key inherits the
            permissions of its owner.
          </p>
          <pre className="overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs text-foreground">
            <code>Authorization: users API-Key &lt;your-api-key&gt;</code>
          </pre>
          <p>
            There is no separate sandbox: the public read API is read-only, needs no signup and
            serves the same published content as the website. Writes and MCP tool calls change the
            real CMS.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Endpoints</h2>
        <RuleAccent className="my-4" />
        <div className="space-y-3">
          {PUBLIC_API_ENDPOINTS.map((endpoint) => (
            <BentoTile key={`${endpoint.method}-${endpoint.path}`} className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Chip variant="fill">{endpoint.method}</Chip>
                <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{endpoint.description}</p>
              <pre className="mt-3 overflow-x-auto rounded-[6px] border border-border bg-background/60 p-3 font-mono text-xs text-foreground">
                <code>curl -sS &apos;{endpoint.example}&apos;</code>
              </pre>
            </BentoTile>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Machine-readable entry points
        </h2>
        <RuleAccent className="my-4" />
        <ul className="space-y-2 text-sm">
          <li>
            <Link className="text-primary underline underline-offset-4" href={OPENAPI_PATH}>
              OpenAPI 3.1 specification
            </Link>{' '}
            <span className="text-muted-foreground">— operations, schemas, function calling.</span>
          </li>
          <li>
            <Link className="text-primary underline underline-offset-4" href="/api">
              API index (JSON)
            </Link>{' '}
            <span className="text-muted-foreground">— endpoint list and discovery links.</span>
          </li>
          <li>
            <Link className="text-primary underline underline-offset-4" href={LLMS_PATH}>
              llms.txt
            </Link>{' '}
            <span className="text-muted-foreground">— site overview and when-to-use guidance.</span>
          </li>
          <li>
            <Link
              className="text-primary underline underline-offset-4"
              href="/.well-known/mcp/manifest.json"
            >
              MCP manifest
            </Link>{' '}
            <span className="text-muted-foreground">— transport, auth and tool list.</span>
          </li>
          <li>
            <Link className="text-primary underline underline-offset-4" href="/sitemap.xml">
              Sitemap
            </Link>{' '}
            <span className="text-muted-foreground">— every public page in both locales.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Markdown negotiation
        </h2>
        <RuleAccent className="my-4" />
        <p className="max-w-3xl text-sm text-muted-foreground">
          Every public page is also available as Markdown. Send{' '}
          <code className="text-foreground">Accept: text/markdown</code> to the page URL and the
          response is <code className="text-foreground">text/markdown</code> with{' '}
          <code className="text-foreground">Vary: Accept</code>. Browsers keep receiving HTML.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs text-foreground">
          <code>{`curl -sS -H 'Accept: text/markdown' ${SITE_BASE}/en/career`}</code>
        </pre>
      </section>
    </article>
  );
}
