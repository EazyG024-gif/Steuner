'use client';

import { useState } from 'react';
import { type DailyLog } from '@/types/database';
import { MoodTrendChart } from './charts/mood-trend';
import { PillarRadarChart } from './charts/pillar-radar';
import { PILLARS } from '@/lib/pillars';

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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periode.days);
  const filtered = logs.filter((l) => new Date(l.datum + 'T00:00:00') >= cutoff);

  const gemStemming =
    filtered.length > 0
      ? (filtered.reduce((a, l) => a + l.stemming, 0) / filtered.length).toFixed(1)
      : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Period + summary */}
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
          {filtered.length} logs{gemStemming ? ` · gem. ${gemStemming}/10` : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nog geen logs in deze periode.
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Stemmingsverloop</h2>
            <MoodTrendChart logs={filtered} />
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Pijler-gemiddelden</h2>
            <PillarRadarChart logs={filtered} />
          </div>

          {/* Log list */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Logboek
            </h2>
            {[...filtered]
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
