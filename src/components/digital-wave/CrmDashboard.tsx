import { BarChart3, Briefcase, Calendar, CheckSquare, Database, Download, Target, Upload, Users } from 'lucide-react';
import type {
  CompanyTableRow,
  CrmDeal,
  CrmLead,
  CrmMeeting,
  CrmPerson,
  CrmTask,
} from '../../constants/data';
import { SetupHealthPanel } from './SetupHealthPanel';

interface CrmDashboardProps {
  companies: CompanyTableRow[];
  people: CrmPerson[];
  tasks: CrmTask[];
  leads: CrmLead[];
  deals: CrmDeal[];
  meetings: CrmMeeting[];
  companiesLoaded: boolean;
  recordsLoaded: boolean;
  schemaHealth?: { ok: boolean; missing: string[] } | null;
  onNavigate: (module: string) => void;
  onOpenImport?: () => void;
  onExportAll?: () => void;
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function CrmDashboard({
  companies,
  people,
  tasks,
  leads,
  deals,
  meetings,
  companiesLoaded,
  recordsLoaded,
  schemaHealth,
  onNavigate,
  onOpenImport,
  onExportAll,
}: CrmDashboardProps) {
  const openTasks = tasks.filter((task) => task.status !== 'Done' && task.status !== 'Cancelled');
  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());
  const pipelineValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const qualifiedLeads = leads.filter((lead) => ['Qualified', 'Contacted'].includes(lead.status));
  const upcomingMeetings = meetings
    .filter((meeting) => meeting.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const stats = [
    { label: 'Pipeline value', value: money(pipelineValue), icon: BarChart3, module: 'Deals', tone: '#22c55e' },
    { label: 'Open tasks', value: String(openTasks.length), icon: CheckSquare, module: 'Tasks', tone: '#38bdf8' },
    { label: 'Qualified leads', value: String(qualifiedLeads.length), icon: Target, module: 'Leads', tone: '#f59e0b' },
    { label: 'Companies', value: String(companies.length), icon: Briefcase, module: 'Companies', tone: '#a78bfa' },
  ];

  return (
    <div className="space-y-4">
      <div className="digital-wave-table-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--crm-text)' }}>Business command center</h2>
            <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>Your sales, tasks, meetings, and setup health in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenImport && <button onClick={onOpenImport} className="digital-wave-btn digital-wave-btn-primary" type="button"><Upload size={13} /> Import CSV</button>}
            {onExportAll && <button onClick={onExportAll} className="digital-wave-btn" type="button"><Download size={13} /> Export CRM</button>}
          </div>
        </div>
      </div>

      <SetupHealthPanel
        compact
        companiesLoaded={companiesLoaded}
        recordsLoaded={recordsLoaded}
        schemaHealth={schemaHealth}
        counts={{ companies: companies.length, people: people.length, deals: deals.length, tasks: tasks.length }}
        onNavigate={onNavigate}
        onOpenImport={onOpenImport}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button key={stat.label} onClick={() => onNavigate(stat.module)} className="rounded-xl border p-4 text-left" style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-card-bg)' }} type="button">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-lg p-2" style={{ background: `${stat.tone}22`, color: stat.tone }}><Icon size={16} /></span>
                <span className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>Open</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--crm-text)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="digital-wave-table-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Sales pipeline</h3>
            <button className="digital-wave-btn digital-wave-btn-ghost" onClick={() => onNavigate('Deals')} type="button">View deals</button>
          </div>
          <div className="space-y-2">
            {deals.length === 0 ? (
              <EmptyLine icon={Database} text="No deals yet. Create your first deal to start forecasting." />
            ) : deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{deal.name}</p>
                    <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>{deal.company} - {deal.stage}</p>
                  </div>
                  <b className="text-sm" style={{ color: '#22c55e' }}>{money(Number(deal.value) || 0)}</b>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="digital-wave-table-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Today's work</h3>
            <button className="digital-wave-btn digital-wave-btn-ghost" onClick={() => onNavigate('Tasks')} type="button">View tasks</button>
          </div>
          <div className="space-y-2">
            {overdueTasks.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{overdueTasks.length} overdue task(s) need attention.</div>
            )}
            {openTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{task.title}</p>
                  <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>{task.priority} - Due {task.dueDate || 'unscheduled'}</p>
                </div>
                <span className="rounded-full px-2 py-1 text-[10px]" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>{task.status}</span>
              </div>
            ))}
            {openTasks.length === 0 && <EmptyLine icon={CheckSquare} text="No open tasks. The queue is clean." />}
          </div>
        </section>
      </div>

      <section className="digital-wave-table-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Upcoming meetings</h3>
          <button className="digital-wave-btn digital-wave-btn-ghost" onClick={() => onNavigate('Meetings')} type="button">View calendar</button>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {upcomingMeetings.length === 0 ? (
            <EmptyLine icon={Calendar} text="No meetings scheduled." />
          ) : upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{meeting.title}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--crm-text-muted)' }}>{meeting.date} - {meeting.duration || 60} min</p>
              <p className="mt-1 truncate text-xs" style={{ color: 'var(--crm-text-muted)' }}><Users size={11} className="mr-1 inline" />{meeting.attendees || 'No attendees'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyLine({ icon: Icon, text }: { icon: typeof Database; text: string }) {
  return (
    <div className="rounded-lg border p-4 text-center text-xs" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)', background: 'var(--crm-surface)' }}>
      <Icon size={18} className="mx-auto mb-2 opacity-60" />
      {text}
    </div>
  );
}
