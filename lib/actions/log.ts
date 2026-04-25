'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getOrCreateProfile } from './profile';
import { generateInsights } from './insights';
import { type PijlerScores, type GedragsChecks, type DailyLog } from '@/types/database';

interface SaveLogInput {
  datum: string;
  stemming: number;
  pijler_scores: PijlerScores;
  gedragschecks: GedragsChecks;
  slaapuren?: number;
  werkdag?: boolean;
  notitie?: string;
}

export async function saveLog(input: SaveLogInput): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Niet ingelogd' };

  const profile = await getOrCreateProfile();
  if (!profile) return { error: 'Profiel niet gevonden' };

  const { error } = await supabaseAdmin
    .from('daily_logs')
    .upsert(
      {
        user_id: profile.id,
        datum: input.datum,
        stemming: input.stemming,
        pijler_scores: input.pijler_scores as Record<string, unknown>,
        gedragschecks: input.gedragschecks as Record<string, unknown>,
        slaapuren: input.slaapuren ?? null,
        werkdag: input.werkdag ?? null,
        notitie: input.notitie || null,
      },
      { onConflict: 'user_id,datum' }
    );

  if (error) return { error: error.message };

  await generateInsights();
  return { success: true };
}

export async function getLogByDate(datum: string): Promise<DailyLog | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const profile = await getOrCreateProfile();
  if (!profile) return null;

  const { data } = await supabaseAdmin
    .from('daily_logs')
    .select('*')
    .eq('user_id', profile.id)
    .eq('datum', datum)
    .maybeSingle();

  return data as DailyLog | null;
}

export async function getTodayLog(): Promise<DailyLog | null> {
  const today = new Date().toISOString().split('T')[0];
  return getLogByDate(today);
}

export async function getRecentLogs(days = 7): Promise<DailyLog[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data } = await supabaseAdmin
    .from('daily_logs')
    .select('*')
    .eq('user_id', profile.id)
    .order('datum', { ascending: false })
    .limit(days);

  return data ?? [];
}
