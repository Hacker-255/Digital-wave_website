const STORAGE_KEY = 'crm-settings';

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
  sidebarStyle: 'default' | 'compact' | 'icon-only';
  dashboardDensity: 'comfortable' | 'compact' | 'cozy';
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
}

export interface NotificationSettings {
  email: boolean;
  crmAlerts: boolean;
  taskReminders: boolean;
  workflowAlerts: boolean;
  mentions: boolean;
  aiNotifications: boolean;
  desktop: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: Array<{ id: string; device: string; location: string; lastActive: string; current: boolean }>;
  apiTokens: Array<{ id: string; name: string; createdAt: string; lastUsed: string }>;
}

export interface WorkspaceSettings {
  name: string;
  url: string;
  industry: string;
  size: string;
}

export interface AiSettings {
  executionEnabled: boolean;
  assistantEnabled: boolean;
  model: 'fast' | 'balanced' | 'precise';
  responseStyle: 'concise' | 'detailed' | 'balanced';
  automationLimits: number;
  showPrompts: boolean;
}

export interface WorkflowSettings {
  enabled: boolean;
  maxExecutions: number;
  retryPolicy: 'none' | 'once' | 'three-times';
  logging: boolean;
}

/* ───── Billing & Plans ───── */
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  plan: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl?: string;
}

export interface BillingSettings {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  trialEndsAt: string;
  autoRenew: boolean;
  paymentMethods: PaymentMethod[];
  invoices: InvoiceRecord[];
  usage: {
    aiExecutions: number;
    aiLimit: number;
    workflowExecutions: number;
    workflowLimit: number;
    storageUsed: number;
    storageLimit: number;
    teamMembers: number;
    teamLimit: number;
  };
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
}

/* ───── Data & Backup ───── */
export interface BackupRecord {
  id: string;
  name: string;
  createdAt: string;
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'manual' | 'scheduled';
  encrypted: boolean;
}

export interface DataBackupSettings {
  exportFormat: 'csv' | 'json' | 'xlsx';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
  cloudBackup: boolean;
  cloudProvider: 'none' | 's3' | 'gcs' | 'azure';
  encryptBackups: boolean;
  backups: BackupRecord[];
  lastExport: string | null;
  lastRestore: string | null;
  includeActivity: boolean;
  includeAiLogs: boolean;
}

/* ───── API & Webhooks ───── */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  permissions: ('read' | 'write' | 'admin')[];
  enabled: boolean;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
  lastDelivery: string | null;
  lastStatus: 'success' | 'failed' | null;
  retryCount: number;
}

export interface ApiWebhookSettings {
  apiKeys: ApiKey[];
  webhooks: WebhookEndpoint[];
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  logLevel: 'all' | 'errors' | 'none';
  retentionDays: number;
}

/* ───── Email Settings ───── */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'notification' | 'reminder' | 'onboarding' | 'workflow' | 'custom';
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'gmail' | 'outlook' | 'none';
  smtp: SmtpConfig;
  sendgridApiKey: string;
  mailgunApiKey: string;
  mailgunDomain: string;
  gmailConnected: boolean;
  outlookConnected: boolean;
  signature: string;
  templates: EmailTemplate[];
  automationEmails: boolean;
  onboardingEmails: boolean;
  reminderEmails: boolean;
  workflowEmails: boolean;
  dailyDigest: boolean;
}

/* ───── CRM Preferences ───── */
export interface CrmPreferences {
  defaultPage: 'dashboard' | 'leads' | 'companies' | 'projects' | 'tasks';
  tableDensity: 'compact' | 'comfortable' | 'cozy';
  defaultFilters: string[];
  currency: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'monday' | 'sunday' | 'saturday';
  startupBehavior: 'resume' | 'dashboard' | 'last-page';
  sidebarCollapsed: boolean;
  showActivityFeed: boolean;
  enableQuickCreate: boolean;
  confirmBeforeDelete: boolean;
  enableDragAndDrop: boolean;
  autoSaveInterval: number;
}

/* ───── Advanced Settings ───── */
export interface AdvancedSettings {
  cacheEnabled: boolean;
  cacheTTL: number;
  debugMode: boolean;
  loggingEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogRetention: number;
  workflowEngineConfig: {
    maxConcurrent: number;
    maxRetries: number;
    timeoutMs: number;
  };
  aiExecutionConfig: {
    maxConcurrent: number;
    maxTokensPerRequest: number;
    timeoutMs: number;
  };
  backgroundJobsEnabled: boolean;
  maxBackgroundJobs: number;
  queueConcurrency: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  performanceMonitoring: boolean;
  realtimeUpdates: boolean;
}

