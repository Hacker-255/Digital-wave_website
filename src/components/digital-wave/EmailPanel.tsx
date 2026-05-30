import { useState } from 'react';
import { Mail, Send, Settings as SettingsIcon, FileText, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { EmailSettings, EmailTemplate } from '../../services/settingsService';

export function EmailPanel({ settings, onChange }: { settings: EmailSettings; onChange: (s: EmailSettings) => void }) {
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const sendTest = () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({ ok: true, msg: 'Test email sent successfully to ' + testEmail });
      setTestSending(false);
    }, 1000);
  };

  const addTemplate = () => {
    const t: EmailTemplate = {
      id: 't_' + Date.now(), name: 'New Template', subject: 'New subject', body: 'Template body', type: 'custom',
    };
    onChange({ ...settings, templates: [...settings.templates, t] });
  };

  const updateTemplate = (id: string, patch: Partial<EmailTemplate>) => {
    onChange({ ...settings, templates: settings.templates.map((t) => t.id === id ? { ...t, ...patch } : t) });
  };

  const deleteTemplate = (id: string) => {
    onChange({ ...settings, templates: settings.templates.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-5">
      {/* Provider */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Email Provider</h3>
        <div className="flex gap-2 mb-3">
          <SelectDropdown value={settings.provider} onChange={(v) => onChange({ ...settings, provider: v as EmailSettings['provider'] })} options={['smtp', 'sendgrid', 'mailgun', 'gmail', 'outlook']} />
        </div>

        {settings.provider === 'smtp' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'SMTP Host', key: 'host', value: settings.smtp.host },
              { label: 'Port', key: 'port', value: String(settings.smtp.port) },
              { label: 'Username', key: 'user', value: settings.smtp.user },
              { label: 'Password', key: 'pass', value: settings.smtp.pass },
              { label: 'From Name', key: 'fromName', value: settings.smtp.fromName },
              { label: 'From Email', key: 'fromEmail', value: settings.smtp.fromEmail },
            ].map((f) => (
              <div key={f.key}>
                <p className="text-[10px] mb-0.5" style={{ color: 'var(--crm-text-muted)' }}>{f.label}</p>
                <input value={f.value} onChange={(e) => onChange({ ...settings, smtp: { ...settings.smtp, [f.key]: f.key === 'port' ? Number(e.target.value) : e.target.value } })}
                  type={f.key === 'pass' ? 'password' : 'text'} className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
              </div>
            ))}
            <label className="flex items-center gap-1.5 text-xs col-span-2" style={{ color: 'var(--crm-text-secondary)' }}>
              <input type="checkbox" checked={settings.smtp.secure} onChange={(e) => onChange({ ...settings, smtp: { ...settings.smtp, secure: e.target.checked } })} className="rounded" /> Use TLS/SSL
            </label>
          </div>
        )}

        {settings.provider === 'sendgrid' && (
          <input value={settings.sendgridApiKey} onChange={(e) => onChange({ ...settings, sendgridApiKey: e.target.value })} placeholder="SG.xxxxx" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
        )}

        {settings.provider === 'mailgun' && (
          <div className="space-y-2">
            <input value={settings.mailgunApiKey} onChange={(e) => onChange({ ...settings, mailgunApiKey: e.target.value })} placeholder="Mailgun API Key" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
            <input value={settings.mailgunDomain} onChange={(e) => onChange({ ...settings, mailgunDomain: e.target.value })} placeholder="mg.yourdomain.com" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
          </div>
        )}

        {['gmail', 'outlook'].includes(settings.provider) && (
          <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--crm-surface)' }}>
            <p style={{ color: 'var(--crm-text-secondary)' }}>Connect your {settings.provider === 'gmail' ? 'Gmail' : 'Outlook'} account to send emails directly from CRM.</p>
            <button type="button" className="digital-wave-btn digital-wave-btn-primary mt-2">
              Connect {settings.provider === 'gmail' ? 'Gmail' : 'Outlook'}
            </button>
          </div>
        )}
      </div>

      {/* Test Email */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Test Email</h3>
        <div className="flex gap-2">
          <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" type="email" className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
          <button onClick={sendTest} disabled={testSending || !testEmail} type="button" className="digital-wave-btn digital-wave-btn-primary flex items-center gap-1.5 disabled:opacity-50">
            <Send size={12} /> {testSending ? 'Sending...' : 'Send Test'}
          </button>
        </div>
        {testResult && (
          <p className={`mt-2 text-xs flex items-center gap-1 ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />} {testResult.msg}
          </p>
        )}
      </div>

      {/* Signature */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Email Signature</h3>
        <textarea value={settings.signature} onChange={(e) => onChange({ ...settings, signature: e.target.value })} rows={3}
          className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none font-mono"
          style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
        <p className="text-[10px] mt-1" style={{ color: 'var(--crm-text-muted)' }}>HTML is supported. Use {'{{name}}'} for recipient name.</p>
      </div>

      {/* Automation */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Automation</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Automation Emails', key: 'automationEmails' as const },
            { label: 'Onboarding Emails', key: 'onboardingEmails' as const },
            { label: 'Reminder Emails', key: 'reminderEmails' as const },
            { label: 'Workflow Emails', key: 'workflowEmails' as const },
            { label: 'Daily Digest', key: 'dailyDigest' as const },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <input type="checkbox" checked={settings[item.key]} onChange={(e) => onChange({ ...settings, [item.key]: e.target.checked })} className="rounded" />
              <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Email Templates</h3>
          <button onClick={addTemplate} type="button" className="digital-wave-btn flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition">
            <Plus size={12} /> Add Template
          </button>
        </div>
        <div className="space-y-2">
          {settings.templates.map((t) => (
            <div key={t.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={12} style={{ color: 'var(--crm-text-muted)' }} />
                <input value={t.name} onChange={(e) => updateTemplate(t.id, { name: e.target.value })} className="flex-1 rounded border-none px-1 py-0.5 text-xs outline-none bg-transparent font-medium" style={{ color: 'var(--crm-text)' }} />
                <button onClick={() => deleteTemplate(t.id)} type="button" className="p-1 rounded hover:bg-red-500/10"><Trash2 size={11} style={{ color: '#f87171' }} /></button>
              </div>
              <div className="flex gap-2">
                <input value={t.subject} onChange={(e) => updateTemplate(t.id, { subject: e.target.value })} placeholder="Subject" className="flex-1 rounded border px-2 py-1 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
                <input value={t.type} onChange={(e) => updateTemplate(t.id, { type: e.target.value as EmailTemplate['type'] })} className="w-24 rounded border px-2 py-1 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
              </div>
              <textarea value={t.body} onChange={(e) => updateTemplate(t.id, { body: e.target.value })} rows={2} placeholder="Template body with {{variables}}" className="mt-2 w-full rounded border px-2 py-1 text-xs outline-none resize-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
