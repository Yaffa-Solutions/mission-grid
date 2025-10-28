'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTruckStatus(
  mission_id: string,
  entryIds: string[],
  newStatus: string
) {
  const supabase = await createClient();

  if (!entryIds || entryIds.length === 0) {
    console.error('No entries selected');
    return { error: 'No entries selected' };
  }

  // Update all selected entries
  const { error } = await supabase
    .from('missionentry')
    .update({ current_status: newStatus })
    .in('id', entryIds);

  if (error) {
    console.error('Error updating truck status:', error);
    return { error: 'Failed to update truck status' };
  }

  revalidatePath(`/dashboard/missions/${mission_id}/board`);
  return { success: true };
}

export async function requestGL(mission_id: string, entryIds: string[]) {
  const supabase = await createClient();

  if (!entryIds || entryIds.length === 0) {
    console.error('No entries selected');
    return { error: 'No entries selected' };
  }

  // Set gl_requested to true for selected entries
  const { error } = await supabase
    .from('missionentry')
    .update({ gl_requested: true })
    .in('id', entryIds);

  if (error) {
    console.error('Error requesting GL:', error);
    return { error: 'Failed to request GL' };
  }

  revalidatePath(`/dashboard/missions/${mission_id}/board`);
  return { success: true };
}

export async function approveGL(mission_id: string, entryIds: string[]) {
  const supabase = await createClient();

  if (!entryIds || entryIds.length === 0) {
    console.error('No entries selected');
    return { error: 'No entries selected' };
  }

  // Set gl_approved to true for selected entries
  const { error } = await supabase
    .from('missionentry')
    .update({ gl_approved: true })
    .in('id', entryIds);

  if (error) {
    console.error('Error approving GL:', error);
    return { error: 'Failed to approve GL' };
  }

  revalidatePath(`/dashboard/missions/${mission_id}/board`);
  return { success: true };
}

export async function updateFuelData(formData: FormData) {
  const supabase = await createClient();

  const entry_id = formData.get('entry_id') as string;
  const mission_id = formData.get('mission_id') as string;
  const fuel_liters_company = parseFloat(
    (formData.get('fuel_liters_company') as string) || '0'
  );
  const fuel_liters_driver = parseFloat(
    (formData.get('fuel_liters_driver') as string) || '0'
  );
  const fuel_station_name = (formData.get('fuel_station_name') as string) || null;

  if (!entry_id) {
    console.error('Entry ID is required');
    return;
  }

  const { error } = await supabase
    .from('missionentry')
    .update({
      fuel_liters_company,
      fuel_liters_driver,
      fuel_station_name,
    })
    .eq('id', entry_id);

  if (error) {
    console.error('Error updating fuel data:', error);
    return;
  }

  revalidatePath(`/dashboard/missions/${mission_id}/board`);
}
