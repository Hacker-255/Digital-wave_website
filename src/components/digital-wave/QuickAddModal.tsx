import { useState } from 'react';
import { X } from 'lucide-react';

export type QuickAddType = 'Person' | 'Task' | 'Note';

interface QuickAddModalProps {
  type: QuickAddType;
  onClose: () => void;
  onSave: (type: QuickAddType, data: Record<string, string>) => void;
}

export function QuickAddModal({ type, onClose, onSave }: QuickAddModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    switch (type) {
      case 'Person': return { name: '', title: '', company: '' } as Record<string, string>;
      case 'Task': return { title: '', priority: 'Medium', dueDate: '' } as Record<string, string>;
      case 'Note': return { title: '', content: '' } as Record<string, string>;
      default: return {} as Record<string, string>;
    }
  });

  const fields = (() => {
    switch (type) {
      case 'Person':
        return [
          { key: 'name', label: 'Name', placeholder: 'e.g. Jane Doe' },
          { key: 'title', label: 'Title', placeholder: 'e.g. CEO' },
          { key: 'company', label: 'Company', placeholder: 'e.g. NovaGrid Systems' },
        ];
      case 'Task':
        return [
          { key: 'title', label: 'Title', placeholder: 'e.g. Send proposal' },
          { key: 'priority', label: 'Priority', placeholder: '', options: ['Low', 'Medium', 'High', 'Urgent'] },
          { key: 'dueDate', label: 'Due Date', placeholder: 'e.g. 2026-06-15', type: 'date' },
        ];
      case 'Note':
        return [
          { key: 'title', label: 'Title', placeholder: 'e.g. Meeting notes' },
          { key: 'content', label: 'Content', placeholder: 'Write your note...', multiline: true },
        ];
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--crm-overlay)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-5 shadow-2xl"
        style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>New {type}</h2>
          <button onClick={onClose} type="button" className="digital-wave-btn-ghost p-1">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{f.label}</label>
              {'options' in f && f.options ? (
                <select
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
                >
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : 'multiline' in f && f.multiline ? (
                <textarea
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
                  style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
                />
              ) : (
                <input
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  type={'type' in f ? (f as { key: string; label: string; placeholder: string; type: string }).type : 'text'}
                  className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="digital-wave-btn-ghost"
            >Cancel</button>
            <button
              type="submit"
              className="digital-wave-btn digital-wave-btn-primary"
            >Add {type}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
