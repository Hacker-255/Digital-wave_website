import { useEffect } from 'react';
import { ArrowUpDown, CheckCircle2, Download, Plus, Search, Settings, SlidersHorizontal, Sparkles, Target, Trash2, Users, X, type LucideIcon } from 'lucide-react';

interface DigitalWaveCommandMenuProps {
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
  onRun: (action: string) => void;
  activeModule: string;
}

const actions: Array<[string, LucideIcon, string, string]> = [
  ['new-company', Plus, 'New Company', 'N'],
  ['search', Search, 'Search', '/'],
  ['filter', SlidersHorizontal, 'Filter', 'F'],
  ['sort-name', ArrowUpDown, 'Sort by name', 'S'],
  ['sort-employees', ArrowUpDown, 'Sort by employees', 'E'],
  ['export', Download, 'Export View', ''],
  ['delete-selected', Trash2, 'Delete selected', ''],
  ['ask-ai', Sparkles, 'Ask AI', '@'],
  ['People', Users, 'Open People', ''],
  ['Opportunities', Target, 'Open Opportunities', ''],
  ['Tasks', CheckCircle2, 'Open Tasks', ''],
  ['Settings', Settings, 'Go to Settings', 'G S'],
];

export function DigitalWaveCommandMenu({ query, setQuery, onClose, onRun }: DigitalWaveCommandMenuProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      e.stopPropagation();
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [onClose]);

  const filtered = actions.filter(([, , label]) => label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#151515] p-2 text-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-2">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search companies, actions, settings..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          <button onClick={onClose} className="rounded-lg bg-white/10 p-1.5"><X size={13} /></button>
        </div>
        <p className="px-3 py-2 text-xs text-white/50">Other</p>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.map(([action, Icon, label, shortcut]) => (
            <button
              key={action}
              onClick={() => onRun(action)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Icon size={14} /></span>
              {label}
              {shortcut && <em className="ml-auto rounded-md border border-white/20 px-2 py-0.5 text-[11px] not-italic text-white/60">{shortcut}</em>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
