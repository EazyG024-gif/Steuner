'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { markInsightRead } from '@/lib/actions/insights';
import { PILLARS } from '@/lib/pillars';
import { type Insight } from '@/types/database';
import { type CorrelatieData, type DrempelData, type AanbevelingData } from '@/lib/patterns';
import { X, BarChart2, AlertTriangle, Lightbulb, Search } from 'lucide-react';

function getPillar(id: string) {
  return PILLARS.find((p) => p.id === id);
}

function CorrelatieCard({ data }: { data: CorrelatieData }) {
  const pillar = getPillar(data.pillar);
  if (!pillar) return null;
  const strength = Math.abs(data.correlation) >= 0.6 ? 'sterk' : 'matig';
  return (
    <>
      <p className="font-medium text-foreground text-sm">
        {pillar.emoji} {pillar.label} heeft een {strength} verband met jouw stemming
      </p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        Correlatie: {data.correlation > 0 ? '+' : ''}{data.correlation} — op dagen dat je{' '}
        {pillar.label.toLowerCase()} hoog scoort, is je stemming doorgaans ook hoger.
      </p>
    </>
  );
}

function DrempelCard({ data }: { data: DrempelData }) {
  const pillar = getPillar(data.pillar);
  if (!pillar) return null;
  return (
    <>
      <p className="font-medium text-foreground text-sm">
        {pillar.emoji} {pillar.label} heeft een drempeleffect op jouw stemming
      </p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        Als {pillar.label.toLowerCase()} onder {data.drempel} zakt, is je stemming gemiddeld{' '}
        <span className="font-semibold text-destructive">{data.verschil} punten lager</span>
        {' '}({data.ondersGemiddeld} vs {data.bovensGemiddeld}).
      </p>
    </>
  );
}

function AanbevelingCard({ data }: { data: AanbevelingData }) {
  const pillar = getPillar(data.pillar);
  if (!pillar) return null;
  return (
    <>
      <p className="font-medium text-foreground text-sm">
        {pillar.emoji} Aandachtspunt: {pillar.label}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Gemiddelde score: <span className="font-semibold">{data.gemiddeldeScore}/10</span>
      </p>
      <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">{data.actie}</p>
    </>
  );
}

const CONFIG = {
  correlatie: {
    Icon: BarChart2,
    iconClass: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40',
  },
  drempel: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40',
  },
  cluster: {
    Icon: Search,
    iconClass: 'text-violet-500',
    bg: 'bg-violet-50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/40',
  },
  aanbeveling: {
    Icon: Lightbulb,
    iconClass: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40',
  },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const [dismissed, setDismissed] = useState(false);

  async function dismiss() {
    setDismissed(true);
    await markInsightRead(insight.id);
  }

  if (dismissed) return null;

  const cfg = CONFIG[insight.type];
  const d = insight.data as Record<string, unknown>;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <div className="flex gap-3">
        <cfg.Icon size={16} className={`mt-0.5 shrink-0 ${cfg.iconClass}`} />
        <div className="flex-1 min-w-0">
          {insight.type === 'correlatie' && <CorrelatieCard data={d as unknown as CorrelatieData} />}
          {insight.type === 'drempel' && <DrempelCard data={d as unknown as DrempelData} />}
          {insight.type === 'aanbeveling' && <AanbevelingCard data={d as unknown as AanbevelingData} />}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground shrink-0 h-6 w-6 p-0 -mt-0.5 -mr-1"
          onClick={dismiss}
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}
