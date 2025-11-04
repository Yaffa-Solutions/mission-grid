'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ActiveNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export default function ActiveNavLink({ href, icon, label }: ActiveNavLinkProps) {
  const pathname = usePathname();

  // Check if current path matches the link
  // For dashboard home, exact match; for others, check if pathname starts with href
  const isActive = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
        isActive
          ? 'bg-blue-50 text-blue-600 font-semibold'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <span className={isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
