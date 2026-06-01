export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  actor: string;
  outcome: 'success' | 'blocked' | 'failed';
  createdAt: string;
}

const STORAGE_KEY = 'crm-audit-log';
const MAX_EVENTS = 300;

export function listAuditEvents(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as AuditEvent[] : [];
  } catch {
    return [];
  }
}

export function recordAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
  const next: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const events = [next, ...listAuditEvents()].slice(0, MAX_EVENTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent('crm-audit-log-updated'));
  return next;
}
