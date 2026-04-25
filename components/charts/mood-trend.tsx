'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { type DailyLog } from '@/types/database';

interface Props {
  logs: DailyLog[];
}

export function MoodTrendChart({ logs }: Props) {
  const data = [...logs]
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .map((log) => ({
      datum: new Date(log.datum + 'T00:00:00').toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      }),
      stemming: log.stemming,
    }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="datum"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          stroke="#e2e8f0"
          tickLine={false}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 3, 5, 7, 10]}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          stroke="#e2e8f0"
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          formatter={(v) => [`${v}/10`, 'Stemming']}
        />
        <ReferenceLine y={5} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="stemming"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
