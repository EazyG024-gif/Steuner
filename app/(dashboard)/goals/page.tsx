import { getGoals } from '@/lib/actions/goals';
import { GoalsClient } from '@/components/goals-client';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doelen</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          WOOP — Wens · Uitkomst · Obstakel · Plan
        </p>
      </div>
      <GoalsClient initialGoals={goals} />
    </div>
  );
}
