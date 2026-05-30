import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, Building2, Users, CheckSquare, FileText, Target, DollarSign,
  UserPlus, Calendar, Briefcase, Workflow, Settings, Sparkles, ArrowRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'Company' | 'Person' | 'Task' | 'Note' | 'Opportunity' | 'Deal' | 'Lead' | 'Meeting' | 'Project' | 'Workflow' | 'Action';
  label: string;
  detail: string;
  icon: typeof Building2;
  action: () => void;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onRun: (action: string) => void;
  entities: {
    companies: any[];
    people: any[];
    tasks: any[];
    notes: any[];
    opportunities: any[];
    deals: any[];
    leads: any[];
    meetings: any[];
    projects: any[];
  };
  onNavigate: (module: string, id?: string) => void;
}

const ICON_MAP: Record<string, typeof Building2> = {
  Company: Building2, Person: Users, Task: CheckSquare, Note: FileText,
  Opportunity: Target, Deal: DollarSign, Lead: UserPlus, Meeting: Calendar,
  Project: Briefcase, Workflow: Workflow, Action: Sparkles,
};

export function GlobalSearch({ open, onClose, onRun, entities, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      return [
        { id: 'cmd-new', type: 'Action', label: 'New Company', detail: 'Create a new company record', icon: ICON_MAP.Action, action: () => onRun('new-company') },
        { id: 'cmd-people', type: 'Action', label: 'Open People', detail: 'View all people records', icon: ICON_MAP.Action, action: () => onNavigate('People') },
        { id: 'cmd-tasks', type: 'Action', label: 'Open Tasks', detail: 'View all tasks', icon: ICON_MAP.Action, action: () => onNavigate('Tasks') },
        { id: 'cmd-workflows', type: 'Action', label: 'Open Workflows', detail: 'View workflow dashboard', icon: ICON_MAP.Action, action: () => onNavigate('Workflows') },
        { id: 'cmd-settings', type: 'Action', label: 'Go to Settings', detail: 'CRM configuration', icon: ICON_MAP.Action, action: () => onNavigate('Settings') },
        { id: 'cmd-ai', type: 'Action', label: 'Ask AI', detail: 'Get AI-powered insights', icon: ICON_MAP.Action, action: () => onRun('ask-ai') },
        { id: 'cmd-filter', type: 'Action', label: 'Toggle Employee Filter', detail: 'Filter companies by size', icon: ICON_MAP.Action, action: () => onRun('filter') },
        { id: 'cmd-export', type: 'Action', label: 'Export View', detail: 'Export current view as JSON', icon: ICON_MAP.Action, action: () => onRun('export') },
      ];
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    const addItems = (items: any[], type: SearchResult['type'], labelKey: string, detailKey: string) => {
      for (const item of items) {
        const label = String(item[labelKey] || '');
        const detail = String(item[detailKey] || '');
        if (label.toLowerCase().includes(q) || detail.toLowerCase().includes(q)) {
          matches.push({
            id: `${type.toLowerCase()}-${item.id}`,
            type,
            label,
            detail: detail || type,
            icon: ICON_MAP[type] || Building2,
            action: () => onNavigate(type === 'Company' ? 'Companies' : `${type}s`, item.id),
          });
        }
      }
    };

    if (entities.companies) addItems(entities.companies, 'Company', 'name', 'domain');
    if (entities.people) addItems(entities.people, 'Person', 'name', 'email');
    if (entities.tasks) addItems(entities.tasks, 'Task', 'title', 'description');
    if (entities.notes) addItems(entities.notes, 'Note', 'title', 'content');
    if (entities.opportunities) addItems(entities.opportunities, 'Opportunity', 'name', 'company');
    if (entities.deals) addItems(entities.deals, 'Deal', 'name', 'company');
    if (entities.leads) addItems(entities.leads, 'Lead', 'name', 'email');
    if (entities.meetings) addItems(entities.meetings, 'Meeting', 'title', 'date');
    if (entities.projects) addItems(entities.projects, 'Project', 'name', 'description');

    return matches.slice(0, 50);
  }, [query, entities, onRun, onNavigate]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      const child = el.children[selectedIndex] as HTMLElement | undefined;
      if (child) {
        child.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--crm-card-bg)',
          borderColor: 'var(--crm-border-accent)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: 'var(--crm-border)' }}>
          <Search size={16} style={{ color: 'var(--crm-text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, people, tasks, workflows..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--crm-text)' }}
          />
          <kbd className="rounded-md border px-1.5 py-0.5 text-[10px] font-mono"
            style={{
              color: 'var(--crm-text-muted)',
              borderColor: 'var(--crm-border-accent)',
              background: 'var(--crm-surface)',
            }}>
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-xs"
              style={{ color: 'var(--crm-text-muted)' }}>
              <Search size={24} className="mb-2 opacity-40" />
              {query ? `No results for "${query}"` : 'Start typing to search...'}
            </div>
          ) : (
            results.map((result, i) => (
              <button
                key={result.id}
                onClick={() => { result.action(); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  i === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                style={{
                  color: i === selectedIndex ? 'var(--crm-text)' : 'var(--crm-text-secondary)',
                  background: i === selectedIndex ? 'var(--crm-surface)' : undefined,
                }}
                type="button"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--crm-surface)' }}>
                  <result.icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" style={{ color: 'var(--crm-text)' }}>
                    {result.label}
                  </div>
                  <div className="truncate text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>
                    {result.type} · {result.detail}
                  </div>
                </div>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t px-4 py-2 text-[10px]"
          style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>
          <span><kbd className="rounded border px-1 font-mono" style={{ borderColor: 'var(--crm-border-accent)' }}>↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border px-1 font-mono" style={{ borderColor: 'var(--crm-border-accent)' }}>↵</kbd> Open</span>
          <span><kbd className="rounded border px-1 font-mono" style={{ borderColor: 'var(--crm-border-accent)' }}>Esc</kbd> Close</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
