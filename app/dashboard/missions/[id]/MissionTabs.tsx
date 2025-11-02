'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MissionTabs({ missionId }: { missionId: string }) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/dashboard/missions/${missionId}`,
      label: 'التفاصيل / Details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: `/dashboard/missions/${missionId}/board`,
      label: 'لوحة التوزيع / Dispatch Board',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: `/dashboard/missions/${missionId}/reconciliation`,
      label: 'التسوية / Reconciliation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => {
        // Special handling for Details tab - exact match only
        // For other tabs - check if pathname starts with the href
        const isActive =
          tab.href === `/dashboard/missions/${missionId}`
            ? pathname === tab.href  // Exact match for Details
            : pathname?.startsWith(tab.href);  // Prefix match for sub-routes

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <span className={isActive ? 'text-white' : ''}>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
