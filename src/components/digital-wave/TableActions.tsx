import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, FileEdit, Trash2, Copy, Eye } from 'lucide-react';

export interface TableAction {
  key: string;
  label: string;
  icon: typeof FileEdit;
  danger?: boolean;
}

const defaultActions: TableAction[] = [
  { key: 'edit', label: 'Edit', icon: FileEdit },
  { key: 'duplicate', label: 'Duplicate', icon: Copy },
  { key: 'view', label: 'View', icon: Eye },
  { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

interface TableActionsProps {
  onAction: (action: string) => void;
  actions?: TableAction[];
}

export function TableActions({ onAction, actions = defaultActions }: TableActionsProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const handleClick = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node) &&
          menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handleClick, true);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousedown', handleClick, true);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const dropdownWidth = 160;
      const dropdownHeight = actions.length * 32 + 8;

      let left = rect.right - dropdownWidth;
      let top = rect.bottom + 4;

      if (left + dropdownWidth > window.innerWidth) left = window.innerWidth - dropdownWidth - 12;
      if (left < 12) left = 12;
      if (top + dropdownHeight > window.innerHeight) top = Math.max(8, rect.top - dropdownHeight - 4);

      setPos({ left, top });
    }
    setOpen(true);
  };

  const handleAction = (action: string) => {
    setOpen(false);
    onAction(action);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-md transition"
        style={{ color: 'var(--crm-text-muted)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--crm-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <MoreHorizontal size={13} />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-36 rounded-xl border p-1 shadow-2xl origin-top-right"
          style={{
            background: 'var(--crm-dropdown-bg)',
            borderColor: 'var(--crm-border-accent)',
            left: pos.left,
            top: pos.top,
          }}
        >
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={(e) => { e.stopPropagation(); handleAction(a.key); }}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition"
                style={{ color: a.danger ? '#f87171' : 'var(--crm-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--crm-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={12} />
                {a.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
