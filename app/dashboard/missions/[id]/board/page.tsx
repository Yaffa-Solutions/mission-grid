import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import DispatchBoard from './DispatchBoard';

type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type Mission = {
  id: string;
  name: string;
  steps_snapshot: MissionStep[];
};

export default async function DispatchBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch the mission with steps
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .select('id, name, steps_snapshot')
    .eq('id', id)
    .single();

  if (missionError || !mission) {
    console.error('Error fetching mission:', missionError);
    notFound();
  }

  // Fetch all mission entries with truck and driver info
  const { data: entries, error: entriesError } = await supabase
    .from('missionentry')
    .select(
      `
      id,
      truck_id,
      driver_id,
      current_status,
      gl_requested,
      gl_approved,
      fuel_liters_company,
      fuel_liters_driver,
      fuel_station_name,
      truck:truck(plate_no, vehicle_type),
      driver:driver(name)
    `
    )
    .eq('mission_id', id)
    .order('created_at', { ascending: true });

  if (entriesError) {
    console.error('Error fetching entries:', entriesError);
  }

  const missionData = mission as Mission;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <DispatchBoard
        mission_id={missionData.id}
        mission_name={missionData.name}
        steps={missionData.steps_snapshot}
        entries={entries || []}
      />

      {/* Help Panel */}
      <div className="mt-8 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-3">How to use the Dispatch Board:</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>✅ Select trucks:</strong> Check the boxes next to trucks you
            want to update
          </li>
          <li>
            <strong>📝 Update Status:</strong> Click "Update Status" to move trucks
            to the next step
          </li>
          <li>
            <strong>🚦 Green Light (GL):</strong> If next step requires GL, you
            must request and get approval first
          </li>
          <li>
            <strong>🔒 GL Workflow:</strong> Request GL → Wait for approval → Update
            status
          </li>
          <li>
            <strong>💡 Bulk Actions:</strong> Select multiple trucks to update them
            all at once
          </li>
        </ul>
      </div>
    </div>
  );
}
