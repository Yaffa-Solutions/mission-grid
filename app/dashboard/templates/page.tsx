import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { deleteTemplate } from './actions';

type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type MissionTemplate = {
  id: string;
  name: string;
  steps_definition: MissionStep[];
  created_at?: string;
};

// Helper function to render steps as a string
function renderSteps(steps: MissionStep[]): string {
  if (!steps || steps.length === 0) return 'No steps defined';

  return steps
    .map((step) => {
      const glTag = step.requires_gl ? ' (GL)' : '';
      return `${step.step_name}${glTag}`;
    })
    .join(' → ');
}

export default async function TemplatesPage() {
  const supabase = await createClient();

  const { data: templates, error } = await supabase
    .from('missiontemplate')
    .select('id, name, steps_definition, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mission Templates</h1>
        <Link
          href="/dashboard/templates/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Template
        </Link>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="text-center py-12  rounded-lg">
          <p className="text-gray-500 mb-4">No templates created yet.</p>
          <Link
            href="/dashboard/templates/new"
            className="text-blue-600 hover:underline"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(templates as MissionTemplate[]).map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Steps:</span>{' '}
                    {renderSteps(template.steps_definition)}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {template.steps_definition?.length || 0} step(s)
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/templates/${template.id}/edit`}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Edit
                  </Link>
                  <form action={deleteTemplate}>
                    <input type="hidden" name="id" value={template.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
