'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { type Profile } from '@/types/database';

export async function getOrCreateProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (existing) return existing;

  const { data: created } = await supabaseAdmin
    .from('profiles')
    .insert({ clerk_user_id: userId })
    .select()
    .single();

  return created;
}

export async function updateProfile(naam: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Niet ingelogd' };

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ naam, onboarding_completed: true })
    .eq('clerk_user_id', userId);

  if (error) return { error: error.message };
  return {};
}
