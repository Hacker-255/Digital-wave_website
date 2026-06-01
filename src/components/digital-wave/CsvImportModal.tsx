import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Upload, X } from 'lucide-react';

export type ImportTarget = 'Companies' | 'People';

interface CsvImportModalProps {
  onClose: () => void;
  onImport: (target: ImportTarget, rows: Array<Record<string, string>>) => { created: number; skipped: number; duplicates: string[] };
}

export function CsvImportModal({ onClose, onImport }: CsvImportModalProps) {
  const [target, setTarget] = useState<ImportTarget>('Companies');
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<{ created: number; skipped: number; duplicates: string[] } | null>(null);
  const [error, setError] = useState('');

  const rows = useMemo(() => parseCsv(csv), [csv]);

  const example = target === 'Companies'
    ? 'name,domain,employees,owner,linkedin\nAcme Inc,acme.com,120,Sarah Lee,https://linkedin.com/company/acme'
    : 'name,email,phone,title,company,status,tags\nJordan Smith,jordan@acme.com,+1-555-0199,VP Sales,Acme Inc,Lead,vip';

  const submit = () => {
    setError('');
    setResult(null);
    if (rows.length === 0) {
      setError('Paste CSV data with a header row before importing.');
      return;
    }
    setResult(onImport(target, rows));
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: 'var(--crm-overlay)' }} onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl" style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: 'var(--crm-border)' }}>
          <div className="flex items-center gap-2">
            <Upload size={16} style={{ color: '#38bdf8' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Import CSV</h2>
          </div>
          <button onClick={onClose} type="button" className="table-action-btn" aria-label="Close import"><X size={15} /></button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {(['Companies', 'People'] as ImportTarget[]).map((item) => (
              <button key={item} type="button" onClick={() => { setTarget(item); setResult(null); setError(''); }} className={target === item ? 'digital-wave-btn digital-wave-btn-primary' : 'digital-wave-btn'}>
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-lg border p-3 text-xs" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text-muted)' }}>
            <p className="mb-2 font-semibold" style={{ color: 'var(--crm-text)' }}>Expected format</p>
            <pre className="overflow-x-auto whitespace-pre-wrap">{example}</pre>
          </div>

          <textarea
            value={csv}
            onChange={(e) => { setCsv(e.target.value); setResult(null); setError(''); }}
            placeholder={example}
            rows={8}
            className="w-full resize-y rounded-lg border px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Imported {result.created}. Skipped {result.skipped} duplicate(s).</div>
              {result.duplicates.length > 0 && <p className="mt-1 opacity-80">Duplicates: {result.duplicates.slice(0, 6).join(', ')}{result.duplicates.length > 6 ? '...' : ''}</p>}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--crm-border)' }}>
            <button onClick={onClose} type="button" className="digital-wave-btn digital-wave-btn-ghost">Close</button>
            <button onClick={submit} type="button" className="digital-wave-btn digital-wave-btn-primary">Import {rows.length || ''} row{rows.length === 1 ? '' : 's'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseCsv(input: string) {
  const lines = input.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()]));
  }).filter((row) => Object.values(row).some(Boolean));
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}
