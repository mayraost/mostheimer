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
    <footer className="w-full border-t border-border/40 bg-background/70 backdrop-blur-xl mt-auto transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-averia text-2xl font-bold flex items-center gap-2">
          <span className="text-primary drop-shadow-sm">MO</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-text to-gray-500">
            Mostheimer
          </span>
        </div>

        {navLinks && navLinks.length > 0 && (
          <nav>
            <ul className="flex flex-wrap items-center justify-center gap-6">
              {navLinks.map((item, index) => (
                <li key={item.id || index}>
                  <Link
                    href={item.link}
                    className="text-sm font-geist-mono opacity-70 hover:opacity-100 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
