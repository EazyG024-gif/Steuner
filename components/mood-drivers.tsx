import { PILLARS } from '@/lib/pillars';
import { type CorrelatieData } from '@/lib/patterns';

interface Props {
  correlaties: CorrelatieData[];
  logCount: number;
}

function strength(r: number): { label: string; labelColor: string } {
  const abs = Math.abs(r);
  if (abs >= 0.6) return { label: 'Sterk', labelColor: 'text-primary' };
  if (abs >= 0.35) return { label: 'Matig', labelColor: 'text-muted-foreground' };
  return { label: 'Weinig', labelColor: 'text-muted-foreground/60' };
}

export function MoodDrivers({ correlaties, logCount }: Props) {
  if (correlaties.length === 0) return null;

  const maxAbs = Math.max(...correlaties.map((c) => Math.abs(c.correlation)), 0.01);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Wat drijft jouw stemming?</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verband tussen elke pijler en jouw algemene stemming
        </p>
      </div>

      <div className="space-y-3">
        {correlaties.map((c) => {
          const pillar = PILLARS.find((p) => p.id === c.pillar);
          if (!pillar) return null;
          const pct = Math.round((Math.abs(c.correlation) / maxAbs) * 100);
          const { label, labelColor } = strength(c.correlation);
          const positive = c.correlation >= 0;

          return (
            <div key={c.pillar} className="flex items-center gap-3">
              <span className="text-base w-5 shrink-0 text-center">{pillar.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{pillar.label}</span>
                  <span className={`text-xs ${labelColor}`}>
                    {label} {positive ? '↑' : '↓'}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      positive ? 'bg-primary' : 'bg-rose-400'
                    }`}
                    style={{ width: `${pct}%`, opacity: pct < 30 ? 0.4 : 1 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/60 mt-4">
        Op basis van {logCount} logs · ↑ = hogere score gaat samen met betere stemming
      </p>
    </div>
  );
}
