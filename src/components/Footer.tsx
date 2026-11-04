import Link from 'next/link';

export function Footer({
  navLinks,
}: {
  locale: string;
  navLinks?: {
    label: string;
    link: string;
    id?: string | null;
  }[];
}) {
  return (
    <footer className="mt-auto w-full border-t border-border bg-surface/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <span className="mono-label flex h-8 w-8 items-center justify-center rounded-[6px] border border-primary/40 bg-primary-muted text-primary">
            MO
          </span>
          <div>
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              Mostheimer
            </p>
            <p className="mono-label text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              Web &amp; Application Architect
            </p>
          </div>
        </div>

        {navLinks && navLinks.length > 0 && (
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {navLinks.map((item, index) => (
                <li key={item.id || index}>
                  <Link
                    href={item.link}
                    className="mono-label text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="mono-label text-muted-foreground">
            © {new Date().getFullYear()} Mostheimer · Alle Rechte vorbehalten
          </p>
          <p className="mono-label text-muted-foreground">
            Next.js 16 <span className="text-primary">/</span> Payload 4{' '}
            <span className="text-primary">/</span> Postgres
          </p>
        </div>
      </div>
    </footer>
  );
}
