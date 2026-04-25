'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PILLARS } from '@/lib/pillars';
import { type DailyLog } from '@/types/database';

interface Props {
  logs: DailyLog[];
}

export function PillarRadarChart({ logs }: Props) {
  if (logs.length === 0) return null;

  const data = PILLARS.map((pillar) => {
    const scores = logs.map(
      (l) => ((l.pijler_scores as Record<string, number>)[pillar.id] ?? 5)
    );
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      pillar: `${pillar.emoji} ${pillar.label}`,
      score: Math.round(avg * 10) / 10,
      fullMark: 10,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="pillar"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
        />
        <Radar
          name="Gemiddelde"
          dataKey="score"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          formatter={(v) => [`${v}/10`, 'Gemiddelde']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
