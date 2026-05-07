import { supabaseAdmin } from '@/lib/supabase-admin';
import webpush from 'web-push';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const today = now.toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam' }).split('-').reverse().join('-');
  const currentHour = parseInt(
    new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: 'numeric', hour12: false }).format(now)
  );

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('reminder_hour', currentHour);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  // Skip users who already logged today
  const userIds = Array.from(new Set(subs.map((s: { user_id: string }) => s.user_id)));
  const { data: logs } = await supabaseAdmin
    .from('daily_logs')
    .select('user_id')
    .in('user_id', userIds)
    .eq('datum', today);

  const loggedUsers = new Set(logs?.map((l: { user_id: string }) => l.user_id) ?? []);
  const pending = subs.filter((s: { user_id: string }) => !loggedUsers.has(s.user_id));

  let sent = 0;
  const expired: string[] = [];

  for (const sub of pending as { endpoint: string; p256dh: string; auth: string }[]) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: 'Steuner',
          body: 'Hoe was jouw dag? Je dagelijkse check-in wacht op je 💜',
        })
      );
      sent++;
    } catch (e: unknown) {
      const err = e as { statusCode?: number };
      if (err.statusCode === 410 || err.statusCode === 404) {
        expired.push(sub.endpoint);
      }
    }
  }

  if (expired.length) {
    await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expired);
  }

  return NextResponse.json({ sent, cleaned: expired.length });
}
