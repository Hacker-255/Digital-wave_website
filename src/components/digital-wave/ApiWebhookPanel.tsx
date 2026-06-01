import { useState } from 'react';
import { Key, Globe, Webhook, Plus, Trash2, Copy, Check, RefreshCw, Eye, EyeOff, ToggleLeft } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { ApiWebhookSettings, ApiKey, WebhookEndpoint } from '../../services/settingsService';

const WEBHOOK_EVENTS = [
  'company.created', 'company.updated', 'company.deleted',
  'lead.created', 'lead.updated', 'lead.converted',
  'task.created', 'task.completed', 'task.deleted',
  'workflow.executed', 'workflow.failed',
  'user.login', 'user.created',
  'ai.executed', 'ai.failed',
];

export function ApiWebhookPanel({ settings, onChange }: { settings: ApiWebhookSettings; onChange: (s: ApiWebhookSettings) => void }) {
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(['read']);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  const toggleSecret = (id: string) => {
    const next = new Set(showSecrets);
    if (next.has(id)) next.delete(id); else next.add(id);
    setShowSecrets(next);
  };

  const generateKey = () => {
    if (!newKeyName.trim()) return;
    const ak: ApiKey = {
      id: 'ak_' + Date.now(), name: newKeyName,
      key: 'dw_' + Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join(''),
      createdAt: new Date().toISOString().split('T')[0], lastUsed: null,
      permissions: newKeyPerms as ('read' | 'write' | 'admin')[], enabled: true,
    };
    onChange({ ...settings, apiKeys: [...settings.apiKeys, ak] });
    setNewKeyName(''); setShowNewKey(false);
  };

  const revokeKey = (id: string) => {
    onChange({ ...settings, apiKeys: settings.apiKeys.filter((k) => k.id !== id) });
  };

  const toggleKey = (id: string) => {
    onChange({ ...settings, apiKeys: settings.apiKeys.map((k) => k.id === id ? { ...k, enabled: !k.enabled } : k) });
  };

  const addWebhook = () => {
    const wh: WebhookEndpoint = {
      id: 'wh_' + Date.now(), url: '', secret: 'whsec_' + Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join(''),
      events: ['company.created'], enabled: true, createdAt: new Date().toISOString().split('T')[0],
      lastDelivery: null, lastStatus: null, retryCount: 3,
    };
    onChange({ ...settings, webhooks: [...settings.webhooks, wh] });
  };

  const updateWebhook = (id: string, patch: Partial<WebhookEndpoint>) => {
    onChange({ ...settings, webhooks: settings.webhooks.map((w) => w.id === id ? { ...w, ...patch } : w) });
  };

  const deleteWebhook = (id: string) => {
    onChange({ ...settings, webhooks: settings.webhooks.filter((w) => w.id !== id) });
  };

  const copyToClipboard = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* API Keys */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>API Keys</h3>
          <button onClick={() => setShowNewKey(!showNewKey)} type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition" style={{ background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}>
            <Plus size={12} /> Generate Key
          </button>
        </div>
        {showNewKey && (
          <div className="rounded-lg border p-3 mb-3 space-y-2" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
            <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (e.g. Production API)" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
            <div className="flex gap-2">
              {['read', 'write', 'admin'].map((p) => (
                <label key={p} className="flex items-center gap-1 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                  <input type="checkbox" checked={newKeyPerms.includes(p)} onChange={() => setNewKeyPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])} className="rounded" /> {p}
                </label>
              ))}
            </div>
            <button onClick={generateKey} type="button" className="digital-wave-btn digital-wave-btn-primary w-full">Generate</button>
          </div>
        )}
        <div className="space-y-1">
          {settings.apiKeys.map((ak) => (
            <div key={ak.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Key size={13} style={{ color: 'var(--crm-text-muted)' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate" style={{ color: 'var(--crm-text)' }}>{ak.name}</p>
                  <p className="text-[10px] font-mono truncate" style={{ color: 'var(--crm-text-muted)' }}>
                    {ak.key.slice(0, 12)}... - {ak.permissions.join(', ')} - {ak.lastUsed || 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => copyToClipboard(ak.key, ak.id)} type="button" className="p-1 rounded hover:bg-white/10" title="Copy key">{copied === ak.id ? <Check size={11} style={{ color: '#22c55e' }} /> : <Copy size={11} style={{ color: 'var(--crm-text-muted)' }} />}</button>
                <button onClick={() => toggleKey(ak.id)} type="button" className="p-1 rounded hover:bg-white/10"><Eye size={11} style={{ color: ak.enabled ? '#22c55e' : 'var(--crm-text-muted)' }} /></button>
                <button onClick={() => revokeKey(ak.id)} type="button" className="p-1 rounded hover:bg-red-500/10"><Trash2 size={11} style={{ color: '#f87171' }} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--crm-border)' }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
            <span>Rate Limit:</span>
            <SelectDropdown value={String(settings.rateLimitPerMinute)} onChange={(v) => onChange({ ...settings, rateLimitPerMinute: Number(v) })} options={['30', '60', '120', '300', '600']} />
            <span className="text-[10px]">/min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
            <span>Log Level:</span>
            <SelectDropdown value={settings.logLevel} onChange={(v) => onChange({ ...settings, logLevel: v as ApiWebhookSettings['logLevel'] })} options={['all', 'errors', 'none']} />
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Webhooks</h3>
          <button onClick={addWebhook} type="button" className="digital-wave-btn flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition">
            <Plus size={12} /> Add Webhook
          </button>
        </div>
        <div className="space-y-2">
          {settings.webhooks.map((wh) => (
            <div key={wh.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Webhook size={13} style={{ color: 'var(--crm-text-muted)' }} />
                  <input value={wh.url} onChange={(e) => updateWebhook(wh.id, { url: e.target.value })} placeholder="https://example.com/webhook" className="flex-1 rounded border px-2 py-1 text-xs outline-none min-w-0" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleSecret(wh.id)} type="button" className="p-1 rounded hover:bg-white/10">{showSecrets.has(wh.id) ? <EyeOff size={11} style={{ color: 'var(--crm-text-muted)' }} /> : <Eye size={11} style={{ color: 'var(--crm-text-muted)' }} />}</button>
                  <button onClick={() => copyToClipboard(wh.secret, 'sec_' + wh.id)} type="button" className="p-1 rounded hover:bg-white/10" title="Copy secret">{copied === 'sec_' + wh.id ? <Check size={11} style={{ color: '#22c55e' }} /> : <Copy size={11} style={{ color: 'var(--crm-text-muted)' }} />}</button>
                  <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--crm-text-secondary)' }}>
                    <input type="checkbox" checked={wh.enabled} onChange={() => updateWebhook(wh.id, { enabled: !wh.enabled })} className="rounded" />
                  </label>
                  <button onClick={() => deleteWebhook(wh.id)} type="button" className="p-1 rounded hover:bg-red-500/10"><Trash2 size={11} style={{ color: '#f87171' }} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] shrink-0" style={{ color: 'var(--crm-text-muted)' }}>Events:</span>
                <select multiple value={wh.events} onChange={(e) => updateWebhook(wh.id, { events: Array.from(e.target.selectedOptions, (o) => o.value) })}
                  className="flex-1 rounded border px-2 py-1 text-[10px] outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)', minHeight: '60px' }}>
                  {WEBHOOK_EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>Secret:</span>
                <code className="text-[10px] font-mono flex-1 truncate rounded px-1.5 py-0.5" style={{ background: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>
                  {showSecrets.has(wh.id) ? wh.secret : wh.secret.slice(0, 12) + '...'}
                </code>
                <span className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>Retries: {wh.retryCount}</span>
                {wh.lastDelivery && <span className="text-[10px]" style={{ color: wh.lastStatus === 'success' ? '#22c55e' : '#f87171' }}>Last: {wh.lastDelivery}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
