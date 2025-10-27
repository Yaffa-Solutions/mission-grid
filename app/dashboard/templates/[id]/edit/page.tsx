import { createClient } from '@/lib/supabase/server';
import TemplateForm from '../../TemplateForm';
import { notFound } from 'next/navigation';

type MissionStep = {
  step_name: string;
  requires_gl: boolean;
};

type MissionTemplate = {
  id: string;
  name: string;
  steps_definition: MissionStep[];
};

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: template, error } = await supabase
    .from('missiontemplate')
    .select('id, name, steps_definition')
    .eq('id', id)
    .single();

  if (error || !template) {
    console.error('Error fetching template:', error);
    notFound();
  }

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Mission Template</h1>
      <TemplateForm
        initialData={template as MissionTemplate}
        isEditing={true}
      />
    </div>
  );
}
