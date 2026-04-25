'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Goal } from '@/types/database';
import { PILLARS } from '@/lib/pillars';
import { createGoal, archiveGoal } from '@/lib/actions/goals';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Target, Plus } from 'lucide-react';

const TYPE_COLORS: Record<Goal['type'], string> = {
  gewoonte: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  project: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  intentie: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
};

function daysLeft(goal: Goal): number | null {
  if (!goal.tijdshorizon) return null;
  const elapsed = Math.floor((Date.now() - new Date(goal.created_at).getTime()) / 86400000);
  return goal.tijdshorizon - elapsed;
}

function GoalCard({ goal, onArchive }: { goal: Goal; onArchive: () => void }) {
  const remaining = daysLeft(goal);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[goal.type]}`}>
              {goal.type}
            </span>
            {remaining !== null && remaining > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                nog {remaining} dag{remaining !== 1 ? 'en' : ''}
              </span>
            )}
            {remaining !== null && remaining <= 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                periode voorbij
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground mb-2">{goal.wish}</p>
          <div className="space-y-1">
            {goal.outcome && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Uitkomst: </span>
                {goal.outcome}
              </p>
            )}
            {goal.obstacle && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Hindernis: </span>
                {goal.obstacle}
              </p>
            )}
            {goal.plan && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Plan: </span>
                {goal.plan}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onArchive}
          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Archiveren"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function NewGoalDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pijler, setPijler] = useState<Goal['pijler']>('savor');
  const [type, setType] = useState<Goal['type']>('gewoonte');
  const [wish, setWish] = useState('');
  const [outcome, setOutcome] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [plan, setPlan] = useState('');
  const [tijdshorizon, setTijdshorizon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setPijler('savor');
    setType('gewoonte');
    setWish('');
    setOutcome('');
    setObstacle('');
    setPlan('');
    setTijdshorizon('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wish.trim()) return;
    setLoading(true);
    setError('');
    const result = await createGoal({
      pijler,
      type,
      wish: wish.trim(),
      outcome: outcome.trim() || undefined,
      obstacle: obstacle.trim() || undefined,
      plan: plan.trim() || undefined,
      tijdshorizon: tijdshorizon ? parseInt(tijdshorizon) : undefined,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      resetForm();
      onClose();
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuw WOOP-doel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Pillar picker */}
          <div className="space-y-2">
            <Label>Pijler</Label>
            <div className="grid grid-cols-3 gap-2">
              {PILLARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPijler(p.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    pijler === p.id
                      ? 'border-primary bg-accent text-accent-foreground shadow-glow'
                      : 'border-border text-muted-foreground hover:border-primary/40 bg-card'
                  }`}
                >
                  <span className="text-xl mb-1">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type picker */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(['gewoonte', 'project', 'intentie'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                    type === t
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40 bg-card'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wish">
              W — Wens <span className="text-destructive">*</span>
            </Label>
            <Textarea id="wish" placeholder="Wat wil je bereiken?" value={wish} onChange={(e) => setWish(e.target.value)} rows={2} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="outcome">
              O — Beste uitkomst <span className="text-muted-foreground font-normal">(optioneel)</span>
            </Label>
            <Textarea id="outcome" placeholder="Stel je voor dat het lukt — hoe voelt dat?" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="obstacle">
              O — Interne hindernis <span className="text-muted-foreground font-normal">(optioneel)</span>
            </Label>
            <Textarea id="obstacle" placeholder="Wat in jezelf kan dit in de weg staan?" value={obstacle} onChange={(e) => setObstacle(e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan">
              P — Als-dan plan <span className="text-muted-foreground font-normal">(optioneel)</span>
            </Label>
            <Textarea id="plan" placeholder="Als [hindernis], dan doe ik [concrete actie]..." value={plan} onChange={(e) => setPlan(e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tijdshorizon">
              Tijdshorizon (dagen) <span className="text-muted-foreground font-normal">(optioneel)</span>
            </Label>
            <Input id="tijdshorizon" type="number" min="1" max="365" placeholder="bijv. 30" value={tijdshorizon} onChange={(e) => setTijdshorizon(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { onClose(); resetForm(); }}>
              Annuleren
            </Button>
            <Button type="submit" className="flex-1" disabled={!wish.trim() || loading}>
              {loading ? 'Opslaan...' : 'Doel toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  async function handleArchive(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await archiveGoal(id);
  }

  function handleCreated() {
    router.refresh();
  }

  const grouped = PILLARS.map((pillar) => ({
    pillar,
    goals: goals.filter((g) => g.pijler === pillar.id),
  })).filter((g) => g.goals.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {goals.length} actief{goals.length !== 1 ? 'e' : ''} doel{goals.length !== 1 ? 'en' : ''}
        </p>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="flex items-center gap-1.5">
          <Plus size={14} />
          Nieuw doel
        </Button>
      </div>

      {goals.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl py-14 flex flex-col items-center gap-4 text-center px-6">
          <Target size={40} strokeWidth={1} className="text-muted-foreground/50" />
          <div>
            <p className="font-semibold text-foreground">Nog geen doelen</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Voeg je eerste WOOP-doel toe om bewust aan je welzijn te werken.
            </p>
          </div>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Eerste doel toevoegen
          </Button>
        </div>
      )}

      {grouped.map(({ pillar, goals: pillarGoals }) => (
        <div key={pillar.id} className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            {pillar.emoji} {pillar.label}
          </h2>
          {pillarGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onArchive={() => handleArchive(goal.id)} />
          ))}
        </div>
      ))}

      <NewGoalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
