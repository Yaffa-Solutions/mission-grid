'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMission(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to create a mission');
    return;
  }

  const name = formData.get('name') as string;
  const mission_date = formData.get('mission_date') as string;
  const border_crossing = (formData.get('border_crossing') as string) || null;
  const mission_template_id = formData.get('mission_template_id') as string;

  if (!name) {
    console.error('Mission name is required');
    return;
  }

  if (!mission_template_id) {
    console.error('Mission template is required');
    return;
  }

  // Fetch the template to get the steps_definition
  const { data: template, error: templateError } = await supabase
    .from('missiontemplate')
    .select('steps_definition')
    .eq('id', mission_template_id)
    .single();

  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    return;
  }

  // Create the mission with a snapshot of the steps
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .insert({
      name,
      mission_date: mission_date || new Date().toISOString().split('T')[0],
      border_crossing,
      mission_template_id,
      steps_snapshot: template.steps_definition,
      tenant_id: user.id,
      status: 'Draft',
    })
    .select('id')
    .single();

  if (missionError || !mission) {
    console.error('Error creating mission:', missionError);
    return;
  }

  revalidatePath('/dashboard/missions');
  redirect(`/dashboard/missions/${mission.id}`);
}

export async function assignTruck(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to assign a truck');
    return;
  }

  const mission_id = formData.get('mission_id') as string;
  const truck_id = formData.get('truck_id') as string;

  if (!mission_id || !truck_id) {
    console.error('Mission ID and Truck ID are required');
    return;
  }

  // Get the truck with its driver
  const { data: truck, error: truckError } = await supabase
    .from('truck')
    .select('driver_id')
    .eq('id', truck_id)
    .single();

  if (truckError) {
    console.error('Error fetching truck:', truckError);
    return;
  }

  // Get the mission to access the first step from steps_snapshot
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .select('steps_snapshot')
    .eq('id', mission_id)
    .single();

  if (missionError || !mission) {
    console.error('Error fetching mission:', missionError);
    return;
  }

  // Get the first step from the snapshot
  const steps = mission.steps_snapshot as Array<{
    step_name: string;
    requires_gl: boolean;
  }>;
  const firstStep = steps && steps.length > 0 ? steps[0].step_name : 'Dispatched';

  // Create the mission entry
  const { error: entryError } = await supabase.from('missionentry').insert({
    mission_id,
    truck_id,
    driver_id: truck.driver_id,
    current_status: firstStep,
    tenant_id: user.id,
  });

  if (entryError) {
    console.error('Error creating mission entry:', entryError);
    return;
  }

  // Update the truck status to 'in_mission'
  const { error: updateError } = await supabase
    .from('truck')
    .update({ status: 'in_mission' })
    .eq('id', truck_id);

  if (updateError) {
    console.error('Error updating truck status:', updateError);
    return;
  }

  revalidatePath(`/dashboard/missions/${mission_id}`);
}

export async function unassignTruck(formData: FormData) {
  const supabase = await createClient();

  const entry_id = formData.get('entry_id') as string;
  const truck_id = formData.get('truck_id') as string;
  const mission_id = formData.get('mission_id') as string;

  if (!entry_id || !truck_id) {
    console.error('Entry ID and Truck ID are required');
    return;
  }

  // Delete the mission entry
  const { error: deleteError } = await supabase
    .from('missionentry')
    .delete()
    .eq('id', entry_id);

  if (deleteError) {
    console.error('Error deleting mission entry:', deleteError);
    return;
  }

  // Update the truck status back to 'idle'
  const { error: updateError } = await supabase
    .from('truck')
    .update({ status: 'idle' })
    .eq('id', truck_id);

  if (updateError) {
    console.error('Error updating truck status:', updateError);
    return;
  }

  revalidatePath(`/dashboard/missions/${mission_id}`);
}

export async function updateMissionStatus(formData: FormData) {
  const supabase = await createClient();

  const mission_id = formData.get('mission_id') as string;
  const status = formData.get('status') as string;

  if (!mission_id || !status) {
    console.error('Mission ID and status are required');
    return;
  }

  const { error } = await supabase
    .from('mission')
    .update({ status })
    .eq('id', mission_id);

  if (error) {
    console.error('Error updating mission status:', error);
    return;
  }

  revalidatePath(`/dashboard/missions/${mission_id}`);
  revalidatePath('/dashboard/missions');
}
