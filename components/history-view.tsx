'use client';

import { useState } from 'react';
import { type DailyLog } from '@/types/database';
import { MoodTrendChart } from './charts/mood-trend';
import { PillarRadarChart } from './charts/pillar-radar';
import { MoodDrivers } from './mood-drivers';
import { HabitImpact } from './habit-impact';
import { PILLARS } from '@/lib/pillars';
import {
  berekenAlleCorrelaties,
  berekenGewoontesEffect,
  berekenPijlerTrends,
} from '@/lib/patterns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PERIODES = [
  { label: '7 d', days: 7 },
  { label: '14 d', days: 14 },
  { label: '30 d', days: 30 },
];

function getMoodEmoji(score: number) {
  if (score <= 2) return '😞';
  if (score <= 4) return '😕';
  if (score <= 6) return '😐';
  if (score <= 8) return '🙂';
  return '😊';
}

function formatDatum(datum: string) {
  return new Date(datum + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function HistoryView({ logs }: { logs: DailyLog[] }) {
  const [periodeIdx, setPeriodeIdx] = useState(0);
  const periode = PERIODES[periodeIdx];

  const now = new Date();

  const cutoffHuidig = new Date(now);
  cutoffHuidig.setDate(now.getDate() - periode.days);

  const cutoffVorig = new Date(now);
  cutoffVorig.setDate(now.getDate() - periode.days * 2);

  const huidig = logs.filter((l) => new Date(l.datum + 'T00:00:00') >= cutoffHuidig);
  const vorig = logs.filter(
    (l) =>
      new Date(l.datum + 'T00:00:00') >= cutoffVorig &&
      new Date(l.datum + 'T00:00:00') < cutoffHuidig
  );

  const gemStemming =
    huidig.length > 0
      ? (huidig.reduce((a, l) => a + l.stemming, 0) / huidig.length).toFixed(1)
      : null;

  const correlaties = berekenAlleCorrelaties(huidig);
  const gewoontesEffect = berekenGewoontesEffect(huidig);
  const trends = berekenPijlerTrends(huidig, vorig);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Period toggle + summary */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {PERIODES.map((p, i) => (
            <button
              key={p.days}
              onClick={() => setPeriodeIdx(i)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                i === periodeIdx
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {huidig.length} logs{gemStemming ? ` · gem. ${gemStemming}/10` : ''}
        </span>
      </div>

      {huidig.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nog geen logs in deze periode.
        </div>
      ) : (
        <>
          {/* Mood trend chart */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Stemmingsverloop</h2>
            <MoodTrendChart logs={huidig} />
          </div>

          {/* Pillar trends vs previous period */}
          {huidig.length >= 3 && (
            <div className="bg-card border border-border rounded-2xl shadow-card p-5">
              <div className="mb-4">
                <h2 className="font-semibold text-foreground">Pijlers deze periode</h2>
                {vorig.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vergeleken met de vorige {periode.days} dagen
                  </p>
                )}
              </div>
              <div className="space-y-2.5">
                {trends.map((t) => {
                  const pillar = PILLARS.find((p) => p.id === t.pillar);
                  if (!pillar) return null;

                  const pct = Math.round((t.huidigGem / 10) * 100);
                  const barColor =
                    t.huidigGem >= 7
                      ? 'bg-emerald-500'
                      : t.huidigGem >= 5
                      ? 'bg-amber-400'
                      : 'bg-rose-500';

                  const TrendIcon =
                    t.richting === 'omhoog'
                      ? TrendingUp
                      : t.richting === 'omlaag'
                      ? TrendingDown
                      : Minus;

                  const trendColor =
                    t.richting === 'omhoog'
                      ? 'text-emerald-600'
                      : t.richting === 'omlaag'
                      ? 'text-rose-500'
                      : 'text-muted-foreground';

                  return (
                    <div key={t.pillar} className="flex items-center gap-3">
                      <span className="text-base w-5 shrink-0 text-center">{pillar.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{pillar.label}</span>
                          <div className="flex items-center gap-1.5">
                            {t.verschil !== null && (
                              <span className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
                                <TrendIcon size={11} />
                                {t.verschil > 0 ? '+' : ''}{t.verschil}
                              </span>
                            )}
                            <span className="text-xs font-bold text-foreground tabular-nums">
                              {t.huidigGem}/10
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Radar chart */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Pijler-radar</h2>
            <PillarRadarChart logs={huidig} />
          </div>

          {/* Habit impact voor deze periode */}
          {gewoontesEffect.length > 0 && (
            <HabitImpact effecten={gewoontesEffect} />
          )}

          {/* Mood drivers voor deze periode */}
          {correlaties.length > 0 && (
            <MoodDrivers correlaties={correlaties} logCount={huidig.length} />
          )}

          {/* Log list */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Logboek
            </h2>
            {[...huidig]
              .sort((a, b) => b.datum.localeCompare(a.datum))
              .map((log) => (
                <div
                  key={log.id}
                  className="bg-card border border-border rounded-xl shadow-card px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {formatDatum(log.datum)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
                      {getMoodEmoji(log.stemming)} {log.stemming}/10
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {PILLARS.map((p) => {
                      const score = (log.pijler_scores as Record<string, number>)[p.id];
                      if (!score) return null;
                      return (
                        <span
                          key={p.id}
                          className="text-xs bg-muted rounded-full px-2.5 py-0.5 text-muted-foreground"
                        >
                          {p.emoji} {score}
                        </span>
                      );
                    })}
                  </div>
                  {log.notitie && (
                    <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">
                      {log.notitie}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
