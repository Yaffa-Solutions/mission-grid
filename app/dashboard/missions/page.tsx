import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function MissionsPage() {
  const supabase = await createClient();

  const { data: missions, error } = await supabase
    .from('mission')
    .select('id, name, mission_date, border_crossing, status, created_at')
    .order('mission_date', { ascending: false });

  if (error) {
    console.error('Error fetching missions:', error);
  }

  // For each mission, count assigned trucks
  const missionsWithCounts = await Promise.all(
    (missions || []).map(async (mission) => {
      const { count } = await supabase
        .from('missionentry')
        .select('*', { count: 'exact', head: true })
        .eq('mission_id', mission.id);

      return {
        ...mission,
        truckCount: count || 0,
      };
    })
  );

  // Status badge colors
  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-200 text-gray-800',
    Active: 'bg-green-200 text-green-800',
    Reconciling: 'bg-yellow-200 text-yellow-800',
    Closed: 'bg-blue-200 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            المهام / Missions
          </h1>
          <p className="text-gray-600">
            View and manage all your missions
          </p>
        </div>
        <Link
          href="/dashboard/missions/new"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          + Create New Mission
        </Link>
      </div>

      {!missions || missions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No missions yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first mission</p>
          <Link
            href="/dashboard/missions/new"
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Create your first mission
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">All Missions ({missionsWithCounts.length})</h2>
          <div className="space-y-4">
            {missionsWithCounts.map((mission) => (
              <div
                key={mission.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
              <div className="flex justify-between items-start">
                <Link
                  href={`/dashboard/missions/${mission.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{mission.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[mission.status] ||
                        'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {mission.status}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      📅{' '}
                      {new Date(mission.mission_date).toLocaleDateString()}
                    </span>
                    {mission.border_crossing && (
                      <span>🚧 {mission.border_crossing}</span>
                    )}
                    <span>🚚 {mission.truckCount} truck(s) assigned</span>
                  </div>
                </Link>

                <div className="flex gap-2 items-start">
                  {(mission.status === 'Reconciling' || mission.status === 'Closed') && (
                    <Link
                      href={`/dashboard/missions/${mission.id}/reconciliation`}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium whitespace-nowrap"
                    >
                      📊 Reconcile
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/missions/${mission.id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
