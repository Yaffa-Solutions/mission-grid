import { createClient } from '@/lib/supabase/server';
import OpsConsole from './OpsConsole';

export default async function OpsConsolePage() {
  const supabase = await createClient();

  // Fetch all pending GL requests
  const { data: pendingRequests, error } = await supabase
    .from('missionentry')
    .select(`
      *,
      mission!inner(id, name),
      truck!inner(plate_no),
      driver(name)
    `)
    .eq('gl_requested', true)
    .eq('gl_approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending GL requests:', error);
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading GL Requests</h2>
          <p className="text-red-700 text-sm">{error.message}</p>
          <pre className="text-xs text-red-600 mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ops Console</h1>
        <p className="text-gray-600 mt-2">
          Review and approve Green Light (GL) requests from dispatchers
        </p>
      </div>

      {/* Debug info - remove in production */}
      <div className="mb-4 bg-gray-100 p-3 rounded text-xs">
        <strong>Debug:</strong> Found {pendingRequests?.length || 0} pending GL requests
      </div>

      {pendingRequests && pendingRequests.length > 0 ? (
        <OpsConsole requests={pendingRequests} />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            All Clear!
          </h2>
          <p className="text-gray-600">
            No pending Green Light requests at this time.
          </p>
        </div>
      )}
    </div>
  );
}
