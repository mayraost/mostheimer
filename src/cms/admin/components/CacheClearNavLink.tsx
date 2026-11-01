'use client';

/**
 * Admin-Nav-Eintrag fuer die Custom-View /admin/cache-clear.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CacheClearNavLink() {
  const pathname = usePathname();
  const href = '/admin/cache-clear';

  return (
    <li className="nav__item" style={{ marginTop: 'auto' }}>
      <Link
        href={href}
        className="nav__link"
        aria-current={pathname.startsWith(href) ? 'page' : undefined}
      >
        Cache leeren
      </Link>
    </li>
  );
}

export default CacheClearNavLink;
