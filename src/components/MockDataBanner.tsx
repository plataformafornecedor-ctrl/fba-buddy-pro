import { AlertTriangle } from 'lucide-react';

export function MockDataBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning text-sm font-medium">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Live data temporarily unavailable — showing sample data</span>
    </div>
  );
}
