'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PILLARS, type PijlerId } from '@/lib/pillars';
import { saveLog, getLogByDate } from '@/lib/actions/log';
import { type PijlerScores, type GedragsChecks, type Goal } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock } from 'lucide-react';

function goalCheckLabel(goal: Goal): string {
  const wish = goal.wish.length > 55 ? goal.wish.slice(0, 55) + '…' : goal.wish;
  if (goal.type === 'gewoonte') return `Gewoonte volgehouden: "${wish}"`;
  if (goal.type === 'project') return `Voortgang geboekt: "${wish}"`;
  return `Intentie waargemaakt: "${wish}"`;
}

const TODAY = new Date().toISOString().split('T')[0];

const TYPE_COLORS: Record<Goal['type'], string> = {
  gewoonte: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  project: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  intentie: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
};

function getDaysRemaining(goal: Goal): number | null {
  if (!goal.tijdshorizon) return null;
  const elapsed = Math.floor((Date.now() - new Date(goal.created_at).getTime()) / 86400000);
  return Math.max(0, goal.tijdshorizon - elapsed);
}

function getMoodEmoji(score: number) {
  if (score <= 2) return '😞';
  if (score <= 4) return '😕';
  if (score <= 6) return '😐';
  if (score <= 8) return '🙂';
  return '😊';
}

function getScoreLabel(score: number) {
  if (score <= 3) return 'Laag';
  if (score <= 5) return 'Matig';
  if (score <= 7) return 'Goed';
  return 'Uitstekend';
}

function defaultScores(): Partial<Record<PijlerId, number>> {
  const s: Partial<Record<PijlerId, number>> = {};
  PILLARS.forEach((p) => { s[p.id] = 5; });
  return s;
}

interface Props {
  goals: Goal[];
}

