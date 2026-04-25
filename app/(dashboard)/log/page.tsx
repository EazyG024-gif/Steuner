import { getGoals } from '@/lib/actions/goals';
import { LogForm } from './log-form';

export default async function LogPage() {
  const goals = await getGoals();
  return <LogForm goals={goals} />;
}
