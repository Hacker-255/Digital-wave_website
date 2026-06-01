import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, LogOut, Monitor, ShieldAlert, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { listAuditEvents, type AuditEvent } from '../../services/auditLogService';

export function ActivityPanel() {
  const { sessions, currentUser, isManager, refreshSessions, users } = useAuth();
  const [loading, setLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => listAuditEvents());

  useEffect(() => {
    if (isManager) {
      refreshSessions().finally(() => setLoading(false));
    }
  }, [isManager, refreshSessions]);

  useEffect(() => {
    const refresh = () => setAuditEvents(listAuditEvents());
    window.addEventListener('crm-audit-log-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('crm-audit-log-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (!isManager) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} style={{ color: 'var(--crm-text)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Login Activity</span>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{users.filter((u) => u.online).length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--crm-text-muted)' }}>Online now</p>
        </div>
        <div className="flex-1 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--crm-text)' }}>{users.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--crm-text-muted)' }}>Total users</p>
        </div>
        <div className="flex-1 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{users.filter((u) => u.away).length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--crm-text-muted)' }}>Away</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: 'var(--crm-text-muted)' }}>CRM Audit Log</p>
          <button onClick={() => setAuditEvents(listAuditEvents())} type="button" className="digital-wave-btn digital-wave-btn-ghost">Refresh</button>
        </div>
        {auditEvents.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>
            <ShieldAlert size={24} className="mb-2 opacity-40" />
            No CRM actions recorded yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {auditEvents.slice(0, 30).map((event) => {
              const Icon = event.outcome === 'success' ? CheckCircle2 : event.outcome === 'blocked' ? ShieldAlert : AlertTriangle;
              const color = event.outcome === 'success' ? '#22c55e' : event.outcome === 'blocked' ? '#f59e0b' : '#f87171';
              return (
                <div key={event.id} className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
                  <Icon size={14} style={{ color, marginTop: 2 }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--crm-text)' }}>{event.action.replace(/_/g, ' ')}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ color, background: `${color}1f` }}>{event.outcome}</span>
                    </div>
                    <p className="mt-0.5 text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>
                      {event.entityType} - {event.entityName} - {event.actor} - {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: 'var(--crm-text-muted)' }}>Active Sessions</p>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>
            <Clock size={24} className="mb-2 opacity-40" />
            No sessions recorded yet
          </div>
        ) : (
          sessions.slice().reverse().slice(0, 20).map((session, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
              style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}
            >
              <Monitor size={14} style={{ color: 'var(--crm-text-muted)' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--crm-text)' }}>
                    {session.device || 'Unknown device'}
                  </span>
                  {session.active && (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#22c55e' }}>
                      <Circle size={6} fill="#22c55e" /> Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>
                  <span>{session.browser}</span>
                  <span>-</span>
                  <span>{session.ip}</span>
                  <span>-</span>
                  <span>{new Date(session.loginTime).toLocaleString()}</span>
                  {session.logoutTime && (
                    <>
                      <LogOut size={10} />
                      <span>{new Date(session.logoutTime).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
