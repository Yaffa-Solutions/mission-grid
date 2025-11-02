import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import MissionTabs from './MissionTabs';

export default async function MissionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { id } = await params;

  // Fetch mission details to display in the header
  const { data: mission, error } = await supabase
    .from('mission')
    .select('id, name, mission_date, border_crossing, status')
    .eq('id', id)
    .single();

  if (error || !mission) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Mission Header with basic info */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{mission.name}</h1>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Missions
              </Link>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                {new Date(mission.mission_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {mission.border_crossing && <span>🚧 {mission.border_crossing}</span>}
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {mission.status}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <MissionTabs missionId={id} />
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
