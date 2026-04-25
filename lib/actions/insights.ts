'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getOrCreateProfile } from './profile';
import { berekenCorrelaties, detecteerDrempels, genereerAanbeveling } from '@/lib/patterns';
import { type DailyLog, type Insight } from '@/types/database';

export async function generateInsights(): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const profile = await getOrCreateProfile();
  if (!profile) return;

  const { data: logs } = await supabaseAdmin
    .from('daily_logs')
    .select('*')
    .eq('user_id', profile.id)
    .order('datum', { ascending: false })
    .limit(30);

  if (!logs || logs.length < 3) return;

  const typedLogs = logs as DailyLog[];

  await supabaseAdmin
    .from('insights')
    .delete()
    .eq('user_id', profile.id)
    .eq('gelezen', false);

  const toInsert: { user_id: string; type: Insight['type']; laag: 1 | 2 | 3; data: Record<string, unknown> }[] = [];

  const correlaties = berekenCorrelaties(typedLogs);
  if (correlaties.length > 0) {
    toInsert.push({
      user_id: profile.id,
      type: 'correlatie',
      laag: 1,
      data: correlaties[0] as unknown as Record<string, unknown>,
    });
  }

  const drempels = detecteerDrempels(typedLogs);
  if (drempels.length > 0) {
    toInsert.push({
      user_id: profile.id,
      type: 'drempel',
      laag: 2,
      data: drempels[0] as unknown as Record<string, unknown>,
    });
  }

  const aanbeveling = genereerAanbeveling(typedLogs);
  if (aanbeveling) {
    toInsert.push({
      user_id: profile.id,
      type: 'aanbeveling',
      laag: 3,
      data: aanbeveling as unknown as Record<string, unknown>,
    });
  }

  if (toInsert.length > 0) {
    await supabaseAdmin.from('insights').insert(toInsert);
  }
}

export async function getInsights(): Promise<Insight[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data } = await supabaseAdmin
    .from('insights')
    .select('*')
    .eq('user_id', profile.id)
    .eq('gelezen', false)
    .order('laag', { ascending: true })
    .limit(5);

  return (data as Insight[]) ?? [];
}

export async function markInsightRead(insightId: string): Promise<void> {
  await supabaseAdmin.from('insights').update({ gelezen: true }).eq('id', insightId);
}
