import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User, Building2, Palette, Bell, Shield, Users, Bot, Workflow,
  Puzzle, CreditCard, Database, Key, Mail, SlidersHorizontal, Settings2,
  Save, RotateCcw, Check, ChevronRight, Globe, Clock, Smartphone, LogOut,
  Sun, Moon, Monitor, RefreshCw, Link, Unlink, Plus, Trash2, Eye, EyeOff,
  FileText, Download, Activity,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LogoutButton } from './LogoutButton';
import { UserPermissionPanel } from './UserPermissionPanel';
import { ActivityPanel } from './ActivityPanel';
import { SelectDropdown } from './SelectDropdown';
import { BillingPanel } from './BillingPanel';
import { DataBackupPanel } from './DataBackupPanel';
import { ApiWebhookPanel } from './ApiWebhookPanel';
import { EmailPanel } from './EmailPanel';
import { CrmPreferencesPanel } from './CrmPreferencesPanel';
import { AdvancedSettingsPanel } from './AdvancedSettingsPanel';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/apiClient';
import {
  loadSettings, saveSettings, resetSettings,
  type CrmSettings, type ProfileSettings, type AppearanceSettings,
  type NotificationSettings, type SecuritySettings, type AiSettings,
  type WorkflowSettings, type IntegrationSettings, type IntegrationItem,
  type BillingSettings, type DataBackupSettings, type ApiWebhookSettings,
  type EmailSettings, type CrmPreferences, type AdvancedSettings,
} from '../../services/settingsService';

interface SettingsPanelProps {
  onNavigate?: (module: string) => void;
}

type SettingCategory = {
  id: string;
  label: string;
  icon: typeof User;
};

