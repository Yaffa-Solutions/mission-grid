'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to create a template');
    return;
  }

  const name = formData.get('name') as string;
  const stepsJson = formData.get('steps_definition') as string;

  if (!name) {
    console.error('Template name is required');
    return;
  }

  if (!stepsJson) {
    console.error('Steps definition is required');
    return;
  }

  let stepsDefinition;
  try {
    stepsDefinition = JSON.parse(stepsJson);
  } catch (e) {
    console.error('Invalid JSON for steps_definition:', e);
    return;
  }

  // Insert the template
  const { error } = await supabase.from('missiontemplate').insert({
    name: name,
    steps_definition: stepsDefinition,
    tenant_id: user.id,
  });

  if (error) {
    console.error('Error creating template:', error);
    return;
  }

  revalidatePath('/dashboard/templates');
  redirect('/dashboard/templates');
}

export async function updateTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to update a template');
    return;
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const stepsJson = formData.get('steps_definition') as string;

  if (!id) {
    console.error('Template ID is required');
    return;
  }

  if (!name) {
    console.error('Template name is required');
    return;
  }

  if (!stepsJson) {
    console.error('Steps definition is required');
    return;
  }

  let stepsDefinition;
  try {
    stepsDefinition = JSON.parse(stepsJson);
  } catch (e) {
    console.error('Invalid JSON for steps_definition:', e);
    return;
  }

  // Update the template
  const { error } = await supabase
    .from('missiontemplate')
    .update({
      name: name,
      steps_definition: stepsDefinition,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating template:', error);
    return;
  }

  revalidatePath('/dashboard/templates');
  redirect('/dashboard/templates');
}

export async function deleteTemplate(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;

  if (!id) {
    console.error('Template ID is required');
    return;
  }

  const { error } = await supabase.from('missiontemplate').delete().eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    return;
  }

  revalidatePath('/dashboard/templates');
}
