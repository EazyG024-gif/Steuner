import { getRecentLogs } from '@/lib/actions/log';
import { HistoryView } from '@/components/history-view';

export default async function HistoryPage() {
  const logs = await getRecentLogs(30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Historiek</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Jouw welzijn over tijd</p>
      </div>
      <HistoryView logs={logs} />
    </div>
  );
}
