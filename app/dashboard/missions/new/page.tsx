import { createClient } from '@/lib/supabase/server';
import { createMission } from '../actions';

type MissionTemplate = {
  id: string;
  name: string;
};

export default async function NewMissionPage() {
  const supabase = await createClient();

  // Fetch all templates for the dropdown
  const { data: templates, error } = await supabase
    .from('missiontemplate')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching templates:', error);
  }

  // Get today's date in YYYY-MM-DD format for default value
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مهمة جديدة / Create New Mission
        </h1>
        <p className="text-gray-600">
          Create a new mission from a template
        </p>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium mb-2">
                No templates available
              </p>
              <p className="text-yellow-700 mb-3">
                You need to create at least one mission template before creating a mission.
              </p>
              <a
                href="/dashboard/templates/new"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
              >
                Create a template now →
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form action={createMission} className="space-y-6">
            {/* Mission Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                اسم المهمة / Mission Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Morning Run - HP1 to HP2"
              />
            </div>

            {/* Mission Date */}
            <div>
              <label htmlFor="mission_date" className="block text-sm font-medium mb-2 text-gray-700">
                تاريخ المهمة / Mission Date <span className="text-red-500">*</span>
              </label>
              <input
                id="mission_date"
                name="mission_date"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Border Crossing */}
            <div>
              <label htmlFor="border_crossing" className="block text-sm font-medium mb-2 text-gray-700">
                المعبر / Border Crossing
              </label>
              <select
                id="border_crossing"
                name="border_crossing"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select (optional) --</option>
                <option value="KS">KS</option>
                <option value="Zikim">Zikim</option>
                <option value="Erez">Erez</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mission Template */}
            <div>
              <label htmlFor="mission_template_id" className="block text-sm font-medium mb-2 text-gray-700">
                القالب / Mission Template <span className="text-red-500">*</span>
              </label>
              <select
                id="mission_template_id"
                name="mission_template_id"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a template --</option>
                {(templates as MissionTemplate[]).map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2">
                The mission steps will be copied from this template
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Create Mission
              </button>
              <a
                href="/dashboard/missions"
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
