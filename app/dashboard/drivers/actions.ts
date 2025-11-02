'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { redirect } from 'next/navigation';

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

export async function uploadDriverCSV(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('Not logged in');
    redirect('/dashboard/drivers?error=' + encodeURIComponent('يجب تسجيل الدخول أولاً / Not logged in'));
  }

  // 1. Get form data
  const contractorId = formData.get('contractor_id') as string;
  const file = formData.get('driver_file') as File;

  if (!file) {
    console.error('No file provided');
    redirect('/dashboard/drivers?error=' + encodeURIComponent('لم يتم اختيار ملف / No file provided'));
  }
  if (!contractorId) {
    console.error('No contractor selected');
    redirect('/dashboard/drivers?error=' + encodeURIComponent('لم يتم اختيار مقاول / No contractor selected'));
  }

  // 2. Determine file type and parse accordingly
  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  let parsedData: any[] = [];

  if (isExcel) {
    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON with header row
    parsedData = XLSX.utils.sheet_to_json(worksheet);
  } else {
    // Parse CSV file
    const fileContent = await file.text();
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    parsedData = parseResult.data as any[];
  }

  const driversToInsert: any[] = [];
  const trucksToInsert: any[] = [];

  // 3. Helper function to get value from row with Arabic/English column support
  // Also handles columns with leading/trailing spaces
  const getFieldValue = (row: any, englishKey: string, arabicKeys: string[]) => {
    // Try English key first
    if (row[englishKey] !== undefined && row[englishKey] !== null && row[englishKey] !== '') {
      return row[englishKey];
    }
    // Try Arabic keys (exact match)
    for (const arabicKey of arabicKeys) {
      if (row[arabicKey] !== undefined && row[arabicKey] !== null && row[arabicKey] !== '') {
        return row[arabicKey];
      }
    }
    // Try with trimmed versions (handle spaces in column names)
    const rowKeys = Object.keys(row);
    for (const rowKey of rowKeys) {
      const trimmedRowKey = rowKey.trim();
      for (const arabicKey of arabicKeys) {
        if (trimmedRowKey === arabicKey || trimmedRowKey === arabicKey.trim()) {
          if (row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== '') {
            return row[rowKey];
          }
        }
      }
    }
    return null;
  };

  // 4. Loop through parsed rows and build insert arrays
  const errors: string[] = [];
  let rowNumber = 1; // Start from 1 (header is row 0)

  for (const row of parsedData) {
    rowNumber++;

    // Support both English and Arabic column names
    const name = getFieldValue(row, 'name', ['الاسم', 'اسم', 'الأسم']);
    const plate_no = getFieldValue(row, 'plate_no', ['رقم السيارة', 'رقم اللوحة', 'اللوحة']);
    const national_id = getFieldValue(row, 'national_id', ['رقم الهوية', 'الهوية', 'رقم هوية']);
    const phone = getFieldValue(row, 'phone', ['رقم الجوال', 'الجوال', 'رقم الهاتف', 'الهاتف']);
    const vehicle_type = getFieldValue(row, 'vehicle_type', ['النوع', 'نوع السيارة', 'نوع المركبة']);
    const capacity_tons = getFieldValue(row, 'capacity_tons', ['الحمولة', 'الحمولة بالطن', 'عدد الاطنان']);
    const capacity_pallets = getFieldValue(row, 'capacity_pallets', ['عدد المشاتيح', 'المشاتيح', 'عدد البالتات']);

    if (!name || !plate_no) {
      const missingFields = [];
      if (!name) missingFields.push('الاسم/name');
      if (!plate_no) missingFields.push('رقم السيارة/plate_no');
      errors.push(`Row ${rowNumber}: Missing ${missingFields.join(', ')}`);
      console.warn(`Skipping row ${rowNumber}, missing fields:`, row);
      continue; // Skip invalid rows
    }

    const driverId = crypto.randomUUID(); // Generate a UUID for the driver

    driversToInsert.push({
      id: driverId, // Use the same ID for linking
      tenant_id: user.id,
      contractor_id: contractorId,
      name: String(name).trim(),
      national_id: national_id ? String(national_id).trim() : null,
      phone: phone ? String(phone).trim() : null,
    });

    trucksToInsert.push({
      tenant_id: user.id,
      driver_id: driverId, // Link to the driver we're about to create
      plate_no: String(plate_no).trim(),
      vehicle_type: vehicle_type ? String(vehicle_type).trim() : null,
      capacity_tons: capacity_tons ? parseFloat(capacity_tons.toString()) : 0,
      capacity_pallets: capacity_pallets ? parseInt(capacity_pallets.toString()) : 0,
      status: 'idle', // Default status
    });
  }

  if (driversToInsert.length === 0) {
    const errorMsg = errors.length > 0
      ? `لا توجد صفوف صالحة في الملف. الأخطاء: ${errors.join('; ')} / No valid rows found. Errors: ${errors.join('; ')}`
      : 'لا توجد صفوف صالحة في الملف / No valid rows found in file';
    console.error(errorMsg);
    redirect('/dashboard/drivers?error=' + encodeURIComponent(errorMsg));
  }

  // 5. Perform the bulk inserts
  // We must insert Drivers *first*
  const { error: driverError } = await supabase
    .from('driver')
    .insert(driversToInsert);

  if (driverError) {
    console.error('Driver insert failed:', driverError);
    const errorMsg = `فشل إضافة السائقين: ${driverError.message} / Driver insert failed: ${driverError.message}`;
    redirect('/dashboard/drivers?error=' + encodeURIComponent(errorMsg));
  }

  // Now insert Trucks
  const { error: truckError } = await supabase
    .from('truck')
    .insert(trucksToInsert);

  if (truckError) {
    console.error('Truck insert failed:', truckError);
    const errorMsg = `فشل إضافة الشاحنات: ${truckError.message} / Truck insert failed: ${truckError.message}`;
    redirect('/dashboard/drivers?error=' + encodeURIComponent(errorMsg));
  }

  revalidatePath('/dashboard/drivers');
  console.log(`Successfully uploaded ${driversToInsert.length} drivers.`);

  // Show success message with any skipped rows
  const successMsg = errors.length > 0
    ? `تم رفع ${driversToInsert.length} سائق بنجاح. تم تجاوز ${errors.length} صف. / Successfully uploaded ${driversToInsert.length} drivers. Skipped ${errors.length} rows.`
    : `تم رفع ${driversToInsert.length} سائق بنجاح / Successfully uploaded ${driversToInsert.length} drivers`;

  redirect('/dashboard/drivers?success=' + encodeURIComponent(successMsg));
}
