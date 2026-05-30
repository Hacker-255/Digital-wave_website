import { LayoutDashboard, Globe } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { CrmPreferences } from '../../services/settingsService';

export function CrmPreferencesPanel({ settings, onChange }: { settings: CrmPreferences; onChange: (s: CrmPreferences) => void }) {
  return (
    <div className="space-y-5">
      {/* Layout */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <LayoutDashboard size={13} /> Layout & Behavior
        </h3>
        <div className="space-y-1">
          {[
            { label: 'Default Page', key: 'defaultPage' as const, options: ['dashboard', 'leads', 'companies', 'projects', 'tasks'] },
            { label: 'Table Density', key: 'tableDensity' as const, options: ['compact', 'comfortable', 'cozy'] },
            { label: 'Startup Behavior', key: 'startupBehavior' as const, options: ['dashboard', 'resume', 'last-page'] },
            { label: 'First Day of Week', key: 'firstDayOfWeek' as const, options: ['monday', 'sunday', 'saturday'] },
            { label: 'Auto-Save Interval', key: 'autoSaveInterval' as const, options: ['15', '30', '60', '120', '300'] },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-2">
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{f.label}</span>
              <div className="w-40">
                <SelectDropdown
                  value={f.key === 'autoSaveInterval' ? String(settings[f.key]) : settings[f.key] as string}
                  onChange={(v) => {
                    const val = f.key === 'autoSaveInterval' ? Number(v) : v;
                    onChange({ ...settings, [f.key]: val } as CrmPreferences);
                  }}
                  options={f.options}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Features</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Show Activity Feed', key: 'showActivityFeed' as const },
            { label: 'Enable Quick Create', key: 'enableQuickCreate' as const },
            { label: 'Confirm Before Delete', key: 'confirmBeforeDelete' as const },
            { label: 'Enable Drag & Drop', key: 'enableDragAndDrop' as const },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <input type="checkbox" checked={settings[item.key]} onChange={(e) => onChange({ ...settings, [item.key]: e.target.checked })} className="rounded" />
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Formatting */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <Globe size={13} /> Regional & Formatting
        </h3>
        <div className="space-y-1">
          {[
            { label: 'Currency', key: 'currency' as const, options: ['USD', 'EUR', 'GBP', 'EGP', 'AED', 'SAR'] },
            { label: 'Date Format', key: 'dateFormat' as const, options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
            { label: 'Time Format', key: 'timeFormat' as const, options: ['12h', '24h'] },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-2">
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{f.label}</span>
              <div className="w-40">
                <SelectDropdown value={settings[f.key] as string} onChange={(v) => onChange({ ...settings, [f.key]: v })} options={f.options} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
