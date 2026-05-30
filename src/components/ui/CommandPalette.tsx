import { useCallback, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CommandItem {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({ open, onClose, items, placeholder = 'Search actions...' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) { setQuery(''); }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-slate-300">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[520px] overflow-y-auto px-3 pb-3">
          {filtered.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onSelect(); onClose(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-slate-300 transition hover:bg-white/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                {item.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.shortcut && (
                <span className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-400">
                  {item.shortcut}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-slate-500">No actions found</div>
          )}
        </div>
      </div>
    </div>
  );
}