export function LogForm({ goals }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const goalByPillar = Object.fromEntries(goals.map((g) => [g.pijler, g])) as Partial<Record<PijlerId, Goal>>;

  const [datum, setDatum] = useState(TODAY);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const [stemming, setStemming] = useState(5);
  const [scores, setScores] = useState<Partial<Record<PijlerId, number>>>(defaultScores());
  const [checks, setChecks] = useState<Partial<Record<PijlerId, boolean>>>({});
  const [slaapuren, setSlaapuren] = useState('');
  const [werkdag, setWerkdag] = useState(true);
  const [notitie, setNotitie] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function loadForDate(date: string) {
    setLoadingExisting(true);
    setHasExisting(false);
    const existing = await getLogByDate(date);
    if (existing) {
      setHasExisting(true);
      setStemming(existing.stemming);
      setScores((existing.pijler_scores as Record<PijlerId, number>) ?? defaultScores());
      setChecks((existing.gedragschecks as Record<PijlerId, boolean>) ?? {});
      setSlaapuren(existing.slaapuren?.toString() ?? '');
      setWerkdag(existing.werkdag ?? true);
      setNotitie(existing.notitie ?? '');
    } else {
      setHasExisting(false);
      setStemming(5);
      setScores(defaultScores());
      setChecks({});
      setSlaapuren('');
      setWerkdag(true);
      setNotitie('');
    }
    setLoadingExisting(false);
  }

  useEffect(() => { loadForDate(TODAY); }, []);

  function handleDateChange(newDate: string) {
    setDatum(newDate);
    loadForDate(newDate);
  }

  function setScore(id: PijlerId, value: number) {
    setScores((prev) => ({ ...prev, [id]: value }));
  }

  function setCheck(id: PijlerId, value: boolean) {
    setChecks((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    setError('');
    startTransition(async () => {
      const result = await saveLog({
        datum,
        stemming,
        pijler_scores: scores as PijlerScores,
        gedragschecks: checks as GedragsChecks,
        slaapuren: slaapuren ? parseFloat(slaapuren) : undefined,
        werkdag,
        notitie: notitie || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => router.push('/dashboard'), 1200);
      }
    });
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <CheckCircle2 size={56} className="text-emerald-500" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-foreground">Opgeslagen!</h2>
        <p className="text-muted-foreground">Je gaat terug naar het overzicht...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dagelijkse check-in</h1>
          {hasExisting && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Bestaand log — je past het aan
            </p>
          )}
        </div>
        <input
          type="date"
          value={datum}
          max={TODAY}
          onChange={(e) => handleDateChange(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loadingExisting && (
        <p className="text-sm text-muted-foreground text-center py-2">Log laden...</p>
      )}

      {/* Stemming */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{getMoodEmoji(stemming)}</span>
          <div>
            <h2 className="font-semibold text-foreground">Algemene stemming</h2>
            <p className="text-sm text-muted-foreground">Hoe voel je je vandaag overall?</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-2xl font-bold text-primary">{stemming}</span>
            <span className="text-sm text-muted-foreground">/10</span>
            <p className="text-xs text-muted-foreground">{getScoreLabel(stemming)}</p>
          </div>
        </div>
        <Slider
          min={1} max={10} step={1}
          value={[stemming]}
          onValueChange={([v]) => setStemming(v)}
          disabled={loadingExisting}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {/* Pillars */}
      {PILLARS.map((pillar) => {
        const goal = goalByPillar[pillar.id];
        const daysLeft = goal ? getDaysRemaining(goal) : null;
        const score = scores[pillar.id] ?? 5;

        return (
          <div
            key={pillar.id}
            className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
            style={{ borderLeft: `4px solid ${pillar.color}` }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{pillar.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{pillar.label}</h3>
                    <p className="text-xs text-muted-foreground">{pillar.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold" style={{ color: pillar.color }}>{score}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{pillar.scoreVraag}</p>

              <Slider
                min={1} max={10} step={1}
                value={[score]}
                onValueChange={([v]) => setScore(pillar.id, v)}
                disabled={loadingExisting}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5 mb-4">
                <span>1</span>
                <span>10</span>
              </div>

              {goal ? (
                /* Goal-specific check */
                <div
                  className={`flex items-start gap-3 rounded-xl p-3 border transition-colors cursor-pointer ${
                    checks[pillar.id]
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                      : 'bg-muted/50 border-border hover:bg-muted'
                  }`}
                  onClick={() => !loadingExisting && setCheck(pillar.id, !(checks[pillar.id] ?? false))}
                >
                  <Checkbox
                    id={`check-${pillar.id}`}
                    checked={checks[pillar.id] ?? false}
                    onCheckedChange={(v) => setCheck(pillar.id, v === true)}
                    disabled={loadingExisting}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`check-${pillar.id}`}
                      className="text-sm font-medium text-foreground cursor-pointer leading-snug"
                    >
                      {goalCheckLabel(goal)}
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[goal.type]}`}>
                        {goal.type}
                      </span>
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="text-xs text-muted-foreground">nog {daysLeft} dagen</span>
                      )}
                      {daysLeft !== null && daysLeft === 0 && (
                        <span className="text-xs text-emerald-600 font-medium">vandaag afgerond!</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic pillar check when no goal */
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id={`check-${pillar.id}`}
                    checked={checks[pillar.id] ?? false}
                    onCheckedChange={(v) => setCheck(pillar.id, v === true)}
                    disabled={loadingExisting}
                  />
                  <Label
                    htmlFor={`check-${pillar.id}`}
                    className="text-sm text-foreground cursor-pointer leading-snug"
                  >
                    {pillar.checkVraag}
                  </Label>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Extra */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Extra (optioneel)</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="slaap">Slaapuren</Label>
              <Input
                id="slaap"
                type="number"
                min="0" max="24" step="0.5"
                placeholder="bijv. 7.5"
                value={slaapuren}
                onChange={(e) => setSlaapuren(e.target.value)}
                disabled={loadingExisting}
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                id="werkdag"
                checked={werkdag}
                onCheckedChange={(v) => setWerkdag(v === true)}
                disabled={loadingExisting}
              />
              <Label htmlFor="werkdag" className="cursor-pointer">Werkdag</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notitie">Notitie</Label>
            <Textarea
              id="notitie"
              placeholder="Iets wat je wilt onthouden over vandaag..."
              value={notitie}
              onChange={(e) => setNotitie(e.target.value)}
              rows={3}
              disabled={loadingExisting}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={isPending || loadingExisting}
        className="w-full h-12 text-base font-semibold"
      >
        {isPending ? 'Opslaan...' : hasExisting ? 'Log bijwerken' : 'Dag opslaan'}
      </Button>
    </div>
  );
}
