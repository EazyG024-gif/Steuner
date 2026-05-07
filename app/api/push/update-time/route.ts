import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reminder_hour } = await req.json() as { reminder_hour: number };

  if (typeof reminder_hour !== 'number' || reminder_hour < 0 || reminder_hour > 23) {
    return NextResponse.json({ error: 'Invalid hour' }, { status: 400 });
  }

  await supabaseAdmin
    .from('push_subscriptions')
    .update({ reminder_hour })
    .eq('user_id', userId);

  return NextResponse.json({ ok: true });
}
