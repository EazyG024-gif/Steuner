'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getOrCreateProfile } from './profile';
import { type Goal } from '@/types/database';

interface CreateGoalInput {
  pijler: Goal['pijler'];
  type: Goal['type'];
  wish: string;
  outcome?: string;
  obstacle?: string;
  plan?: string;
  tijdshorizon?: number;
}

export async function createGoal(input: CreateGoalInput): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Niet ingelogd' };

  const profile = await getOrCreateProfile();
  if (!profile) return { error: 'Profiel niet gevonden' };

  const { error } = await supabaseAdmin.from('goals').insert({
    user_id: profile.id,
    pijler: input.pijler,
    type: input.type,
    wish: input.wish,
    outcome: input.outcome || null,
    obstacle: input.obstacle || null,
    plan: input.plan || null,
    tijdshorizon: input.tijdshorizon || null,
  });

  if (error) return { error: error.message };
  return {};
}

export async function getGoals(): Promise<Goal[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('user_id', profile.id)
    .eq('actief', true)
    .order('created_at', { ascending: false });

  return (data as Goal[]) ?? [];
}

export async function archiveGoal(id: string): Promise<void> {
  await supabaseAdmin.from('goals').update({ actief: false }).eq('id', id);
}
