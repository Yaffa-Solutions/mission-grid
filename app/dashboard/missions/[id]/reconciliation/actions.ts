'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function closeMission(missionId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // First, get all trucks on this mission
  const { data: entries, error: entriesError } = await supabase
    .from('missionentry')
    .select('truck_id')
    .eq('mission_id', missionId);

  if (entriesError) {
    console.error('Error fetching mission entries:', entriesError);
    return { success: false, error: 'Failed to fetch mission entries' };
  }

  // Update mission status to Closed
  const { error: missionError } = await supabase
    .from('mission')
    .update({
      status: 'Closed',
      closed_at: new Date().toISOString(),
      closed_by: user.id,
    })
    .eq('id', missionId);

  if (missionError) {
    console.error('Error closing mission:', missionError);
    return { success: false, error: 'Failed to close mission' };
  }

  // Update all trucks back to idle status
  if (entries && entries.length > 0) {
    const truckIds = entries.map((e) => e.truck_id);
    const { error: trucksError } = await supabase
      .from('truck')
      .update({ status: 'idle' })
      .in('id', truckIds);

    if (trucksError) {
      console.error('Error updating truck statuses:', trucksError);
      // Don't fail the whole operation if truck updates fail
    }
  }

  revalidatePath(`/dashboard/missions/${missionId}/reconciliation`);
  revalidatePath('/dashboard/missions');

  return { success: true };
}

export async function exportMissionCSV(missionId: string) {
  const supabase = await createClient();

  // Fetch mission details
  const { data: mission, error: missionError } = await supabase
    .from('mission')
    .select('name, mission_date')
    .eq('id', missionId)
    .single();

  if (missionError) {
    console.error('Error fetching mission:', missionError);
    return { success: false, error: 'Failed to fetch mission details' };
  }

  // Fetch all mission entries with joined data
  const { data: missionEntries, error: entriesError } = await supabase
    .from('missionentry')
    .select(`
      *,
      truck:truck!inner(plate_no, vehicle_type),
      driver:driver(name, national_id, contractor:contractor(name))
    `)
    .eq('mission_id', missionId);

  if (entriesError) {
    console.error('Error fetching mission entries:', entriesError);
    return { success: false, error: 'Failed to fetch mission data' };
  }

  // Build CSV string
  const headers = [
    'Mission Name',
    'Mission Date',
    'Truck Plate',
    'Vehicle Type',
    'Driver Name',
    'Driver ID Number',
    'Contractor',
    'Current Status',
    'Pallets Loaded',
    'Pallets Received',
    'Fuel (Company) Liters',
    'Fuel (Driver) Liters',
    'Fuel Station',
    'Damage Notes',
  ];

  let csvString = headers.join(',') + '\n';

  missionEntries?.forEach((entry) => {
    const truck = Array.isArray(entry.truck) ? entry.truck[0] : entry.truck;
    const driver = Array.isArray(entry.driver) ? entry.driver?.[0] : entry.driver;
    const contractorData = driver?.contractor;
    const contractor = Array.isArray(contractorData) ? contractorData?.[0] : contractorData;

    const row = [
      mission.name,
      mission.mission_date,
      truck?.plate_no || '',
      truck?.vehicle_type || '',
      driver?.name || '',
      driver?.national_id || '',
      contractor?.name || '',
      entry.current_status || '',
      entry.pallets_loaded || 0,
      entry.pallets_received || 0,
      entry.fuel_liters_company || 0,
      entry.fuel_liters_driver || 0,
      entry.fuel_station_name || '',
      `"${(entry.damage_notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
    ];

    csvString += row.join(',') + '\n';
  });

  return { success: true, csvString };
}
