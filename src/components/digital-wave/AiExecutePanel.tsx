import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, CheckCircle, XCircle, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { parseAndExecute } from '../../services/aiExecutionEngine';
import type { ExecuteResult } from '../../services/aiExecutionEngine';
import type { CompanyTableRow } from '../../constants/data';

interface Entry {
  id: number;
  input: string;
  result: ExecuteResult;
  timestamp: Date;
}

interface AiExecutePanelProps {
  companies: CompanyTableRow[];
  selectedIds: string[];
  onExecuteAction: (result: ExecuteResult) => void;
}

const quickCommands = [
  { label: 'Create company', cmd: 'create company NovaGrid Systems' },
  { label: 'Delete company', cmd: 'delete company Blue Harbor Logistics' },
  { label: 'Count companies', cmd: 'count companies' },
  { label: 'Filter >1K', cmd: 'filter employees > 1000' },
  { label: 'Assign owner', cmd: 'assign NovaGrid Systems to Digital Wave Ops' },
  { label: 'List all', cmd: 'list all companies' },
];

export function AiExecutePanel({ companies, selectedIds, onExecuteAction }: AiExecutePanelProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Entry[]>([]);
  const [executing, setExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const handleExecute = (cmd: string) => {
    const q = cmd.trim();
    if (!q || executing) return;
    setInput('');
    setExecuting(true);
    setTimeout(() => {
      const result = parseAndExecute(q, { companies, selectedIds });
      const entry: Entry = { id: Date.now(), input: q, result, timestamp: new Date() };
      setHistory((prev) => [...prev, entry]);
      if (result.success && !result.needsConfirmation) onExecuteAction(result);
      else if (result.needsConfirmation) onExecuteAction(result);
      setExecuting(false);
    }, 150);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 p-4">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: 'var(--crm-surface)' }}>
              <Terminal size={18} style={{ color: 'var(--crm-text-secondary)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--crm-text)' }}>Execute CRM commands</p>
            <p className="text-xs mb-6" style={{ color: 'var(--crm-text-muted)' }}>Type a command below or try a quick action</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickCommands.map((qc) => (
                <button
                  key={qc.cmd}
                  onClick={() => handleExecute(qc.cmd)}
                  type="button"
                  className="flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition hover:opacity-80"
                  style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}
                >
                  <Zap size={13} style={{ color: 'var(--crm-text-muted)' }} />
                  <span style={{ color: 'var(--crm-text-secondary)' }}>{qc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {history.map((entry) => (
          <div key={entry.id}>
            <div className="flex items-center gap-2 text-xs mb-1.5 font-mono">
              <span style={{ color: '#22c55e' }}>$</span>
              <span style={{ color: 'var(--crm-text)' }}>{entry.input}</span>
            </div>
            <div
              className="rounded-lg border p-3 text-xs leading-relaxed"
              style={{
                borderColor: entry.result.success ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)',
                background: entry.result.success ? 'rgba(34,197,94,0.04)' : 'rgba(248,113,113,0.04)',
              }}
            >
              <div className="flex items-start gap-2">
                {entry.result.success ? (
                  <CheckCircle size={13} style={{ color: '#22c55e', marginTop: 1 }} />
                ) : (
                  <XCircle size={13} style={{ color: '#f87171', marginTop: 1 }} />
                )}
                <div className="flex-1 min-w-0">
                  <p style={{ color: entry.result.success ? 'var(--crm-text)' : '#f87171' }}>{entry.result.message}</p>
                  {entry.result.needsConfirmation && (
                    <button
                      onClick={() => { onExecuteAction({ ...entry.result, needsConfirmation: false }); }}
                      type="button"
                      className="mt-2 flex items-center gap-1 rounded-md px-2.5 py-1 text-xs"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
                    >
                      <AlertTriangle size={11} /> Confirm delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {executing && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span style={{ color: '#22c55e' }}>$</span>
            <span style={{ color: 'var(--crm-text-muted)' }}>Executing<span className="animate-pulse">...</span></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex gap-2">
          <span className="flex items-center text-xs font-mono" style={{ color: '#22c55e' }}>$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleExecute(input); } }}
            placeholder="Type a command..."
            className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition font-mono"
            style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
          />
          <button
            onClick={() => handleExecute(input)}
            disabled={!input.trim() || executing}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30"
            style={{ background: 'var(--crm-text)' }}
          >
            {executing ? <RotateCcw size={12} className="animate-spin" style={{ color: 'var(--crm-app-bg)' }} /> : <Send size={13} style={{ color: 'var(--crm-app-bg)' }} />}
          </button>
        </div>
      </div>
    </div>
  );
}