function buildCategories(isManager: boolean): SettingCategory[] {
  const base: SettingCategory[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'workflow', label: 'Workflow Settings', icon: Workflow },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'api', label: 'API & Webhooks', icon: Key },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'crm', label: 'CRM Preferences', icon: SlidersHorizontal },
    { id: 'advanced', label: 'Advanced', icon: Settings2 },
  ];
  if (isManager) {
    base.splice(4, 0, { id: 'team', label: 'Team & Permissions', icon: Users });
    base.splice(5, 0, { id: 'activity', label: 'Activity', icon: Activity });
  }
  return base;
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{title}</h2>
      <p className="text-xs mt-1" style={{ color: 'var(--crm-text-muted)' }}>{desc}</p>
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      type="button"
      className="relative h-5 w-9 rounded-full transition-colors"
      style={{ background: value ? 'var(--crm-text)' : 'var(--crm-border)' }}
    >
      <span
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-transform"
        style={{ background: value ? 'var(--crm-app-bg)' : 'var(--crm-text-muted)', transform: value ? 'translateX(14px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs shrink-0" style={{ color: 'var(--crm-text-secondary)', width: '140px' }}>{label}</span>
      <div className="flex-1 max-w-sm">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="w-full rounded-lg border px-3 py-2 text-xs outline-none transition"
      style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <SelectDropdown value={value} onChange={onChange} options={options} />;
}

export function SettingsPanel({ onNavigate }: SettingsPanelProps) {
  const [activeCategory, setActiveCategory] = useState('profile');
  const [settings, setSettings] = useState<CrmSettings>(() => loadSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isManager } = useAuth();

  const categories = useMemo(() => buildCategories(isManager), [isManager]);

  useEffect(() => { setSettings(loadSettings()); }, []);

  const persist = useCallback((updated: CrmSettings) => {
    saveSettings(updated);
    setSettings(updated);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    api.settings.save(settings).catch(() => {});
    setTimeout(() => {
      saveSettings(settings);
      if (settings.appearance.theme !== 'system') setTheme(settings.appearance.theme === 'light' ? 'light' : 'dark');
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  }, [settings, setTheme]);

  const updateProfile = useCallback((patch: Partial<ProfileSettings>) => {
    persist({ ...settings, profile: { ...settings.profile, ...patch } });
  }, [settings, persist]);

  const updateAppearance = useCallback((patch: Partial<AppearanceSettings>) => {
    persist({ ...settings, appearance: { ...settings.appearance, ...patch } });
  }, [settings, persist]);

  const updateNotifications = useCallback((patch: Partial<NotificationSettings>) => {
    persist({ ...settings, notifications: { ...settings.notifications, ...patch } });
  }, [settings, persist]);

  const updateSecurity = useCallback((patch: Partial<SecuritySettings>) => {
    persist({ ...settings, security: { ...settings.security, ...patch } });
  }, [settings, persist]);

  const updateAi = useCallback((patch: Partial<AiSettings>) => {
    persist({ ...settings, ai: { ...settings.ai, ...patch } });
  }, [settings, persist]);

  const updateWorkflows = useCallback((patch: Partial<WorkflowSettings>) => {
    persist({ ...settings, workflows: { ...settings.workflows, ...patch } });
  }, [settings, persist]);

  const updateBilling = useCallback((patch: Partial<BillingSettings> | BillingSettings) => {
    persist({ ...settings, billing: { ...settings.billing, ...patch } });
  }, [settings, persist]);

  const updateDataBackup = useCallback((patch: Partial<DataBackupSettings> | DataBackupSettings) => {
    persist({ ...settings, dataBackup: { ...settings.dataBackup, ...patch } });
  }, [settings, persist]);

  const updateApiWebhook = useCallback((patch: Partial<ApiWebhookSettings> | ApiWebhookSettings) => {
    persist({ ...settings, apiWebhook: { ...settings.apiWebhook, ...patch } });
  }, [settings, persist]);

  const updateEmail = useCallback((patch: Partial<EmailSettings> | EmailSettings) => {
    persist({ ...settings, email: { ...settings.email, ...patch } });
  }, [settings, persist]);

  const updateCrmPreferences = useCallback((patch: Partial<CrmPreferences> | CrmPreferences) => {
    persist({ ...settings, crmPreferences: { ...settings.crmPreferences, ...patch } });
  }, [settings, persist]);

  const updateAdvanced = useCallback((patch: Partial<AdvancedSettings> | AdvancedSettings) => {
    persist({ ...settings, advanced: { ...settings.advanced, ...patch } });
  }, [settings, persist]);

  const updateIntegration = useCallback((key: keyof IntegrationSettings, patch: Partial<IntegrationItem>) => {
    persist({ ...settings, integrations: { ...settings.integrations, [key]: { ...settings.integrations[key], ...patch } } });
  }, [settings, persist]);

  const toggleIntegration = useCallback((key: keyof IntegrationSettings) => {
    const current = settings.integrations[key];
    if (current.connected) {
      updateIntegration(key, { connected: false, status: 'disconnected', apiKey: undefined });
    } else {
      updateIntegration(key, { connected: true, status: 'connected', apiKey: 'sk-' + Math.random().toString(36).slice(2, 12) });
    }
  }, [settings, updateIntegration]);

  const handlePasswordChange = useCallback(() => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!passwordForm.current) { setPasswordError('Current password is required'); return; }
    if (passwordForm.newPass.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordError('Passwords do not match'); return; }
    setPasswordSuccess(true);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  }, [passwordForm]);

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile': return (
        <>
          <SectionHeader title="Profile" desc="Manage your personal information and preferences." />
          <div className="space-y-1">
            <Field label="Full Name"><Input value={settings.profile.name} onChange={(v) => updateProfile({ name: v })} placeholder="Your name" /></Field>
            <Field label="Email"><Input value={settings.profile.email} onChange={(v) => updateProfile({ email: v })} type="email" placeholder="email@example.com" /></Field>
            <Field label="Phone"><Input value={settings.profile.phone} onChange={(v) => updateProfile({ phone: v })} type="tel" placeholder="+20 100 000 0000" /></Field>
            <Field label="Role"><Select value={settings.profile.role} onChange={(v) => updateProfile({ role: v })} options={['Owner', 'Admin', 'Employee', 'Viewer']} /></Field>
            <Field label="Timezone"><Select value={settings.profile.timezone} onChange={(v) => updateProfile({ timezone: v })} options={['UTC-12', 'UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+5:30', 'UTC+8']} /></Field>
            <Field label="Language"><Select value={settings.profile.language} onChange={(v) => updateProfile({ language: v })} options={['English', 'Arabic', 'French', 'Spanish', 'German', 'Chinese']} /></Field>
            <Field label="Bio"><textarea value={settings.profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} /></Field>
          </div>
        </>
      );

      case 'appearance': return (
        <>
          <SectionHeader title="Appearance" desc="Customize how the CRM looks and feels." />
          <div className="space-y-1">
            <Field label="Theme">
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button key={t} onClick={() => { updateAppearance({ theme: t }); if (t !== 'system') setTheme(t); }} type="button"
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition"
                    style={{ borderColor: settings.appearance.theme === t ? 'var(--crm-text)' : 'var(--crm-border)', color: 'var(--crm-text)' }}
                  >
                    {t === 'dark' ? <Moon size={12} /> : t === 'light' ? <Sun size={12} /> : <Monitor size={12} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Compact Mode"><Toggle value={settings.appearance.compactMode} onChange={(v) => updateAppearance({ compactMode: v })} /></Field>
            <Field label="Sidebar Style"><Select value={settings.appearance.sidebarStyle} onChange={(v) => updateAppearance({ sidebarStyle: v as 'default' | 'compact' | 'icon-only' })} options={['default', 'compact', 'icon-only']} /></Field>
            <Field label="Dashboard Density"><Select value={settings.appearance.dashboardDensity} onChange={(v) => updateAppearance({ dashboardDensity: v as 'comfortable' | 'compact' | 'cozy' })} options={['comfortable', 'compact', 'cozy']} /></Field>
            <Field label="Font Size"><Select value={settings.appearance.fontSize} onChange={(v) => updateAppearance({ fontSize: v as 'small' | 'medium' | 'large' })} options={['small', 'medium', 'large']} /></Field>
            <Field label="Accent Color">
              <div className="flex gap-2">
                {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#0ea5e9'].map((c) => (
                  <button key={c} onClick={() => updateAppearance({ accentColor: c })} type="button"
                    className="h-6 w-6 rounded-full border-2 transition"
                    style={{ background: c, borderColor: settings.appearance.accentColor === c ? 'var(--crm-text)' : 'transparent' }}
                  />
                ))}
              </div>
            </Field>
          </div>
        </>
      );

      case 'notifications': return (
        <>
          <SectionHeader title="Notifications" desc="Control which notifications you receive." />
          <div className="space-y-1">
            {([['Email Notifications', 'email'], ['CRM Alerts', 'crmAlerts'], ['Task Reminders', 'taskReminders'], ['Workflow Alerts', 'workflowAlerts'], ['Mentions', 'mentions'], ['AI Notifications', 'aiNotifications'], ['Desktop Notifications', 'desktop']] as const).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{label}</span>
                <Toggle value={settings.notifications[key] as boolean} onChange={(v) => updateNotifications({ [key]: v } as Partial<NotificationSettings>)} />
              </div>
            ))}
          </div>
        </>
      );

      case 'security': return (
        <>
          <SectionHeader title="Security" desc="Manage your account security and active sessions." />
          <div className="space-y-4">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--crm-border)' }}>
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Change Password</h3>
              <div className="space-y-2.5">
                <div className="relative">
                  <Input value={passwordForm.current} onChange={(v) => setPasswordForm((p) => ({ ...p, current: v }))} placeholder="Current password" type={showPassword ? 'text' : 'password'} />
                  <button onClick={() => setShowPassword((v) => !v)} type="button" className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--crm-text-muted)' }}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                <Input value={passwordForm.newPass} onChange={(v) => setPasswordForm((p) => ({ ...p, newPass: v }))} placeholder="New password" type={showPassword ? 'text' : 'password'} />
                <Input value={passwordForm.confirm} onChange={(v) => setPasswordForm((p) => ({ ...p, confirm: v }))} placeholder="Confirm new password" type={showPassword ? 'text' : 'password'} />
                {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                {passwordSuccess && <p className="text-xs text-emerald-400 flex items-center gap-1"><Check size={12} /> Password updated successfully</p>}
                <button onClick={handlePasswordChange} type="button" className="digital-wave-btn digital-wave-btn-primary">Update Password</button>
              </div>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--crm-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--crm-text)' }}>Two-Factor Authentication</h3>
                <Toggle value={settings.security.twoFactorEnabled} onChange={(v) => updateSecurity({ twoFactorEnabled: v })} />
              </div>
              <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>Add an extra layer of security to your account.</p>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--crm-border)' }}>
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Active Sessions</h3>
              <div className="space-y-2">
                {settings.security.sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <Smartphone size={13} style={{ color: 'var(--crm-text-muted)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--crm-text)' }}>{s.device} {s.current && <span className="text-emerald-400 ml-1">Current</span>}</p>
                        <p className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>{s.location} - {s.lastActive}</p>
                      </div>
                    </div>
                    {!s.current && <button type="button" className="digital-wave-btn-ghost digital-wave-btn-danger text-xs hover:underline">Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );

      case 'ai': return (
        <>
          <SectionHeader title="AI Settings" desc="Configure AI behavior and permissions." />
          <div className="space-y-1">
            <Field label="Execution AI"><Toggle value={settings.ai.executionEnabled} onChange={(v) => updateAi({ executionEnabled: v })} /></Field>
            <Field label="Assistant AI"><Toggle value={settings.ai.assistantEnabled} onChange={(v) => updateAi({ assistantEnabled: v })} /></Field>
            <Field label="AI Model"><Select value={settings.ai.model} onChange={(v) => updateAi({ model: v as 'fast' | 'balanced' | 'precise' })} options={['fast', 'balanced', 'precise']} /></Field>
            <Field label="Response Style"><Select value={settings.ai.responseStyle} onChange={(v) => updateAi({ responseStyle: v as 'concise' | 'detailed' | 'balanced' })} options={['concise', 'detailed', 'balanced']} /></Field>
            <Field label="Automation Limits"><Input value={String(settings.ai.automationLimits)} onChange={(v) => updateAi({ automationLimits: Number(v) || 50 })} type="number" /></Field>
            <Field label="Show Quick Prompts"><Toggle value={settings.ai.showPrompts} onChange={(v) => updateAi({ showPrompts: v })} /></Field>
          </div>
        </>
      );

      case 'workflow': return (
        <>
          <SectionHeader title="Workflow Settings" desc="Configure workflow execution and automation." />
          <div className="space-y-1">
            <Field label="Enable Workflows"><Toggle value={settings.workflows.enabled} onChange={(v) => updateWorkflows({ enabled: v })} /></Field>
            <Field label="Max Executions"><Input value={String(settings.workflows.maxExecutions)} onChange={(v) => updateWorkflows({ maxExecutions: Number(v) || 100 })} type="number" /></Field>
            <Field label="Retry Policy"><Select value={settings.workflows.retryPolicy} onChange={(v) => updateWorkflows({ retryPolicy: v as 'none' | 'once' | 'three-times' })} options={['none', 'once', 'three-times']} /></Field>
            <Field label="Execution Logging"><Toggle value={settings.workflows.logging} onChange={(v) => updateWorkflows({ logging: v })} /></Field>
          </div>
        </>
      );

      case 'integrations': return (
        <>
          <SectionHeader title="Integrations" desc="Connect your CRM with external services." />
          <div className="grid gap-2">
            {(Object.entries(settings.integrations) as [keyof IntegrationSettings, IntegrationItem][]).map(([key, item]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--crm-surface)' }}>
                    <Puzzle size={14} style={{ color: 'var(--crm-text-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--crm-text)' }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: item.status === 'connected' ? '#34d399' : item.status === 'error' ? '#f87171' : 'var(--crm-text-muted)' }}>
                      {item.status === 'connected' ? 'Connected' : item.status === 'error' ? 'Error' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleIntegration(key)}
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition"
                  style={{ background: item.connected ? 'rgba(239,68,68,0.1)' : 'var(--crm-surface)', color: item.connected ? '#f87171' : 'var(--crm-text-secondary)' }}
                >
                  {item.connected ? <><Unlink size={12} /> Disconnect</> : <><Link size={12} /> Connect</>}
                </button>
              </div>
            ))}
          </div>
        </>
      );

      case 'workspace': return (
        <>
          <SectionHeader title="Workspace" desc="Manage your workspace settings." />
          <div className="space-y-1">
            <Field label="Workspace Name"><Input value="Digital Wave CRM" onChange={() => {}} placeholder="Workspace name" /></Field>
            <Field label="Workspace URL"><Input value="digitalwave.crm.com" onChange={() => {}} placeholder="workspace URL" /></Field>
            <Field label="Industry"><Select value="Technology" onChange={() => {}} options={['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Other']} /></Field>
            <Field label="Workspace Size"><Select value="10-50" onChange={() => {}} options={['1-10', '10-50', '50-200', '200-1000', '1000+']} /></Field>
          </div>
        </>
      );

      case 'team': return <UserPermissionPanel />;

      case 'activity': return <ActivityPanel />;

      case 'billing': return (
        <>
          <SectionHeader title="Billing & Plans" desc="Manage your subscription and billing information." />
          <BillingPanel settings={settings.billing} onChange={updateBilling} />
        </>
      );

      case 'data': return (
        <>
          <SectionHeader title="Data & Backup" desc="Export, import, and manage your CRM data backups." />
          <DataBackupPanel settings={settings.dataBackup} onChange={updateDataBackup} />
        </>
      );

      case 'api': return (
        <>
          <SectionHeader title="API & Webhooks" desc="Manage API keys and webhook endpoints." />
          <ApiWebhookPanel settings={settings.apiWebhook} onChange={updateApiWebhook} />
        </>
      );

      case 'email': return (
        <>
          <SectionHeader title="Email Settings" desc="Configure email provider, signatures, and templates." />
          <EmailPanel settings={settings.email} onChange={updateEmail} />
        </>
      );

      case 'crm': return (
        <>
          <SectionHeader title="CRM Preferences" desc="Customize your CRM layout, behavior, and regional settings." />
          <CrmPreferencesPanel settings={settings.crmPreferences} onChange={updateCrmPreferences} />
        </>
      );

      case 'advanced': return (
        <>
          <SectionHeader title="Advanced Settings" desc="System-level configuration and performance tuning." />
          <AdvancedSettingsPanel settings={settings.advanced} onChange={updateAdvanced} />
        </>
      );

      default: return (
        <>
          <SectionHeader title={categories.find((c) => c.id === activeCategory)?.label || 'Settings'} desc="Configure your CRM preferences." />
          <div className="rounded-lg border p-6 text-center" style={{ borderColor: 'var(--crm-border)' }}>
            <Settings2 size={24} className="mx-auto mb-2" style={{ color: 'var(--crm-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>This section is being built. Check back soon.</p>
          </div>
        </>
      );
    }
  };

  return (
    <div className="flex h-full gap-0" style={{ color: 'var(--crm-text)' }}>
      <div className="flex w-48 shrink-0 flex-col border-r" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings2 size={14} />
            <span className="text-xs font-semibold">Settings</span>
          </div>
          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition"
                  style={{
                    background: activeCategory === cat.id ? 'var(--crm-hover)' : 'transparent',
                    color: activeCategory === cat.id ? 'var(--crm-text)' : 'var(--crm-text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = 'var(--crm-hover-subtle)'; }}
                  onMouseLeave={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <CatIcon size={13} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="shrink-0 border-t p-3" style={{ borderColor: 'var(--crm-border)' }}>
          <LogoutButton variant="settings" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-xl">
          {renderContent()}
          {activeCategory !== 'team' && activeCategory !== 'activity' && (
          <div className="mt-6 flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--crm-border)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition disabled:opacity-50"
              style={{ background: 'var(--crm-text)', color: 'var(--crm-app-bg)' }}
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-400"><Check size={12} /> Saved</span>
            )}
            <button
              onClick={() => { resetSettings(); setSettings(loadSettings()); setSaved(false); }}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition"
              style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
