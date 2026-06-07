import { useState } from 'react';
import { X } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';

export interface CrudField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'tags';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface CrudModalProps {
  title: string;
  fields: CrudField[];
  initial: Record<string, string>;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  saving?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  entityType?: string;
}

export function CrudModal({ title, fields, initial, onClose, onSave, saving, error, fieldErrors, entityType }: CrudModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...initial }));

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const renderField = (f: CrudField) => {
    const fe = fieldErrors?.[f.key];
    const baseStyle: React.CSSProperties = {
      background: 'var(--crm-surface)',
      borderColor: fe ? '#f87171' : 'var(--crm-border)',
      color: 'var(--crm-text)',
    };

    if (f.type === 'select' && f.options) {
      return (
        <SelectDropdown
          value={form[f.key] || ''}
          onChange={(v) => set(f.key, v)}
          options={f.options}
          placeholder="Select..."
        />
      );
    }

    if (f.type === 'textarea') {
      return (
        <textarea
          value={form[f.key] || ''}
          onChange={(e) => set(f.key, e.target.value)}
          placeholder={f.placeholder}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-xs outline-none transition resize-none"
          style={baseStyle}
        />
      );
    }

    return (
      <input
        value={form[f.key] || ''}
        onChange={(e) => set(f.key, e.target.value)}
        placeholder={f.placeholder}
        type={f.type || 'text'}
        className="w-full rounded-lg border px-3 py-2 text-xs outline-none transition"
        style={baseStyle}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--crm-overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{title}</h2>
          <button onClick={onClose} type="button" className="digital-wave-btn-ghost p-1 hover:opacity-80"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>
          )}
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--crm-text-secondary)' }}>
                {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              {renderField(f)}
              {fieldErrors?.[f.key] && (
                <p className="mt-0.5 text-[10px] text-red-400">{fieldErrors[f.key]}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--crm-border)' }}>
            <button type="button" onClick={onClose} className="digital-wave-btn-ghost">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="digital-wave-btn digital-wave-btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
