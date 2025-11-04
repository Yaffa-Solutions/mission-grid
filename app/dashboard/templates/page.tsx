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
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            القوالب / Mission Templates
          </h1>
          <p className="text-gray-600">
            Create and manage reusable mission templates
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          + Create New Template
        </Link>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first mission template</p>
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Create your first template
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">All Templates ({templates.length})</h2>
          <div className="space-y-4">
            {(templates as MissionTemplate[]).map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{template.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Steps:</span>{' '}
                      {renderSteps(template.steps_definition)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {template.steps_definition?.length || 0} step(s) defined
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/templates/${template.id}/edit`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <form action={deleteTemplate}>
                      <input type="hidden" name="id" value={template.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </form>
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
