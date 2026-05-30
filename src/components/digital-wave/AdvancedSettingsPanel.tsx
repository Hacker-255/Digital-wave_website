import { Cpu, Database, Activity, AlertTriangle, RefreshCw, Shield, Zap, Gauge } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { AdvancedSettings } from '../../services/settingsService';

export function AdvancedSettingsPanel({ settings, onChange }: { settings: AdvancedSettings; onChange: (s: AdvancedSettings) => void }) {
  return (
    <div className="space-y-5">
      {/* Cache */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <Database size={13} /> Cache
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
            <input type="checkbox" checked={settings.cacheEnabled} onChange={(e) => onChange({ ...settings, cacheEnabled: e.target.checked })} className="rounded" />
            <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Enable Cache</span>
          </label>
          {settings.cacheEnabled && (
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Cache TTL (seconds):</span>
              <div className="w-32">
                <SelectDropdown value={String(settings.cacheTTL)} onChange={(v) => onChange({ ...settings, cacheTTL: Number(v) })} options={['60', '120', '300', '600', '1800', '3600']} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug & Logging */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <Activity size={13} /> Debug & Logging
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
            <input type="checkbox" checked={settings.debugMode} onChange={(e) => onChange({ ...settings, debugMode: e.target.checked })} className="rounded" />
            <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Debug Mode <span className="text-[10px]" style={{ color: settings.debugMode ? '#f87171' : 'var(--crm-text-muted)' }}>{settings.debugMode ? '(Enabled)' : ''}</span></span>
          </label>
          <label className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
            <input type="checkbox" checked={settings.loggingEnabled} onChange={(e) => onChange({ ...settings, loggingEnabled: e.target.checked })} className="rounded" />
            <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Enable Logging</span>
          </label>
          {settings.loggingEnabled && (
            <div className="flex items-center gap-3 pl-2">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                <span>Log Level:</span>
                <SelectDropdown value={settings.logLevel} onChange={(v) => onChange({ ...settings, logLevel: v as AdvancedSettings['logLevel'] })} options={['debug', 'info', 'warn', 'error']} />
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                <span>Retention (days):</span>
                <SelectDropdown value={String(settings.maxLogRetention)} onChange={(v) => onChange({ ...settings, maxLogRetention: Number(v) })} options={['7', '14', '30', '60', '90']} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Engine */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <Zap size={13} /> Workflow Engine
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Max Concurrent Workflows', key: 'maxConcurrent' as const, options: ['1', '3', '5', '10', '20'] },
            { label: 'Max Retries', key: 'maxRetries' as const, options: ['0', '1', '3', '5', '10'] },
            { label: 'Timeout (ms)', key: 'timeoutMs' as const, options: ['5000', '15000', '30000', '60000', '120000'] },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-1.5">
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{f.label}</span>
              <div className="w-32">
                <SelectDropdown value={String(settings.workflowEngineConfig[f.key])} onChange={(v) => onChange({ ...settings, workflowEngineConfig: { ...settings.workflowEngineConfig, [f.key]: Number(v) } })} options={f.options} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Execution */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <Cpu size={13} /> AI Execution
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Max Concurrent AI', key: 'maxConcurrent' as const, options: ['1', '3', '5', '10'] },
            { label: 'Max Tokens / Request', key: 'maxTokensPerRequest' as const, options: ['1024', '2048', '4096', '8192'] },
            { label: 'AI Timeout (ms)', key: 'timeoutMs' as const, options: ['10000', '30000', '60000', '120000'] },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-1.5">
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{f.label}</span>
              <div className="w-32">
                <SelectDropdown value={String(settings.aiExecutionConfig[f.key])} onChange={(v) => onChange({ ...settings, aiExecutionConfig: { ...settings.aiExecutionConfig, [f.key]: Number(v) } })} options={f.options} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Jobs */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <RefreshCw size={13} /> Background Jobs
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
            <input type="checkbox" checked={settings.backgroundJobsEnabled} onChange={(e) => onChange({ ...settings, backgroundJobsEnabled: e.target.checked })} className="rounded" />
            <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Enable Background Jobs</span>
          </label>
          {settings.backgroundJobsEnabled && (
            <div className="flex items-center gap-3 pl-2">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                <span>Max Jobs:</span>
                <SelectDropdown value={String(settings.maxBackgroundJobs)} onChange={(v) => onChange({ ...settings, maxBackgroundJobs: Number(v) })} options={['10', '25', '50', '100', '500']} />
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                <span>Queue Concurrency:</span>
                <SelectDropdown value={String(settings.queueConcurrency)} onChange={(v) => onChange({ ...settings, queueConcurrency: Number(v) })} options={['1', '5', '10', '20', '50']} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--crm-text)' }}>
          <AlertTriangle size={13} /> Maintenance
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => onChange({ ...settings, maintenanceMode: e.target.checked })} className="rounded" />
            <span className="text-xs" style={{ color: settings.maintenanceMode ? '#f87171' : 'var(--crm-text-secondary)' }}>Maintenance Mode {settings.maintenanceMode && '(Active)'}</span>
          </label>
          {settings.maintenanceMode && (
            <textarea value={settings.maintenanceMessage} onChange={(e) => onChange({ ...settings, maintenanceMessage: e.target.value })} rows={2}
              placeholder="Maintenance message shown to users"
              className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
              style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
          )}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1" style={{ background: 'var(--crm-surface)' }}>
              <input type="checkbox" checked={settings.performanceMonitoring} onChange={(e) => onChange({ ...settings, performanceMonitoring: e.target.checked })} className="rounded" />
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Performance Monitoring</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1" style={{ background: 'var(--crm-surface)' }}>
              <input type="checkbox" checked={settings.realtimeUpdates} onChange={(e) => onChange({ ...settings, realtimeUpdates: e.target.checked })} className="rounded" />
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>Realtime Updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
