import { AlertTriangle, CheckCircle2, Cloud, Loader2 } from 'lucide-react';

export type SyncStatusState = 'loading' | 'local' | 'saved' | 'error';

export interface SyncStatus {
  state: SyncStatusState;
  message: string;
}

const COLORS: Record<SyncStatusState, string> = {
  loading: '#38bdf8',
  local: '#f59e0b',
  saved: '#22c55e',
  error: '#ef4444',
};

export function SyncStatusPill({ status }: { status: SyncStatus }) {
  const color = COLORS[status.state];
  const Icon = status.state === 'loading'
    ? Loader2
    : status.state === 'saved'
      ? CheckCircle2
      : status.state === 'error'
        ? AlertTriangle
        : Cloud;

  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium md:flex"
      style={{ borderColor: `${color}55`, background: `${color}14`, color }}
      title={status.message}
    >
      <Icon size={12} className={status.state === 'loading' ? 'animate-spin' : undefined} />
      <span>{status.message}</span>
    </div>
  );
}
