'use client';

import { useState } from 'react';
import { saveTemplate, updateTemplate } from './actions';

// Define the type for a single step
type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type TemplateFormProps = {
  initialData?: {
    id?: string;
    name: string;
    steps_definition: MissionStep[];
  };
  isEditing?: boolean;
};

export default function TemplateForm({
  initialData,
  isEditing = false,
}: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [steps, setSteps] = useState<MissionStep[]>(
    initialData?.steps_definition || [{ step_name: 'HP1', requires_gl: false }]
  );

  // Add a new step
  const addStep = () => {
    setSteps([...steps, { step_name: '', requires_gl: false }]);
  };

  // Remove a step at a specific index
  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      alert('You must have at least one step');
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Update step name
  const updateStepName = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].step_name = value;
    setSteps(newSteps);
  };

  // Toggle requires_gl
  const toggleRequiresGL = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].requires_gl = !newSteps[index].requires_gl;
    setSteps(newSteps);
  };

  // Preview the steps as they would appear
  const previewSteps = () => {
    return steps
      .filter((s) => s.step_name.trim())
      .map((step) => {
        const glTag = step.requires_gl ? ' (GL)' : '';
        return `${step.step_name}${glTag}`;
      })
      .join(' → ');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form action={isEditing ? updateTemplate : saveTemplate}>
        {/* Hidden field for template ID (only when editing) */}
        {isEditing && initialData?.id && (
          <input type="hidden" name="id" value={initialData.id} />
        )}

        {/* Template Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block font-semibold text-lg mb-2">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., HP1 to HP2 Loading"
          />
        </div>

        {/* Hidden field to store steps as JSON */}
        <input
          type="hidden"
          name="steps_definition"
          value={JSON.stringify(steps)}
        />

        {/* Steps Builder */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Mission Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Add Step
            </button>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-300 rounded"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={step.step_name}
                    onChange={(e) => updateStepName(index, e.target.value)}
                    placeholder={`Step ${index + 1} name`}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step.requires_gl}
                    onChange={() => toggleRequiresGL(index)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Requires GL</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  disabled={steps.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {steps.some((s) => s.step_name.trim()) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold mb-2 text-blue-900">Preview:</h4>
            <p className="text-lg text-blue-800">{previewSteps()}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          >
            {isEditing ? 'Update Template' : 'Save Template'}
          </button>
          <a
            href="/dashboard/templates"
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
