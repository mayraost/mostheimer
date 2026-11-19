import type { Metadata } from 'next';
import Link from 'next/link';
import {
  DEVELOPER_DOCS_TITLE,
  LLMS_PATH,
  MCP_ENDPOINT,
  MCP_PAGE_DESCRIPTION,
  MCP_PAGE_TITLE,
  MCP_TOOLS,
  SITE_BASE,
} from '@/cms/aeo/developerDocs';
import { BentoTile, Chip, Eyebrow, RuleAccent } from '@/components/ui/industrial';

/**
 * MCP server documentation at `/[locale]/mcp`.
 *
 * One page per tool surface (not a paragraph on the homepage): the audit that
 * asks for "a search for your MCP server returns your own page" needs a stable
 * URL whose title contains the product name and "MCP".
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = locale === 'de' ? 'de' : 'en';
  return {
    title: { absolute: MCP_PAGE_TITLE },
    description: MCP_PAGE_DESCRIPTION,
    alternates: { canonical: `${SITE_BASE}/${language}/mcp` },
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

export default function McpPage() {
  const clientConfig = JSON.stringify(
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
  );

  return (
    <article className="mx-auto w-full max-w-6xl pb-16 pt-8 lg:pt-12">
      <header className="mb-10 border-b border-border pb-8">
        <Eyebrow>model context protocol</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-[-0.03em] text-foreground lg:text-5xl">
          {MCP_PAGE_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">{MCP_PAGE_DESCRIPTION}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip variant="solid">Streamable HTTP</Chip>
          <Chip variant="outline">Payload CMS</Chip>
          <Chip variant="outline">API key</Chip>
        </div>
      </header>

      <section className="mb-10 grid gap-3 md:grid-cols-2">
        <BentoTile className="p-5">
          <p className="mono-label text-primary">endpoint</p>
          <p className="mt-2 break-all font-mono text-sm text-foreground">{MCP_ENDPOINT}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            The endpoint answers <code>POST</code> JSON-RPC requests. A bare <code>GET</code>{' '}
            returns <code>405</code>; that is expected.
          </p>
        </BentoTile>
        <BentoTile className="p-5">
          <p className="mono-label text-primary">authentication</p>
          <pre className="mt-2 overflow-x-auto rounded-[6px] border border-border bg-background/60 p-3 font-mono text-xs text-foreground">
            <code>Authorization: users API-Key &lt;your-api-key&gt;</code>
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Create the key in the Payload admin under <strong>Users → API Key</strong>. The key
            inherits the permissions of its owner.
          </p>
        </BentoTile>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Tools</h2>
        <RuleAccent className="my-4" />
        <div className="grid gap-3 md:grid-cols-2">
          {MCP_TOOLS.map((tool) => (
            <BentoTile key={tool.name} className="p-5">
              <code className="font-mono text-sm text-primary">{tool.name}</code>
              <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
            </BentoTile>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Client configuration
        </h2>
        <RuleAccent className="my-4" />
        <pre className="overflow-x-auto rounded-[6px] border border-border bg-surface p-4 font-mono text-xs text-foreground">
          <code>{clientConfig}</code>
        </pre>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Discovery</h2>
        <RuleAccent className="my-4" />
        <ul className="space-y-2 text-sm">
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
            <Link className="text-primary underline underline-offset-4" href={LLMS_PATH}>
              llms.txt
            </Link>{' '}
            <span className="text-muted-foreground">— agent instructions and when-to-use.</span>
          </li>
          <li>
            <Link className="text-primary underline underline-offset-4" href="/docs">
              {DEVELOPER_DOCS_TITLE}
            </Link>{' '}
            <span className="text-muted-foreground">— REST endpoints and OpenAPI.</span>
          </li>
          <li>
            <Link className="text-primary underline underline-offset-4" href="/openapi.json">
              OpenAPI specification
            </Link>{' '}
            <span className="text-muted-foreground">— typed operations for tool loaders.</span>
          </li>
        </ul>
      </section>
    </article>
  );
}
