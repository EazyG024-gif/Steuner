import { PILLARS } from '@/lib/pillars';
import { type GewoontesEffectData } from '@/lib/patterns';

interface Props {
  effecten: GewoontesEffectData[];
}

export function HabitImpact({ effecten }: Props) {
  if (effecten.length === 0) return null;

  const positief = effecten.filter((e) => e.verschil > 0);
  const negatief = effecten.filter((e) => e.verschil < 0);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Welke gewoontes werken voor jou?</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verschil in stemming op dagen dat je een gewoonte wel of niet deed
        </p>
      </div>

      <div className="space-y-3">
        {positief.map((e) => {
          const pillar = PILLARS.find((p) => p.id === e.pillar);
          if (!pillar) return null;
          return (
            <div key={e.pillar} className="flex items-start gap-3">
              <span className="text-base w-5 shrink-0 text-center mt-0.5">{pillar.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{pillar.label}</span>
                  <span className="text-xs font-bold text-emerald-600">
                    +{e.verschil} stemming
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs text-emerald-600 font-semibold">✓ Gedaan</span>
                    <span className="ml-auto text-xs font-bold text-emerald-700">{e.gemDoen}/10</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                    <span className="text-xs text-muted-foreground font-medium">✗ Niet gedaan</span>
                    <span className="ml-auto text-xs font-semibold text-muted-foreground">{e.gemNietDoen}/10</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Op basis van {e.aantalDoen} dagen met check
                </p>
              </div>
            </div>
          );
        })}

        {negatief.length > 0 && (
          <>
            {positief.length > 0 && <div className="border-t border-border my-1" />}
            {negatief.map((e) => {
              const pillar = PILLARS.find((p) => p.id === e.pillar);
              if (!pillar) return null;
              return (
                <div key={e.pillar} className="flex items-start gap-3 opacity-70">
                  <span className="text-base w-5 shrink-0 text-center mt-0.5">{pillar.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{pillar.label}</span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {e.verschil} stemming
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-muted-foreground font-semibold">✓ Gedaan</span>
                        <span className="ml-auto text-xs font-bold text-foreground">{e.gemDoen}/10</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-muted-foreground font-medium">✗ Niet</span>
                        <span className="ml-auto text-xs font-semibold text-foreground">{e.gemNietDoen}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