export interface IntegrationItem {
  connected: boolean;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
}

export interface IntegrationSettings {
  slack: IntegrationItem;
  gmail: IntegrationItem;
  outlook: IntegrationItem;
  discord: IntegrationItem;
  zapier: IntegrationItem;
  webhooks: IntegrationItem;
  openai: IntegrationItem;
  lemonsqueezy: IntegrationItem;
}

export interface CrmSettings {
  profile: ProfileSettings;
  workspace: WorkspaceSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  ai: AiSettings;
  workflows: WorkflowSettings;
  integrations: IntegrationSettings;
  billing: BillingSettings;
  dataBackup: DataBackupSettings;
  apiWebhook: ApiWebhookSettings;
  email: EmailSettings;
  crmPreferences: CrmPreferences;
  advanced: AdvancedSettings;
}

const defaultIntegrations: IntegrationSettings = {
  slack: { connected: false, name: 'Slack', status: 'disconnected' },
  gmail: { connected: false, name: 'Gmail', status: 'disconnected' },
  outlook: { connected: false, name: 'Outlook', status: 'disconnected' },
  discord: { connected: false, name: 'Discord', status: 'disconnected' },
  zapier: { connected: false, name: 'Zapier', status: 'disconnected' },
  webhooks: { connected: false, name: 'Webhooks', status: 'disconnected' },
  openai: { connected: false, name: 'OpenAI', status: 'disconnected' },
  lemonsqueezy: { connected: false, name: 'Lemon Squeezy', status: 'disconnected' },
};

const defaultBilling: BillingSettings = {
  plan: 'professional', billingCycle: 'yearly', subscriptionStatus: 'active', trialEndsAt: '',
  autoRenew: true, cancelAtPeriodEnd: false,
  nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  paymentMethods: [{ id: 'pm_1', brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true }],
  invoices: [
    { id: 'inv_001', date: '2026-04-01', amount: 299, currency: 'USD', status: 'paid', plan: 'Professional', periodStart: '2026-04-01', periodEnd: '2026-04-30' },
    { id: 'inv_002', date: '2026-03-01', amount: 299, currency: 'USD', status: 'paid', plan: 'Professional', periodStart: '2026-03-01', periodEnd: '2026-03-31' },
    { id: 'inv_003', date: '2026-02-01', amount: 299, currency: 'USD', status: 'paid', plan: 'Professional', periodStart: '2026-02-01', periodEnd: '2026-02-28' },
  ],
  usage: { aiExecutions: 842, aiLimit: 2000, workflowExecutions: 156, workflowLimit: 500, storageUsed: 2.4, storageLimit: 10, teamMembers: 5, teamLimit: 10 },
};

const defaultDataBackup: DataBackupSettings = {
  exportFormat: 'csv', autoBackup: false, backupFrequency: 'weekly', backupRetention: 30,
  cloudBackup: false, cloudProvider: 'none', encryptBackups: true,
  backups: [
    { id: 'b1', name: 'Pre-upgrade Backup', createdAt: '2026-04-28 03:00', size: '156 MB', status: 'completed', type: 'scheduled', encrypted: true },
    { id: 'b2', name: 'Weekly Backup', createdAt: '2026-04-21 03:00', size: '148 MB', status: 'completed', type: 'scheduled', encrypted: true },
  ],
  lastExport: null, lastRestore: null, includeActivity: true, includeAiLogs: false,
};

const defaultApiWebhook: ApiWebhookSettings = {
  apiKeys: [
    { id: 'ak_1', name: 'Production API Key', key: 'dw_' + 'example_key_replace_me', createdAt: '2026-01-15', lastUsed: '2026-04-29', permissions: ['read', 'write'], enabled: true },
    { id: 'ak_2', name: 'Read-only Key', key: 'dw_' + 'example_key_replace_me_2', createdAt: '2026-03-01', lastUsed: '2026-04-28', permissions: ['read'], enabled: true },
  ],
  webhooks: [
    { id: 'wh_1', url: 'https://api.example.com/webhooks/dw', secret: 'whsec_replace_me', events: ['company.created', 'lead.created', 'task.completed'], enabled: true, createdAt: '2026-02-01', lastDelivery: '2026-04-29', lastStatus: 'success', retryCount: 3 },
  ],
  rateLimitPerMinute: 60, rateLimitPerHour: 1000, logLevel: 'errors', retentionDays: 30,
};

