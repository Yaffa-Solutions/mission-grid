'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

//! TODO
// NOTE: Replace this with the tenant_id from the logged-in user/session when
// you wire auth -> tenant mapping. For now we hardcode a test UUID so the
// CRUD actions work during development.

export async function createContractor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('You must be logged in to add a contractor');
    return;
  }
  const name = (formData.get('name') as string) || '';
  const poc_name = (formData.get('poc_name') as string) || null;
  const poc_phone = (formData.get('poc_phone') as string) || null;

  if (!name) {
    console.error('Contractor name is required');
    return;
  }

  const { error } = await supabase
    .from('contractor')
    .insert({ name, poc_name, poc_phone, tenant_id: user.id });

  if (error) {
    console.error('Error inserting contractor:', error);
    return;
  }

  // Revalidate the contractors page so the new item appears
  revalidatePath('/dashboard/contractors');
}

export async function updateContractor(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string) || '';
  const poc_name = (formData.get('poc_name') as string) || null;
  const poc_phone = (formData.get('poc_phone') as string) || null;

  if (!id) {
    console.error('Missing contractor id');
    return;
  }
  if (!name) {
    console.error('Contractor name is required');
    return;
  }

  const { error } = await supabase
    .from('contractor')
    .update({ name, poc_name, poc_phone })
    .eq('id', id);

  if (error) {
    console.error('Error updating contractor:', error);
    return;
  }

  revalidatePath('/dashboard/contractors');
}

export async function deleteContractor(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  if (!id) {
    console.error('Missing contractor id');
    return;
  }

  const { error } = await supabase.from('contractor').delete().eq('id', id);

  if (error) {
    console.error('Error deleting contractor:', error);
    return;
  }

  revalidatePath('/dashboard/contractors');
}

export async function fetchContractors() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contractor')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contractors:', error);
    return [];
  }

  return data ?? [];
}
