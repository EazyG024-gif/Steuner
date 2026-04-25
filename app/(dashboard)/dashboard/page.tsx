import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateProfile } from '@/lib/actions/profile';
import { getTodayLog, getRecentLogs } from '@/lib/actions/log';
import { getInsights } from '@/lib/actions/insights';
import { getGoals } from '@/lib/actions/goals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InsightCard } from '@/components/insight-card';
import { MoodDrivers } from '@/components/mood-drivers';
import { PILLARS } from '@/lib/pillars';
import { berekenAlleCorrelaties } from '@/lib/patterns';
import { type Goal, type DailyLog } from '@/types/database';
import { type PijlerId } from '@/lib/pillars';
import { Flame, TrendingUp, PenLine, CheckCircle2 } from 'lucide-react';

function weekAvgForPillar(logs: DailyLog[], pillarId: string): number | null {
  if (logs.length === 0) return null;
  const scores = logs
    .map((l) => ((l.pijler_scores as Record<string, number>)[pillarId] ?? null))
    .filter(Boolean) as number[];
  if (scores.length === 0) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

function goalCheckStreak(logs: DailyLog[], pillarId: string): number {
  return logs.filter((l) => (l.gedragschecks as Record<string, boolean>)?.[pillarId] === true).length;
}

function GoalStatusRow({ goal, logs }: { goal: Goal; logs: DailyLog[] }) {
  const pillar = PILLARS.find((p) => p.id === goal.pijler);
  const avg = weekAvgForPillar(logs, goal.pijler);
  const checks = goalCheckStreak(logs, goal.pijler);
  const pct = avg ? Math.round((avg / 10) * 100) : 0;

  const track =
    avg === null
      ? { bar: 'bg-muted', label: 'geen data', text: 'text-muted-foreground' }
      : avg >= 7
      ? { bar: 'bg-emerald-500', label: 'op schema', text: 'text-emerald-600' }
      : avg >= 5
      ? { bar: 'bg-amber-400', label: 'matig', text: 'text-amber-600' }
      : { bar: 'bg-rose-500', label: 'aandacht', text: 'text-rose-500' };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="text-base w-5 shrink-0 text-center">{pillar?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate leading-snug">{goal.wish}</p>
        </div>
        {/* Goal check streak */}
        <span
          className={`text-xs font-medium shrink-0 tabular-nums ${
            checks >= 5
              ? 'text-emerald-600'
              : checks >= 3
              ? 'text-amber-600'
              : 'text-muted-foreground'
          }`}
          title={`${checks} van de laatste ${logs.length} dagen aangevinkt`}
        >
          ✓ {checks}/{logs.length}d
        </span>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <div className="flex-1 bg-muted rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${track.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-medium shrink-0 ${track.text}`}>
          {avg !== null ? `${avg}/10` : '—'} · {track.label}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  await auth();
  const [profile, todayLog, recentLogs, insights, goals] = await Promise.all([
    getOrCreateProfile(),
    getTodayLog(),
    getRecentLogs(30),
    getInsights(),
    getGoals(),
  ]);

  // Use last 30 logs for correlations, last 7 for display
  const last7 = recentLogs.slice(0, 7);
  const correlaties = berekenAlleCorrelaties(recentLogs);

  const naam = profile?.naam ?? 'daar';
  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const streak = last7.filter((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return last7.some((l) => l.datum === d.toISOString().split('T')[0]);
  }).length;

  const avgMood =
    last7.length > 0
      ? (last7.reduce((a, l) => a + l.stemming, 0) / last7.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hoi {naam}!</h1>
        <p className="text-muted-foreground capitalize text-sm mt-0.5">{today}</p>
      </div>

      {/* Stat cards */}
      {last7.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame size={16} className="text-orange-500" />}
            label="Huidige streak"
            value={streak}
            sub={`dag${streak !== 1 ? 'en' : ''} op rij`}
            color="bg-orange-50 dark:bg-orange-950/40"
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-violet-500" />}
            label="Gem. stemming"
            value={avgMood ? `${avgMood}/10` : '—'}
            sub="afgelopen 7 dagen"
            color="bg-violet-50 dark:bg-violet-950/40"
          />
        </div>
      )}

      {/* Check-in CTA */}
      {!todayLog ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 text-white p-5 shadow-elevated">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-1">
            Dagelijkse check-in
          </p>
          <h2 className="text-lg font-bold mb-3">Hoe was jouw dag?</h2>
          <Button
            asChild
            className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-none"
          >
            <Link href="/log" className="flex items-center gap-2">
              <PenLine size={15} />
              Check-in starten
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="font-semibold text-foreground">Vandaag ingevuld</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              Stemming {todayLog.stemming}/10
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {PILLARS.map((p) => {
              const score = (todayLog.pijler_scores as Record<string, number>)[p.id];
              if (!score) return null;
              return (
                <span
                  key={p.id}
                  className="text-xs bg-muted rounded-full px-3 py-1 text-foreground border border-border"
                >
                  {p.emoji} {score}/10
                </span>
              );
            })}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/log">Aanpassen</Link>
          </Button>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-foreground">Doelen</h2>
            <Link href="/goals" className="text-xs text-primary hover:underline font-medium">
              Beheren
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Gem. score · check-ins — afgelopen {last7.length} dagen
          </p>
          <div className="space-y-5">
            {goals.map((goal) => (
              <GoalStatusRow key={goal.id} goal={goal} logs={last7} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl p-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Nog geen doelen ingesteld.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/goals">+ Doel</Link>
          </Button>
        </div>
      )}

      {/* Mood drivers — shown when enough data */}
      {correlaties.length > 0 && (
        <MoodDrivers correlaties={correlaties} logCount={recentLogs.length} />
      )}

      {/* Insights — only non-correlatie types now (correlatie is shown in MoodDrivers) */}
      {insights.filter((i) => i.type !== 'correlatie').length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Inzichten
          </h2>
          {insights
            .filter((i) => i.type !== 'correlatie')
            .map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
        </div>
      )}

      {/* Week dots */}
      {last7.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Afgelopen week</h2>
          <div className="flex gap-2 justify-between">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = d.toISOString().split('T')[0];
              const log = last7.find((l) => l.datum === dateStr);

              // Count how many goal checks were done that day
              const goalChecks = goals.filter(
                (g) =>
                  log &&
                  (log.gedragschecks as Record<string, boolean>)?.[g.pijler as PijlerId] === true
              ).length;

              return (
                <div key={dateStr} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      log
                        ? 'bg-primary text-primary-foreground shadow-glow'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {log ? log.stemming : '·'}
                  </div>
                  {/* Goal check dots */}
                  {goals.length > 0 && (
                    <div className="flex gap-0.5">
                      {goals.map((g) => {
                        const checked =
                          log &&
                          (log.gedragschecks as Record<string, boolean>)?.[g.pijler as PijlerId] ===
                            true;
                        return (
                          <div
                            key={g.id}
                            className={`w-1 h-1 rounded-full ${
                              checked ? 'bg-emerald-500' : log ? 'bg-muted-foreground/30' : 'bg-transparent'
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {d.toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {streak} dag{streak !== 1 ? 'en' : ''} op rij bijgehouden
            </p>
            {goals.length > 0 && (
              <p className="text-xs text-muted-foreground">
                ● = goal check gedaan
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
