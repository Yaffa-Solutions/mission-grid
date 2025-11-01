import { createClient } from '@/lib/supabase/server';
import ReconciliationView from './ReconciliationView';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReconciliationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch mission details
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (missionError) {
    console.error('Error fetching mission:', missionError);
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Mission</h2>
          <p className="text-red-700 text-sm">{missionError.message}</p>
        </div>
      </div>
    );
  }

  // Fetch all mission entries with joined data
  const { data: missionEntries, error: entriesError } = await supabase
    .from('missionentry')
    .select(`
      *,
      truck:truck!inner(plate_no, vehicle_type),
      driver:driver(name, national_id, contractor:contractor(name))
    `)
    .eq('mission_id', resolvedParams.id);

  if (entriesError) {
    console.error('Error fetching mission entries:', entriesError);
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
          <p className="text-red-700 text-sm">{entriesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ReconciliationView
      mission={mission}
      entries={missionEntries || []}
      missionId={resolvedParams.id}
    />
  );
}
