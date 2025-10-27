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
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Missions</h1>
        <Link
          href="/dashboard/missions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Mission
        </Link>
      </div>

      {!missions || missions.length === 0 ? (
        <div className="text-center py-12 rounded-lg">
          <p className="text-gray-500 mb-4">No missions created yet.</p>
          <Link
            href="/dashboard/missions/new"
            className="text-blue-600 hover:underline"
          >
            Create your first mission
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {missionsWithCounts.map((mission) => (
            <Link
              key={mission.id}
              href={`/dashboard/missions/${mission.id}`}
              className="block"
            >
              <div className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
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
                  </div>

                  <div className="text-blue-600 font-medium hover:underline">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
