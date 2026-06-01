import { useState } from 'react';
import { Download, Upload, Cloud, Shield, Calendar, Trash2, RefreshCw, FileText } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { DataBackupSettings, BackupRecord } from '../../services/settingsService';

export function DataBackupPanel({ settings, onChange }: { settings: DataBackupSettings; onChange: (s: DataBackupSettings) => void }) {
  const [exporting, setExporting] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const data = JSON.stringify({ exported: true, date: new Date().toISOString(), format: settings.exportFormat }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `digital-wave-export.${settings.exportFormat}`; a.click();
      URL.revokeObjectURL(url);
      onChange({ ...settings, lastExport: new Date().toISOString() });
      setExporting(false);
    }, 800);
  };

  const createBackup = () => {
    const newBackup: BackupRecord = {
      id: 'b_' + Date.now(), name: `Manual Backup ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toLocaleString(), size: `${(Math.random() * 100 + 50).toFixed(0)} MB`,
      status: 'completed', type: 'manual', encrypted: settings.encryptBackups,
    };
    onChange({ ...settings, backups: [newBackup, ...settings.backups] });
  };

  const deleteBackup = (id: string) => {
    onChange({ ...settings, backups: settings.backups.filter((b) => b.id !== id) });
  };

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Export CRM Data</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SelectDropdown value={settings.exportFormat} onChange={(v) => onChange({ ...settings, exportFormat: v as DataBackupSettings['exportFormat'] })} options={['csv', 'json', 'xlsx']} />
            <button onClick={handleExport} disabled={exporting} type="button" className="digital-wave-btn digital-wave-btn-primary flex items-center gap-1.5 disabled:opacity-50">
              <Download size={12} /> {exporting ? 'Exporting...' : 'Export Now'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
              <input type="checkbox" checked={settings.includeActivity} onChange={(e) => onChange({ ...settings, includeActivity: e.target.checked })} className="rounded" /> Include Activity
            </label>
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
              <input type="checkbox" checked={settings.includeAiLogs} onChange={(e) => onChange({ ...settings, includeAiLogs: e.target.checked })} className="rounded" /> Include AI Logs
            </label>
          </div>
          {settings.lastExport && <p className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>Last export: {new Date(settings.lastExport).toLocaleString()}</p>}
        </div>
      </div>

      {/* Backup */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Backups</h3>
          <button onClick={createBackup} type="button" className="digital-wave-btn flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition">
            <RefreshCw size={12} /> Create Backup
          </button>
        </div>
        <div className="space-y-3 mb-3">
          <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
            <input type="checkbox" checked={settings.autoBackup} onChange={(e) => onChange({ ...settings, autoBackup: e.target.checked })} className="rounded" /> Enable Scheduled Backups
          </label>
          {settings.autoBackup && (
            <div className="flex gap-2">
              <SelectDropdown value={settings.backupFrequency} onChange={(v) => onChange({ ...settings, backupFrequency: v as DataBackupSettings['backupFrequency'] })} options={['daily', 'weekly', 'monthly']} />
              <SelectDropdown value={String(settings.backupRetention)} onChange={(v) => onChange({ ...settings, backupRetention: Number(v) })} options={['7', '14', '30', '60', '90']} />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
              <input type="checkbox" checked={settings.cloudBackup} onChange={(e) => onChange({ ...settings, cloudBackup: e.target.checked })} className="rounded" /> Cloud Backup
            </label>
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
              <input type="checkbox" checked={settings.encryptBackups} onChange={(e) => onChange({ ...settings, encryptBackups: e.target.checked })} className="rounded" /> <Shield size={11} /> Encrypt Backups
            </label>
          </div>
          {settings.cloudBackup && (
            <SelectDropdown value={settings.cloudProvider} onChange={(v) => onChange({ ...settings, cloudProvider: v as DataBackupSettings['cloudProvider'] })} options={['s3', 'gcs', 'azure']} />
          )}
        </div>

        <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--crm-text-secondary)' }}>Backup History</h4>
        <div className="space-y-1">
          {settings.backups.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <div className="flex items-center gap-2">
                <FileText size={13} style={{ color: 'var(--crm-text-muted)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--crm-text)' }}>{b.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>{b.createdAt} - {b.size} - {b.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: b.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)', color: b.status === 'completed' ? '#22c55e' : '#f87171' }}>
                  {b.status}
                </span>
                <button onClick={() => deleteBackup(b.id)} type="button" className="p-1 rounded hover:bg-red-500/10"><Trash2 size={11} style={{ color: '#f87171' }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restore */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Restore</h3>
        {restoreId ? (
          <div className="space-y-2">
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(250,204,21,0.1)', color: '#eab308' }}>
              Are you sure you want to restore this backup? Current data will be overwritten.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setRestoreId(null); setTimeout(() => onChange({ ...settings }), 100); }} type="button" className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: '#f87171', color: '#fff' }}>Confirm Restore</button>
              <button onClick={() => setRestoreId(null)} type="button" className="rounded-lg px-3 py-1.5 text-xs border" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>Select a backup from the list above and click restore to recover your data.</p>
        )}
      </div>
    </div>
  );
}
