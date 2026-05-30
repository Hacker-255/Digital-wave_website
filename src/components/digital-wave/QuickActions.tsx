import { UserPlus, CheckSquare, StickyNote, Plus } from 'lucide-react';
import type { QuickAddType } from './QuickAddModal';

interface QuickActionsProps {
  onAdd: (type: QuickAddType) => void;
}

const actions: Array<{ type: QuickAddType; icon: typeof UserPlus; label: string }> = [
  { type: 'Person', icon: UserPlus, label: 'Person' },
  { type: 'Task', icon: CheckSquare, label: 'Task' },
  { type: 'Note', icon: StickyNote, label: 'Note' },
];

export function QuickActions({ onAdd }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.type}
            onClick={() => onAdd(a.type)}
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition"
            style={{ color: 'var(--crm-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--crm-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--crm-text-secondary)'}
          >
            <Icon size={12} />
            {a.label}
          </button>
        );
      })}
      <span className="mx-1 w-px h-4" style={{ background: 'var(--crm-border)' }} />
      <button
        onClick={() => onAdd('Person')}
        type="button"
        className="digital-wave-quick-add-button"
      >
        <Plus size={12} />
        Quick Add
      </button>
    </div>
  );
}
