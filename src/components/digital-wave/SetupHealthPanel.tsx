import { AlertTriangle, CheckCircle2, Database, Upload, UserPlus, Workflow } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SetupHealthPanelProps {
  companiesLoaded: boolean;
  recordsLoaded: boolean;
  counts: {
    companies: number;
    people: number;
    deals: number;
    tasks: number;
    workflows?: number;
  };
  schemaHealth?: { ok: boolean; missing: string[] } | null;
  compact?: boolean;
  onNavigate: (module: string) => void;
  onOpenImport: () => void;
}

export function SetupHealthPanel({ companiesLoaded, recordsLoaded, counts, schemaHealth, compact, onNavigate, onOpenImport }: SetupHealthPanelProps) {
  const items = [
    {
      label: 'Supabase connected',
      done: isSupabaseConfigured,
      detail: isSupabaseConfigured ? 'Environment variables are present.' : 'Missing Supabase environment variables.',
      action: 'Open settings',
      onClick: () => onNavigate('Settings'),
    },
    {
      label: 'Database schema ready',
      done: Boolean(schemaHealth?.ok),
      detail: schemaHealth?.ok ? 'Required CRM tables are available.' : schemaHealth?.missing?.length ? `Missing: ${schemaHealth.missing.join(', ')}` : 'Checking required CRM tables.',
      action: 'Open settings',
      onClick: () => onNavigate('Settings'),
    },
    {
      label: 'CRM data loaded',
      done: companiesLoaded && recordsLoaded,
      detail: companiesLoaded && recordsLoaded ? 'Companies and CRM records loaded.' : 'Waiting for database reads to complete.',
      action: 'Refresh CRM',
      onClick: () => window.location.reload(),
    },
    {
      label: 'Import customer data',
      done: counts.companies > 3 && counts.people > 3,
      detail: `${counts.companies} companies and ${counts.people} people in this workspace.`,
      action: 'Import CSV',
      onClick: onOpenImport,
    },
    {
      label: 'Create sales pipeline',
      done: counts.deals > 0,
      detail: counts.deals > 0 ? `${counts.deals} deals are tracked.` : 'Add your first deal to start forecasting.',
      action: 'Open deals',
      onClick: () => onNavigate('Deals'),
    },
    {
      label: 'Invite the team',
      done: false,
      detail: 'Invite sales, support, and operations teammates.',
      action: 'Team settings',
      onClick: () => onNavigate('Settings'),
    },
  ];

  const completed = items.filter((item) => item.done).length;

  return (
    <section className={compact ? 'rounded-xl border p-4' : 'digital-wave-table-card p-4'} style={{ borderColor: 'var(--crm-border-accent)', background: compact ? 'var(--crm-card-bg)' : undefined }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={15} style={{ color: isSupabaseConfigured ? '#22c55e' : '#f59e0b' }} />
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Workspace setup</h2>
            <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>{completed} of {items.length} essentials complete</p>
          </div>
        </div>
        <span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: completed === items.length ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: completed === items.length ? '#22c55e' : '#f59e0b' }}>
          {completed === items.length ? 'Ready' : 'Needs setup'}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick} className="rounded-lg border p-3 text-left transition hover:opacity-90" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
            <div className="mb-2 flex items-center justify-between">
              {item.done ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <AlertTriangle size={14} style={{ color: '#f59e0b' }} />}
              {item.label === 'Import customer data' ? <Upload size={13} style={{ color: 'var(--crm-text-muted)' }} /> : item.label === 'Invite the team' ? <UserPlus size={13} style={{ color: 'var(--crm-text-muted)' }} /> : item.label === 'Create sales pipeline' ? <Workflow size={13} style={{ color: 'var(--crm-text-muted)' }} /> : null}
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--crm-text)' }}>{item.label}</p>
            <p className="mt-1 min-h-8 text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>{item.detail}</p>
            <span className="mt-2 inline-block text-[11px] font-semibold" style={{ color: 'var(--crm-text-secondary)' }}>{item.action}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
