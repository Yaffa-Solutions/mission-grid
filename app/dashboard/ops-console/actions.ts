'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveGL(missionEntryId: string, missionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('missionentry')
    .update({ gl_approved: true })
    .eq('id', missionEntryId);

  if (error) {
    console.error('Error approving GL:', error);
    return { success: false, error: error.message };
  }

  // Revalidate both the ops console and the dispatch board
  revalidatePath('/dashboard/ops-console');
  revalidatePath(`/dashboard/missions/${missionId}/board`);

  return { success: true };
}
