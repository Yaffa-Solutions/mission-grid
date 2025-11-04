import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardHomePage() {
  const supabase = await createClient();

  // Fetch all missions
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

  // Fetch statistics
  const { count: totalDrivers } = await supabase
    .from('driver')
    .select('*', { count: 'exact', head: true });

  const { count: totalContractors } = await supabase
    .from('contractor')
    .select('*', { count: 'exact', head: true });

  const { count: totalTemplates } = await supabase
    .from('missiontemplate')
    .select('*', { count: 'exact', head: true });

  const activeMissions = missionsWithCounts?.filter(m => m.status === 'Active').length || 0;

  // Status badge colors
  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-200 text-gray-800',
    Active: 'bg-green-200 text-green-800',
    Reconciling: 'bg-yellow-200 text-yellow-800',
    Closed: 'bg-blue-200 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          لوحة التحكم / Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to Mission Grid - Manage your missions, drivers, and operations
        </p>
      </div>

      {/* Missions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              المهام / Active Missions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage your missions from the dispatch board
            </p>
          </div>
          <Link
            href="/dashboard/missions/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            + Create New Mission
          </Link>
        </div>

        {!missions || missions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No missions created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first mission
            </p>
            <Link
              href="/dashboard/missions/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create your first mission
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {missionsWithCounts.map((mission) => (
              <Link
                key={mission.id}
                href={`/dashboard/missions/${mission.id}/board`}
                className="block group"
              >
                <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                          {mission.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[mission.status] ||
                            'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {mission.status}
                        </span>
                      </div>

                      <div className="flex gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(mission.mission_date).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        {mission.border_crossing && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {mission.border_crossing}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {mission.truckCount} truck(s) assigned
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                      <span className="mr-2">Open Dispatch Board</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/drivers"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Drivers</h3>
              <p className="text-sm text-gray-600">Manage driver intake</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/templates"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <p className="text-sm text-gray-600">Mission templates</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/ops-console"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ops Console</h3>
              <p className="text-sm text-gray-600">GL Approvals</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
