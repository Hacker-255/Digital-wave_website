import { Copy, Database, FileEdit, List, Plus, Search, Trash2 } from 'lucide-react';
import { TableActions } from './TableActions';
import type { ModuleItem } from '../../constants/data';
import type { TableAction } from './TableActions';

interface DigitalWaveModulePanelProps {
  module: string;
  onOpenCommand: () => void;
  items?: ModuleItem[];
  onAdd?: () => void;
  onEdit?: (item: ModuleItem) => void;
  onView?: (item: ModuleItem) => void;
  onDelete?: (item: ModuleItem) => void;
  onDuplicate?: (item: ModuleItem) => void;
}

const fallbackData: Record<string, ModuleItem[]> = {
  Dashboards: [
    { id: 'db1', label: 'Revenue dashboard', detail: 'Monthly overview' },
    { id: 'db2', label: 'Workflow dashboard', detail: 'Pipeline status' },
    { id: 'db3', label: 'Team performance', detail: 'Weekly metrics' },
  ],
  Settings: [
    { id: 'st1', label: 'Workspace settings', detail: 'General configuration' },
    { id: 'st2', label: 'Experience settings', detail: 'UI preferences' },
    { id: 'st3', label: 'Email settings', detail: 'Notification preferences' },
  ],
  Documentation: [
    { id: 'doc1', label: 'Getting started', detail: 'Quick setup guide' },
    { id: 'doc2', label: 'Workflow automation', detail: 'Advanced guide' },
    { id: 'doc3', label: 'API reference', detail: 'Developer docs' },
  ],
};

const emptyCopy: Record<string, { title: string; detail: string }> = {
  People: { title: 'No people yet', detail: 'Add contacts or import a CSV to build your customer directory.' },
  Tasks: { title: 'No tasks yet', detail: 'Create follow-ups, reminders, and handoffs for the team.' },
  Notes: { title: 'No notes yet', detail: 'Capture meeting notes, customer feedback, and internal context.' },
  Opportunities: { title: 'No opportunities yet', detail: 'Track early-stage revenue before it becomes a deal.' },
  Deals: { title: 'No deals yet', detail: 'Create your first deal to start forecasting pipeline value.' },
  Leads: { title: 'No leads yet', detail: 'Add inbound or outbound leads to qualify future customers.' },
  Meetings: { title: 'No meetings yet', detail: 'Schedule meetings to build a visible customer timeline.' },
  Projects: { title: 'No projects yet', detail: 'Track implementation or delivery work after a deal closes.' },
};

export function DigitalWaveModulePanel({ module, onOpenCommand, items, onAdd, onEdit, onView, onDelete, onDuplicate }: DigitalWaveModulePanelProps) {
  const displayItems = items ?? fallbackData[module] ?? [];
  const empty = emptyCopy[module] ?? { title: `No ${module.toLowerCase()} yet`, detail: 'Create a record to get started.' };
  const rowActions: TableAction[] = [
    ...(onEdit ? [{ key: 'edit', label: 'Edit', icon: FileEdit }] : []),
    ...(onDuplicate ? [{ key: 'duplicate', label: 'Duplicate', icon: Copy }] : []),
    ...(onDelete ? [{ key: 'delete', label: 'Delete', icon: Trash2, danger: true }] : []),
  ];

  const handleAction = (item: ModuleItem, action: string) => {
    switch (action) {
      case 'edit': onEdit?.(item); break;
      case 'delete': onDelete?.(item); break;
      case 'duplicate': onDuplicate?.(item); break;
    }
  };

  return (
    <div className="digital-wave-table-card min-h-[400px]">
      <div className="digital-wave-viewbar">
        <div className="digital-wave-view-title">
          <List size={14} /> {module} - {displayItems.length}
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            type="button"
            className="ml-2 flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition"
            style={{ background: 'var(--crm-text)', color: 'var(--crm-app-bg)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={12} /> Add {module}
          </button>
        )}
        <div className="digital-wave-view-actions ml-auto">
          <button onClick={onOpenCommand} type="button">
            <Search size={12} className="inline mr-1" />Search
          </button>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border p-3 transition"
            style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--crm-border-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--crm-border)'}
          >
            <button onClick={() => onView?.(item)} type="button" className="min-w-0 flex-1 text-left">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--crm-text)' }}>{item.label}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--crm-text-muted)' }}>{item.detail}</div>
            </button>
            {rowActions.length > 0 && (
              <TableActions actions={rowActions} onAction={(action) => handleAction(item, action)} />
            )}
          </div>
        ))}
        {displayItems.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border py-14 text-center text-xs" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)', background: 'var(--crm-surface)' }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--crm-card-bg)', color: 'var(--crm-text-secondary)' }}>
              <Database size={20} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--crm-text)' }}>{empty.title}</p>
            <p className="mt-1 max-w-sm leading-relaxed">{empty.detail}</p>
            <div className="mt-4 flex gap-2">
              {onAdd && <button onClick={onAdd} type="button" className="digital-wave-btn digital-wave-btn-primary"><Plus size={12} /> Add record</button>}
              <button onClick={onOpenCommand} type="button" className="digital-wave-btn"><Search size={12} /> Search CRM</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
