import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { assignTruck, unassignTruck, updateMissionStatus } from '../actions';

type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type Mission = {
  id: string;
  name: string;
  mission_date: string;
  border_crossing: string | null;
  status: string;
  steps_snapshot: MissionStep[];
};

type MissionEntry = {
  id: string;
  truck_id: string;
  driver_id: string | null;
  current_status: string;
  truck: {
    plate_no: string;
    vehicle_type: string | null;
  }[];
  driver: {
    name: string;
  }[] | null;
};

type AvailableTruck = {
  id: string;
  plate_no: string;
  vehicle_type: string | null;
  driver_id: string | null;
  driver: {
    name: string;
  }[];
};

// Helper function to render steps
function renderSteps(steps: MissionStep[]): string {
  if (!steps || steps.length === 0) return 'No steps';
  return steps
    .map((step) => {
      const glTag = step.requires_gl ? ' (GL)' : '';
      return `${step.step_name}${glTag}`;
    })
    .join(' → ');
}

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch the mission
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .select('id, name, mission_date, border_crossing, status, steps_snapshot')
    .eq('id', id)
    .single();

  if (missionError || !mission) {
    console.error('Error fetching mission:', missionError);
    notFound();
  }

  // Fetch assigned trucks (mission entries)
  const { data: assignedTrucks, error: assignedError } = await supabase
    .from('missionentry')
    .select(
      `
      id,
      truck_id,
      driver_id,
      current_status,
      truck:truck(plate_no, vehicle_type),
      driver:driver(name)
    `
    )
    .eq('mission_id', id);

  if (assignedError) {
    console.error('Error fetching assigned trucks:', assignedError);
  }

  // Get IDs of assigned trucks to exclude them from available list
  const assignedTruckIds =
    assignedTrucks?.map((entry) => entry.truck_id) || [];

  // Fetch available trucks (idle and not assigned to this mission)
  const { data: availableTrucks, error: availableError } = await supabase
    .from('truck')
    .select(
      `
      id,
      plate_no,
      vehicle_type,
      driver_id,
      driver:driver(name)
    `
    )
    .eq('status', 'idle')
    .not('id', 'in', `(${assignedTruckIds.join(',')})`);

  if (availableError) {
    console.error('Error fetching available trucks:', availableError);
  }

  const missionData = mission as Mission;
  const assigned = (assignedTrucks || []) as MissionEntry[];
  const available = (availableTrucks || []) as AvailableTruck[];

  // Status badge color
  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-200 text-gray-800',
    Active: 'bg-green-200 text-green-800',
    Reconciling: 'bg-yellow-200 text-yellow-800',
    Closed: 'bg-blue-200 text-blue-800',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Mission Header */}
      <div className="rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{missionData.name}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                📅 {new Date(missionData.mission_date).toLocaleDateString()}
              </span>
              {missionData.border_crossing && (
                <span>🚧 {missionData.border_crossing}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[missionData.status] || 'bg-gray-200 text-gray-800'
              }`}
            >
              {missionData.status}
            </span>
            <a
              href="/dashboard/missions"
              className="text-blue-600 hover:underline"
            >
              ← Back to Missions
            </a>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Mission Steps:</h3>
          <p className="text-lg text-gray-700">
            {renderSteps(missionData.steps_snapshot)}
          </p>
        </div>

        {/* Change Status */}
        <div className="border-t pt-4 mt-4">
          <form action={updateMissionStatus} className="flex items-center gap-3">
            <input type="hidden" name="mission_id" value={missionData.id} />
            <label className="font-semibold">Change Status:</label>
            <select
              name="status"
              defaultValue={missionData.status}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Reconciling">Reconciling</option>
              <option value="Closed">Closed</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Update
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Trucks */}
        <div className="rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            Assigned Trucks ({assigned.length})
          </h2>

          {assigned.length === 0 ? (
            <p className="text-gray-500 italic">
              No trucks assigned yet. Assign trucks from the available list →
            </p>
          ) : (
            <div className="space-y-3">
              {assigned.map((entry) => {
                const truck = entry.truck && entry.truck[0];
                const driver = entry.driver && entry.driver[0];
                return (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold text-lg">
                        🚚 {truck?.plate_no || 'Unknown'}
                      </div>
                      {truck?.vehicle_type && (
                        <div className="text-sm text-gray-600">
                          Type: {truck.vehicle_type}
                        </div>
                      )}
                      {driver && (
                        <div className="text-sm text-gray-600">
                          Driver: {driver.name}
                        </div>
                      )}
                      <div className="text-sm font-medium mt-2 text-blue-600">
                        Status: {entry.current_status}
                      </div>
                    </div>

                    <form action={unassignTruck}>
                      <input type="hidden" name="entry_id" value={entry.id} />
                      <input type="hidden" name="truck_id" value={entry.truck_id} />
                      <input type="hidden" name="mission_id" value={missionData.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Unassign
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Trucks */}
        <div className="rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            Available Trucks ({available.length})
          </h2>

          {available.length === 0 ? (
            <p className="text-gray-500 italic">
              No idle trucks available. All trucks are either assigned or not in
              idle status.
            </p>
          ) : (
            <div className="space-y-3">
              {available.map((truck) => {
                const driver = truck.driver && truck.driver[0];
                return (
                  <div
                    key={truck.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold text-lg">
                        🚚 {truck.plate_no}
                      </div>
                      {truck.vehicle_type && (
                        <div className="text-sm text-gray-600">
                          Type: {truck.vehicle_type}
                        </div>
                      )}
                      {driver ? (
                        <div className="text-sm text-gray-600">
                          Driver: {driver.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No driver assigned
                        </div>
                      )}
                    </div>

                    <form action={assignTruck}>
                      <input type="hidden" name="mission_id" value={missionData.id} />
                      <input type="hidden" name="truck_id" value={truck.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Assign
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