const defaultEmail: EmailSettings = {
  provider: 'smtp',
  smtp: { host: 'smtp.digital-wave.solutions', port: 587, secure: false, user: 'notifications@digital-wave.solutions', pass: '', fromName: 'Digital Wave CRM', fromEmail: 'notifications@digital-wave.solutions' },
  sendgridApiKey: '', mailgunApiKey: '', mailgunDomain: '', gmailConnected: false, outlookConnected: false,
  signature: '<br/>--<br/><strong>Digital Wave CRM</strong><br/>Enterprise Customer Platform',
  templates: [
    { id: 't1', name: 'Welcome Email', subject: 'Welcome to Digital Wave CRM', body: 'Hi {{name}}, welcome aboard!', type: 'onboarding' },
    { id: 't2', name: 'Task Reminder', subject: 'Reminder: {{task}} is due soon', body: 'Hi {{name}}, just a reminder that {{task}} is due on {{due_date}}.', type: 'reminder' },
  ],
  automationEmails: true, onboardingEmails: true, reminderEmails: true, workflowEmails: true, dailyDigest: false,
};

const defaultCrmPreferences: CrmPreferences = {
  defaultPage: 'dashboard', tableDensity: 'compact', defaultFilters: ['active'],
  currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', firstDayOfWeek: 'monday',
  startupBehavior: 'dashboard', sidebarCollapsed: false, showActivityFeed: true,
  enableQuickCreate: true, confirmBeforeDelete: true, enableDragAndDrop: true, autoSaveInterval: 30,
};

const defaultAdvanced: AdvancedSettings = {
  cacheEnabled: true, cacheTTL: 300, debugMode: false, loggingEnabled: true, logLevel: 'info', maxLogRetention: 30,
  workflowEngineConfig: { maxConcurrent: 5, maxRetries: 3, timeoutMs: 30000 },
  aiExecutionConfig: { maxConcurrent: 3, maxTokensPerRequest: 4096, timeoutMs: 60000 },
  backgroundJobsEnabled: true, maxBackgroundJobs: 50, queueConcurrency: 10,
  maintenanceMode: false, maintenanceMessage: 'System is undergoing scheduled maintenance.', performanceMonitoring: true, realtimeUpdates: true,
};

export const defaultSettings: CrmSettings = {
  profile: { name: 'Digital Wave Admin', email: 'info@digital-wave.solutions', phone: '+20 100 000 0000', role: 'Owner', timezone: 'UTC+2', language: 'English', bio: 'Digital Wave CRM owner and workflow automation administrator.' },
  workspace: { name: 'Digital Wave CRM', url: 'digital-wave.solutions', industry: 'Technology', size: '10-50' },
  appearance: { theme: 'dark', compactMode: false, sidebarStyle: 'default', dashboardDensity: 'comfortable', fontSize: 'medium', accentColor: '#0086ff' },
  notifications: { email: true, crmAlerts: true, taskReminders: true, workflowAlerts: false, mentions: true, aiNotifications: false, desktop: true },
  security: { twoFactorEnabled: false, sessions: [{ id: 's1', device: 'Chrome on Windows', location: 'Cairo, Egypt', lastActive: 'Just now', current: true }], apiTokens: [] },
  ai: { executionEnabled: true, assistantEnabled: true, model: 'balanced', responseStyle: 'concise', automationLimits: 50, showPrompts: true },
  workflows: { enabled: true, maxExecutions: 100, retryPolicy: 'once', logging: true },
  integrations: defaultIntegrations,
  billing: defaultBilling,
  dataBackup: defaultDataBackup,
  apiWebhook: defaultApiWebhook,
  email: defaultEmail,
  crmPreferences: defaultCrmPreferences,
  advanced: defaultAdvanced,
};

function deepMerge(defaults: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(overrides)) {
    const overrideVal = overrides[key];
    const defaultVal = defaults[key];
    if (overrideVal !== undefined && overrideVal !== null) {
      if (typeof overrideVal === 'object' && !Array.isArray(overrideVal) && typeof defaultVal === 'object' && !Array.isArray(defaultVal)) {
        result[key] = deepMerge(defaultVal as Record<string, unknown>, overrideVal as Record<string, unknown>);
      } else {
        result[key] = overrideVal;
      }
    }
  }
  return result;
}

export function loadSettings(): CrmSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return deepMerge(defaultSettings as unknown as Record<string, unknown>, parsed) as unknown as CrmSettings;
      }
    }
  } catch {
    // use defaults
  }
  return { ...defaultSettings, integrations: { ...defaultIntegrations } };
}

export function saveSettings(settings: CrmSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function resetSettings(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
