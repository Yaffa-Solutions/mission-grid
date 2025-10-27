'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

//! TODO
// NOTE: Replace this with the tenant_id from the logged-in user/session when
// you wire auth -> tenant mapping. For now we use the user.id from auth.

export async function createDriver(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to add a driver');
    return;
  }

  // Extract form data
  const driverName = (formData.get('driverName') as string) || '';
  const national_id = (formData.get('national_id') as string) || null;
  const phone = (formData.get('phone') as string) || null;
  const truck_plate = (formData.get('truck_plate') as string) || '';
  const vehicle_type = (formData.get('vehicle_type') as string) || null;
  const contractor_id = formData.get('contractor_id') as string;

  // Validate required fields
  if (!driverName) {
    console.error('Driver name is required');
    return;
  }

  if (!truck_plate) {
    console.error('Truck plate is required');
    return;
  }

  if (!contractor_id) {
    console.error('Contractor is required');
    return;
  }

  // Step 1: Insert the driver
  const { data: driverData, error: driverError } = await supabase
    .from('driver')
    .insert({
      name: driverName,
      national_id,
      phone,
      contractor_id,
      tenant_id: user.id,
    })
    .select('id')
    .single();

  if (driverError) {
    console.error('Error inserting driver:', driverError);
    return;
  }

  // Step 2: Insert the truck linked to the driver
  const { error: truckError } = await supabase.from('truck').insert({
    plate_no: truck_plate,
    vehicle_type,
    driver_id: driverData.id,
    tenant_id: user.id,
  });

  if (truckError) {
    console.error('Error inserting truck:', truckError);
    return;
  }

  // Revalidate the drivers page so the new items appear
  revalidatePath('/dashboard/drivers');
}

export async function updateDriver(formData: FormData) {
  const supabase = await createClient();

  const driver_id = formData.get('driver_id') as string;
  const driverName = (formData.get('driverName') as string) || '';
  const national_id = (formData.get('national_id') as string) || null;
  const phone = (formData.get('phone') as string) || null;
  const truck_id = formData.get('truck_id') as string;
  const truck_plate = (formData.get('truck_plate') as string) || '';
  const vehicle_type = (formData.get('vehicle_type') as string) || null;
  const contractor_id = formData.get('contractor_id') as string;

  // Validate required fields
  if (!driver_id) {
    console.error('Driver ID is required');
    return;
  }

  if (!driverName) {
    console.error('Driver name is required');
    return;
  }

  if (!truck_plate) {
    console.error('Truck plate is required');
    return;
  }

  if (!contractor_id) {
    console.error('Contractor is required');
    return;
  }

  // Step 1: Update the driver
  const { error: driverError } = await supabase
    .from('driver')
    .update({
      name: driverName,
      national_id,
      phone,
      contractor_id,
    })
    .eq('id', driver_id);

  if (driverError) {
    console.error('Error updating driver:', driverError);
    return;
  }

  // Step 2: Update the truck
  if (truck_id) {
    const { error: truckError } = await supabase
      .from('truck')
      .update({
        plate_no: truck_plate,
        vehicle_type,
      })
      .eq('id', truck_id);

    if (truckError) {
      console.error('Error updating truck:', truckError);
      return;
    }
  }

  revalidatePath('/dashboard/drivers');
}

export async function deleteDriver(formData: FormData) {
  const supabase = await createClient();

  const driver_id = formData.get('driver_id') as string;

  if (!driver_id) {
    console.error('Driver ID is required');
    return;
  }

  // Note: The truck will be automatically deleted due to ON DELETE CASCADE
  // in your foreign key constraint (if set up), or you can manually delete it first

  // Optional: Manually delete trucks first if CASCADE is not set up
  const { error: truckError } = await supabase
    .from('truck')
    .delete()
    .eq('driver_id', driver_id);

  if (truckError) {
    console.error('Error deleting trucks:', truckError);
    return;
  }

  // Delete the driver
  const { error: driverError } = await supabase
    .from('driver')
    .delete()
    .eq('id', driver_id);

  if (driverError) {
    console.error('Error deleting driver:', driverError);
    return;
  }

  revalidatePath('/dashboard/drivers');
}

export async function fetchDrivers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('driver')
    .select(`
      *,
      contractor:contractor(id, name),
      truck:truck(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }

  return data ?? [];
}
