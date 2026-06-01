import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Database, ShieldAlert, X } from 'lucide-react';
import { listAuditEvents, type AuditEvent } from '../../services/auditLogService';

interface NotificationCenterProps {
  schemaHealth?: { ok: boolean; missing: string[] } | null;
  companiesLoaded: boolean;
  recordsLoaded: boolean;
  lastAction: string;
}

export function NotificationCenter({ schemaHealth, companiesLoaded, recordsLoaded, lastAction }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => listAuditEvents());

  useEffect(() => {
    const refresh = () => setAuditEvents(listAuditEvents());
    window.addEventListener('crm-audit-log-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('crm-audit-log-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const systemItems = useMemo(() => {
    const items = [];
    if (!companiesLoaded || !recordsLoaded) {
      items.push({
        id: 'loading',
        type: 'info',
        title: 'CRM data is loading',
        detail: 'Companies and module records are still being hydrated.',
      });
    }
    if (schemaHealth && !schemaHealth.ok) {
      items.push({
        id: 'schema',
        type: 'warning',
        title: 'Database setup needs attention',
        detail: schemaHealth.missing.length ? `Missing: ${schemaHealth.missing.join(', ')}` : 'Schema health check failed.',
      });
    }
    if (lastAction && lastAction !== 'Ready') {
      items.push({
        id: 'last-action',
        type: 'success',
        title: 'Latest CRM action',
        detail: lastAction,
      });
    }
    return items;
  }, [companiesLoaded, lastAction, recordsLoaded, schemaHealth]);

  const unreadCount = systemItems.length + auditEvents.filter((event) => event.outcome !== 'success').length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        type="button"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border transition"
        style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}
        title="Notifications"
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold" style={{ background: '#ef4444', color: '#fff' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[340px] rounded-xl border p-3 shadow-2xl" style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-dropdown-bg)' }}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Notifications</h3>
              <p className="text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>System health and recent CRM activity</p>
            </div>
            <button onClick={() => setOpen(false)} type="button" className="rounded-md p-1" style={{ color: 'var(--crm-text-muted)' }}>
              <X size={14} />
            </button>
          </div>

          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {systemItems.map((item) => (
              <NotificationRow
                key={item.id}
                icon={item.type === 'success' ? CheckCircle2 : item.type === 'warning' ? AlertTriangle : Database}
                color={item.type === 'success' ? '#22c55e' : item.type === 'warning' ? '#f59e0b' : '#38bdf8'}
                title={item.title}
                detail={item.detail}
              />
            ))}

            {auditEvents.slice(0, 8).map((event) => (
              <NotificationRow
                key={event.id}
                icon={event.outcome === 'success' ? CheckCircle2 : event.outcome === 'blocked' ? ShieldAlert : AlertTriangle}
                color={event.outcome === 'success' ? '#22c55e' : event.outcome === 'blocked' ? '#f59e0b' : '#ef4444'}
                title={event.action.replace(/_/g, ' ')}
                detail={`${event.entityType} - ${event.entityName} - ${new Date(event.createdAt).toLocaleString()}`}
              />
            ))}

            {systemItems.length === 0 && auditEvents.length === 0 && (
              <div className="rounded-lg border p-4 text-center text-xs" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ icon: Icon, color, title, detail }: { icon: typeof Bell; color: string; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
      <Icon size={14} style={{ color, marginTop: 2 }} />
      <div className="min-w-0">
        <p className="text-xs font-semibold capitalize" style={{ color: 'var(--crm-text)' }}>{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: 'var(--crm-text-muted)' }}>{detail}</p>
      </div>
    </div>
  );
}
