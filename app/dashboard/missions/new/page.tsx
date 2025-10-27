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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Mission</h1>

      {!templates || templates.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to create at least one mission template before creating a
            mission.
          </p>
          <a
            href="/dashboard/templates/new"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create a template now →
          </a>
        </div>
      ) : (
        <form action={createMission} className="space-y-6">
          {/* Mission Name */}
          <div>
            <label htmlFor="name" className="block font-semibold mb-2">
              Mission Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Morning Run - HP1 to HP2"
            />
          </div>

          {/* Mission Date */}
          <div>
            <label htmlFor="mission_date" className="block font-semibold mb-2">
              Mission Date <span className="text-red-500">*</span>
            </label>
            <input
              id="mission_date"
              name="mission_date"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Border Crossing */}
          <div>
            <label
              htmlFor="border_crossing"
              className="block font-semibold mb-2"
            >
              Border Crossing
            </label>
            <select
              id="border_crossing"
              name="border_crossing"
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label
              htmlFor="mission_template_id"
              className="block font-semibold mb-2"
            >
              Mission Template <span className="text-red-500">*</span>
            </label>
            <select
              id="mission_template_id"
              name="mission_template_id"
              required
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a template --</option>
              {(templates as MissionTemplate[]).map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              The mission steps will be copied from this template
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              Create Mission
            </button>
            <a
              href="/dashboard/missions"
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
            >
              Cancel
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
